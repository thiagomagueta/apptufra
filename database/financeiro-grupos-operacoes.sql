
create table public.financeiro_grupos_auditoria (
 id bigint generated always as identity primary key,
 grupo_id bigint not null references public.financeiro_grupos_compartilhados(id),
 acao text not null check (acao in ('criar','adicionar','retirar','desfazer')),
 realizado_por uuid not null references public.usuarios(id),
 registrado_em timestamptz not null default now(),
 dados_anteriores jsonb not null,
 dados_posteriores jsonb not null
);
alter table public.financeiro_grupos_auditoria enable row level security;
grant select,insert on public.financeiro_grupos_auditoria to authenticated;
grant usage,select on sequence public.financeiro_grupos_auditoria_id_seq to authenticated;
create policy grupos_auditoria_leitura on public.financeiro_grupos_auditoria for select to authenticated
 using (public.usuario_pode_acessar_financeiro());
create policy grupos_auditoria_registro on public.financeiro_grupos_auditoria for insert to authenticated
 with check (public.usuario_pode_acessar_financeiro() and exists
 (select 1 from public.usuarios u where u.id=realizado_por and u.auth_id=auth.uid()));

-- Executada sob as permissões do chamador e as políticas existentes.
create function private.financeiro_grupo_enquadrar(p_usuario uuid,p_grupo bigint,p_competencia date)
returns void language plpgsql security invoker set search_path='' as $$
declare r public.financeiro_enquadramentos%rowtype; v_fim date; v_inicio date;
begin
 if auth.uid() is null or not coalesce(public.usuario_pode_acessar_financeiro(),false) then
  raise exception 'Usuário sem autorização financeira.'; end if;
 if p_competencia <> (date_trunc('month',timezone('America/Sao_Paulo',now()))+interval '1 month')::date then
  raise exception 'Competência inválida para alteração do vínculo.'; end if;
 select * into r from public.financeiro_enquadramentos
 where usuario_id=p_usuario and (fim_vigencia is null or fim_vigencia>=p_competencia)
 order by inicio_vigencia limit 1 for update;
 if not found then
  insert into public.financeiro_enquadramentos(usuario_id,tipo,grupo_id,inicio_vigencia,inicio_cobranca,observacao)
  values(p_usuario,case when p_grupo is null then 'individual' else 'compartilhado' end,
         p_grupo,p_competencia,p_competencia,'Vínculo administrado pela tela de grupos de pagamento');
 elsif r.inicio_vigencia < p_competencia then
  v_fim:=r.fim_vigencia;
  update public.financeiro_enquadramentos set fim_vigencia=p_competencia-1 where id=r.id;
  insert into public.financeiro_enquadramentos(usuario_id,tipo,grupo_id,inicio_vigencia,fim_vigencia,inicio_cobranca,observacao)
  values(p_usuario,case when p_grupo is null then 'individual' else 'compartilhado' end,
         p_grupo,p_competencia,v_fim,greatest(r.inicio_cobranca,p_competencia),
         'Vínculo administrado pela tela de grupos de pagamento');
 end if;
 -- Mantém as datas de enquadramentos já programados, sem antecipar cobranças.
 update public.financeiro_enquadramentos
 set tipo=case when p_grupo is null then 'individual' else 'compartilhado' end,grupo_id=p_grupo
 where usuario_id=p_usuario and inicio_vigencia>=p_competencia;
end; $$;
revoke all on function private.financeiro_grupo_enquadrar(uuid,bigint,date) from public,anon,authenticated;
-- Helper não será exposto ao cliente; a operação pública o chama como invoker.
grant execute on function private.financeiro_grupo_enquadrar(uuid,bigint,date) to authenticated;

create function public.financeiro_grupo_operar(p_acao text,p_grupo_id bigint default null,p_usuarios uuid[] default null)
returns bigint language plpgsql security invoker set search_path='' as $$
declare
 v_grupo bigint:=p_grupo_id; v_autor uuid; v_ids uuid[]; v_retirar uuid[]; v_id uuid;
 v_hoje date:=timezone('America/Sao_Paulo',now())::date;
 v_comp date:=(date_trunc('month',timezone('America/Sao_Paulo',now()))+interval '1 month')::date;
 v_inicio date; v_antes jsonb; v_depois jsonb; v_count integer;
begin
 if auth.uid() is null or not coalesce(public.usuario_pode_acessar_financeiro(),false) then
  raise exception 'Usuário sem autorização financeira.'; end if;
 select id into strict v_autor from public.usuarios where auth_id=auth.uid();
 if p_acao is null or p_acao not in ('criar','adicionar','retirar','desfazer') then raise exception 'Ação inválida.'; end if;
 perform pg_advisory_xact_lock(74261,4);
 select array_agg(distinct x order by x) into v_ids from unnest(p_usuarios) x where x is not null;
 if p_acao in ('criar','adicionar') then
  if v_ids is null or (p_acao='criar' and cardinality(v_ids)<2) then raise exception 'Selecione as pessoas do vínculo.'; end if;
  if exists(select 1 from unnest(v_ids) x where not exists
    (select 1 from public.usuarios u where u.id=x and u.status='ativo')) then
   raise exception 'A seleção contém uma pessoa indisponível.'; end if;
  if exists(select 1 from public.financeiro_grupo_integrantes where usuario_id=any(v_ids) and
    (fim_vigencia is null or fim_vigencia>v_hoje)) then
   raise exception 'Uma das pessoas já possui vínculo. Atualize a lista.'; end if;
 end if;
 if p_acao='criar' then
  if p_grupo_id is not null then raise exception 'Não informe grupo ao criar um vínculo.'; end if;
  v_antes:='{}';
  insert into public.financeiro_grupos_compartilhados(nome) values(null) returning id into v_grupo;
 else
  perform 1 from public.financeiro_grupos_compartilhados where id=v_grupo and ativo for update;
  if not found then raise exception 'Grupo indisponível. Atualize a lista.'; end if;
  select jsonb_build_object('grupo',to_jsonb(g),'integrantes',
    (select coalesce(jsonb_agg(to_jsonb(i)),'[]') from public.financeiro_grupo_integrantes i where i.grupo_id=v_grupo),
    'enquadramentos',(select coalesce(jsonb_agg(to_jsonb(e)),'[]') from public.financeiro_enquadramentos e
       where e.usuario_id in (select usuario_id from public.financeiro_grupo_integrantes where grupo_id=v_grupo)))
   into v_antes from public.financeiro_grupos_compartilhados g where g.id=v_grupo;
 end if;
 if p_acao in ('criar','adicionar') then
  -- Guarda também o enquadramento anterior das pessoas adicionadas.
  v_antes:=v_antes||jsonb_build_object('enquadramentos_adicionados',
    (select coalesce(jsonb_agg(to_jsonb(e)),'[]') from public.financeiro_enquadramentos e where e.usuario_id=any(v_ids)));
  foreach v_id in array v_ids loop
   select greatest(v_hoje,coalesce(max(fim_vigencia)+1,v_hoje)) into v_inicio
    from public.financeiro_grupo_integrantes where usuario_id=v_id;
   insert into public.financeiro_grupo_integrantes(grupo_id,usuario_id,inicio_vigencia)
    values(v_grupo,v_id,v_inicio);
   perform private.financeiro_grupo_enquadrar(v_id,v_grupo,v_comp);
  end loop;
 else
  if p_acao='retirar' then
   if coalesce(cardinality(v_ids),0)<>1 or not exists(select 1 from public.financeiro_grupo_integrantes
      where grupo_id=v_grupo and usuario_id=v_ids[1] and fim_vigencia is null) then
    raise exception 'Selecione um integrante ativo.'; end if;
   select count(*) into v_count from public.financeiro_grupo_integrantes where grupo_id=v_grupo and fim_vigencia is null;
   if v_count>2 then v_retirar:=v_ids; end if;
  end if;
  if v_retirar is null then
   select array_agg(usuario_id order by usuario_id) into v_retirar from public.financeiro_grupo_integrantes
    where grupo_id=v_grupo and fim_vigencia is null;
  end if;
  if v_retirar is null then raise exception 'O grupo não possui integrantes ativos.'; end if;
  foreach v_id in array v_retirar loop
   perform private.financeiro_grupo_enquadrar(v_id,null,v_comp);
   -- Enquadramentos futuros foram alterados antes de encerrar a participação.
   update public.financeiro_grupo_integrantes
    set fim_vigencia=greatest(v_hoje,inicio_vigencia)
    where grupo_id=v_grupo and usuario_id=v_id and fim_vigencia is null;
  end loop;
  if not exists(select 1 from public.financeiro_grupo_integrantes where grupo_id=v_grupo and fim_vigencia is null) then
   update public.financeiro_grupos_compartilhados set ativo=false,atualizado_em=now() where id=v_grupo;
  end if;
 end if;
 update public.financeiro_grupos_compartilhados set atualizado_em=now() where id=v_grupo;
 select jsonb_build_object('grupo',to_jsonb(g),'integrantes',
    (select coalesce(jsonb_agg(to_jsonb(i)),'[]') from public.financeiro_grupo_integrantes i where i.grupo_id=v_grupo),
    'enquadramentos',(select coalesce(jsonb_agg(to_jsonb(e)),'[]') from public.financeiro_enquadramentos e
       where e.usuario_id in (select usuario_id from public.financeiro_grupo_integrantes where grupo_id=v_grupo)))
   into v_depois from public.financeiro_grupos_compartilhados g where g.id=v_grupo;
 insert into public.financeiro_grupos_auditoria(grupo_id,acao,realizado_por,dados_anteriores,dados_posteriores)
 values(v_grupo,p_acao,v_autor,v_antes,v_depois);
 return v_grupo;
end; $$;
revoke all on function public.financeiro_grupo_operar(text,bigint,uuid[]) from public,anon;
grant execute on function public.financeiro_grupo_operar(text,bigint,uuid[]) to authenticated;
notify pgrst,'reload schema';

grant select,insert,update on public.financeiro_grupo_integrantes,public.financeiro_grupos_compartilhados,public.financeiro_enquadramentos to authenticated;
grant usage,select on sequence public.financeiro_grupo_integrantes_id_seq,public.financeiro_grupos_compartilhados_id_seq,public.financeiro_enquadramentos_id_seq to authenticated;

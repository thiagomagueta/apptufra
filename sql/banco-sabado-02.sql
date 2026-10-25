begin;
create or replace function private.salvar_periodos_desenvolvimento(p_usuario_id uuid,p_periodos jsonb)
returns void language plpgsql security definer set search_path='' as $$
declare r record; v_fim date; v_primeiro boolean:=true; v_grupo text; v_admin uuid; v_pai uuid; v_filho uuid;
begin
 if auth.uid() is null or not private.eh_tesoureiro() then raise exception 'Sem autorização para alterar os períodos.'; end if;
 perform 1 from public.usuarios where id=p_usuario_id for update;
 if not found then raise exception 'Pessoa não encontrada.'; end if;
 if p_periodos is null or jsonb_typeof(p_periodos)<>'array' or jsonb_array_length(p_periodos)=0 then raise exception 'Informe pelo menos um período.'; end if;
 for r in select * from jsonb_to_recordset(p_periodos) as x(grupo text,data_inicio date,data_fim date) order by data_inicio loop
  if r.grupo is null or r.grupo not in ('banco_terca','corrente_terca','banco_sabado') or r.data_inicio is null
    or (r.data_fim is not null and r.data_fim<=r.data_inicio) then raise exception 'Período inválido.'; end if;
  if r.data_inicio<(select data_entrada_tufra from public.usuarios where id=p_usuario_id) then raise exception 'O período não pode começar antes da entrada no TUFRA.'; end if;
  if r.data_inicio>(now() at time zone 'America/Sao_Paulo')::date then raise exception 'Informe uma data de início até hoje.'; end if;
  if not v_primeiro and (v_fim is null or r.data_inicio<>v_fim) then raise exception 'Os períodos precisam ser contínuos, sem sobreposição.'; end if;
  v_primeiro:=false; v_fim:=r.data_fim; v_grupo:=r.grupo;
 end loop;
 if v_fim is not null then raise exception 'O último período deve estar em aberto.'; end if;
 select id into v_admin from public.usuarios where auth_id=auth.uid();
 -- Substituição atômica: valida tudo antes de escrever. Presenças não são alteradas.
 delete from public.desenvolvimento_periodos where usuario_id=p_usuario_id;
 insert into public.desenvolvimento_periodos(usuario_id,grupo,data_inicio,data_fim,atualizado_por)
 select p_usuario_id,x.grupo,x.data_inicio,x.data_fim,v_admin from jsonb_to_recordset(p_periodos) as x(grupo text,data_inicio date,data_fim date);
 select id into strict v_pai from public.funcoes where nome='Médium em Desenvolvimento' and funcao_pai_id is null;
 select id into strict v_filho from public.funcoes where nome=case v_grupo when 'banco_sabado' then 'Banco sábado' when 'corrente_terca' then 'Corrente do Desenvolvimento' else 'Banco do Desenvolvimento' end and funcao_pai_id=v_pai;
 delete from public.usuario_funcoes uf using public.funcoes f where uf.funcao_id=f.id and uf.usuario_id=p_usuario_id
 and f.funcao_pai_id=v_pai and f.nome in ('Banco do Desenvolvimento','Corrente do Desenvolvimento','Banco sábado') and f.id<>v_filho;
 insert into public.usuario_funcoes(usuario_id,funcao_id,atribuido_por)
 select p_usuario_id,f,v_admin from unnest(array[v_pai,v_filho]) f
 where not exists(select 1 from public.usuario_funcoes uf where uf.usuario_id=p_usuario_id and uf.funcao_id=f);
end $$;
revoke all on function private.salvar_periodos_desenvolvimento(uuid,jsonb) from public,anon;
grant execute on function private.salvar_periodos_desenvolvimento(uuid,jsonb) to authenticated;
create or replace function public.salvar_periodos_desenvolvimento(p_usuario_id uuid,p_periodos jsonb) returns void
language sql security invoker set search_path='' as $$ select * from private.salvar_periodos_desenvolvimento(p_usuario_id,p_periodos); $$;
revoke all on function public.salvar_periodos_desenvolvimento(uuid,jsonb) from public,anon;
grant execute on function public.salvar_periodos_desenvolvimento(uuid,jsonb) to authenticated;

create or replace function private.listar_associados_presenca_periodo(p_tipo_lista_id uuid,p_data date)
returns table(id uuid,nome_completo text,data_entrada_tufra date)
language plpgsql stable security definer set search_path='' as $$
declare v_nome text;
begin
 if auth.uid() is null or not (private.eh_responsavel_lista_presenca(p_tipo_lista_id) or private.pode_gerenciar_calendario()) then raise exception 'Sem autorização para esta lista.'; end if;
 select t.nome into v_nome from public.tipos_lista_presenca t where t.id=p_tipo_lista_id and t.ativo;
 return query select u.id,u.nome_completo,u.data_entrada_tufra from public.usuarios u where u.status='ativo'
 and (u.data_entrada_tufra is null or p_data is null or u.data_entrada_tufra<=p_data)
 and case when v_nome in ('Desenvolvimento','Banco sábado') then
  exists(select 1 from public.desenvolvimento_periodos d where d.usuario_id=u.id
    and (p_data is null or (d.data_inicio<=p_data and (d.data_fim is null or p_data<d.data_fim)))
    and ((v_nome='Banco sábado' and d.grupo='banco_sabado') or (v_nome='Desenvolvimento' and d.grupo in ('banco_terca','corrente_terca'))))
  or (v_nome='Desenvolvimento' and not exists(select 1 from public.desenvolvimento_periodos d where d.usuario_id=u.id)
    and exists(select 1 from public.usuario_funcoes uf join public.funcoes f on f.id=uf.funcao_id where uf.usuario_id=u.id and f.nome='Médium em Desenvolvimento'))
 else exists(select 1 from public.usuario_funcoes uf join public.funcoes f on f.id=uf.funcao_id where uf.usuario_id=u.id
 and f.nome=any(case v_nome when 'Corrente Principal' then array['Médium Corrente Principal','Médium Principal'] when 'Ogans' then array['Ogam'] when 'Cambones' then array['Cambone'] when 'Cantina' then array['Cantina'] else array[]::text[] end)) end
 order by u.nome_completo;
end $$;
revoke all on function private.listar_associados_presenca_periodo(uuid,date) from public,anon;
grant execute on function private.listar_associados_presenca_periodo(uuid,date) to authenticated;
create or replace function public.listar_associados_presenca_periodo(p_tipo_lista_id uuid,p_data date) returns table(id uuid,nome_completo text,data_entrada_tufra date)
language sql security invoker set search_path='' as $$ select * from private.listar_associados_presenca_periodo(p_tipo_lista_id,p_data); $$;
revoke all on function public.listar_associados_presenca_periodo(uuid,date) from public,anon;
grant execute on function public.listar_associados_presenca_periodo(uuid,date) to authenticated;
-- Conferência interna dos lançamentos que serão desconsiderados, sem apagá-los.
create or replace function private.conferir_presencas_desenvolvimento(p_usuario_id uuid)
returns table(data date,lista text,status text) language plpgsql stable security definer set search_path='' as $$
begin
 if auth.uid() is null or not private.eh_tesoureiro() then raise exception 'Sem autorização.'; end if;
 return query select a.data,t.nome,p.status from public.presencas p
 join public.atividades a on a.id=p.atividade_id join public.tipos_lista_presenca t on t.id=p.tipo_lista_id
 where p.usuario_id=p_usuario_id and t.nome in ('Desenvolvimento','Banco sábado')
 and exists(select 1 from public.desenvolvimento_periodos d where d.usuario_id=p_usuario_id)
 and not exists(select 1 from public.desenvolvimento_periodos d where d.usuario_id=p_usuario_id
 and d.data_inicio<=a.data and (d.data_fim is null or a.data<d.data_fim)
 and ((t.nome='Banco sábado' and d.grupo='banco_sabado') or (t.nome='Desenvolvimento' and d.grupo<>'banco_sabado')))
 order by a.data,t.nome;
end $$;
revoke all on function private.conferir_presencas_desenvolvimento(uuid) from public,anon;
grant execute on function private.conferir_presencas_desenvolvimento(uuid) to authenticated;
create or replace function public.conferir_presencas_desenvolvimento(p_usuario_id uuid)
returns table(data date,lista text,status text) language sql security invoker set search_path='' as $$
 select * from private.conferir_presencas_desenvolvimento(p_usuario_id);
$$;
revoke all on function public.conferir_presencas_desenvolvimento(uuid) from public,anon;
grant execute on function public.conferir_presencas_desenvolvimento(uuid) to authenticated;
commit;

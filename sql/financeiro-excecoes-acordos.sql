-- Etapa 7. Operações atômicas; nenhuma alteração de permissão de liberação geral.
create table public.financeiro_negociacoes_auditoria (
 id bigint generated always as identity primary key,
 requisicao uuid not null unique,
 realizado_por uuid not null references public.usuarios(id),
 registrado_em timestamptz not null default now(),
 acao text not null check(acao in ('reducao','acordo')),
 registro_id bigint not null,
 dados jsonb not null
);
alter table public.financeiro_negociacoes_auditoria enable row level security;
revoke all on public.financeiro_negociacoes_auditoria from public,anon,authenticated;
grant select on public.financeiro_negociacoes_auditoria to authenticated;
create policy negociacoes_auditoria_leitura on public.financeiro_negociacoes_auditoria for select to authenticated using(public.usuario_pode_acessar_financeiro() and exists(select 1 from public.usuarios u join public.responsaveis_financeiro r on r.usuario_id=u.id where u.auth_id=auth.uid() and u.status='ativo'));
-- Renegociada mantém a cobrança original, mas a retira do saldo exigível.
do $$declare r record; begin
 for r in select conname from pg_constraint where conrelid='public.financeiro_cobrancas'::regclass and contype='c' and pg_get_constraintdef(oid) like '%status%' loop
 execute format('alter table public.financeiro_cobrancas drop constraint %I',r.conname); end loop;
end;$$;
alter table public.financeiro_cobrancas add constraint financeiro_cobrancas_status_check check(status in ('aberta','paga','parcial','cancelada','renegociada'));
create function private.financeiro_pode_negociar() returns boolean language sql stable security definer set search_path='' as $$
 select auth.uid() is not null and coalesce(public.usuario_pode_acessar_financeiro(),false) and exists(select 1 from public.usuarios u join public.responsaveis_financeiro r on r.usuario_id=u.id where u.auth_id=auth.uid() and u.status='ativo');
$$;
create function public.financeiro_pode_negociar() returns boolean language sql stable security invoker set search_path='' as $$select private.financeiro_pode_negociar();$$;

create function private.financeiro_reducao_aplicar() returns trigger language plpgsql security definer set search_path='' as $$
declare v numeric;
begin
 if new.tipo='mensalidade' then
  perform 1 from public.usuarios where id=new.usuario_id for update;
  select valor_temporario into v from public.financeiro_ajustes_mensalidade where usuario_id=new.usuario_id and ativo and inicio_vigencia<=new.competencia and fim_vigencia>=new.competencia order by inicio_vigencia desc limit 1;
  if found then new.valor_original:=v; if v=0 then new.status:='paga'; end if; end if;
 end if;
 return new;
end;$$;
create trigger financeiro_reducao_na_geracao before insert on public.financeiro_cobrancas for each row execute function private.financeiro_reducao_aplicar();

create function private.financeiro_negociacao_criar(p_requisicao uuid,p_acao text,p_usuario uuid,p_valor numeric,p_inicio date,p_fim date,p_cobrancas bigint[],p_parcelas integer,p_motivo text) returns bigint
language plpgsql security definer set search_path='' as $$
declare autor uuid; rid bigint; anterior public.financeiro_negociacoes_auditoria%rowtype; v_c record; total numeric:=0; pago numeric; n integer; ids bigint[]; snap jsonb:='[]'; parcela numeric; cid bigint; venc date; centavos bigint; base bigint; ultimo bigint; assinatura jsonb;
begin
 if not coalesce(private.financeiro_pode_negociar(),false) then raise exception 'Acesso não autorizado para negociar.'; end if;
 if p_requisicao is null or p_acao is null or p_acao not in('reducao','acordo') or p_usuario is null then raise exception 'Dados inválidos.'; end if;
 select id into strict autor from public.usuarios where auth_id=auth.uid() and status='ativo';
 assinatura:=jsonb_build_object('acao',p_acao,'usuario',p_usuario,'valor',p_valor,'inicio',p_inicio,'fim',p_fim,'cobrancas',p_cobrancas,'parcelas',p_parcelas,'motivo',p_motivo);
 perform pg_advisory_xact_lock(hashtextextended(p_requisicao::text,0));
 select * into anterior from public.financeiro_negociacoes_auditoria where requisicao=p_requisicao;
 if found then
  if anterior.realizado_por<>autor or anterior.dados->'pedido'<>assinatura then raise exception 'Identificador já usado em outra operação.'; end if;
  return anterior.registro_id;
 end if;
 if p_motivo is null or length(btrim(p_motivo))=0 or length(p_motivo)>1000 then raise exception 'Informe o motivo (até 1000 caracteres).'; end if;
 perform 1 from public.usuarios where id=p_usuario and status='ativo' for update;
 if not found then raise exception 'Associado indisponível.'; end if;
 if p_inicio is null then raise exception 'Informe a data inicial.'; end if;
 if p_acao='reducao' then
  if p_valor is null or p_valor<0 or p_valor<>round(p_valor,2) or p_valor>99999999.99 or p_fim is null or p_fim<p_inicio or p_inicio<>date_trunc('month',p_inicio)::date or p_fim<>(date_trunc('month',p_fim)+interval '1 month - 1 day')::date then raise exception 'Informe valor e período mensal válidos.'; end if;
  if exists(select 1 from public.financeiro_ajustes_mensalidade where usuario_id=p_usuario and ativo and inicio_vigencia<=p_fim and fim_vigencia>=p_inicio) then raise exception 'Já existe redução nesse período.'; end if;
  -- Uma redução não pode aumentar a mensalidade normal de nenhuma competência.
  for v_c in select d::date competencia from generate_series(p_inicio,p_fim,interval '1 month') d loop
   select case when e.tipo='compartilhado' then v.valor_compartilhado else v.valor_individual end into pago
    from public.financeiro_enquadramentos e join public.financeiro_valores_mensalidade v on v.inicio_vigencia<=v_c.competencia and (v.fim_vigencia is null or v.fim_vigencia>=v_c.competencia)
    where e.usuario_id=p_usuario and e.inicio_vigencia<=v_c.competencia and (e.fim_vigencia is null or e.fim_vigencia>=v_c.competencia) and date_trunc('month',e.inicio_cobranca)::date<=v_c.competencia order by v.inicio_vigencia desc limit 1;
   if pago is null or p_valor>pago then raise exception 'Redução fora do enquadramento vigente em %.',to_char(v_c.competencia,'MM/YYYY'); end if;
  end loop;
  perform 1 from public.financeiro_cobrancas where usuario_id=p_usuario and tipo='mensalidade' and competencia between p_inicio and p_fim order by id for update;
  for v_c in select * from public.financeiro_cobrancas where usuario_id=p_usuario and tipo='mensalidade' and competencia between p_inicio and p_fim order by id loop
   select coalesce(sum(valor_aplicado),0) into pago from public.financeiro_pagamento_aplicacoes where cobranca_id=v_c.id;
   if v_c.status not in('aberta','parcial') or pago>p_valor then raise exception 'A competência % já foi paga, cancelada, negociada ou recebeu mais que o valor reduzido.',to_char(v_c.competencia,'MM/YYYY'); end if;
   if exists(select 1 from public.financeiro_comprovantes_destinacoes d join public.financeiro_comprovantes_envios e on e.id=d.envio_id where d.cobranca_id=v_c.id and e.status='aguardando_conferencia') then raise exception 'Confira ou redistribua o comprovante pendente antes de reduzir.'; end if;
   snap:=snap||jsonb_build_array(to_jsonb(v_c));
  end loop;
  insert into public.financeiro_ajustes_mensalidade(usuario_id,valor_temporario,inicio_vigencia,fim_vigencia,motivo) values(p_usuario,p_valor,p_inicio,p_fim,btrim(p_motivo)) returning id into rid;
  update public.financeiro_cobrancas c set valor_original=p_valor,status=case when coalesce((select sum(valor_aplicado) from public.financeiro_pagamento_aplicacoes where cobranca_id=c.id),0)>=p_valor then 'paga' when exists(select 1 from public.financeiro_pagamento_aplicacoes where cobranca_id=c.id) then 'parcial' else 'aberta' end,atualizado_em=now() where usuario_id=p_usuario and tipo='mensalidade' and competencia between p_inicio and p_fim;
 else
  select array_agg(distinct x order by x) into ids from unnest(p_cobrancas) x where x is not null;
  if ids is null or cardinality(ids)<>cardinality(p_cobrancas) or p_parcelas is null or p_parcelas<1 or p_parcelas>120 then raise exception 'Selecione dívidas e informe de 1 a 120 parcelas.'; end if;
  perform 1 from public.financeiro_cobrancas where id=any(ids) order by id for update;
  if (select count(*) from public.financeiro_cobrancas where id=any(ids) and usuario_id=p_usuario and status in('aberta','parcial'))<>cardinality(ids) then raise exception 'Há cobranças indisponíveis. Atualize a lista.'; end if;
  for v_c in select * from public.financeiro_cobrancas where id=any(ids) order by id loop
   if exists(select 1 from public.financeiro_acordo_parcelas where cobranca_id=v_c.id) or (v_c.tipo<>'mensalidade' and not exists(select 1 from public.financeiro_obrigacao_participantes where cobranca_id=v_c.id)) then raise exception 'Selecione apenas mensalidades ou obrigações, sem parcelas de outro acordo.'; end if;
   if exists(select 1 from public.financeiro_comprovantes_destinacoes d join public.financeiro_comprovantes_envios e on e.id=d.envio_id where d.cobranca_id=v_c.id and e.status='aguardando_conferencia') then raise exception 'Confira ou redistribua o comprovante pendente antes do acordo.'; end if;
   select coalesce(sum(valor_aplicado),0) into pago from public.financeiro_pagamento_aplicacoes where cobranca_id=v_c.id;
   if v_c.valor_original-pago<=0 then raise exception 'Uma cobrança já está quitada.'; end if;
   total:=total+v_c.valor_original-pago;
   snap:=snap||jsonb_build_array(to_jsonb(v_c)||jsonb_build_object('pago',pago,'saldo',v_c.valor_original-pago));
  end loop;
  if p_valor is not null and p_valor<>total then raise exception 'O saldo mudou. Atualize e revise o acordo.'; end if;
  centavos:=(total*100)::bigint; base:=centavos/p_parcelas; ultimo:=centavos-base*(p_parcelas-1);
  if base<1 then raise exception 'Valor insuficiente para essa quantidade de parcelas.'; end if;
  insert into public.financeiro_acordos(usuario_id,valor_divida_original,valor_acordado,quantidade_parcelas,data_acordo,primeira_parcela,status,observacao) values(p_usuario,total,total,p_parcelas,timezone('America/Sao_Paulo',now())::date,p_inicio,'ativo',btrim(p_motivo)) returning id into rid;
  insert into public.financeiro_acordo_origens(acordo_id,cobranca_id,valor_incorporado) select rid,c.id,c.valor_original-coalesce((select sum(valor_aplicado) from public.financeiro_pagamento_aplicacoes where cobranca_id=c.id),0) from public.financeiro_cobrancas c where id=any(ids);
  update public.financeiro_cobrancas set status='renegociada',atualizado_em=now() where id=any(ids);
  for n in 1..p_parcelas loop
   parcela:=(case when n=p_parcelas then ultimo else base end)::numeric/100;
   venc:=(p_inicio+make_interval(months=>n-1))::date;
   insert into public.financeiro_cobrancas(usuario_id,tipo,competencia,data_vencimento,valor_original,descricao,status) values(p_usuario,'cobranca_extra',date_trunc('month',venc)::date,venc,parcela,'Acordo #'||rid||' — parcela '||n||'/'||p_parcelas,'aberta') returning id into cid;
   insert into public.financeiro_acordo_parcelas(acordo_id,numero_parcela,data_vencimento,valor,status,cobranca_id) values(rid,n,venc,parcela,'aberta',cid);
  end loop;
 end if;
 insert into public.financeiro_negociacoes_auditoria(requisicao,realizado_por,acao,registro_id,dados) values(p_requisicao,autor,p_acao,rid,jsonb_build_object('pedido',assinatura,'cobrancas_antes',snap));
 return rid;
end;$$;
create function public.financeiro_negociacao_criar(p_requisicao uuid,p_acao text,p_usuario uuid,p_valor numeric,p_inicio date,p_fim date default null,p_cobrancas bigint[] default null,p_parcelas integer default null,p_motivo text default '') returns bigint
language sql security invoker set search_path='' as $$select private.financeiro_negociacao_criar(p_requisicao,p_acao,p_usuario,p_valor,p_inicio,p_fim,p_cobrancas,p_parcelas,p_motivo);$$;

create function private.financeiro_parcela_sincronizar() returns trigger language plpgsql security definer set search_path='' as $$
declare aid bigint;
begin
 update public.financeiro_acordo_parcelas set status=new.status,atualizado_em=now() where cobranca_id=new.id returning acordo_id into aid;
 if aid is not null then
  perform 1 from public.financeiro_acordos where id=aid for update;
  update public.financeiro_acordos set status=case when not exists(select 1 from public.financeiro_acordo_parcelas where acordo_id=aid and status<>'paga') then 'quitado' else 'ativo' end,atualizado_em=now() where id=aid and status<>'cancelado';
 end if;
 return null;
end;$$;
create trigger financeiro_parcela_status after update of status on public.financeiro_cobrancas for each row when(old.status is distinct from new.status) execute function private.financeiro_parcela_sincronizar();
-- Impede que aplicações diretas reabram cobranças incorporadas a acordos.
create function private.financeiro_aplicacao_validar_negociada() returns trigger language plpgsql security definer set search_path='' as $$
begin
 perform 1 from public.financeiro_cobrancas where id in (new.cobranca_id,old.cobranca_id) order by id for update;
 if exists(select 1 from public.financeiro_cobrancas where id in(new.cobranca_id,old.cobranca_id) and status='renegociada') then raise exception 'Cobrança incorporada a acordo; utilize as parcelas.'; end if;
 return case when tg_op='DELETE' then old else new end;
end;$$;
create trigger financeiro_aplicacao_negociada before insert or update or delete on public.financeiro_pagamento_aplicacoes for each row execute function private.financeiro_aplicacao_validar_negociada();

create function private.financeiro_negociacoes_listar(p_usuario uuid) returns jsonb language plpgsql stable security definer set search_path='' as $$
begin
 if not coalesce(private.financeiro_pode_negociar(),false) then raise exception 'Acesso não autorizado.'; end if;
 return jsonb_build_object(
 'pessoas',(select coalesce(jsonb_agg(jsonb_build_object('id',id,'nome',nome_completo) order by nome_completo),'[]') from public.usuarios where status='ativo'),
 'cobrancas',(select coalesce(jsonb_agg(to_jsonb(t) order by t.competencia,t.id),'[]') from (select c.*,c.valor_original-coalesce((select sum(valor_aplicado) from public.financeiro_pagamento_aplicacoes where cobranca_id=c.id),0) saldo,
 exists(select 1 from public.financeiro_comprovantes_destinacoes d join public.financeiro_comprovantes_envios e on e.id=d.envio_id where d.cobranca_id=c.id and e.status='aguardando_conferencia') pendente
 from public.financeiro_cobrancas c where c.usuario_id=p_usuario and c.status in('aberta','parcial') and not exists(select 1 from public.financeiro_acordo_parcelas where cobranca_id=c.id) and (c.tipo='mensalidade' or exists(select 1 from public.financeiro_obrigacao_participantes where cobranca_id=c.id)))t),
 'reducoes',(select coalesce(jsonb_agg(to_jsonb(a) order by inicio_vigencia desc),'[]') from public.financeiro_ajustes_mensalidade a where usuario_id=p_usuario),
 'acordos',(select coalesce(jsonb_agg(to_jsonb(a)||jsonb_build_object('origens',(select coalesce(jsonb_agg(to_jsonb(o)||jsonb_build_object('descricao',c.descricao,'competencia',c.competencia)),'[]') from public.financeiro_acordo_origens o join public.financeiro_cobrancas c on c.id=o.cobranca_id where o.acordo_id=a.id),'parcelas',(select coalesce(jsonb_agg(to_jsonb(p)||jsonb_build_object('saldo',greatest(0,p.valor-coalesce((select sum(valor_aplicado) from public.financeiro_pagamento_aplicacoes where cobranca_id=p.cobranca_id),0))) order by numero_parcela),'[]') from public.financeiro_acordo_parcelas p where acordo_id=a.id)) order by a.id desc),'[]') from public.financeiro_acordos a where usuario_id=p_usuario));
end;$$;
create function public.financeiro_negociacoes_listar(p_usuario uuid default null) returns jsonb language sql stable security invoker set search_path='' as $$select private.financeiro_negociacoes_listar(p_usuario);$$;
-- Escritas unicamente pelas operações validadas. Helpers privados não expostos no REST.
revoke insert,update,delete,truncate on public.financeiro_ajustes_mensalidade,public.financeiro_acordos,public.financeiro_acordo_origens,public.financeiro_acordo_parcelas from anon,authenticated;
do $$declare f record;begin
 for f in select oid::regprocedure identidade,pronamespace::regnamespace esquema,proname from pg_proc where pronamespace in('public'::regnamespace,'private'::regnamespace) and proname in('financeiro_pode_negociar','financeiro_negociacao_criar','financeiro_negociacoes_listar','financeiro_reducao_aplicar','financeiro_parcela_sincronizar','financeiro_aplicacao_validar_negociada') loop
 execute format('revoke all on function %s from public,anon,authenticated',f.identidade);
 if f.proname in('financeiro_pode_negociar','financeiro_negociacao_criar','financeiro_negociacoes_listar') then execute format('grant execute on function %s to authenticated',f.identidade); end if;
 end loop;
end;$$;

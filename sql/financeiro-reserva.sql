-- Etapa 13. Saldos e transferências em schema privado, fora do balancete.
begin;
create table private.financeiro_reserva_permissoes (
 usuario_id uuid primary key references public.usuarios(id),
 movimentar boolean not null default false
);
create table private.financeiro_reserva_permissoes_auditoria (
 id bigint generated always as identity primary key,
 autor uuid not null references public.usuarios(id), registrado_em timestamptz not null default now(),
 anteriores jsonb not null, posteriores jsonb not null
);
create table private.financeiro_reserva_abertura (
 id integer primary key check(id=1), requisicao uuid not null unique,
 inicio date not null check(inicio between '2000-01-01' and '2100-12-31'),
 caixa numeric(15,2) not null, reserva numeric(15,2) not null check(reserva>=0),
 motivo text not null check(length(btrim(motivo)) between 1 and 1000),
 autor uuid not null references public.usuarios(id), registrado_em timestamptz not null default now()
);
create table private.financeiro_reserva_movimentos (
 id bigint generated always as identity primary key, requisicao uuid not null unique,
 data date not null, tipo text not null check(tipo in('aporte','resgate','ajuste_caixa','ajuste_reserva')),
 valor numeric(15,2) not null check(valor<>0),
 motivo text not null check(length(btrim(motivo)) between 1 and 1000),
 autor uuid not null references public.usuarios(id), registrado_em timestamptz not null default now(),
 check(tipo in('ajuste_caixa','ajuste_reserva') or valor>0)
);
create index financeiro_reserva_movimentos_data on private.financeiro_reserva_movimentos(data,id);
alter table private.financeiro_reserva_permissoes enable row level security;
alter table private.financeiro_reserva_permissoes_auditoria enable row level security;
alter table private.financeiro_reserva_abertura enable row level security;
alter table private.financeiro_reserva_movimentos enable row level security;
revoke all on private.financeiro_reserva_permissoes, private.financeiro_reserva_permissoes_auditoria,
 private.financeiro_reserva_abertura, private.financeiro_reserva_movimentos from public,anon,authenticated;
-- Nenhuma outra permissão financeira concede acesso por herança.
insert into private.financeiro_reserva_permissoes(usuario_id,movimentar)
 select id,true from public.usuarios where email='prof.thiago.magueta@gmail.com' and status='ativo';

create function private.financeiro_reserva_acesso() returns jsonb
language sql stable security definer set search_path='' as $$
 select jsonb_build_object(
 'visualizar',auth.uid() is not null and coalesce(public.usuario_pode_acessar_financeiro(),false) and exists(
 select 1 from public.usuarios u join private.financeiro_reserva_permissoes p on p.usuario_id=u.id where u.auth_id=auth.uid() and u.status='ativo'),
 'movimentar',auth.uid() is not null and coalesce(public.usuario_pode_acessar_financeiro(),false) and exists(
 select 1 from public.usuarios u join private.financeiro_reserva_permissoes p on p.usuario_id=u.id where u.auth_id=auth.uid() and u.status='ativo' and p.movimentar),
 'permissoes',auth.uid() is not null and coalesce(public.usuario_pode_gerenciar_permissoes(),false) and coalesce(public.usuario_pode_acessar_financeiro(),false) and exists(select 1 from public.usuarios where auth_id=auth.uid() and status='ativo'));
$$;

create function private.financeiro_reserva_responsaveis(p_visualizadores uuid[],p_editores uuid[]) returns jsonb
language plpgsql security definer set search_path='' as $$
declare anterior jsonb; posterior jsonb; autor uuid;
begin
 if not (private.financeiro_reserva_acesso()->>'permissoes')::boolean then raise exception 'Acesso não autorizado para gerenciar permissões.';end if;
 if (p_visualizadores is null)<>(p_editores is null) then raise exception 'Informe ambas as listas.';end if;
 if p_visualizadores is not null then
  perform pg_advisory_xact_lock(hashtextextended('financeiro_reserva_permissoes',13));
  if cardinality(p_visualizadores)>100 or cardinality(p_editores)>100
   or exists(select 1 from unnest(p_visualizadores) x(id) where x.id is null or not exists(select 1 from public.usuarios u join public.responsaveis_financeiro r on r.usuario_id=u.id where u.id=x.id and u.status='ativo'))
   or exists(select 1 from unnest(p_editores) x(id) where x.id is null or not(x.id=any(p_visualizadores))) then raise exception 'Escolha usuários ativos dos testes financeiros. Para movimentar, é necessário visualizar.';end if;
  select coalesce(jsonb_agg(to_jsonb(p) order by usuario_id),'[]') into anterior from private.financeiro_reserva_permissoes p;
  delete from private.financeiro_reserva_permissoes where not(usuario_id=any(p_visualizadores));
  insert into private.financeiro_reserva_permissoes(usuario_id,movimentar)
   select distinct id,id=any(p_editores) from unnest(p_visualizadores) x(id)
   on conflict(usuario_id) do update set movimentar=excluded.movimentar;
  select coalesce(jsonb_agg(to_jsonb(p) order by usuario_id),'[]') into posterior from private.financeiro_reserva_permissoes p;
  select id into strict autor from public.usuarios where auth_id=auth.uid() and status='ativo';
  insert into private.financeiro_reserva_permissoes_auditoria(autor,anteriores,posteriores) values(autor,anterior,posterior);
 end if;
 return jsonb_build_object('pessoas',(select coalesce(jsonb_agg(jsonb_build_object('id',u.id,'nome',u.nome_completo) order by u.nome_completo),'[]') from public.usuarios u where u.status='ativo' and exists(select 1 from public.responsaveis_financeiro r where r.usuario_id=u.id)),
 'selecionados',(select coalesce(jsonb_agg(to_jsonb(p) order by usuario_id),'[]') from private.financeiro_reserva_permissoes p));
end;$$;

create function private.financeiro_reserva_posicao(p_data date) returns jsonb
language plpgsql stable security definer set search_path='' as $$
declare abertura private.financeiro_reserva_abertura%rowtype; entradas numeric:=0; saidas numeric:=0; dc numeric:=0; dr numeric:=0;
begin
 if not (private.financeiro_reserva_acesso()->>'visualizar')::boolean then raise exception 'Acesso não autorizado.';end if;
 if p_data is null or p_data not between '2000-01-01' and (now() at time zone 'America/Sao_Paulo')::date then raise exception 'Data inválida.';end if;
 select * into abertura from private.financeiro_reserva_abertura where id=1;
 if not found then return jsonb_build_object('configurado',false);end if;
 if p_data<abertura.inicio then raise exception 'Escolha uma data a partir do início do controle.';end if;
 -- Mesmas fontes do Caixa: manuais ativos e recebimentos com comprovante aprovado.
 select coalesce(sum(l.valor) filter(where c.tipo='receita'),0),coalesce(sum(l.valor) filter(where c.tipo='despesa'),0)
 into entradas,saidas from public.financeiro_lancamentos l join public.financeiro_categorias c on c.id=l.categoria_id
 where l.status='ativo' and l.data_movimento between abertura.inicio and p_data;
 entradas:=entradas+(select coalesce(sum(r.valor_recebido),0) from public.financeiro_recebimentos r where r.data_pagamento between abertura.inicio and p_data and exists(select 1 from public.financeiro_comprovantes_envios e where e.recebimento_id=r.id and e.status='aprovado'));
 select coalesce(sum(case tipo when 'aporte' then -valor when 'resgate' then valor when 'ajuste_caixa' then valor else 0 end),0),
 coalesce(sum(case tipo when 'aporte' then valor when 'resgate' then -valor when 'ajuste_reserva' then valor else 0 end),0)
 into dc,dr from private.financeiro_reserva_movimentos where data<=p_data;
 return jsonb_build_object('configurado',true,'data',p_data,'abertura',to_jsonb(abertura)-'requisicao',
 'entradas',entradas,'saidas',saidas,'resultado',entradas-saidas,'variacao_caixa',dc,'variacao_reserva',dr,
 'caixa',abertura.caixa+entradas-saidas+dc,'reserva',abertura.reserva+dr,'total',abertura.caixa+abertura.reserva+entradas-saidas+dc+dr);
end;$$;

create function private.financeiro_reserva_iniciar(p_inicio date,p_caixa numeric,p_reserva numeric,p_motivo text,p_requisicao uuid) returns jsonb
language plpgsql security definer set search_path='' as $$
declare autor uuid; a private.financeiro_reserva_abertura%rowtype;
begin
 if not (private.financeiro_reserva_acesso()->>'movimentar')::boolean then raise exception 'Acesso não autorizado para movimentar.';end if;
 if p_inicio is null or p_inicio not between '2000-01-01' and (now() at time zone 'America/Sao_Paulo')::date
 or p_caixa is null or abs(p_caixa)>=1000000000000 or p_caixa<>round(p_caixa,2)
 or p_reserva is null or p_reserva<0 or p_reserva>=1000000000000 or p_reserva<>round(p_reserva,2)
 or p_requisicao is null or p_motivo is null or length(btrim(p_motivo)) not between 1 and 1000 then raise exception 'Confira a data, os saldos e a justificativa.';end if;
 select id into strict autor from public.usuarios where auth_id=auth.uid() and status='ativo';
 perform pg_advisory_xact_lock(hashtextextended('financeiro_reserva_operacao',13));
 select * into a from private.financeiro_reserva_abertura where id=1;
 if found then
  if a.requisicao=p_requisicao and a.autor=autor and a.inicio=p_inicio and a.caixa=p_caixa and a.reserva=p_reserva and a.motivo=btrim(p_motivo) then return jsonb_build_object('ok',true);end if;
  raise exception 'O saldo inicial já foi definido. Use um ajuste justificado para corrigir valores.';
 end if;
 insert into private.financeiro_reserva_abertura(id,requisicao,inicio,caixa,reserva,motivo,autor) values(1,p_requisicao,p_inicio,p_caixa,p_reserva,btrim(p_motivo),autor);
 return jsonb_build_object('ok',true);
end;$$;

create function private.financeiro_reserva_registrar(p_data date,p_tipo text,p_valor numeric,p_motivo text,p_requisicao uuid) returns jsonb
language plpgsql security definer set search_path='' as $$
declare autor uuid; a private.financeiro_reserva_abertura%rowtype; m private.financeiro_reserva_movimentos%rowtype; posicao jsonb; minimo numeric;
begin
 if not (private.financeiro_reserva_acesso()->>'movimentar')::boolean then raise exception 'Acesso não autorizado para movimentar.';end if;
 if p_tipo is null or p_tipo not in('aporte','resgate','ajuste_caixa','ajuste_reserva') or p_valor is null or p_valor=0 or abs(p_valor)>=1000000000000 or p_valor<>round(p_valor,2)
 or (p_tipo in('aporte','resgate') and p_valor<0) or p_requisicao is null or p_motivo is null or length(btrim(p_motivo)) not between 1 and 1000 then raise exception 'Confira o tipo, o valor e a justificativa.';end if;
 select id into strict autor from public.usuarios where auth_id=auth.uid() and status='ativo';
 perform pg_advisory_xact_lock(hashtextextended('financeiro_reserva_operacao',13));
 select * into m from private.financeiro_reserva_movimentos where requisicao=p_requisicao;
 if found then
  if m.autor<>autor or m.data is distinct from p_data or m.tipo<>p_tipo or m.valor<>p_valor or m.motivo<>btrim(p_motivo) then raise exception 'Identificador utilizado em outra operação.';end if;
  return jsonb_build_object('id',m.id);
 end if;
 select * into a from private.financeiro_reserva_abertura where id=1;
 if not found then raise exception 'Defina primeiro os saldos iniciais.';end if;
 if p_data is null or p_data<a.inicio or p_data>(now() at time zone 'America/Sao_Paulo')::date then raise exception 'Data fora do período de controle.';end if;
 posicao:=private.financeiro_reserva_posicao(p_data);
 if p_tipo='aporte' and p_valor>(posicao->>'caixa')::numeric then raise exception 'Saldo disponível insuficiente para o aporte.';end if;
 insert into private.financeiro_reserva_movimentos(requisicao,data,tipo,valor,motivo,autor) values(p_requisicao,p_data,p_tipo,p_valor,btrim(p_motivo),autor) returning * into m;
 -- Validação de toda a sequência: um resgate retroativo não pode tornar a reserva negativa depois.
 select min(saldo) into minimo from (
 select a.reserva+sum(delta) over(order by data rows unbounded preceding) saldo from (
 select data,sum(case tipo when 'aporte' then valor when 'resgate' then -valor when 'ajuste_reserva' then valor else 0 end) delta
 from private.financeiro_reserva_movimentos group by data) dias) saldos;
 if minimo<0 then raise exception 'A movimentação deixaria o Fundo de Reserva negativo.';end if;
 return jsonb_build_object('id',m.id);
end;$$;

create function private.financeiro_reserva_historico(p_data date,p_offset integer) returns jsonb
language plpgsql stable security definer set search_path='' as $$
begin
 if not (private.financeiro_reserva_acesso()->>'visualizar')::boolean then raise exception 'Acesso não autorizado.';end if;
 if p_data is null or p_offset is null or p_offset<0 then raise exception 'Filtros inválidos.';end if;
 return jsonb_build_object('total',(select count(*) from private.financeiro_reserva_movimentos where data<=p_data),
 'movimentos',(select coalesce(jsonb_agg(to_jsonb(t) order by t.data desc,t.id desc),'[]') from (
 select m.id,m.data,m.tipo,m.valor,m.motivo,m.registrado_em,u.nome_completo responsavel from private.financeiro_reserva_movimentos m join public.usuarios u on u.id=m.autor where m.data<=p_data order by m.data desc,m.id desc limit 30 offset p_offset)t));
end;$$;

create function public.financeiro_reserva_acesso() returns jsonb language sql stable security invoker set search_path='' as $$select private.financeiro_reserva_acesso();$$;
create function public.financeiro_reserva_responsaveis(p_visualizadores uuid[] default null,p_editores uuid[] default null) returns jsonb language sql security invoker set search_path='' as $$select private.financeiro_reserva_responsaveis(p_visualizadores,p_editores);$$;
create function public.financeiro_reserva_posicao(p_data date) returns jsonb language sql stable security invoker set search_path='' as $$select private.financeiro_reserva_posicao(p_data);$$;
create function public.financeiro_reserva_iniciar(p_inicio date,p_caixa numeric,p_reserva numeric,p_motivo text,p_requisicao uuid) returns jsonb language sql security invoker set search_path='' as $$select private.financeiro_reserva_iniciar(p_inicio,p_caixa,p_reserva,p_motivo,p_requisicao);$$;
create function public.financeiro_reserva_registrar(p_data date,p_tipo text,p_valor numeric,p_motivo text,p_requisicao uuid) returns jsonb language sql security invoker set search_path='' as $$select private.financeiro_reserva_registrar(p_data,p_tipo,p_valor,p_motivo,p_requisicao);$$;
create function public.financeiro_reserva_historico(p_data date,p_offset integer default 0) returns jsonb language sql stable security invoker set search_path='' as $$select private.financeiro_reserva_historico(p_data,p_offset);$$;
do $$declare f record;begin
 for f in select oid::regprocedure identidade from pg_proc where pronamespace in('private'::regnamespace,'public'::regnamespace) and proname like 'financeiro_reserva_%' loop
 execute format('revoke all on function %s from public,anon,authenticated',f.identidade);
 execute format('grant execute on function %s to authenticated',f.identidade);
 end loop;
end;$$;
commit;

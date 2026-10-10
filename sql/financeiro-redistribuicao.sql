-- Redistribuição administrativa antes da conferência, preservando o total do comprovante.
alter table public.financeiro_comprovantes_envios add column distribuicao_versao integer not null default 1 check(distribuicao_versao>0);
create table private.financeiro_redistribuicoes (
 id uuid primary key, envio_id uuid not null references public.financeiro_comprovantes_envios(id),
 realizado_por uuid not null references public.usuarios(id), registrado_em timestamptz not null default now(),
 versao_anterior integer not null, pedido jsonb not null, anteriores jsonb not null, posteriores jsonb not null
);
create index on private.financeiro_redistribuicoes(envio_id,registrado_em);
alter table private.financeiro_redistribuicoes enable row level security;
revoke all on private.financeiro_redistribuicoes from public,anon,authenticated;
create policy redistribuicoes_acesso_direto_bloqueado on private.financeiro_redistribuicoes as restrictive for all to authenticated using(false) with check(false);
create function private.financeiro_redistribuicao_opcoes(p_envio uuid) returns jsonb
 language plpgsql stable security definer set search_path='' as $$
declare e public.financeiro_comprovantes_envios%rowtype;
begin
 if not coalesce(private.financeiro_pode_conferir(),false) then raise exception 'Acesso não autorizado.'; end if;
 select * into e from public.financeiro_comprovantes_envios where id=p_envio;
 if not found or e.status<>'aguardando_conferencia' then raise exception 'Somente pagamentos aguardando conferência podem ser redistribuídos.'; end if;
 return jsonb_build_object('valor',e.valor,'versao',e.distribuicao_versao,
 'destinacoes',(select coalesce(jsonb_agg(jsonb_build_object('cobranca_id',d.cobranca_id,'valor',d.valor) order by d.cobranca_id),'[]'::jsonb) from public.financeiro_comprovantes_destinacoes d where d.envio_id=p_envio),
 'cobrancas',(select coalesce(jsonb_agg(t order by t.nome,t.competencia,t.id),'[]'::jsonb) from (
 select c.id,c.usuario_id,u.nome_completo nome,c.tipo,c.competencia,c.descricao,
 greatest(0,c.valor_original-coalesce((select sum(valor_aplicado) from public.financeiro_pagamento_aplicacoes where cobranca_id=c.id),0)
 -coalesce((select sum(d.valor) from public.financeiro_comprovantes_destinacoes d join public.financeiro_comprovantes_envios ee on ee.id=d.envio_id where d.cobranca_id=c.id and ee.status='aguardando_conferencia' and ee.id<>p_envio),0)) saldo
 from public.financeiro_cobrancas c join public.usuarios u on u.id=c.usuario_id
 where c.status in('aberta','parcial') and u.status='ativo')t));
end;$$;
create function public.financeiro_redistribuicao_opcoes(p_envio uuid) returns jsonb language sql stable security invoker set search_path='' as $$select private.financeiro_redistribuicao_opcoes(p_envio);$$;
revoke all on function private.financeiro_redistribuicao_opcoes(uuid),public.financeiro_redistribuicao_opcoes(uuid) from public,anon;
grant execute on function private.financeiro_redistribuicao_opcoes(uuid),public.financeiro_redistribuicao_opcoes(uuid) to authenticated;
create function private.financeiro_redistribuir(p_envio uuid,p_versao integer,p_destinacoes jsonb,p_alteracao uuid) returns jsonb
 language plpgsql security definer set search_path='' as $$
declare e public.financeiro_comprovantes_envios%rowtype; a private.financeiro_redistribuicoes%rowtype;
 autor uuid; item record; c public.financeiro_cobrancas%rowtype; pago numeric; pendente numeric; antes jsonb; depois jsonb; pedido jsonb;
begin
 if not coalesce(private.financeiro_pode_conferir(),false) then raise exception 'Acesso não autorizado.'; end if;
 if p_envio is null or p_versao is null or p_versao<1 or p_alteracao is null or p_destinacoes is null or jsonb_typeof(p_destinacoes)<>'array' or jsonb_array_length(p_destinacoes) not between 1 and 100 then raise exception 'Selecione as cobranças e os valores.'; end if;
 select id into autor from public.usuarios where auth_id=auth.uid() and status='ativo';
 select * into e from public.financeiro_comprovantes_envios where id=p_envio for update;
 if not found then raise exception 'Comprovante não encontrado.'; end if;
 if (select count(*)<>count(distinct cobranca_id) or sum(valor)<>e.valor or bool_or(valor is null or valor<=0 or valor<>round(valor,2) or cobranca_id is null) from jsonb_to_recordset(p_destinacoes) x(cobranca_id bigint,valor numeric)) then raise exception 'A distribuição deve totalizar exatamente o valor pago, sem cobranças repetidas.'; end if;
 select jsonb_agg(jsonb_build_object('cobranca_id',cobranca_id,'valor',valor) order by cobranca_id) into pedido from jsonb_to_recordset(p_destinacoes) x(cobranca_id bigint,valor numeric);
 select * into a from private.financeiro_redistribuicoes where id=p_alteracao;
 if found then
  if a.envio_id=p_envio and a.realizado_por=autor and a.pedido=pedido and a.versao_anterior=p_versao then return jsonb_build_object('versao',e.distribuicao_versao,'ja_salvo',true); end if;
  raise exception 'Identificador de alteração indisponível.';
 end if;
 if e.status<>'aguardando_conferencia' then raise exception 'Somente pagamentos aguardando conferência podem ser redistribuídos.'; end if;
 if e.distribuicao_versao<>p_versao then raise exception 'A distribuição foi alterada por outra pessoa. Atualize a lista.'; end if;
 perform 1 from public.financeiro_cobrancas where id in(
 select cobranca_id from public.financeiro_comprovantes_destinacoes where envio_id=p_envio
 union select cobranca_id from jsonb_to_recordset(p_destinacoes) x(cobranca_id bigint)) order by id for update;
 for item in select * from jsonb_to_recordset(p_destinacoes) x(cobranca_id bigint,valor numeric) order by cobranca_id loop
  select * into c from public.financeiro_cobrancas where id=item.cobranca_id;
  if not found or c.status not in('aberta','parcial') or not exists(select 1 from public.usuarios where id=c.usuario_id and status='ativo') then raise exception 'Cobrança indisponível. Nenhuma alteração realizada.'; end if;
  select coalesce(sum(valor_aplicado),0) into pago from public.financeiro_pagamento_aplicacoes where cobranca_id=c.id;
  select coalesce(sum(dd.valor),0) into pendente from public.financeiro_comprovantes_destinacoes dd join public.financeiro_comprovantes_envios ee on ee.id=dd.envio_id where dd.cobranca_id=c.id and ee.status='aguardando_conferencia' and ee.id<>p_envio;
  if item.valor>c.valor_original-pago-pendente then raise exception 'O valor ultrapassa o saldo disponível da cobrança. Atualize a lista.'; end if;
 end loop;
 select coalesce(jsonb_agg(to_jsonb(t) order by t.cobranca_id),'[]'::jsonb) into antes from(select d.cobranca_id,d.usuario_id,u.nome_completo nome,d.descricao,d.valor from public.financeiro_comprovantes_destinacoes d join public.usuarios u on u.id=d.usuario_id where d.envio_id=p_envio)t;
 delete from public.financeiro_comprovantes_destinacoes where envio_id=p_envio;
 insert into public.financeiro_comprovantes_destinacoes(envio_id,cobranca_id,usuario_id,descricao,valor)
 select p_envio,charge.id,charge.usuario_id,coalesce(charge.descricao,charge.tipo||' '||coalesce(charge.competencia::text,'')),x.valor from jsonb_to_recordset(p_destinacoes) x(cobranca_id bigint,valor numeric) join publicharge.financeiro_cobrancas charge on charge.id=x.cobranca_id;
 select jsonb_agg(to_jsonb(t) order by t.cobranca_id) into depois from(select d.cobranca_id,d.usuario_id,u.nome_completo nome,d.descricao,d.valor from public.financeiro_comprovantes_destinacoes d join public.usuarios u on u.id=d.usuario_id where d.envio_id=p_envio)t;
 insert into private.financeiro_redistribuicoes(id,envio_id,realizado_por,versao_anterior,pedido,anteriores,posteriores) values(p_alteracao,p_envio,autor,p_versao,pedido,antes,depois);
 update public.financeiro_comprovantes_envios set distribuicao_versao=distribuicao_versao+1 where id=p_envio;
 return jsonb_build_object('versao',e.distribuicao_versao+1,'ja_salvo',false);
end;$$;
create function public.financeiro_redistribuir(p_envio uuid,p_versao integer,p_destinacoes jsonb,p_alteracao uuid) returns jsonb language sql security invoker set search_path='' as $$select private.financeiro_redistribuir(p_envio,p_versao,p_destinacoes,p_alteracao);$$;
revoke all on function private.financeiro_redistribuir(uuid,integer,jsonb,uuid),public.financeiro_redistribuir(uuid,integer,jsonb,uuid) from public,anon;
grant execute on function private.financeiro_redistribuir(uuid,integer,jsonb,uuid),public.financeiro_redistribuir(uuid,integer,jsonb,uuid) to authenticated;
-- Conferência com versão impede aprovar uma distribuição diferente da exibida.
create function private.financeiro_conferir_versao(p_envio uuid,p_decisao text,p_motivo text,p_versao integer) returns jsonb language plpgsql security definer set search_path='' as $$
declare e public.financeiro_comprovantes_envios%rowtype;
begin
 if not coalesce(private.financeiro_pode_conferir(),false) then raise exception 'Acesso não autorizado.'; end if;
 select * into e from public.financeiro_comprovantes_envios where id=p_envio for update;
 if not found then raise exception 'Comprovante não encontrado.'; end if;
 if p_versao is null or e.distribuicao_versao<>p_versao then raise exception 'A distribuição foi alterada. Atualize a lista antes de conferir.'; end if;
 return private.financeiro_conferir(p_envio,p_decisao,p_motivo);
end;$$;
create function public.financeiro_conferir_atual(p_envio uuid,p_decisao text,p_motivo text,p_versao integer) returns jsonb language sql security invoker set search_path='' as $$select private.financeiro_conferir_versao(p_envio,p_decisao,p_motivo,p_versao);$$;
revoke all on function private.financeiro_conferir_versao(uuid,text,text,integer),public.financeiro_conferir_atual(uuid,text,text,integer) from public,anon;
grant execute on function private.financeiro_conferir_versao(uuid,text,text,integer),public.financeiro_conferir_atual(uuid,text,text,integer) to authenticated;
-- Cliente antigo só pode conferir a versão inicial. O endpoint atualizado exige versão.
create or replace function public.financeiro_conferir(p_envio uuid,p_decisao text,p_motivo text default '') returns jsonb language sql security invoker set search_path='' as $$select private.financeiro_conferir_versao(p_envio,p_decisao,p_motivo,1);$$;
-- Helper original torna-se implementação interna, não um caminho alternativo de conferência.
revoke execute on function private.financeiro_conferir(uuid,text,text) from authenticated;
create or replace function private.financeiro_conferencia_listar(p_status text,p_offset integer) returns jsonb
 language plpgsql stable security definer set search_path='' as $$
begin
 if not coalesce(private.financeiro_pode_conferir(),false) then raise exception 'Acesso não autorizado.'; end if;
 if p_status is null or p_status not in('aguardando_conferencia','aprovado','rejeitado') or p_offset is null or p_offset<0 then raise exception 'Filtro inválido.'; end if;
 return jsonb_build_object('total',(select count(*) from public.financeiro_comprovantes_envios where status=p_status),
 'envios',(select coalesce(jsonb_agg(t order by t.enviado_em,t.id),'[]'::jsonb) from (
 select e.*,u.nome_completo nome_conferente,
 (select coalesce(jsonb_agg(jsonb_build_object('realizado_por',au.nome_completo,'registrado_em',r.registrado_em,'anteriores',r.anteriores,'posteriores',r.posteriores) order by r.registrado_em,r.id),'[]'::jsonb)
 from private.financeiro_redistribuicoes r join public.usuarios au on au.id=r.realizado_por where r.envio_id=e.id) redistribuicoes,
 (select coalesce(jsonb_agg(jsonb_build_object('cobranca_id',d.cobranca_id,'usuario_id',d.usuario_id,'nome',a.nome_completo,'descricao',d.descricao,'valor',d.valor,'competencia',c.competencia,'tipo',c.tipo) order by a.nome_completo,c.competencia,d.cobranca_id),'[]'::jsonb)
 from public.financeiro_comprovantes_destinacoes d join public.usuarios a on a.id=d.usuario_id join public.financeiro_cobrancas c on c.id=d.cobranca_id where d.envio_id=e.id) destinacoes
 from public.financeiro_comprovantes_envios e left join public.usuarios u on u.id=e.conferido_por where e.status=p_status order by e.enviado_em,e.id limit 30 offset p_offset)t));
end;$$;

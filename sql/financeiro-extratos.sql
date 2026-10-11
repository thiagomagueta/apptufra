-- Etapa 9. Importar nunca cria receita, despesa ou baixa.
begin;
create table public.financeiro_extratos(
 id uuid primary key, conta text not null check(length(btrim(conta)) between 1 and 100),
 nome text not null check(length(nome) between 1 and 200), hash text not null check(hash~'^[a-f0-9]{64}$'),
 mapa jsonb not null, importado_por uuid not null references public.usuarios(id), criado_em timestamptz not null default now(),
 unique(conta,hash)
);
create table public.financeiro_extrato_itens(
 id bigint generated always as identity primary key, extrato_id uuid not null references public.financeiro_extratos(id),
 linha integer not null, data date not null, descricao text not null check(length(descricao) between 1 and 300),
 valor numeric(14,2) not null check(valor<>0 and abs(valor)<=99999999.99), referencia text not null default '',
 original jsonb not null, fingerprint text not null, ocorrencia integer not null,
 status text not null default 'pendente' check(status in('pendente','revisar_duplicidade','conciliado','ignorado')),
 duplicado_de bigint references public.financeiro_extrato_itens(id),
 resultado jsonb, atualizado_em timestamptz not null default now(), unique(extrato_id,linha)
);
create index financeiro_extrato_fingerprint on public.financeiro_extrato_itens(fingerprint);
create index financeiro_extrato_lista on public.financeiro_extrato_itens(extrato_id,status,id);
create table private.financeiro_extrato_auditoria(
 id bigint generated always as identity primary key, item_id bigint not null references public.financeiro_extrato_itens(id),
 autor uuid not null references public.usuarios(id), data timestamptz not null default now(), acao text not null,
 motivo text not null, antes jsonb not null, depois jsonb not null
);
alter table public.financeiro_comprovantes_envios add column extrato_item_id bigint unique references public.financeiro_extrato_itens(id);
alter table public.financeiro_extratos enable row level security;
alter table public.financeiro_extrato_itens enable row level security;
alter table private.financeiro_extrato_auditoria enable row level security;
revoke all on public.financeiro_extratos,public.financeiro_extrato_itens,private.financeiro_extrato_auditoria from public,anon,authenticated;
grant select on public.financeiro_extratos,public.financeiro_extrato_itens to authenticated;
create policy extratos_leitura on public.financeiro_extratos for select to authenticated using(private.financeiro_pode_negociar() and private.financeiro_pode_conferir());
create policy extrato_itens_leitura on public.financeiro_extrato_itens for select to authenticated using(private.financeiro_pode_negociar() and private.financeiro_pode_conferir());

create function private.financeiro_extrato_importar(p_id uuid,p_conta text,p_nome text,p_hash text,p_mapa jsonb,p_itens jsonb) returns uuid
language plpgsql security definer set search_path='' as $$
declare autor uuid; existente public.financeiro_extratos%rowtype; x record; chave text; dupe bigint;
begin
 if not coalesce(private.financeiro_pode_negociar() and private.financeiro_pode_conferir(),false) then raise exception 'Acesso não autorizado.';end if;
 if p_id is null or p_conta is null or length(btrim(p_conta)) not between 1 and 100 or p_nome is null or length(p_nome) not between 1 and 200 or p_hash is null or p_hash!~'^[a-f0-9]{64}$' or p_mapa is null or p_itens is null or jsonb_typeof(p_itens)<>'array' or jsonb_array_length(p_itens) not between 1 and 2000 then raise exception 'Importação inválida.';end if;
 select id into strict autor from public.usuarios where auth_id=auth.uid() and status='ativo';
 perform pg_advisory_xact_lock(hashtextextended('extrato-conta:'||btrim(p_conta),0));
 select * into existente from public.financeiro_extratos where conta=btrim(p_conta) and hash=p_hash;
 if found then
  if existente.mapa<>p_mapa then raise exception 'Arquivo já importado com outro mapeamento. Revise a importação existente.';end if;
  return existente.id;
 end if;
 if exists(select 1 from jsonb_to_recordset(p_itens) x(linha integer,data date,descricao text,valor numeric,referencia text,ocorrencia integer,original jsonb) where linha is null or linha<1 or data is null or data not between '2000-01-01' and '2100-12-31' or descricao is null or length(btrim(descricao)) not between 1 and 300 or valor is null or valor=0 or abs(valor)>99999999.99 or valor<>round(valor,2) or referencia is null or length(referencia)>150 or ocorrencia is null or ocorrencia<1 or original is null or jsonb_typeof(original)<>'array') then raise exception 'Confira as linhas antes de importar.';end if;
 insert into public.financeiro_extratos(id,conta,nome,hash,mapa,importado_por) values(p_id,btrim(p_conta),p_nome,p_hash,p_mapa,autor);
 for x in select * from jsonb_to_recordset(p_itens) x(linha integer,data date,descricao text,valor numeric,referencia text,ocorrencia integer,original jsonb) order by linha loop
  chave:=md5(jsonb_build_array(btrim(p_conta),x.data,lower(btrim(x.descricao)),x.valor,x.referencia)::text);
  select i.id into dupe from public.financeiro_extrato_itens i where i.fingerprint=chave order by i.id limit 1;
  insert into public.financeiro_extrato_itens(extrato_id,linha,data,descricao,valor,referencia,original,fingerprint,ocorrencia,status,duplicado_de)
  values(p_id,x.linha,x.data,btrim(x.descricao),x.valor,x.referencia,x.original,chave,x.ocorrencia,case when dupe is null then 'pendente' else 'revisar_duplicidade' end,dupe);
 end loop;
 return p_id;
end;$$;
create function public.financeiro_extrato_importar(p_id uuid,p_conta text,p_nome text,p_hash text,p_mapa jsonb,p_itens jsonb) returns uuid
language sql security invoker set search_path='' as $$select private.financeiro_extrato_importar(p_id,p_conta,p_nome,p_hash,p_mapa,p_itens);$$;

create function private.financeiro_extrato_opcoes(p_item bigint,p_busca text) returns jsonb
language plpgsql stable security definer set search_path='' as $$
declare i public.financeiro_extrato_itens%rowtype;
begin
 if not coalesce(private.financeiro_pode_negociar() and private.financeiro_pode_conferir(),false) then raise exception 'Acesso não autorizado.';end if;
 select * into strict i from public.financeiro_extrato_itens where id=p_item;
 return jsonb_build_object(
 'recebimentos',(select coalesce(jsonb_agg(t),'[]') from (
  select r.id,r.valor_recebido valor,r.data_pagamento data,e.nome_pagador nome,e.arquivo_path,e.arquivo_nome,e.extrato_item_id,
   (select coalesce(jsonb_agg(jsonb_build_object('nome',u.nome_completo,'descricao',c.descricao,'valor',a.valor_aplicado)),'[]') from public.financeiro_pagamento_aplicacoes a join public.financeiro_cobrancas c on c.id=a.cobranca_id join public.usuarios u on u.id=c.usuario_id where a.recebimento_id=r.id) destinacoes
  from public.financeiro_recebimentos r join public.financeiro_comprovantes_envios e on e.recebimento_id=r.id and e.status='aprovado'
  where i.valor>0 and r.valor_recebido=i.valor and r.data_pagamento between i.data-7 and i.data+7 and not exists(select 1 from public.financeiro_extrato_itens z where z.status='conciliado' and z.resultado->>'recebimento_id'=r.id::text)
  order by abs(r.data_pagamento-i.data),r.id limit 30)t),
 'lancamentos',(select coalesce(jsonb_agg(t),'[]') from(
  select l.id,l.data_movimento data,l.descricao,l.valor,c.nome categoria from public.financeiro_lancamentos l join public.financeiro_categorias c on c.id=l.categoria_id
  where l.status='ativo' and l.valor=abs(i.valor) and c.tipo=case when i.valor>0 then 'receita' else 'despesa' end and l.data_movimento between i.data-7 and i.data+7
  and not exists(select 1 from public.financeiro_extrato_itens z where z.status='conciliado' and (z.resultado->>'lancamento_id'=l.id::text or z.resultado->'lancamentos' @> jsonb_build_array(l.id))) order by abs(l.data_movimento-i.data),l.id limit 30)t),
 'envios',(select coalesce(jsonb_agg(t),'[]') from(
  select e.id,e.nome_pagador,e.valor,e.data_pagamento,e.arquivo_path,e.arquivo_nome from public.financeiro_comprovantes_envios e where i.valor>0 and e.status='aguardando_conferencia' and e.valor=i.valor and e.data_pagamento between i.data-7 and i.data+7 order by abs(e.data_pagamento-i.data),e.id limit 30)t),
 'cobrancas',(select coalesce(jsonb_agg(t),'[]') from (
  select c.id,c.usuario_id,u.nome_completo nome,c.descricao,c.competencia,c.tipo,
   greatest(0,c.valor_original-coalesce((select sum(valor_aplicado) from public.financeiro_pagamento_aplicacoes where cobranca_id=c.id),0)-coalesce((select sum(d.valor) from public.financeiro_comprovantes_destinacoes d join public.financeiro_comprovantes_envios e on e.id=d.envio_id where d.cobranca_id=c.id and e.status='aguardando_conferencia'),0)) saldo,
   exists(select 1 from public.financeiro_comprovantes_destinacoes d join public.financeiro_comprovantes_envios e on e.id=d.envio_id where d.cobranca_id=c.id and e.status='aguardando_conferencia') comprovante
  from public.financeiro_cobrancas c join public.usuarios u on u.id=c.usuario_id where i.valor>0 and c.status in('aberta','parcial') and (coalesce(p_busca,'')='' or u.nome_completo ilike '%'||p_busca||'%' or c.descricao ilike '%'||p_busca||'%') order by (c.valor_original=i.valor) desc, abs(coalesce(c.competencia,i.data)-i.data),u.nome_completo,c.id limit 100)t),
 'historico',(select coalesce(jsonb_agg(jsonb_build_object('data',a.data,'nome',u.nome_completo,'acao',a.acao,'motivo',a.motivo,'antes',a.antes,'depois',a.depois) order by a.id),'[]') from private.financeiro_extrato_auditoria a join public.usuarios u on u.id=a.autor where a.item_id=p_item)
 );
end;$$;
create function public.financeiro_extrato_opcoes(p_item bigint,p_busca text default '') returns jsonb language sql stable security invoker set search_path='' as $$select private.financeiro_extrato_opcoes(p_item,p_busca);$$;

create function private.financeiro_extrato_confirmar(p_item bigint,p_versao timestamptz,p_acao text,p_dados jsonb,p_motivo text) returns jsonb
language plpgsql security definer set search_path='' as $$
declare i public.financeiro_extrato_itens%rowtype; autor uuid; antes jsonb; v_resultado jsonb; novo_status text; rid bigint; lid bigint; eid uuid; x record; e public.financeiro_comprovantes_envios%rowtype; l public.financeiro_lancamentos%rowtype; ids jsonb:='[]'; soma numeric; cobran numeric; cat public.financeiro_categorias%rowtype; r public.financeiro_recebimentos%rowtype;
begin
 if not coalesce(private.financeiro_pode_negociar() and private.financeiro_pode_conferir(),false) then raise exception 'Acesso não autorizado.';end if;
 if p_acao is null or p_acao not in('ignorar','distinto','recebimento','lancamento','envio','distribuir') or p_dados is null or p_motivo is null or length(btrim(p_motivo)) not between 1 and 1000 then raise exception 'Informe o motivo e a ação.';end if;
 select id into strict autor from public.usuarios where auth_id=auth.uid() and status='ativo';
 -- Serializa confirmações do módulo para evitar dois itens vinculados à mesma origem.
 perform pg_advisory_xact_lock(hashtextextended('extrato-conciliacao',0));
 select * into i from public.financeiro_extrato_itens where id=p_item for update;
 if not found or i.atualizado_em is distinct from p_versao then raise exception 'Movimentação alterada. Atualize a lista.';end if;
 if i.status in('conciliado','ignorado') then raise exception 'Movimentação já tratada.';end if;
 antes:=to_jsonb(i);novo_status:='conciliado';
 if p_acao='ignorar' then novo_status:='ignorado';v_resultado:=jsonb_build_object('motivo',p_motivo);
 elsif p_acao='distinto' then
  if i.status<>'revisar_duplicidade' then raise exception 'Não há duplicidade para revisar.';end if;
  novo_status:='pendente';v_resultado:=jsonb_build_object('distinto',true,'motivo',p_motivo);
 else
  if i.status<>'pendente' then raise exception 'Revise primeiro a possível duplicidade.';end if;
  if p_acao in('recebimento','envio') then
   if i.valor<=0 then raise exception 'Somente entradas podem ser vinculadas a pagamentos.';end if;
   if p_acao='envio' then
    select * into e from public.financeiro_comprovantes_envios where id=(p_dados->>'id')::uuid for update;
    if not found or e.valor<>i.valor or e.status<>'aguardando_conferencia' or e.distribuicao_versao is distinct from (p_dados->>'versao')::integer then raise exception 'Pagamento indisponível ou valor diferente.';end if;
    v_resultado:=private.financeiro_conferir(e.id,'aprovado','');rid:=(v_resultado->>'recebimento_id')::bigint;
   else rid:=(p_dados->>'id')::bigint;end if;
   select * into r from public.financeiro_recebimentos where id=rid for update;
   if not found or r.valor_recebido<>i.valor or not exists(select 1 from public.financeiro_comprovantes_envios where recebimento_id=rid and status='aprovado') then raise exception 'Pagamento não encontrado ou valor diferente.';end if;
   if exists(select 1 from public.financeiro_extrato_itens z where z.status='conciliado' and z.resultado->>'recebimento_id'=rid::text) then raise exception 'Pagamento já conciliado.';end if;
   v_resultado:=jsonb_build_object('recebimento_id',rid,'envio_id',case when p_acao='envio' then e.id else null end);
  elsif p_acao='lancamento' then
   lid:=(p_dados->>'id')::bigint;select * into l from public.financeiro_lancamentos where id=lid for update;
   select * into cat from public.financeiro_categorias where id=l.categoria_id;
   if l.id is null or l.status<>'ativo' or l.valor<>abs(i.valor) or cat.tipo<>(case when i.valor>0 then 'receita' else 'despesa' end) then raise exception 'Lançamento indisponível ou valor diferente.';end if;
   if exists(select 1 from public.financeiro_extrato_itens z where z.status='conciliado' and (z.resultado->>'lancamento_id'=lid::text or z.resultado->'lancamentos' @> jsonb_build_array(lid))) then raise exception 'Lançamento já conciliado.';end if;
   v_resultado:=jsonb_build_object('lancamento_id',lid);
  elsif p_acao='distribuir' then
   if jsonb_typeof(p_dados->'partes') is distinct from 'array' or jsonb_array_length(p_dados->'partes') not between 1 and 100 then raise exception 'Informe a distribuição.';end if;
   if exists(select 1 from jsonb_to_recordset(p_dados->'partes') j(cobranca_id bigint,categoria_id bigint,valor numeric) where valor is null or valor<=0 or valor<>round(valor,2) or (cobranca_id is null)=(categoria_id is null) or (i.valor<0 and cobranca_id is not null)) then raise exception 'Distribuição inválida.';end if;
   select sum(valor),coalesce(sum(valor) filter(where cobranca_id is not null),0) into soma,cobran from jsonb_to_recordset(p_dados->'partes') j(cobranca_id bigint,categoria_id bigint,valor numeric);
   if soma<>abs(i.valor) then raise exception 'A distribuição deve totalizar exatamente o valor do extrato.';end if;
   if exists(select 1 from jsonb_to_recordset(p_dados->'partes') j(cobranca_id bigint) where cobranca_id is not null group by cobranca_id having count(*)>1) then raise exception 'Cobrança repetida.';end if;
   -- Um envio identificado como extrato reutiliza a mesma baixa transacional da Etapa 5.
   if cobran>0 then
    if (p_dados->>'forma') is null or (p_dados->>'forma') not in('pix','debito','credito') then raise exception 'Identifique a forma de pagamento.';end if;
    eid:=gen_random_uuid();
    insert into public.financeiro_comprovantes_envios(id,enviado_por,nome_pagador,valor,data_pagamento,forma_pagamento,observacao,arquivo_path,arquivo_nome,extrato_item_id)
    values(eid,autor,i.descricao,cobran,i.data,p_dados->>'forma','Conciliação do extrato #'||i.id,'extrato/'||eid,'Movimentação bancária #'||i.id,i.id);
    insert into public.financeiro_comprovantes_destinacoes(envio_id,cobranca_id,usuario_id,descricao,valor)
     select eid,c.id,c.usuario_id,c.descricao,j.valor from jsonb_to_recordset(p_dados->'partes') j(cobranca_id bigint,valor numeric) join public.financeiro_cobrancas c on c.id=j.cobranca_id;
    if (select count(*) from public.financeiro_comprovantes_destinacoes where envio_id=eid)<>(select count(*) from jsonb_to_recordset(p_dados->'partes') j(cobranca_id bigint) where cobranca_id is not null) then raise exception 'Cobrança não encontrada.';end if;
    -- Reservas de comprovantes pendentes não podem ser consumidas pelo extrato.
    perform 1 from public.financeiro_cobrancas where id in(select cobranca_id from public.financeiro_comprovantes_destinacoes where envio_id=eid) order by id for update;
    if exists(select 1 from public.financeiro_comprovantes_destinacoes d join public.financeiro_cobrancas c on c.id=d.cobranca_id where d.envio_id=eid and d.valor>c.valor_original-coalesce((select sum(valor_aplicado) from public.financeiro_pagamento_aplicacoes where cobranca_id=c.id),0)-coalesce((select sum(dd.valor) from public.financeiro_comprovantes_destinacoes dd join public.financeiro_comprovantes_envios ee on ee.id=dd.envio_id where dd.cobranca_id=c.id and ee.status='aguardando_conferencia' and ee.id<>eid),0)) then raise exception 'Cobrança reservada por comprovante ou saldo insuficiente. Confira o comprovante existente.';end if;
    v_resultado:=private.financeiro_conferir(eid,'aprovado','');rid:=(v_resultado->>'recebimento_id')::bigint;
   end if;
   for x in select * from jsonb_to_recordset(p_dados->'partes') j(categoria_id bigint,valor numeric) where categoria_id is not null loop
    select * into cat from public.financeiro_categorias where id=x.categoria_id for share;
    if not found or not cat.ativo or cat.tipo<>(case when i.valor>0 then 'receita' else 'despesa' end) then raise exception 'Escolha categoria ativa e compatível.';end if;
    lid:=private.financeiro_lancamento_salvar(gen_random_uuid(),null,cat.id,i.data,i.descricao,x.valor,case p_dados->>'forma' when 'pix' then 'PIX' when 'debito' then 'Débito' when 'credito' then 'Crédito' else 'Outro' end,'','Conciliação do extrato #'||i.id,'ativo','',null);
    ids:=ids||jsonb_build_array(lid);
   end loop;
   v_resultado:=jsonb_build_object('recebimento_id',rid,'envio_id',eid,'lancamentos',ids,'partes',p_dados->'partes');
  end if;
 end if;
 update public.financeiro_extrato_itens set status=novo_status,resultado=v_resultado,atualizado_em=clock_timestamp() where id=i.id returning to_jsonb(financeiro_extrato_itens) into v_resultado;
 insert into private.financeiro_extrato_auditoria(item_id,autor,acao,motivo,antes,depois) values(i.id,autor,p_acao,btrim(p_motivo),antes,v_resultado);
 return v_resultado;
end;$$;
create function public.financeiro_extrato_confirmar(p_item bigint,p_versao timestamptz,p_acao text,p_dados jsonb,p_motivo text) returns jsonb language sql security invoker set search_path='' as $$select private.financeiro_extrato_confirmar(p_item,p_versao,p_acao,p_dados,p_motivo);$$;
do $$declare f record;begin
 for f in select oid::regprocedure identidade from pg_proc where pronamespace in('public'::regnamespace,'private'::regnamespace) and proname in('financeiro_extrato_importar','financeiro_extrato_opcoes','financeiro_extrato_confirmar') loop
 execute format('revoke all on function %s from public,anon,authenticated',f.identidade);
 execute format('grant execute on function %s to authenticated',f.identidade);
 end loop;
end;$$;
commit;

-- Etapa 8: lançamentos manuais. Sem migração de valores históricos.
create table public.financeiro_lancamentos (
 id bigint generated always as identity primary key,
 categoria_id bigint not null references public.financeiro_categorias(id),
 data_movimento date not null,
 descricao text not null check(length(btrim(descricao)) between 1 and 300),
 valor numeric(14,2) not null check(valor>0 and valor<=99999999.99),
 forma_pagamento text not null check(forma_pagamento in ('PIX','Dinheiro','Débito','Crédito','Transferência','Boleto','Outro')),
 favorecido text not null default '' check(length(favorecido)<=150),
 observacao text not null default '' check(length(observacao)<=1000),
 status text not null default 'ativo' check(status in ('ativo','cancelado')),
 registrado_por uuid not null references public.usuarios(id),
 criado_em timestamptz not null default now(),
 atualizado_em timestamptz not null default now()
);
create index financeiro_lancamentos_data on public.financeiro_lancamentos(data_movimento,id);
create index financeiro_lancamentos_categoria on public.financeiro_lancamentos(categoria_id);
alter table public.financeiro_lancamentos enable row level security;
revoke all on public.financeiro_lancamentos from public,anon,authenticated;
grant select on public.financeiro_lancamentos to authenticated;
create policy lancamentos_leitura on public.financeiro_lancamentos for select to authenticated using(private.financeiro_pode_negociar());
create table private.financeiro_lancamentos_auditoria(
 requisicao uuid primary key,
 lancamento_id bigint not null references public.financeiro_lancamentos(id),
 autor uuid not null references public.usuarios(id),
 registrado_em timestamptz not null default now(),
 pedido jsonb not null, anteriores jsonb, posteriores jsonb not null, motivo text not null
);
alter table private.financeiro_lancamentos_auditoria enable row level security;
revoke all on private.financeiro_lancamentos_auditoria from public,anon,authenticated;
create function private.financeiro_lancamento_salvar(p_requisicao uuid,p_id bigint,p_categoria bigint,p_data date,p_descricao text,p_valor numeric,p_forma text,p_favorecido text,p_observacao text,p_status text,p_motivo text,p_versao timestamptz)
returns bigint language plpgsql security definer set search_path='' as $$
declare autor uuid; assinatura jsonb; audit private.financeiro_lancamentos_auditoria%rowtype; antigo public.financeiro_lancamentos%rowtype; novo public.financeiro_lancamentos%rowtype; cat public.financeiro_categorias%rowtype; tipo_antigo text;
begin
 if not coalesce(private.financeiro_pode_negociar(),false) then raise exception 'Acesso não autorizado.'; end if;
 select id into strict autor from public.usuarios where auth_id=auth.uid() and status='ativo';
 if p_requisicao is null then raise exception 'Identificador obrigatório.'; end if;
 assinatura:=jsonb_build_object('id',p_id,'categoria',p_categoria,'data',p_data,'descricao',p_descricao,'valor',p_valor,'forma',p_forma,'favorecido',p_favorecido,'observacao',p_observacao,'status',p_status,'motivo',p_motivo,'versao',p_versao);
 perform pg_advisory_xact_lock(hashtextextended(p_requisicao::text,0));
 select * into audit from private.financeiro_lancamentos_auditoria where requisicao=p_requisicao;
 if found then
  if audit.autor<>autor or audit.pedido<>assinatura then raise exception 'Identificador usado em outra operação.'; end if;
  return audit.lancamento_id;
 end if;
 if p_id is not null then
  select * into antigo from public.financeiro_lancamentos where id=p_id for update;
  if not found then raise exception 'Lançamento não encontrado.'; end if;
  if antigo.status='cancelado' then raise exception 'Lançamento cancelado permanece no histórico.'; end if;
  if antigo.atualizado_em is distinct from p_versao then raise exception 'Lançamento alterado. Atualize a lista antes de editar.'; end if;
  if p_motivo is null or length(btrim(p_motivo)) not between 1 and 1000 then raise exception 'Informe o motivo da correção ou cancelamento.'; end if;
 end if;
 if p_status is null or p_status not in('ativo','cancelado') or (p_id is null and p_status<>'ativo') then raise exception 'Situação inválida.'; end if;
 select * into cat from public.financeiro_categorias where id=p_categoria for share;
 if not found or (not cat.ativo and (p_id is null or p_categoria<>antigo.categoria_id)) then raise exception 'Escolha uma categoria ativa.'; end if;
 if p_id is not null then
  select tipo into tipo_antigo from public.financeiro_categorias where id=antigo.categoria_id;
  if cat.tipo<>tipo_antigo then raise exception 'Para mudar entre receita e despesa, cancele e cadastre um novo lançamento.'; end if;
 end if;
 if p_data is null or p_descricao is null or length(btrim(p_descricao)) not between 1 and 300 or p_valor is null or p_valor<=0 or p_valor>99999999.99 or p_valor<>round(p_valor,2) or p_forma is null or p_forma not in('PIX','Dinheiro','Débito','Crédito','Transferência','Boleto','Outro') or p_favorecido is null or length(p_favorecido)>150 or p_observacao is null or length(p_observacao)>1000 then raise exception 'Confira data, descrição, valor e forma de pagamento.'; end if;
 if p_status='cancelado' and (p_categoria<>antigo.categoria_id or p_data<>antigo.data_movimento or p_descricao<>antigo.descricao or p_valor<>antigo.valor or p_forma<>antigo.forma_pagamento or p_favorecido<>antigo.favorecido or p_observacao<>antigo.observacao) then raise exception 'O cancelamento deve preservar os dados originais.'; end if;
 if p_id is null then
  insert into public.financeiro_lancamentos(categoria_id,data_movimento,descricao,valor,forma_pagamento,favorecido,observacao,registrado_por) values(p_categoria,p_data,btrim(p_descricao),p_valor,p_forma,btrim(p_favorecido),btrim(p_observacao),autor) returning * into novo;
 else
  update public.financeiro_lancamentos set categoria_id=p_categoria,data_movimento=p_data,descricao=btrim(p_descricao),valor=p_valor,forma_pagamento=p_forma,favorecido=btrim(p_favorecido),observacao=btrim(p_observacao),status=p_status,atualizado_em=clock_timestamp() where id=p_id returning * into novo;
 end if;
 insert into private.financeiro_lancamentos_auditoria(requisicao,lancamento_id,autor,pedido,anteriores,posteriores,motivo) values(p_requisicao,novo.id,autor,assinatura,case when p_id is null then null else to_jsonb(antigo) end,to_jsonb(novo),case when p_id is null then 'Cadastro' else btrim(p_motivo) end);
 return novo.id;
end;$$;
create function public.financeiro_lancamento_salvar(p_requisicao uuid,p_id bigint,p_categoria bigint,p_data date,p_descricao text,p_valor numeric,p_forma text,p_favorecido text,p_observacao text,p_status text,p_motivo text,p_versao timestamptz default null)
returns bigint language sql security invoker set search_path='' as $$select private.financeiro_lancamento_salvar(p_requisicao,p_id,p_categoria,p_data,p_descricao,p_valor,p_forma,p_favorecido,p_observacao,p_status,p_motivo,p_versao);$$;
create function private.financeiro_lancamentos_listar(p_inicio date,p_fim date,p_tipo text,p_categoria bigint,p_offset integer) returns jsonb language plpgsql stable security definer set search_path='' as $$
declare resultado jsonb;
begin
 if not coalesce(private.financeiro_pode_negociar(),false) then raise exception 'Acesso não autorizado.';end if;
 if p_inicio is null or p_fim is null or p_fim<p_inicio or p_offset is null or p_offset<0 or (p_tipo is not null and p_tipo not in('receita','despesa')) then raise exception 'Filtros inválidos.';end if;
 with filtrados as(select l.*,c.nome categoria,c.tipo,u.nome_completo responsavel from public.financeiro_lancamentos l join public.financeiro_categorias c on c.id=l.categoria_id join public.usuarios u on u.id=l.registrado_por where l.data_movimento between p_inicio and p_fim and (p_tipo is null or c.tipo=p_tipo) and (p_categoria is null or c.id=p_categoria)),
 pagina as(select * from filtrados order by data_movimento desc,id desc limit 30 offset p_offset)
 select jsonb_build_object('total',(select count(*) from filtrados),'receitas',(select coalesce(sum(valor),0) from filtrados where tipo='receita' and status='ativo'),'despesas',(select coalesce(sum(valor),0) from filtrados where tipo='despesa' and status='ativo'),'lancamentos',(select coalesce(jsonb_agg(to_jsonb(p) order by data_movimento desc,id desc),'[]') from pagina p)) into resultado;
 return resultado;
end;$$;
create function public.financeiro_lancamentos_listar(p_inicio date,p_fim date,p_tipo text default null,p_categoria bigint default null,p_offset integer default 0) returns jsonb language sql stable security invoker set search_path='' as $$select private.financeiro_lancamentos_listar(p_inicio,p_fim,p_tipo,p_categoria,p_offset);$$;
create function private.financeiro_lancamento_historico(p_id bigint) returns jsonb language plpgsql stable security definer set search_path='' as $$
begin
 if not coalesce(private.financeiro_pode_negociar(),false) then raise exception 'Acesso não autorizado.';end if;
 return (select coalesce(jsonb_agg(jsonb_build_object('data',a.registrado_em,'responsavel',u.nome_completo,'motivo',a.motivo,'antes',a.anteriores,'depois',a.posteriores) order by a.registrado_em),'[]') from private.financeiro_lancamentos_auditoria a join public.usuarios u on u.id=a.autor where a.lancamento_id=p_id);
end;$$;
create function public.financeiro_lancamento_historico(p_id bigint) returns jsonb language sql stable security invoker set search_path='' as $$select private.financeiro_lancamento_historico(p_id);$$;
do $$declare f record;begin
 for f in select oid::regprocedure identidade from pg_proc where pronamespace in('public'::regnamespace,'private'::regnamespace) and proname in('financeiro_lancamento_salvar','financeiro_lancamentos_listar','financeiro_lancamento_historico') loop
 execute format('revoke all on function %s from public,anon,authenticated',f.identidade);
 execute format('grant execute on function %s to authenticated',f.identidade);
 end loop;
end;$$;
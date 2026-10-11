-- Etapa 11: vínculo ao Caixa, sem duplicar movimentações.
create table public.financeiro_festas (
 id bigint generated always as identity primary key,
 requisicao uuid not null unique,
 nome text not null check(length(btrim(nome)) between 1 and 150),
 data_evento date not null,
 registrado_por uuid not null references public.usuarios(id),
 criado_em timestamptz not null default now()
);
create table public.financeiro_evento_vinculos (
 lancamento_id bigint primary key references public.financeiro_lancamentos(id),
 setor text not null check(setor in ('festa','cantina')),
 festa_id bigint references public.financeiro_festas(id),
 atualizado_em timestamptz not null default clock_timestamp(),
 check((setor='festa' and festa_id is not null) or (setor='cantina' and festa_id is null))
);
create index financeiro_evento_vinculos_festa on public.financeiro_evento_vinculos(festa_id);
create table private.financeiro_evento_auditoria (
 requisicao uuid primary key, lancamento_id bigint not null references public.financeiro_lancamentos(id),
 autor uuid not null references public.usuarios(id), pedido jsonb not null,
 antes jsonb, depois jsonb, motivo text not null, criado_em timestamptz not null default now()
);
create table private.financeiro_cantina_categorias (
 categoria_id bigint primary key references public.financeiro_categorias(id)
);
insert into private.financeiro_cantina_categorias select id from public.financeiro_categorias where lower(btrim(nome))='cantina';
alter table public.financeiro_festas enable row level security;
alter table public.financeiro_evento_vinculos enable row level security;
alter table private.financeiro_evento_auditoria enable row level security;
alter table private.financeiro_cantina_categorias enable row level security;
revoke all on public.financeiro_festas,public.financeiro_evento_vinculos,private.financeiro_evento_auditoria,private.financeiro_cantina_categorias from public,anon,authenticated;
grant select on public.financeiro_festas,public.financeiro_evento_vinculos to authenticated;
create policy festas_leitura on public.financeiro_festas for select to authenticated using(private.financeiro_pode_negociar());
create policy eventos_leitura on public.financeiro_evento_vinculos for select to authenticated using(private.financeiro_pode_negociar());
create function private.financeiro_festa_cadastrar(p_requisicao uuid,p_nome text,p_data date) returns bigint language plpgsql security definer set search_path='' as $$
declare autor uuid; festa public.financeiro_festas%rowtype;
begin
 if not coalesce(private.financeiro_pode_negociar(),false) then raise exception 'Acesso não autorizado.';end if;
 select id into strict autor from public.usuarios where auth_id=auth.uid() and status='ativo';
 if p_requisicao is null or p_nome is null or length(btrim(p_nome)) not between 1 and 150 or p_data is null then raise exception 'Informe nome e data da festa.';end if;
 perform pg_advisory_xact_lock(hashtextextended(p_requisicao::text,0));
 select * into festa from public.financeiro_festas where requisicao=p_requisicao;
 if found then
  if festa.nome<>btrim(p_nome) or festa.data_evento<>p_data or festa.registrado_por<>autor then raise exception 'Identificador usado em outra operação.';end if;
  return festa.id;
 end if;
 insert into public.financeiro_festas(requisicao,nome,data_evento,registrado_por) values(p_requisicao,btrim(p_nome),p_data,autor) returning id into festa.id;
 return festa.id;
end;$$;
create function public.financeiro_festa_cadastrar(p_requisicao uuid,p_nome text,p_data date) returns bigint language sql security invoker set search_path='' as $$select private.financeiro_festa_cadastrar(p_requisicao,p_nome,p_data);$$;
create function private.financeiro_evento_vincular(p_requisicao uuid,p_lancamento bigint,p_setor text,p_festa bigint,p_motivo text,p_versao timestamptz) returns void language plpgsql security definer set search_path='' as $$
declare autor uuid; anterior public.financeiro_evento_vinculos%rowtype; posterior public.financeiro_evento_vinculos%rowtype; pedido jsonb; audit private.financeiro_evento_auditoria%rowtype;
begin
 if not coalesce(private.financeiro_pode_negociar(),false) then raise exception 'Acesso não autorizado.';end if;
 select id into strict autor from public.usuarios where auth_id=auth.uid() and status='ativo';
 if p_requisicao is null or p_motivo is null or length(btrim(p_motivo)) not between 1 and 1000 or p_setor is null or p_setor not in ('festa','cantina') or (p_setor='festa' and p_festa is null) or (p_setor='cantina' and p_festa is not null) then raise exception 'Confira destino e motivo.';end if;
 pedido:=jsonb_build_object('lancamento',p_lancamento,'setor',p_setor,'festa',p_festa,'motivo',p_motivo,'versao',p_versao);
 perform pg_advisory_xact_lock(hashtextextended(p_requisicao::text,0));
 select * into audit from private.financeiro_evento_auditoria where requisicao=p_requisicao;
 if found then
  if audit.autor<>autor or audit.pedido<>pedido then raise exception 'Identificador usado em outra operação.';end if;
  return;
 end if;
 perform 1 from public.financeiro_lancamentos where id=p_lancamento and status='ativo' for update;
 if not found then raise exception 'Lançamento ativo não encontrado.';end if;
 select * into anterior from public.financeiro_evento_vinculos where lancamento_id=p_lancamento;
 if anterior.atualizado_em is distinct from p_versao then raise exception 'Vínculo alterado. Atualize a consulta.';end if;
 insert into public.financeiro_evento_vinculos(lancamento_id,setor,festa_id) values(p_lancamento,p_setor,p_festa)
 on conflict(lancamento_id) do update set setor=excluded.setor,festa_id=excluded.festa_id,atualizado_em=clock_timestamp() returning * into posterior;
 insert into private.financeiro_evento_auditoria(requisicao,lancamento_id,autor,pedido,antes,depois,motivo) values(p_requisicao,p_lancamento,autor,pedido,case when anterior.lancamento_id is null then null else to_jsonb(anterior) end,to_jsonb(posterior),btrim(p_motivo));
end;$$;
create function public.financeiro_evento_vincular(p_requisicao uuid,p_lancamento bigint,p_setor text,p_festa bigint,p_motivo text,p_versao timestamptz) returns void language sql security invoker set search_path='' as $$select private.financeiro_evento_vincular(p_requisicao,p_lancamento,p_setor,p_festa,p_motivo,p_versao);$$;
create function private.financeiro_evento_consultar(p_setor text,p_festa bigint,p_inicio date,p_fim date,p_offset integer) returns jsonb language plpgsql stable security definer set search_path='' as $$
declare resultado jsonb;
begin
 if not coalesce(private.financeiro_pode_negociar(),false) then raise exception 'Acesso não autorizado.';end if;
 if p_setor is null or p_setor not in ('festa','cantina') or p_inicio is null or p_fim is null or p_inicio>p_fim or p_offset is null or p_offset<0 or (p_setor='festa' and p_festa is null) then raise exception 'Confira os filtros.';end if;
 with dados as (
 select l.*,c.tipo,c.nome categoria,v.setor,v.festa_id,v.atualizado_em versao_vinculo
 from public.financeiro_lancamentos l join public.financeiro_categorias c on c.id=l.categoria_id left join public.financeiro_evento_vinculos v on v.lancamento_id=l.id
 where l.data_movimento between p_inicio and p_fim and
 ((p_setor='festa' and v.setor='festa' and v.festa_id=p_festa) or
 (p_setor='cantina' and (v.setor='cantina' or (v.lancamento_id is null and exists(select 1 from private.financeiro_cantina_categorias cc where cc.categoria_id=l.categoria_id)))))
 ), pagina as (select * from dados order by data_movimento desc,id desc limit 30 offset p_offset)
 select jsonb_build_object('total',(select count(*) from dados),'entradas',(select coalesce(sum(valor),0) from dados where status='ativo' and tipo='receita'),'despesas',(select coalesce(sum(valor),0) from dados where status='ativo' and tipo='despesa'),'lancamentos',(select coalesce(jsonb_agg(to_jsonb(p) order by data_movimento desc,id desc),'[]') from pagina p)) into resultado;
 return resultado;
end;$$;
create function public.financeiro_evento_consultar(p_setor text,p_festa bigint,p_inicio date,p_fim date,p_offset integer default 0) returns jsonb language sql stable security invoker set search_path='' as $$select private.financeiro_evento_consultar(p_setor,p_festa,p_inicio,p_fim,p_offset);$$;
create function private.financeiro_evento_historico(p_lancamento bigint) returns jsonb language plpgsql stable security definer set search_path='' as $$
begin
 if not coalesce(private.financeiro_pode_negociar(),false) then raise exception 'Acesso não autorizado.';end if;
 return (select coalesce(jsonb_agg(jsonb_build_object('data',a.criado_em,'responsavel',u.nome_completo,'motivo',a.motivo,'antes',a.antes,'depois',a.depois) order by a.criado_em),'[]') from private.financeiro_evento_auditoria a join public.usuarios u on u.id=a.autor where a.lancamento_id=p_lancamento);
end;$$;
create function public.financeiro_evento_historico(p_lancamento bigint) returns jsonb language sql stable security invoker set search_path='' as $$select private.financeiro_evento_historico(p_lancamento);$$;
do $$declare f record;begin
 for f in select oid::regprocedure assinatura from pg_proc where pronamespace in ('public'::regnamespace,'private'::regnamespace) and proname in ('financeiro_festa_cadastrar','financeiro_evento_vincular','financeiro_evento_consultar','financeiro_evento_historico') loop
 execute format('revoke all on function %s from public,anon,authenticated',f.assinatura);
 execute format('grant execute on function %s to authenticated',f.assinatura);
 end loop;
end;$$;

create table public.financeiro_categorias (
 id bigint generated always as identity primary key,
 tipo text not null check(tipo in ('receita','despesa')),
 nome text not null check(length(btrim(nome)) between 1 and 80),
 ativo boolean not null default true,
 criado_em timestamptz not null default now(),
 atualizado_em timestamptz not null default now()
);
create unique index financeiro_categorias_nome_tipo on public.financeiro_categorias(tipo,lower(btrim(nome)));
alter table public.financeiro_categorias enable row level security;
revoke all on public.financeiro_categorias from public,anon,authenticated;
grant select on public.financeiro_categorias to authenticated;
create policy categorias_leitura on public.financeiro_categorias for select to authenticated using(private.financeiro_pode_negociar());
create table private.financeiro_categorias_auditoria (
 id bigint generated always as identity primary key,
 categoria_id bigint not null references public.financeiro_categorias(id),
 realizado_por uuid not null references public.usuarios(id),
 registrado_em timestamptz not null default now(),
 anteriores jsonb, posteriores jsonb not null
);
alter table private.financeiro_categorias_auditoria enable row level security;
revoke all on private.financeiro_categorias_auditoria from public,anon,authenticated;
insert into public.financeiro_categorias(tipo,nome)
 select 'receita',unnest(array['Mensalidades','Obrigações','Doações','Cantina','Festas','Outras entradas'])
 union all select 'despesa',unnest(array['Aluguel','Energia','Água','Materiais','Prestação de serviços','Cantina','Segurança','Contabilidade','Tarifas','Velas','Demais despesas']);
create function private.financeiro_categoria_salvar(p_id bigint,p_tipo text,p_nome text,p_ativo boolean,p_versao timestamptz) returns bigint language plpgsql security definer set search_path='' as $$
declare autor uuid; anterior public.financeiro_categorias%rowtype; posterior public.financeiro_categorias%rowtype;
begin
 if not coalesce(private.financeiro_pode_negociar(),false) then raise exception 'Acesso não autorizado.'; end if;
 if p_tipo is null or p_tipo not in ('receita','despesa') or p_nome is null or length(btrim(p_nome)) not between 1 and 80 or p_ativo is null then raise exception 'Informe tipo e nome (até 80 caracteres).'; end if;
 select id into strict autor from public.usuarios where auth_id=auth.uid() and status='ativo';
 if p_id is null then
  insert into public.financeiro_categorias(tipo,nome,ativo) values(p_tipo,btrim(p_nome),p_ativo) returning * into posterior;
 else
  select * into anterior from public.financeiro_categorias where id=p_id for update;
  if not found then raise exception 'Categoria não encontrada.'; end if;
  if p_versao is distinct from anterior.atualizado_em then raise exception 'Categoria alterada por outra pessoa. Atualize a lista.'; end if;
  if p_tipo<>anterior.tipo then raise exception 'O tipo da categoria não pode ser alterado. Cadastre outra categoria.'; end if;
  update public.financeiro_categorias set nome=btrim(p_nome),ativo=p_ativo,atualizado_em=clock_timestamp() where id=p_id returning * into posterior;
 end if;
 insert into private.financeiro_categorias_auditoria(categoria_id,realizado_por,anteriores,posteriores) values(posterior.id,autor,case when p_id is null then null else to_jsonb(anterior) end,to_jsonb(posterior));
 return posterior.id;
exception when unique_violation then raise exception 'Já existe uma categoria com esse nome e tipo.';
end;$$;
create function public.financeiro_categoria_salvar(p_id bigint,p_tipo text,p_nome text,p_ativo boolean,p_versao timestamptz default null) returns bigint language sql security invoker set search_path='' as $$select private.financeiro_categoria_salvar(p_id,p_tipo,p_nome,p_ativo,p_versao);$$;
revoke all on function private.financeiro_categoria_salvar(bigint,text,text,boolean,timestamptz),public.financeiro_categoria_salvar(bigint,text,text,boolean,timestamptz) from public,anon,authenticated;
grant execute on function private.financeiro_categoria_salvar(bigint,text,text,boolean,timestamptz),public.financeiro_categoria_salvar(bigint,text,text,boolean,timestamptz) to authenticated;
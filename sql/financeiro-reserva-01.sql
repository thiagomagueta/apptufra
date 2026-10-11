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
revoke all on function private.financeiro_reserva_acesso(),private.financeiro_reserva_responsaveis(uuid[],uuid[]) from public,anon,authenticated;
commit;

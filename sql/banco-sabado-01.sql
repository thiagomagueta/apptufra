-- Períodos [data_inicio, data_fim): o dia da mudança pertence ao novo grupo.
begin;
insert into public.funcoes(nome,funcao_pai_id,ordem,ativo)
select 'Banco sábado',id,30,true from public.funcoes p
where p.nome='Médium em Desenvolvimento' and p.funcao_pai_id is null
and not exists(select 1 from public.funcoes where nome='Banco sábado');
insert into public.tipos_lista_presenca(nome,tipo_atividade,ativo,ordem)
select 'Banco sábado','gira_principal',true,6
where not exists(select 1 from public.tipos_lista_presenca where nome='Banco sábado');

create table if not exists public.desenvolvimento_periodos (
 id uuid primary key default gen_random_uuid(),
 usuario_id uuid not null references public.usuarios(id) on delete cascade,
 grupo text not null check(grupo in ('banco_terca','corrente_terca','banco_sabado')),
 data_inicio date not null,
 data_fim date,
 atualizado_por uuid references public.usuarios(id) on delete set null,
 atualizado_em timestamptz not null default now(),
 check(data_fim is null or data_fim>data_inicio),
 unique(usuario_id,data_inicio)
);
create index if not exists desenvolvimento_periodos_usuario on public.desenvolvimento_periodos(usuario_id);
alter table public.desenvolvimento_periodos enable row level security;
revoke all on public.desenvolvimento_periodos from anon,authenticated;
grant select on public.desenvolvimento_periodos to authenticated;
drop policy if exists desenvolvimento_periodos_leitura on public.desenvolvimento_periodos;
create policy desenvolvimento_periodos_leitura on public.desenvolvimento_periodos
for select to authenticated using (
 usuario_id in(select id from public.usuarios where auth_id=(select auth.uid()))
 or private.pode_gerenciar_calendario()
 or exists(select 1 from public.responsaveis_lista_presenca r
 join public.usuarios u on u.id=r.usuario_id join public.tipos_lista_presenca t on t.id=r.tipo_lista_id
 where u.auth_id=(select auth.uid()) and t.nome in ('Desenvolvimento','Banco sábado'))
);

-- Mantém a situação atual como ponto de partida; mudanças anteriores serão informadas pela gestão.
insert into public.desenvolvimento_periodos(usuario_id,grupo,data_inicio)
select u.id,case when exists(select 1 from public.usuario_funcoes uf join public.funcoes f on f.id=uf.funcao_id
 where uf.usuario_id=u.id and f.nome='Banco sábado') then 'banco_sabado'
 when exists(select 1 from public.usuario_funcoes uf join public.funcoes f on f.id=uf.funcao_id
 where uf.usuario_id=u.id and f.nome='Corrente do Desenvolvimento') then 'corrente_terca' else 'banco_terca' end,
 coalesce(u.data_entrada_tufra,(select min(a.data) from public.presencas p join public.atividades a on a.id=p.atividade_id where p.usuario_id=u.id),current_date)
from public.usuarios u where exists(select 1 from public.usuario_funcoes uf join public.funcoes f on f.id=uf.funcao_id
 where uf.usuario_id=u.id and f.nome='Médium em Desenvolvimento')
and not exists(select 1 from public.desenvolvimento_periodos d where d.usuario_id=u.id);

commit;

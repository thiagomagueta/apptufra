-- Cadastro administrativo sem criar conta de acesso.
alter table public.usuarios alter column cpf drop not null;
alter table public.usuarios add column if not exists cadastro_previo boolean not null default false;
alter table public.usuarios add column if not exists cpf_previo text;
create unique index if not exists usuarios_cpf_previo_unico on public.usuarios(cpf_previo) where cadastro_previo and auth_id is null and cpf_previo is not null;
create table private.cadastro_administrativo_responsaveis (
 usuario_id uuid primary key references public.usuarios(id), criado_em timestamptz not null default now()
);
alter table private.cadastro_administrativo_responsaveis enable row level security;
create table private.cadastro_administrativo_auditoria (
 id bigint generated always as identity primary key, autor uuid not null, acao text not null,
 associado_id uuid, dados jsonb not null, criado_em timestamptz not null default now()
);
alter table private.cadastro_administrativo_auditoria enable row level security;
revoke all on private.cadastro_administrativo_responsaveis, private.cadastro_administrativo_auditoria from public,anon,authenticated;


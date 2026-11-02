-- Leitura de Búzios e Batismo — estrutura inicial, sem lançamentos financeiros automáticos.
-- Aplicar somente após revisão da integração com o financeiro existente.
create table if not exists public.cerimonias_tufra (
 id uuid primary key default gen_random_uuid(),
 titulo text not null,
 data_oficial date not null,
 prazo_interesse date,
 prazo_pagamento date,
 abertura_publico date,
 valor_leitura_associado numeric(12,2) not null default 85 check(valor_leitura_associado>=0),
 valor_batismo_associado numeric(12,2) not null default 85 check(valor_batismo_associado>=0),
 valor_conjunto_associado numeric(12,2) not null default 140 check(valor_conjunto_associado>=0),
 valor_leitura_externo numeric(12,2) not null default 130 check(valor_leitura_externo>=0),
 valor_batismo_externo numeric(12,2) not null default 130 check(valor_batismo_externo>=0),
 status text not null default 'planejada' check(status in ('planejada','inscricoes','realizada','encerrada')),
 criado_em timestamptz not null default now()
);
create table if not exists public.cerimonias_periodos_leitura (
 id uuid primary key default gen_random_uuid(),
 cerimonia_id uuid not null references public.cerimonias_tufra(id),
 data_leitura date not null,
 periodo text not null,
 vagas integer not null check(vagas>0),
 unique(cerimonia_id,data_leitura,periodo)
);
create table if not exists public.cerimonias_participantes (
 id uuid primary key default gen_random_uuid(),
 cerimonia_id uuid not null references public.cerimonias_tufra(id),
 associado_id uuid references public.usuarios(id),
 nome_externo text,
 leitura boolean not null default false,
 batismo boolean not null default false,
 periodo_leitura_id uuid references public.cerimonias_periodos_leitura(id),
 padrinho text,
 madrinha text,
 orixa_frente text,
 orixa_adjunto text,
 leitura_realizada_em date,
 batismo_realizado_em date,
 situacao text not null default 'interesse' check(situacao in ('interesse','espera','confirmado','cancelado')),
 valor_previsto numeric(12,2) not null default 0 check(valor_previsto>=0),
 criado_em timestamptz not null default now(),
 atualizado_em timestamptz not null default now(),
 constraint participante_identificacao check (
  (associado_id is not null and nome_externo is null)
  or (associado_id is null and length(trim(coalesce(nome_externo,'')))>0)
 ),
 constraint participante_atividade check (leitura or batismo),
 constraint participante_periodo check (leitura or periodo_leitura_id is null),
 unique(cerimonia_id,associado_id)
);
create table if not exists public.cerimonias_pagamentos (
 id uuid primary key default gen_random_uuid(),
 participante_id uuid not null references public.cerimonias_participantes(id),
 valor numeric(12,2) not null check(valor>0),
 data_pagamento date not null,
 confirmado_por uuid not null references public.usuarios(id),
 criado_em timestamptz not null default now()
);
create table if not exists public.cerimonias_responsaveis (
 usuario_id uuid primary key references public.usuarios(id),
 pode_gerenciar boolean not null default false,
 pode_confirmar_pagamento boolean not null default false,
 pode_configurar_valores boolean not null default false
);
create index if not exists cerimonias_participantes_cerimonia_idx on public.cerimonias_participantes(cerimonia_id,situacao);
create index if not exists cerimonias_pagamentos_participante_idx on public.cerimonias_pagamentos(participante_id);
alter table public.cerimonias_tufra enable row level security;
alter table public.cerimonias_periodos_leitura enable row level security;
alter table public.cerimonias_participantes enable row level security;
alter table public.cerimonias_pagamentos enable row level security;
alter table public.cerimonias_responsaveis enable row level security;
revoke all on public.cerimonias_tufra, public.cerimonias_periodos_leitura,
 public.cerimonias_participantes, public.cerimonias_pagamentos,
 public.cerimonias_responsaveis from anon, authenticated;
-- As operações devem ser feitas por RPCs autenticadas, com validação de autorização no servidor.
-- O registro de pagamento não deve, por si só, duplicar receitas no balancete.

-- Aplicar antes de reaplicar cerimonias-api.sql.
-- Não altera recebimentos existentes.
alter table public.cerimonias_pagamentos
 add column if not exists forma_pagamento text;
alter table public.cerimonias_pagamentos
 add constraint cerimonias_pagamentos_forma_pagamento_check
 check (forma_pagamento in ('PIX','Dinheiro','Débito','Crédito','Transferência','Boleto','Outro'));
-- A API exige a seleção; a coluna permanece anulável para compatibilidade com registros antigos.

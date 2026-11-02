-- Regras de preço por edição. Não altera os valores históricos das outras cerimônias.
create or replace function public.cerimonia_valor_previsto(
 p_cerimonia uuid, p_associado boolean, p_leitura boolean, p_batismo boolean
) returns numeric language sql stable set search_path='' as $$
 select case
  when p_associado and p_leitura and p_batismo then c.valor_conjunto_associado
  when p_associado and p_leitura then c.valor_leitura_associado
  when p_associado and p_batismo then c.valor_batismo_associado
  when not p_associado and p_leitura and p_batismo then c.valor_leitura_externo+c.valor_batismo_externo
  when not p_associado and p_leitura then c.valor_leitura_externo
  when not p_associado and p_batismo then c.valor_batismo_externo
  else 0::numeric
 end
 from public.cerimonias_tufra c where c.id=p_cerimonia
$$;
revoke all on function public.cerimonia_valor_previsto(uuid,boolean,boolean,boolean) from public,anon,authenticated;

-- Recalcula o preço quando a inscrição é alterada, inclusive batismo -> leitura.
create or replace function private.cerimonia_recalcular_valor()
returns trigger language plpgsql security invoker set search_path='' as $$
begin
 new.valor_previsto:=public.cerimonia_valor_previsto(
   new.cerimonia_id,new.associado_id is not null,new.leitura,new.batismo);
 new.atualizado_em:=now();
 return new;
end;
$$;
create trigger cerimonia_valor_participante
before insert or update of cerimonia_id,associado_id,leitura,batismo
on public.cerimonias_participantes
for each row execute function private.cerimonia_recalcular_valor();

-- Relatório de saldo calculado com base em pagamentos registrados.
-- A confirmação de vaga ainda deve validar quitação e limite em transação própria.
create or replace view public.cerimonias_saldos
with (security_invoker=true) as
select p.id as participante_id,p.cerimonia_id,p.valor_previsto,
 coalesce(sum(pg.valor),0)::numeric(12,2) as valor_pago,
 (p.valor_previsto-coalesce(sum(pg.valor),0))::numeric(12,2) as saldo
from public.cerimonias_participantes p
left join public.cerimonias_pagamentos pg on pg.participante_id=p.id
group by p.id,p.cerimonia_id,p.valor_previsto;
revoke all on public.cerimonias_saldos from anon,authenticated;

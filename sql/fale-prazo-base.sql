alter table public.fale_atendimentos add column if not exists encerrado_automaticamente boolean not null default false;
create or replace function private.finalizar_fale_por_prazo(p_id uuid default null)
returns integer language plpgsql security invoker set search_path='' as $$
declare v_total integer;
begin
 with vencidos as (
   select id from public.fale_atendimentos
   where situacao='aguardando_confirmacao'
     and encerramento_solicitado_em <= statement_timestamp()-interval '120 hours'
     and (p_id is null or id=p_id)
   order by id for update skip locked
 ), encerrados as (
   update public.fale_atendimentos a
   set situacao='finalizado',finalizado_em=clock_timestamp(),atualizado_em=clock_timestamp(),encerrado_automaticamente=true
   from vencidos v where a.id=v.id and a.situacao='aguardando_confirmacao'
   returning a.id,coalesce(a.encerramento_solicitado_por,a.usuario_id) autor_id
 )
 insert into public.fale_mensagens(atendimento_id,autor_id,autor_nome,tipo,texto)
 select id,autor_id,'Sistema','evento',
   'Atendimento encerrado automaticamente após 5 dias sem confirmação do associado. Nenhuma avaliação foi atribuída automaticamente.'
 from encerrados;
 get diagnostics v_total = row_count;
 return v_total;
end $$;
revoke all on function private.finalizar_fale_por_prazo(uuid) from public,anon,authenticated;

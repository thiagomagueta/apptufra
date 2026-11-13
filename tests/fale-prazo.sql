begin;
do $$
declare
 v_usuario uuid; v_auth uuid; v_equipe uuid; v_ids uuid[]; v_id uuid; v_r jsonb;
 v_n integer; v_i integer;
begin
 select id,auth_id into v_usuario,v_auth from public.usuarios where status='ativo' and auth_id is not null limit 1;
 select usuario_id into v_equipe from public.fale_responsaveis limit 1;
 with novos as (
 insert into public.fale_atendimentos(usuario_id,assunto,categoria,situacao,encerramento_solicitado_por,encerramento_solicitado_em)
 select v_usuario,'__TESTE_PRAZO_'||n,'Outro',
 case when n=5 then 'em_acompanhamento' when n=6 then 'finalizado' else 'aguardando_confirmacao' end,
 v_equipe,case when n=4 then null when n in(2,7,8) then statement_timestamp()-interval '119 hours' else statement_timestamp()-interval '120 hours' end
 from generate_series(1,8) n returning id,assunto
 ) select array_agg(id order by assunto) into v_ids from novos;
 for v_i in 1..6 loop
 v_n:=private.finalizar_fale_por_prazo(v_ids[v_i]);
 if v_n<>(case when v_i in(1,3) then 1 else 0 end) then raise exception 'Falha no caso %: %',v_i,v_n; end if;
 end loop;
 if exists(select 1 from public.fale_atendimentos where id=any(v_ids) and (avaliacao is not null or avaliado_em is not null)) then raise exception 'Avaliação indevida'; end if;
 if (select count(*) from public.fale_mensagens where atendimento_id=any(v_ids) and autor_nome='Sistema' and tipo='evento')<>2 then raise exception 'Histórico automático incorreto'; end if;
 if private.finalizar_fale_por_prazo(v_ids[1])<>0 then raise exception 'Encerramento duplicado'; end if;
 perform set_config('request.jwt.claim.sub',v_auth::text,true);
 -- Confirmação manual antes do prazo continua funcionando.
 perform public.fale_com_a_gente('confirmar',jsonb_build_object('id',v_ids[7]));
 if not exists(select 1 from public.fale_atendimentos where id=v_ids[7] and situacao='finalizado' and not encerrado_automaticamente) then raise exception 'Confirmação manual falhou'; end if;
 -- Complemento antes do prazo retoma o acompanhamento e cancela o vencimento.
 perform public.fale_com_a_gente('mensagem',jsonb_build_object('id',v_ids[8],'texto','Complemento de teste'));
 if not exists(select 1 from public.fale_atendimentos where id=v_ids[8] and situacao='em_acompanhamento' and encerramento_solicitado_em is null) then raise exception 'Complemento não retomou conversa'; end if;
 if private.finalizar_fale_por_prazo(v_ids[8])<>0 then raise exception 'Conversa retomada foi encerrada'; end if;
 -- Ao abrir um detalhe vencido, a RPC também verifica o prazo.
 insert into public.fale_atendimentos(usuario_id,assunto,categoria,situacao,encerramento_solicitado_por,encerramento_solicitado_em)
 values(v_usuario,'__TESTE_RPC_PRAZO','Outro','aguardando_confirmacao',v_equipe,statement_timestamp()-interval '121 hours') returning id into v_id;
 v_r:=public.fale_com_a_gente('detalhe',jsonb_build_object('id',v_id));
 if v_r->'atendimento'->>'situacao'<>'finalizado' or not (v_r->'atendimento'->>'encerrado_automaticamente')::boolean then raise exception 'RPC não encerrou no detalhe'; end if;
 begin
 perform public.fale_com_a_gente('mensagem',jsonb_build_object('id',v_id,'texto','Não pode reabrir'));
 raise exception 'Falha: reabriu atendimento';
 exception when others then if sqlerrm not like 'Atendimento finalizado.%' then raise; end if; end;
 if has_function_privilege('authenticated','private.finalizar_fale_por_prazo(uuid)','execute') or has_function_privilege('anon','private.finalizar_fale_por_prazo(uuid)','execute') then raise exception 'Rotina interna exposta'; end if;
end $$;
select 'OK: 5 dias exatos, antes/depois do prazo, confirmação manual, complemento, histórico único, sem avaliação, sem reabertura e rotina privada.' as resultado;
rollback;

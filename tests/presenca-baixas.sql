begin;
do $$
declare u uuid; a uuid; lista uuid; hoje date:=(now() at time zone 'America/Sao_Paulo')::date; antes bigint;
begin
 select x.auth_id into a from public.usuarios x join public.usuario_funcoes uf on uf.usuario_id=x.id join public.funcoes f on f.id=uf.funcao_id where f.nome='Tesoureiro' and x.auth_id is not null limit 1;
 perform set_config('request.jwt.claim.sub',a::text,true);
 select d.usuario_id into u from public.desenvolvimento_periodos d join public.usuarios x on x.id=d.usuario_id where x.status='ativo' and x.data_entrada_tufra<hoje-30 limit 1;
 select id into lista from public.tipos_lista_presenca where nome='Desenvolvimento';
 assert u is not null;
 select count(*) into antes from public.presencas;
 delete from public.desenvolvimento_periodos where usuario_id=u;
 insert into public.desenvolvimento_periodos(usuario_id,grupo,data_inicio) values(u,'banco_terca',hoje-30);
 delete from public.historico_baixas_associados where usuario_id=u;
 update public.usuarios set status='inativo',data_saida_tufra=hoje-5 where id=u;
 insert into public.historico_baixas_associados(usuario_id,data_saida,motivo_saida) values(u,hoje-5,'Teste transacional');
 assert exists(select 1 from public.listar_associados_presenca_historico(lista,hoje-6) where id=u),'Perdeu passado';
 assert not exists(select 1 from public.listar_associados_presenca_historico(lista,hoje-5) where id=u),'Incluiu dia da baixa';
 assert not exists(select 1 from public.listar_associados_presenca_historico(lista,hoje) where id=u),'Incluiu após baixa';
 assert exists(select 1 from public.listar_associados_presenca_historico(lista,null) where id=u and jsonb_array_length(baixas)=1),'Perdeu relatório';
 update public.historico_baixas_associados set data_retorno=hoje-2 where usuario_id=u;
 update public.usuarios set status='ativo',data_saida_tufra=null where id=u;
 assert not exists(select 1 from public.listar_associados_presenca_historico(lista,hoje-3) where id=u),'Perdeu intervalo de afastamento';
 assert exists(select 1 from public.listar_associados_presenca_historico(lista,hoje-2) where id=u),'Não voltou na data';
 assert (select count(*)=antes from public.presencas),'Alterou presenças';
 perform set_config('request.jwt.claim.sub','',true);
 begin
 perform public.listar_associados_presenca_historico(lista,null);
 raise exception 'Acesso anônimo indevido';
 exception when raise_exception then if sqlerrm='Acesso anônimo indevido' then raise;end if;
 end;
end $$;
rollback;

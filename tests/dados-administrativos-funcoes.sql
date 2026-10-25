begin;
do $$
declare u public.usuarios%rowtype; a uuid; ps jsonb; hoje date:=(now() at time zone 'America/Sao_Paulo')::date; funcs uuid[]; depois uuid[]; n bigint; falhou boolean:=false;
begin
 select x.auth_id into a from public.usuarios x join public.usuario_funcoes uf on uf.usuario_id=x.id join public.funcoes f on f.id=uf.funcao_id where f.nome='Tesoureiro' and x.auth_id is not null limit 1;
 perform set_config('request.jwt.claim.sub',a::text,true);
 select * into u from public.usuarios where status='ativo' and data_entrada_tufra<hoje-10 limit 1;
 assert u.id is not null,'Fixture ausente';
 select array_agg(funcao_id order by funcao_id) into funcs from public.usuario_funcoes where usuario_id=u.id;
 select count(*) into n from public.presencas;
 perform private.salvar_periodos_desenvolvimento(u.id,jsonb_build_array(jsonb_build_object('grupo','banco_terca','data_inicio',u.data_entrada_tufra,'data_fim',hoje),jsonb_build_object('grupo','banco_sabado','data_inicio',hoje,'data_fim',null)));
 ps:=jsonb_build_array(jsonb_build_object('grupo','banco_terca','data_inicio',u.data_entrada_tufra,'data_fim',hoje-1),jsonb_build_object('grupo','banco_sabado','data_inicio',hoje-1,'data_fim',null));
 perform public.editar_dados_administrativos_com_funcoes(u.id,u.data_entrada_tufra,null,null,'[]'::jsonb,ps);
 assert exists(select 1 from public.desenvolvimento_periodos where usuario_id=u.id and grupo='banco_sabado' and data_inicio=hoje-1),'Correção da data';
 assert exists(select 1 from public.desenvolvimento_periodos where usuario_id=u.id and grupo='banco_terca' and data_fim=hoje-1),'Fronteira do período anterior';
 select array_agg(funcao_id order by funcao_id) into depois from public.usuario_funcoes where usuario_id=u.id;
 assert funcs is not distinct from depois,'Correção alterou funções';
 assert (select count(*)=n from public.presencas),'Presenças alteradas';
 ps:=jsonb_build_array(jsonb_build_object('grupo','banco_terca','data_inicio',u.data_entrada_tufra,'data_fim',hoje-1),jsonb_build_object('grupo','banco_sabado','data_inicio',hoje-2,'data_fim',null));
 begin perform public.editar_dados_administrativos_com_funcoes(u.id,u.data_entrada_tufra+1,null,null,'[]'::jsonb,ps); exception when others then falhou:=true; end;
 assert falhou,'Datas inválidas aceitas';
 assert (select data_entrada_tufra=u.data_entrada_tufra from public.usuarios where id=u.id),'Salvamento parcial';
end $$;
select 'OK: dados administrativos e datas de função salvos juntos; correção inválida revertida; funções e presenças preservadas' as teste;
rollback;

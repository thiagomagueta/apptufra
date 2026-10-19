-- Teste transacional: usa perfis existentes sem alterar seus dados e desfaz os atendimentos de teste.
begin;
do $$
declare t uuid; regular uuid; tid uuid; rid uuid; atendimento uuid; outro uuid; r jsonb; bloqueou boolean;
begin
 select u.auth_id,u.id into t,tid from public.usuarios u where u.status='ativo' and u.auth_id is not null and exists
 (select 1 from public.usuario_funcoes uf join public.funcoes f on f.id=uf.funcao_id where uf.usuario_id=u.id and f.nome='Tesoureiro' and f.ativo) limit 1;
 select u.auth_id,u.id into regular,rid from public.usuarios u where u.status='ativo' and u.auth_id is not null and not exists
 (select 1 from public.usuario_funcoes uf join public.funcoes f on f.id=uf.funcao_id where uf.usuario_id=u.id and f.nome='Tesoureiro' and f.ativo) limit 1;
 assert t is not null and regular is not null,'Perfis necessários para o teste ausentes';
 assert not has_table_privilege('authenticated','public.fale_mensagens','SELECT'),'Tabela exposta diretamente';
 assert not has_function_privilege('anon','public.fale_com_a_gente(text,jsonb)','EXECUTE'),'RPC anônima';
 perform set_config('request.jwt.claims',jsonb_build_object('sub',regular,'role','authenticated')::text,true);
 execute 'set local role authenticated';
 assert (public.fale_com_a_gente('acesso')->>'permitido')::boolean=false,'Perfil comum com acesso';
 bloqueou:=false;
 begin perform public.fale_com_a_gente('listar','{"equipe":true}'); exception when insufficient_privilege then bloqueou:=true; end;
 assert bloqueou,'Listagem não bloqueada';
 bloqueou:=false;
 begin perform public.fale_com_a_gente('criar','{"assunto":"Teste","categoria":"Outro","texto":"Teste"}'); exception when insufficient_privilege then bloqueou:=true; end;
 assert bloqueou,'Criação por não tesoureiro permitida';
 execute 'reset role';
 -- Mesmo selecionado como futuro responsável, o usuário comum continua sem acesso no piloto.
 insert into public.fale_responsaveis(usuario_id,criado_por) values(rid,tid) on conflict do nothing;
 execute 'set local role authenticated';
 assert (public.fale_com_a_gente('acesso')->>'permitido')::boolean=false,'Lista de responsáveis liberou piloto';
 perform set_config('request.jwt.claims',jsonb_build_object('sub',t,'role','authenticated')::text,true);
 assert (public.fale_com_a_gente('acesso')->>'permitido')::boolean,'Tesoureiro bloqueado';
 atendimento:=(public.fale_com_a_gente('criar','{"assunto":"Teste transacional","categoria":"Pedido de ajuda","texto":"Mensagem inicial"}')->>'id')::uuid;
 r:=public.fale_com_a_gente('detalhe',jsonb_build_object('id',atendimento));
 assert r->'atendimento'->>'situacao'='nao_lido','Própria leitura mudou situação';
 r:=public.fale_com_a_gente('detalhe',jsonb_build_object('id',atendimento,'equipe',true));
 assert r->'atendimento'->>'situacao'='lido','Leitura da equipe não registrada';
 perform public.fale_com_a_gente('mensagem',jsonb_build_object('id',atendimento,'equipe',true,'interna',true,'texto','Nota interna sigilosa'));
 r:=public.fale_com_a_gente('detalhe',jsonb_build_object('id',atendimento));
 assert not (r->'mensagens' @> '[{"tipo":"interna"}]'::jsonb),'Nota interna exposta ao associado';
 assert r->'atendimento'->>'situacao'='lido','Anotação interna alterou a situação';
 perform public.fale_com_a_gente('mensagem',jsonb_build_object('id',atendimento,'equipe',true,'texto','Resposta da equipe'));
 r:=public.fale_com_a_gente('detalhe',jsonb_build_object('id',atendimento));
 assert r->'atendimento'->>'situacao'='em_acompanhamento','Resposta não iniciou acompanhamento automaticamente';
 perform public.fale_com_a_gente('mensagem',jsonb_build_object('id',atendimento,'texto','Complemento do associado'));
 bloqueou:=false;
 begin perform public.fale_com_a_gente('avaliar',jsonb_build_object('id',atendimento,'avaliacao','satisfeito')); exception when others then bloqueou:=true; end;
 assert bloqueou,'Avaliação antes de encerrar permitida';
 perform public.fale_com_a_gente('encerrar',jsonb_build_object('id',atendimento,'equipe',true));
 r:=public.fale_com_a_gente('detalhe',jsonb_build_object('id',atendimento));
 assert r->'atendimento'->>'situacao'='aguardando_confirmacao','Não aguardou confirmação';
 perform public.fale_com_a_gente('confirmar',jsonb_build_object('id',atendimento));
 perform public.fale_com_a_gente('avaliar',jsonb_build_object('id',atendimento,'avaliacao','parcialmente_satisfeito','comentario','Teste'));
 r:=public.fale_com_a_gente('detalhe',jsonb_build_object('id',atendimento));
 assert r->'atendimento'->>'situacao'='finalizado','Avaliação reabriu';
 assert r->'atendimento'->>'avaliacao'='parcialmente_satisfeito','Avaliação não persistiu';
 bloqueou:=false;
 begin perform public.fale_com_a_gente('mensagem',jsonb_build_object('id',atendimento,'texto','Tentativa após finalizar')); exception when others then bloqueou:=true; end;
 assert bloqueou,'Atendimento finalizado recebeu complemento';
 bloqueou:=false;
 begin perform public.fale_com_a_gente('acompanhar',jsonb_build_object('id',atendimento,'equipe',true)); exception when others then bloqueou:=true; end;
 assert bloqueou,'Equipe reabriu finalizado';
 execute 'reset role';
 -- Titularidade: um tesoureiro na visão de associado não pode consultar mensagens de outro titular.
 insert into public.fale_atendimentos(usuario_id,assunto,categoria) values(rid,'Outro titular','Outro') returning id into outro;
 execute 'set local role authenticated';
 bloqueou:=false;
 begin perform public.fale_com_a_gente('detalhe',jsonb_build_object('id',outro)); exception when insufficient_privilege then bloqueou:=true; end;
 assert bloqueou,'Histórico de outro associado acessível na visão pessoal';
 execute 'reset role';
end $$;
rollback;
select 'Fluxo completo, permissões, notas privadas e fechamento definitivo: OK (dados de teste desfeitos)' as resultado;

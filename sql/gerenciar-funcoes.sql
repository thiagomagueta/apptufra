begin;
-- Gestão centralizada. Sem alteração dos vínculos ou das permissões existentes.
create or replace function private.gerenciar_funcoes(p_acao text,p_dados jsonb default '{}'::jsonb)
returns jsonb language plpgsql security definer set search_path='' as $$
declare
 v_id uuid; v_pai uuid; v_nome text; v_ordem integer; v_ativo boolean;
 v_atual public.funcoes%rowtype; v_parent public.funcoes%rowtype;
 v_protegidas text[]:=array['Tesoureiro','Presidente','Secretária','Sacerdote','Pai/Mãe Pequeno (a)','Médium Corrente Principal','Médium Principal','Médium em Desenvolvimento','Banco do Desenvolvimento','Corrente do Desenvolvimento','Ogam','Cambone','Cantina','Assistência'];
begin
 if auth.uid() is null or not exists(
 select 1 from public.usuarios u join public.usuario_funcoes uf on uf.usuario_id=u.id join public.funcoes f on f.id=uf.funcao_id
 where u.auth_id=auth.uid() and u.status='ativo' and f.nome='Tesoureiro' and f.ativo) then
 raise exception 'Acesso restrito à Gestão APP.' using errcode='42501'; end if;
 if p_acao='listar' then
 return (select coalesce(jsonb_agg(to_jsonb(x) order by x.ordem,x.nome),'[]'::jsonb) from
 (select f.*,f.nome=any(v_protegidas) protegida,
 (select count(*) from public.usuario_funcoes uf where uf.funcao_id=f.id) associados,
 (select count(*) from public.financeiro_regras_obrigacoes r where r.funcao_id=f.id) regras
 from public.funcoes f) x);
 end if;
 if p_acao not in ('salvar','excluir') then raise exception 'Ação inválida.'; end if;
 perform pg_advisory_xact_lock(87261341);
 v_id:=nullif(p_dados->>'id','')::uuid;
 if v_id is not null then
 select * into v_atual from public.funcoes where id=v_id for update;
 if not found then raise exception 'Função não encontrada. Atualize a página.'; end if;
 end if;
 if p_acao='excluir' then
 if v_id is null then raise exception 'Selecione a função.'; end if;
 if v_atual.nome=any(v_protegidas) then raise exception 'Esta função é utilizada nas regras do aplicativo e não pode ser excluída.'; end if;
 if exists(select 1 from public.usuario_funcoes where funcao_id=v_id) or exists(select 1 from public.funcoes where funcao_pai_id=v_id) or exists(select 1 from public.financeiro_regras_obrigacoes where funcao_id=v_id) then
 raise exception 'Não é possível excluir: existem associados, funções filhas ou regras vinculadas. Desative a função quando possível.'; end if;
 delete from public.funcoes where id=v_id;
 return jsonb_build_object('ok',true);
 end if;
 v_nome:=btrim(p_dados->>'nome'); v_pai:=nullif(p_dados->>'funcao_pai_id','')::uuid;
 v_ordem:=coalesce((p_dados->>'ordem')::integer,0); v_ativo:=coalesce((p_dados->>'ativo')::boolean,true);
 if v_nome is null or length(v_nome) not between 2 and 100 then raise exception 'Informe um nome entre 2 e 100 caracteres.'; end if;
 if v_id is null and v_nome=any(v_protegidas) then raise exception 'Este nome é reservado para uma função existente do aplicativo.'; end if;
 if v_ordem not between 0 and 9999 then raise exception 'Informe uma ordem entre 0 e 9999.'; end if;
 if v_id is not null and v_atual.nome=any(v_protegidas) and (v_nome<>v_atual.nome or v_pai is distinct from v_atual.funcao_pai_id or v_ativo is distinct from v_atual.ativo) then
 raise exception 'Esta função é utilizada nas regras do aplicativo. Somente a ordem pode ser alterada.'; end if;
 if exists(select 1 from public.funcoes f where lower(btrim(f.nome))=lower(v_nome) and f.funcao_pai_id is not distinct from v_pai and f.id is distinct from v_id) then
 raise exception 'Já existe uma função com este nome neste grupo.'; end if;
 if v_pai is not null then
 select * into v_parent from public.funcoes where id=v_pai;
 if not found or v_pai=v_id or v_parent.funcao_pai_id is not null then raise exception 'Escolha uma função principal como função pai.'; end if;
 if v_ativo and not v_parent.ativo then raise exception 'Reative a função pai antes de ativar a função filha.'; end if;
 if exists(select 1 from public.funcoes where funcao_pai_id=v_id) then raise exception 'Uma função com filhas não pode virar função filha.'; end if;
 end if;
 if not v_ativo and exists(select 1 from public.funcoes where funcao_pai_id=v_id and ativo) then raise exception 'Desative primeiro as funções filhas.'; end if;
 if v_id is null then
 insert into public.funcoes(nome,ordem,ativo,funcao_pai_id) values(v_nome,v_ordem,v_ativo,v_pai) returning id into v_id;
 else update public.funcoes set nome=v_nome,ordem=v_ordem,ativo=v_ativo,funcao_pai_id=v_pai where id=v_id; end if;
 return jsonb_build_object('ok',true,'id',v_id);
end $$;
revoke all on function private.gerenciar_funcoes(text,jsonb) from public,anon;
grant execute on function private.gerenciar_funcoes(text,jsonb) to authenticated;
create or replace function public.gerenciar_funcoes(p_acao text,p_dados jsonb default '{}'::jsonb)
returns jsonb language sql security invoker set search_path='' as $$ select private.gerenciar_funcoes(p_acao,p_dados); $$;
revoke all on function public.gerenciar_funcoes(text,jsonb) from public,anon;
grant execute on function public.gerenciar_funcoes(text,jsonb) to authenticated;

-- Impede novas atribuições de funções desativadas em qualquer tela.
create or replace function private.validar_funcao_ativa()
returns trigger language plpgsql security definer set search_path='' as $$
begin
 if tg_op='INSERT' or new.funcao_id is distinct from old.funcao_id then
 if not exists(select 1 from public.funcoes where id=new.funcao_id and ativo) then
 raise exception 'Esta função foi desativada. Atualize a página e escolha uma função ativa.';
 end if;
 end if;
 return new;
end $$;
revoke all on function private.validar_funcao_ativa() from public,anon,authenticated;
drop trigger if exists validar_funcao_ativa on public.usuario_funcoes;
create trigger validar_funcao_ativa before insert or update of funcao_id on public.usuario_funcoes
for each row execute function private.validar_funcao_ativa();

commit;

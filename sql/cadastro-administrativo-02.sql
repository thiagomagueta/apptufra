create or replace function private.cadastro_administrativo(p_acao text,p_dados jsonb)
returns jsonb language plpgsql security definer set search_path='' as $$
declare
 v_autor uuid; v_gestor boolean; v_pode boolean; v_id uuid; v_conta uuid;
 v_u public.usuarios%rowtype; v_c public.usuarios%rowtype;
 v_nome text; v_cpf text; v_email text; v_telefone text;
 v_entrada date; v_desenvolvimento date; v_principal date;
 v_funcoes uuid[]; v_ficha jsonb; v_r record; v_existe boolean;
begin
 select id into v_autor from public.usuarios where auth_id=auth.uid() and status='ativo';
 v_gestor := v_autor is not null and public.usuario_pode_gerenciar_permissoes();
 v_pode := v_gestor or (v_autor is not null and exists(select 1 from private.cadastro_administrativo_responsaveis where usuario_id=v_autor));
 if p_acao='acesso' then return jsonb_build_object('cadastrar',v_pode,'gerenciar',v_gestor); end if;
 if auth.uid() is null or not v_pode then raise exception 'Sem autorização para cadastrar associados.'; end if;
 if p_acao='listar' then
  return jsonb_build_object(
   'previos',coalesce((select jsonb_agg(to_jsonb(u)||jsonb_build_object('ficha',to_jsonb(f),'funcoes',(select coalesce(jsonb_agg(funcao_id),'[]'::jsonb) from public.usuario_funcoes where usuario_id=u.id)) order by u.nome_completo) from public.usuarios u left join public.fichas_associados f on f.usuario_id=u.id where u.cadastro_previo and u.auth_id is null and u.status='ativo'),'[]'::jsonb),
   'pendentes',case when v_gestor then coalesce((select jsonb_agg(jsonb_build_object('id',u.id,'nome_completo',u.nome_completo,'cpf',u.cpf,'email',u.email,'telefone',u.telefone,'email_confirmado',a.email_confirmed_at is not null) order by u.nome_completo) from public.usuarios u join auth.users a on a.id=u.auth_id where u.status='aguardando_aprovacao'),'[]'::jsonb) else '[]'::jsonb end,
   'funcoes',coalesce((select jsonb_agg(to_jsonb(f) order by f.nome) from public.funcoes f where v_gestor or f.nome not in ('Tesoureiro','Presidente','Secretária','Sacerdote','Pai/Mãe Pequeno (a)')),'[]'::jsonb)
  );
 end if;
 if p_acao in ('responsaveis','autorizar') then
  if not v_gestor then raise exception 'Somente quem gerencia permissões pode autorizar responsáveis.'; end if;
  if p_acao='autorizar' then
   v_id := (p_dados->>'usuario_id')::uuid;
   if not exists(select 1 from public.usuarios where id=v_id and auth_id is not null and status='ativo') then raise exception 'Selecione uma conta ativa.'; end if;
   if (p_dados->>'autorizado')::boolean then
    insert into private.cadastro_administrativo_responsaveis(usuario_id) values(v_id) on conflict do nothing;
   else delete from private.cadastro_administrativo_responsaveis where usuario_id=v_id; end if;
   insert into private.cadastro_administrativo_auditoria(autor,acao,associado_id,dados) values(v_autor,p_acao,v_id,p_dados);
  end if;
  return coalesce((select jsonb_agg(jsonb_build_object('id',u.id,'nome_completo',u.nome_completo,'autorizado',r.usuario_id is not null,'gestor',exists(select 1 from public.usuario_funcoes uf join public.funcoes f on f.id=uf.funcao_id where uf.usuario_id=u.id and f.nome='Tesoureiro')) order by u.nome_completo) from public.usuarios u left join private.cadastro_administrativo_responsaveis r on r.usuario_id=u.id where u.status='ativo' and u.auth_id is not null),'[]'::jsonb);
 end if;
 if p_acao='vincular' then
  if not v_gestor then raise exception 'Somente quem gerencia permissões pode vincular contas.'; end if;
  v_id := (p_dados->>'associado_id')::uuid; v_conta := (p_dados->>'conta_id')::uuid;
  if v_id=v_conta then raise exception 'Selecione dois cadastros diferentes.'; end if;
  perform id from public.usuarios where id in(v_id,v_conta) order by id for update;
  select * into v_u from public.usuarios where id=v_id;
  select * into v_c from public.usuarios where id=v_conta;
  if v_u.id is null or not v_u.cadastro_previo or v_u.auth_id is not null or v_u.status<>'ativo' then raise exception 'Cadastro prévio indisponível.'; end if;
  if v_c.id is null or v_c.auth_id is null or v_c.status<>'aguardando_aprovacao' then raise exception 'A conta precisa estar aguardando aprovação.'; end if;
  if not exists(select 1 from auth.users where id=v_c.auth_id and email_confirmed_at is not null) then raise exception 'A pessoa precisa confirmar o e-mail antes da vinculação.'; end if;
  for v_r in select n.nspname,c.relname,a.attname from pg_catalog.pg_constraint k join pg_catalog.pg_class c on c.oid=k.conrelid join pg_catalog.pg_namespace n on n.oid=c.relnamespace join pg_catalog.pg_attribute a on a.attrelid=c.oid and a.attnum=k.conkey[1] where k.confrelid='public.usuarios'::regclass and k.contype='f' and c.relname<>'fichas_associados' loop
   execute format('select exists(select 1 from %I.%I where %I=$1)',v_r.nspname,v_r.relname,v_r.attname) into v_existe using v_conta;
   if v_existe then raise exception 'A conta nova já tem registros. Revise antes de vincular.'; end if;
  end loop;
  insert into private.cadastro_administrativo_auditoria(autor,acao,associado_id,dados)
   values(v_autor,p_acao,v_id,jsonb_build_object('cadastro_previo',to_jsonb(v_u),'conta_nova',to_jsonb(v_c),'ficha_nova',(select to_jsonb(f) from public.fichas_associados f where usuario_id=v_conta)));
  update public.usuarios set auth_id=null,cpf=null,status='vinculado' where id=v_conta;
  update public.usuarios set auth_id=v_c.auth_id,cpf=v_c.cpf,email=v_c.email,telefone=coalesce(v_c.telefone,v_u.telefone),foto_path=coalesce(v_c.foto_path,v_u.foto_path),ficha_concluida=false,data_aprovacao=now(),aprovado_por=v_autor where id=v_id;
  update public.fichas_associados set dados_pessoais=dados_pessoais||jsonb_build_object('cpf',v_c.cpf),endereco_contato=endereco_contato||jsonb_build_object('email',v_c.email,'celular',coalesce(v_c.telefone,v_u.telefone,'')),atualizado_em=now() where usuario_id=v_id;
  return jsonb_build_object('id',v_id);
 end if;
 if p_acao not in ('salvar') then raise exception 'Ação inválida.'; end if;
 v_id := nullif(p_dados->>'id','')::uuid;
 v_nome := btrim(coalesce(p_dados->>'nome_completo',''));
 v_cpf := nullif(regexp_replace(coalesce(p_dados->>'cpf',''),'\D','','g'),'');
 v_email := lower(btrim(coalesce(p_dados->>'email',''))); v_telefone := nullif(btrim(p_dados->>'telefone'),'');
 if v_nome='' then raise exception 'Informe o nome completo.'; end if;
 if v_cpf is not null and length(v_cpf)<>11 then raise exception 'O CPF deve ter 11 números ou ficar vazio.'; end if;
 v_entrada := nullif(p_dados->>'data_entrada_tufra','')::date;
 v_desenvolvimento := nullif(p_dados->>'data_corrente_desenvolvimento','')::date;
 v_principal := nullif(p_dados->>'data_corrente_principal','')::date;
 if v_entrada is not null and (v_desenvolvimento<v_entrada or v_principal<v_entrada) or v_principal<v_desenvolvimento then raise exception 'Confira a ordem das datas de ingresso.'; end if;
 select coalesce(array_agg(value::uuid),'{}'::uuid[]) into v_funcoes from jsonb_array_elements_text(coalesce(p_dados->'funcoes','[]'::jsonb));
 if exists(select 1 from unnest(v_funcoes) x(funcao_id) where not exists(select 1 from public.funcoes f where f.id=x.funcao_id)) then raise exception 'Função inválida.'; end if;
 if not v_gestor and exists(select 1 from public.funcoes where id=any(v_funcoes) and nome in ('Tesoureiro','Presidente','Secretária','Sacerdote','Pai/Mãe Pequeno (a)')) then raise exception 'Você não pode atribuir funções administrativas.'; end if;
 if v_cpf is not null then
  perform pg_advisory_xact_lock(hashtextextended('cadastro-previo-cpf:'||v_cpf,0));
  if exists(select 1 from public.usuarios where id is distinct from v_id and (regexp_replace(coalesce(cpf,''),'\D','','g')=v_cpf or (cadastro_previo and auth_id is null and cpf_previo=v_cpf))) then raise exception 'Já existe um associado com este CPF. Confira os cadastros.'; end if;
 end if;
 if v_id is null then
  insert into public.usuarios(nome_completo,cpf,cpf_previo,email,telefone,status,ficha_concluida,cadastro_previo,data_entrada_tufra,data_corrente_desenvolvimento,data_corrente_principal,status_migracao_historica)
   values(v_nome,null,v_cpf,v_email,v_telefone,'ativo',false,true,v_entrada,v_desenvolvimento,v_principal,'pendente') returning id into v_id;
 else
  select * into v_u from public.usuarios where id=v_id for update;
  if v_u.id is null or not v_u.cadastro_previo or v_u.auth_id is not null or v_u.status<>'ativo' then raise exception 'Somente cadastros prévios sem conta podem ser editados aqui.'; end if;
  if not v_gestor and exists(select 1 from public.usuario_funcoes uf join public.funcoes f on f.id=uf.funcao_id where uf.usuario_id=v_id and f.nome in ('Tesoureiro','Presidente','Secretária','Sacerdote','Pai/Mãe Pequeno (a)')) then raise exception 'Este cadastro requer edição pela administração.'; end if;
  update public.usuarios set nome_completo=v_nome,cpf_previo=v_cpf,email=v_email,telefone=v_telefone,data_entrada_tufra=v_entrada,data_corrente_desenvolvimento=v_desenvolvimento,data_corrente_principal=v_principal where id=v_id;
 end if;
 v_ficha := coalesce(p_dados->'ficha','{}'::jsonb);
 if jsonb_typeof(coalesce(v_ficha->'dados_pessoais','{}'))<>'object' or jsonb_typeof(coalesce(v_ficha->'endereco_contato','{}'))<>'object' or jsonb_typeof(coalesce(v_ficha->'historico_umbanda','{}'))<>'object' then raise exception 'Ficha inválida.'; end if;
 insert into public.fichas_associados(usuario_id,dados_pessoais,endereco_contato,historico_umbanda)
 values(v_id,coalesce(v_ficha->'dados_pessoais','{}')||jsonb_build_object('nome',v_nome,'cpf',coalesce(v_cpf,'')),coalesce(v_ficha->'endereco_contato','{}')||jsonb_build_object('email',v_email,'celular',coalesce(v_telefone,'')),coalesce(v_ficha->'historico_umbanda','{}'))
 on conflict(usuario_id) do update set dados_pessoais=public.fichas_associados.dados_pessoais||excluded.dados_pessoais,endereco_contato=public.fichas_associados.endereco_contato||excluded.endereco_contato,historico_umbanda=public.fichas_associados.historico_umbanda||excluded.historico_umbanda,atualizado_em=now();
 delete from public.usuario_funcoes where usuario_id=v_id and not(funcao_id=any(v_funcoes));
 insert into public.usuario_funcoes(usuario_id,funcao_id,atribuido_por) select v_id,x,v_autor from unnest(v_funcoes) x where not exists(select 1 from public.usuario_funcoes where usuario_id=v_id and funcao_id=x);
 insert into private.cadastro_administrativo_auditoria(autor,acao,associado_id,dados) values(v_autor,p_acao,v_id,jsonb_build_object('anterior',to_jsonb(v_u),'novo',p_dados));
 return jsonb_build_object('id',v_id);
end;
$$;

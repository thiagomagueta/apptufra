-- Excluir somente cadastro administrativo sem conta e sem histórico.
create or replace function private.excluir_cadastro_previo(p_usuario_id uuid)
returns void language plpgsql security definer set search_path='' as $$
declare
 v_autor uuid; v_acesso jsonb; v_u public.usuarios%rowtype;
 v_r record; v_existe boolean;
begin
 v_acesso := private.cadastro_administrativo('acesso','{}'::jsonb);
 if auth.uid() is null or not coalesce((v_acesso->>'cadastrar')::boolean,false) then
  raise exception 'Sem autorização para excluir cadastros administrativos.';
 end if;
 select id into v_autor from public.usuarios where auth_id=auth.uid() and status='ativo';
 select * into v_u from public.usuarios where id=p_usuario_id for update;
 if v_u.id is null or not v_u.cadastro_previo or v_u.auth_id is not null or v_u.status<>'ativo' then
  raise exception 'Somente cadastros administrativos sem conta podem ser excluídos aqui.';
 end if;
 if not (v_acesso->>'gerenciar')::boolean and exists(
  select 1 from public.usuario_funcoes uf join public.funcoes f on f.id=uf.funcao_id
  where uf.usuario_id=p_usuario_id and f.nome in ('Tesoureiro','Presidente','Secretária','Sacerdote','Pai/Mãe Pequeno (a)')
 ) then raise exception 'Este cadastro requer exclusão pela administração.'; end if;
 -- Impedir cascatas que apagariam mensalidades, presenças ou outros vínculos.
 for v_r in
  select n.nspname,c.relname,a.attname
  from pg_catalog.pg_constraint k
  join pg_catalog.pg_class c on c.oid=k.conrelid
  join pg_catalog.pg_namespace n on n.oid=c.relnamespace
  join pg_catalog.pg_attribute a on a.attrelid=c.oid and a.attnum=any(k.conkey)
  where k.confrelid='public.usuarios'::regclass and k.contype='f'
  and not (n.nspname='public' and c.relname in ('fichas_associados','usuario_funcoes') and a.attname='usuario_id')
 loop
  execute format('select exists(select 1 from %I.%I where %I=$1)',v_r.nspname,v_r.relname,v_r.attname)
   into v_existe using p_usuario_id;
  if v_existe then
   raise exception 'Este associado já possui histórico ou vínculos. Use a baixa do associado para preservá-los.';
  end if;
 end loop;
 insert into private.cadastro_administrativo_auditoria(autor,acao,associado_id,dados)
 values(v_autor,'excluir',p_usuario_id,jsonb_build_object(
  'cadastro',to_jsonb(v_u),
  'ficha',(select to_jsonb(f) from public.fichas_associados f where usuario_id=p_usuario_id),
  'funcoes',(select jsonb_agg(to_jsonb(uf)) from public.usuario_funcoes uf where usuario_id=p_usuario_id)
 ));
 delete from public.usuario_funcoes where usuario_id=p_usuario_id;
 delete from public.usuarios where id=p_usuario_id;
end;
$$;
revoke all on function private.excluir_cadastro_previo(uuid) from public,anon;
grant execute on function private.excluir_cadastro_previo(uuid) to authenticated;
create or replace function public.excluir_cadastro_previo(p_usuario_id uuid)
returns void language sql security invoker set search_path='' as $$
 select private.excluir_cadastro_previo(p_usuario_id);
$$;
revoke all on function public.excluir_cadastro_previo(uuid) from public,anon;
grant execute on function public.excluir_cadastro_previo(uuid) to authenticated;

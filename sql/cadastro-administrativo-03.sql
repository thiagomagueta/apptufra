revoke all on function private.cadastro_administrativo(text,jsonb) from public,anon;
grant usage on schema private to authenticated;
grant execute on function private.cadastro_administrativo(text,jsonb) to authenticated;
create or replace function public.cadastro_administrativo(p_acao text,p_dados jsonb default '{}'::jsonb)
returns jsonb language sql security invoker set search_path='' as $$ select private.cadastro_administrativo(p_acao,p_dados); $$;
revoke all on function public.cadastro_administrativo(text,jsonb) from public,anon;
grant execute on function public.cadastro_administrativo(text,jsonb) to authenticated;
-- Manter bloqueio de CPF de contas existentes, independentemente de pontuação.
create or replace function public.validar_cpf_novo_usuario(event jsonb)
returns jsonb language plpgsql security definer set search_path='' as $$
declare v_cpf text;
begin
 v_cpf := regexp_replace(coalesce(event->'user'->'user_metadata'->>'cpf',''),'\D','','g');
 if v_cpf<>'' and exists(select 1 from public.usuarios where auth_id is not null and regexp_replace(coalesce(cpf,''),'\D','','g')=v_cpf) then
  return jsonb_build_object('error',jsonb_build_object('http_code',400,'message','CPF_JA_CADASTRADO'));
 end if;
 return '{}'::jsonb;
end;
$$;
revoke all on function public.validar_cpf_novo_usuario(jsonb) from public,anon,authenticated;
grant execute on function public.validar_cpf_novo_usuario(jsonb) to supabase_auth_admin;

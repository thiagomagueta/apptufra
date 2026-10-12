-- Criar a ficha na aprovação, preservando fichas já existentes.
create or replace function private.criar_ficha_na_aprovacao()
returns trigger language plpgsql security definer set search_path='' as $$
declare v_nascimento text;
begin
 if new.auth_id is not null and new.status in ('ativo','aprovado') then
  select nullif(raw_user_meta_data->>'data_nascimento','') into v_nascimento
  from auth.users where id=new.auth_id;
  insert into public.fichas_associados(
   usuario_id,dados_pessoais,endereco_contato,historico_umbanda
  ) values(
   new.id,
   jsonb_strip_nulls(jsonb_build_object(
    'nome',nullif(new.nome_completo,''),
    'cpf',nullif(new.cpf,''),'nascimento',v_nascimento
   )),
   jsonb_strip_nulls(jsonb_build_object(
    'email',nullif(new.email,''),'celular',nullif(new.telefone,'')
   )),
   '{}'::jsonb
  ) on conflict(usuario_id) do nothing;
 end if;
 return new;
end;
$$;
revoke all on function private.criar_ficha_na_aprovacao() from public,anon,authenticated;
drop trigger if exists ficha_apos_aprovacao on public.usuarios;
create trigger ficha_apos_aprovacao
 after insert or update of status,auth_id on public.usuarios
 for each row execute function private.criar_ficha_na_aprovacao();
-- Incluir também aprovados anteriores que ainda não têm ficha.
insert into public.fichas_associados(
 usuario_id,dados_pessoais,endereco_contato,historico_umbanda
)
select u.id,
 jsonb_strip_nulls(jsonb_build_object(
  'nome',nullif(u.nome_completo,''),'cpf',nullif(u.cpf,''),
  'nascimento',nullif(a.raw_user_meta_data->>'data_nascimento','')
 )),
 jsonb_strip_nulls(jsonb_build_object(
  'email',nullif(u.email,''),'celular',nullif(u.telefone,'')
 )),
 '{}'::jsonb
from public.usuarios u left join auth.users a on a.id=u.auth_id
where u.auth_id is not null and u.status in ('ativo','aprovado')
 and not u.ficha_concluida
on conflict(usuario_id) do nothing;

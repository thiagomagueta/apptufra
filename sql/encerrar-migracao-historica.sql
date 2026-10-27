begin;
-- Bloqueia as rotinas antigas sem apagar funções, históricos ou presenças.
revoke execute on function public.verificar_migracao_historica(uuid) from public,anon,authenticated;
revoke execute on function public.vincular_migracao_historica_manual(uuid,uuid) from public,anon,authenticated;
revoke execute on function public.marcar_migracao_como_novo(uuid) from public,anon,authenticated;
alter table public.usuarios alter column status_migracao_historica set default 'novo';
-- Também cobre os formulários antigos que enviavam 'pendente' explicitamente.
create or replace function private.novo_cadastro_sem_migracao()
returns trigger language plpgsql set search_path='' as $$
begin
 new.status_migracao_historica := 'novo';
 return new;
end $$;
revoke all on function private.novo_cadastro_sem_migracao() from public,anon,authenticated;
drop trigger if exists novo_cadastro_sem_migracao on public.usuarios;
create trigger novo_cadastro_sem_migracao before insert on public.usuarios
for each row execute function private.novo_cadastro_sem_migracao();
commit;

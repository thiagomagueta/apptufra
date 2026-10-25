begin;
create or replace function private.editar_dados_administrativos_com_funcoes(p_usuario_id uuid,p_data_entrada_tufra date,p_data_corrente_desenvolvimento date,p_data_corrente_principal date,p_historico_funcoes jsonb,p_periodos jsonb)
returns void language plpgsql security definer set search_path='' as $$
declare v_antigos jsonb; v_novos jsonb;
begin
 if auth.uid() is null or not public.usuario_pode_editar_associados() then raise exception 'Usuário sem permissão para editar associados.'; end if;
 perform 1 from public.usuarios where id=p_usuario_id for update;
 perform public.editar_dados_administrativos_associado(p_usuario_id,p_data_entrada_tufra,p_data_corrente_desenvolvimento,p_data_corrente_principal,p_historico_funcoes);
 select coalesce(jsonb_agg(jsonb_build_object('grupo',grupo,'data_inicio',data_inicio,'data_fim',data_fim) order by data_inicio),'[]'::jsonb) into v_antigos from public.desenvolvimento_periodos where usuario_id=p_usuario_id;
 select coalesce(jsonb_agg(jsonb_build_object('grupo',x.grupo,'data_inicio',x.data_inicio,'data_fim',x.data_fim) order by x.data_inicio),'[]'::jsonb) into v_novos from jsonb_to_recordset(coalesce(p_periodos,'[]'::jsonb)) x(grupo text,data_inicio date,data_fim date);
 if v_antigos is distinct from v_novos then perform private.corrigir_datas_periodos(p_usuario_id,p_periodos); end if;
end $$;
revoke all on function private.editar_dados_administrativos_com_funcoes(uuid,date,date,date,jsonb,jsonb) from public,anon;
grant execute on function private.editar_dados_administrativos_com_funcoes(uuid,date,date,date,jsonb,jsonb) to authenticated;
create or replace function public.editar_dados_administrativos_com_funcoes(p_usuario_id uuid,p_data_entrada_tufra date,p_data_corrente_desenvolvimento date,p_data_corrente_principal date,p_historico_funcoes jsonb,p_periodos jsonb)
returns void language sql security invoker set search_path='' as $$ select private.editar_dados_administrativos_com_funcoes(p_usuario_id,p_data_entrada_tufra,p_data_corrente_desenvolvimento,p_data_corrente_principal,p_historico_funcoes,p_periodos); $$;
revoke all on function public.editar_dados_administrativos_com_funcoes(uuid,date,date,date,jsonb,jsonb) from public,anon;
grant execute on function public.editar_dados_administrativos_com_funcoes(uuid,date,date,date,jsonb,jsonb) to authenticated;
commit;

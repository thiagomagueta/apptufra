create or replace function private.listar_associados_presenca_periodo(p_tipo_lista_id uuid,p_data date)
returns table(id uuid,nome_completo text,data_entrada_tufra date)
language plpgsql stable security definer set search_path='' as $$
declare v_nome text;
begin
 if auth.uid() is null or not (private.eh_responsavel_lista_presenca(p_tipo_lista_id) or private.pode_gerenciar_calendario()) then raise exception 'Sem autorização para esta lista.'; end if;
 select t.nome into v_nome from public.tipos_lista_presenca t where t.id=p_tipo_lista_id and t.ativo;
 return query select u.id,u.nome_completo,u.data_entrada_tufra from public.usuarios u where u.status in ('ativo','inativo')
 and (p_data is null or ((u.data_saida_tufra is null or p_data<u.data_saida_tufra) and not exists(select 1 from public.historico_baixas_associados h where h.usuario_id=u.id and h.data_saida<=p_data and (h.data_retorno is null or p_data<h.data_retorno))))
 and (u.data_entrada_tufra is null or p_data is null or u.data_entrada_tufra<=p_data)
 and case when v_nome in ('Desenvolvimento','Banco sábado','Corrente Principal') then
  exists(select 1 from public.desenvolvimento_periodos d where d.usuario_id=u.id
    and (p_data is null or (d.data_inicio<=p_data and (d.data_fim is null or p_data<d.data_fim)))
    and ((v_nome='Banco sábado' and d.grupo='banco_sabado') or (v_nome='Desenvolvimento' and d.grupo in ('banco_terca','corrente_terca')) or (v_nome='Corrente Principal' and d.grupo='principal')))
  or (v_nome in ('Desenvolvimento','Corrente Principal') and not exists(select 1 from public.desenvolvimento_periodos d where d.usuario_id=u.id)
    and exists(select 1 from public.usuario_funcoes uf join public.funcoes f on f.id=uf.funcao_id where uf.usuario_id=u.id and ((v_nome='Desenvolvimento' and f.nome='Médium em Desenvolvimento') or (v_nome='Corrente Principal' and f.nome in ('Médium Corrente Principal','Médium Principal')))))
 else exists(select 1 from public.usuario_funcoes uf join public.funcoes f on f.id=uf.funcao_id where uf.usuario_id=u.id
 and f.nome=any(case v_nome when 'Corrente Principal' then array['Médium Corrente Principal','Médium Principal'] when 'Ogans' then array['Ogam'] when 'Cambones' then array['Cambone'] when 'Cantina' then array['Cantina'] else array[]::text[] end)) end
 order by u.nome_completo;
end $$;

create or replace function private.listar_associados_presenca_historico(p_tipo_lista_id uuid,p_data date)
returns table(id uuid,nome_completo text,data_entrada_tufra date,data_corrente_desenvolvimento date,data_corrente_principal date,data_saida_tufra date,baixas jsonb)
language sql stable security definer set search_path='' as $$
 select r.id,r.nome_completo,r.data_entrada_tufra,u.data_corrente_desenvolvimento,u.data_corrente_principal,u.data_saida_tufra,
 coalesce((select jsonb_agg(jsonb_build_object('data_saida',h.data_saida,'data_retorno',h.data_retorno) order by h.data_saida) from public.historico_baixas_associados h where h.usuario_id=r.id),'[]'::jsonb)
 from private.listar_associados_presenca_periodo(p_tipo_lista_id,p_data) r join public.usuarios u on u.id=r.id;
$$;
revoke all on function private.listar_associados_presenca_historico(uuid,date) from public,anon;
grant execute on function private.listar_associados_presenca_historico(uuid,date) to authenticated;
create or replace function public.listar_associados_presenca_historico(p_tipo_lista_id uuid,p_data date)
returns table(id uuid,nome_completo text,data_entrada_tufra date,data_corrente_desenvolvimento date,data_corrente_principal date,data_saida_tufra date,baixas jsonb)
language sql stable security invoker set search_path='' as $$select * from private.listar_associados_presenca_historico(p_tipo_lista_id,p_data);$$;
revoke all on function public.listar_associados_presenca_historico(uuid,date) from public,anon;
grant execute on function public.listar_associados_presenca_historico(uuid,date) to authenticated;

begin; CREATE OR REPLACE FUNCTION public.sincronizar_confirmacao_presenca(p_atividade_id uuid)
RETURNS void LANGUAGE plpgsql
SECURITY DEFINER SET search_path TO 'public', 'private'
AS $function$ declare
v_usuario_id uuid; v_resposta text;
v_justificativa text; v_tipo_atividade text;
v_data date; v_grupo text;
v_nome_lista text; v_tipo_lista_id uuid;
v_presenca_id uuid; v_origem text;
begin select u.id into v_usuario_id from public.usuarios u where u.auth_id = auth.uid()
and u.status = 'ativo' limit 1; if v_usuario_id is null then
raise exception 'Usuário autenticado não encontrado ou inativo.';
end if; select
cp.resposta, cp.justificativa
into v_resposta,
v_justificativa from public.confirmacoes_presenca cp where
cp.atividade_id = p_atividade_id and cp.usuario_id = v_usuario_id limit 1;
if not found then raise exception
'Confirmação de presença não encontrada.'; end if;
if v_resposta not in ( 'presente',
'ausente' ) then
raise exception 'Resposta de presença inválida.';
end if; select a.tipo_atividade, a.data into v_tipo_atividade, v_data from public.atividades a where a.id = p_atividade_id limit 1;
if not found then raise exception
'Atividade não encontrada.'; end if;
if v_tipo_atividade = 'gira_principal' then v_nome_lista :=
'Corrente Principal'; elsif v_tipo_atividade = 'gira_desenvolvimento' then
v_nome_lista := 'Desenvolvimento';
else return;
end if; select d.grupo into v_grupo from public.desenvolvimento_periodos d where d.usuario_id=v_usuario_id and d.data_inicio<=v_data and (d.data_fim is null or v_data<d.data_fim);
if v_tipo_atividade='gira_principal' and v_grupo='banco_sabado' then v_nome_lista:='Banco sábado'; end if; if v_tipo_atividade='gira_desenvolvimento' and exists(select 1 from public.desenvolvimento_periodos where usuario_id=v_usuario_id)
and (v_grupo is null or v_grupo='banco_sabado') then return; end if; select tlp.id into v_tipo_lista_id from public.tipos_lista_presenca tlp
where tlp.nome = v_nome_lista
and tlp.ativo = true limit 1; if v_tipo_lista_id is null then
raise exception 'Lista de presença não encontrada.';
end if; select
p.id, p.origem
into v_presenca_id,
v_origem from public.presencas p where
p.tipo_lista_id = v_tipo_lista_id and p.atividade_id = p_atividade_id
and p.usuario_id = v_usuario_id limit 1; if v_resposta = 'presente' then
if v_presenca_id is not null
and v_origem = 'confirmacao_previa' then delete from public.presencas where id = v_presenca_id;
end if; return;
end if; if
v_presenca_id is not null and coalesce(
v_origem, ''
) <> 'confirmacao_previa' then return;
end if; if v_presenca_id is not null then
update public.presencas set
status = case
when trim( coalesce(
v_justificativa, ''
) ) <> ''
then 'justificada' else 'falta'
end, origem =
'confirmacao_previa' where id = v_presenca_id; return;
end if; insert into public.presencas (
tipo_lista_id, atividade_id,
usuario_id, status,
origem )
values ( v_tipo_lista_id,
p_atividade_id, v_usuario_id,
case when trim(
coalesce( v_justificativa,
'' )
) <> '' then 'justificada'
else 'falta' end,
'confirmacao_previa' );
end; $function$
commit;

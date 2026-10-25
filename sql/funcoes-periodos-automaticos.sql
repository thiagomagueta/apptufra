begin;
alter table public.desenvolvimento_periodos drop constraint desenvolvimento_periodos_grupo_check;
alter table public.desenvolvimento_periodos add constraint desenvolvimento_periodos_grupo_check check(grupo in ('banco_terca','corrente_terca','banco_sabado','principal','fora'));
insert into public.desenvolvimento_periodos(usuario_id,grupo,data_inicio)
select u.id,'principal',coalesce(u.data_corrente_principal,u.data_entrada_tufra,(now() at time zone 'America/Sao_Paulo')::date)
from public.usuarios u where exists(select 1 from public.usuario_funcoes uf join public.funcoes f on f.id=uf.funcao_id where uf.usuario_id=u.id and f.nome in ('Médium Corrente Principal','Médium Principal'))
and not exists(select 1 from public.desenvolvimento_periodos d where d.usuario_id=u.id);
create or replace function private.salvar_periodos_desenvolvimento(p_usuario_id uuid,p_periodos jsonb)
returns void language plpgsql security definer set search_path='' as $$
declare r record; v_fim date; v_primeiro boolean:=true; v_grupo text; v_admin uuid; v_pai uuid; v_filho uuid;
begin
 if auth.uid() is null or not private.eh_tesoureiro() then raise exception 'Sem autorização para alterar os períodos.'; end if;
 perform 1 from public.usuarios where id=p_usuario_id for update;
 if not found then raise exception 'Pessoa não encontrada.'; end if;
 if p_periodos is null or jsonb_typeof(p_periodos)<>'array' or jsonb_array_length(p_periodos)=0 then raise exception 'Informe pelo menos um período.'; end if;
 for r in select * from jsonb_to_recordset(p_periodos) as x(grupo text,data_inicio date,data_fim date) order by data_inicio loop
  if r.grupo is null or r.grupo not in ('banco_terca','corrente_terca','banco_sabado','principal','fora') or r.data_inicio is null
    or (r.data_fim is not null and r.data_fim<=r.data_inicio) then raise exception 'Período inválido.'; end if;
  if r.data_inicio<(select data_entrada_tufra from public.usuarios where id=p_usuario_id) then raise exception 'O período não pode começar antes da entrada no TUFRA.'; end if;
  if r.data_inicio>(now() at time zone 'America/Sao_Paulo')::date then raise exception 'Informe uma data de início até hoje.'; end if;
  if not v_primeiro and (v_fim is null or r.data_inicio<>v_fim) then raise exception 'Os períodos precisam ser contínuos, sem sobreposição.'; end if;
  v_primeiro:=false; v_fim:=r.data_fim; v_grupo:=r.grupo;
 end loop;
 if v_fim is not null then raise exception 'O último período deve estar em aberto.'; end if;
 select id into v_admin from public.usuarios where auth_id=auth.uid();
 -- Substituição atômica: valida tudo antes de escrever. Presenças não são alteradas.
 delete from public.desenvolvimento_periodos where usuario_id=p_usuario_id;
 insert into public.desenvolvimento_periodos(usuario_id,grupo,data_inicio,data_fim,atualizado_por)
 select p_usuario_id,x.grupo,x.data_inicio,x.data_fim,v_admin from jsonb_to_recordset(p_periodos) as x(grupo text,data_inicio date,data_fim date);
end $$;

create or replace function private.salvar_funcoes_com_periodo(p_usuario_id uuid,p_funcoes uuid[])
returns void language plpgsql security definer set search_path='' as $$
declare v_grupo text; v_anterior text; v_aberto public.desenvolvimento_periodos%rowtype; v_admin uuid; v_hoje date:=(now() at time zone 'America/Sao_Paulo')::date; v_periodos jsonb; v_inicio date; v_funcao text; v_tinha boolean; v_tem boolean;
begin
 if auth.uid() is null or not private.eh_tesoureiro() then raise exception 'Sem autorização para alterar funções.'; end if;
 perform 1 from public.usuarios where id=p_usuario_id for update;
 if not found then raise exception 'Pessoa não encontrada.'; end if;
 if p_funcoes is null then raise exception 'Informe as funções.'; end if;
 if exists(select 1 from unnest(p_funcoes) x where not exists(select 1 from public.funcoes f where f.id=x and (f.ativo or exists(select 1 from public.usuario_funcoes uf where uf.usuario_id=p_usuario_id and uf.funcao_id=f.id)))) then raise exception 'Função inválida ou desativada.'; end if;
 if (select count(*) from public.funcoes where id=any(p_funcoes) and nome in ('Banco do Desenvolvimento','Corrente do Desenvolvimento','Banco sábado'))>1 then raise exception 'Escolha apenas um grupo do Desenvolvimento.'; end if;
 if exists(select 1 from public.funcoes where id=any(p_funcoes) and nome in ('Médium Corrente Principal','Médium Principal')) and exists(select 1 from public.funcoes where id=any(p_funcoes) and nome in ('Médium em Desenvolvimento','Banco do Desenvolvimento','Corrente do Desenvolvimento','Banco sábado')) then raise exception 'Escolha Principal ou Desenvolvimento.'; end if;
 if exists(select 1 from public.funcoes where id=any(p_funcoes) and nome in ('Banco do Desenvolvimento','Corrente do Desenvolvimento','Banco sábado')) and not exists(select 1 from public.funcoes where id=any(p_funcoes) and nome='Médium em Desenvolvimento') then raise exception 'Selecione Médium em Desenvolvimento para este grupo.'; end if;
 select case when bool_or(nome in ('Médium Corrente Principal','Médium Principal')) then 'principal' when bool_or(nome='Banco sábado') then 'banco_sabado' when bool_or(nome='Corrente do Desenvolvimento') then 'corrente_terca' when bool_or(nome='Médium em Desenvolvimento') then 'banco_terca' else 'fora' end into v_grupo from public.funcoes where id=any(p_funcoes);
 select id into v_admin from public.usuarios where auth_id=auth.uid();
 select * into v_aberto from public.desenvolvimento_periodos where usuario_id=p_usuario_id and data_fim is null;
 if v_aberto.id is null then
  select case when bool_or(f.nome in ('Médium Corrente Principal','Médium Principal')) then 'principal' when bool_or(f.nome='Banco sábado') then 'banco_sabado' when bool_or(f.nome='Corrente do Desenvolvimento') then 'corrente_terca' when bool_or(f.nome='Médium em Desenvolvimento') then 'banco_terca' else 'fora' end into v_anterior from public.usuario_funcoes uf join public.funcoes f on f.id=uf.funcao_id where uf.usuario_id=p_usuario_id;
  if v_anterior<>v_grupo then
   select coalesce(data_entrada_tufra,v_hoje) into v_inicio from public.usuarios where id=p_usuario_id;
   insert into public.desenvolvimento_periodos(usuario_id,grupo,data_inicio,atualizado_por) values(p_usuario_id,v_anterior,least(v_inicio,v_hoje),v_admin) returning * into v_aberto;
  end if;
 end if;
 if v_aberto.id is not null and v_aberto.grupo<>v_grupo then
  if v_aberto.data_inicio=v_hoje then update public.desenvolvimento_periodos set grupo=v_grupo,atualizado_por=v_admin,atualizado_em=now() where id=v_aberto.id;
  else
   update public.desenvolvimento_periodos set data_fim=v_hoje,atualizado_por=v_admin,atualizado_em=now() where id=v_aberto.id;
   insert into public.desenvolvimento_periodos(usuario_id,grupo,data_inicio,atualizado_por) values(p_usuario_id,v_grupo,v_hoje,v_admin);
  end if;
 end if;
 for v_funcao in select unnest(array['Ogam','Cambone','Cantina']) loop
  select exists(select 1 from public.usuario_funcoes uf join public.funcoes f on f.id=uf.funcao_id where uf.usuario_id=p_usuario_id and f.nome=v_funcao) into v_tinha;
  select exists(select 1 from public.funcoes f where f.id=any(p_funcoes) and f.nome=v_funcao) into v_tem;
  if not v_tinha and v_tem and not exists(select 1 from public.historico_funcoes_associado where usuario_id=p_usuario_id and funcao_nome=v_funcao and data_fim is null) then insert into public.historico_funcoes_associado(usuario_id,funcao_nome,data_inicio) values(p_usuario_id,v_funcao,v_hoje); end if;
  if v_tinha and not v_tem then update public.historico_funcoes_associado set data_fim=v_hoje,atualizado_em=now() where usuario_id=p_usuario_id and funcao_nome=v_funcao and data_fim is null; end if;
 end loop;
 delete from public.usuario_funcoes where usuario_id=p_usuario_id and not(funcao_id=any(p_funcoes));
 insert into public.usuario_funcoes(usuario_id,funcao_id,atribuido_por) select p_usuario_id,x,v_admin from (select distinct unnest(p_funcoes) as x) f where not exists(select 1 from public.usuario_funcoes uf where uf.usuario_id=p_usuario_id and uf.funcao_id=x);
end $$;
revoke all on function private.salvar_funcoes_com_periodo(uuid,uuid[]) from public,anon;
grant execute on function private.salvar_funcoes_com_periodo(uuid,uuid[]) to authenticated;
create or replace function public.salvar_funcoes_com_periodo(p_usuario_id uuid,p_funcoes uuid[]) returns void language sql security invoker set search_path='' as $$ select private.salvar_funcoes_com_periodo(p_usuario_id,p_funcoes); $$;
revoke all on function public.salvar_funcoes_com_periodo(uuid,uuid[]) from public,anon;
grant execute on function public.salvar_funcoes_com_periodo(uuid,uuid[]) to authenticated;
create or replace function private.corrigir_datas_periodos(p_usuario_id uuid,p_periodos jsonb)
returns void language plpgsql security definer set search_path='' as $$
declare v_antigos jsonb; v_novos jsonb;
begin
 if auth.uid() is null or not private.eh_tesoureiro() then raise exception 'Sem autorização para corrigir datas.'; end if;
 perform 1 from public.usuarios where id=p_usuario_id for update;
 select jsonb_agg(grupo order by data_inicio) into v_antigos from public.desenvolvimento_periodos where usuario_id=p_usuario_id;
 select jsonb_agg(x.grupo order by x.data_inicio) into v_novos from jsonb_to_recordset(p_periodos) x(grupo text,data_inicio date);
 if v_antigos is distinct from v_novos then raise exception 'Altere as funções na Gestão APP. Neste resumo, corrija apenas as datas.'; end if;
 perform private.salvar_periodos_desenvolvimento(p_usuario_id,p_periodos);
 update public.usuarios set data_corrente_principal=(select min(data_inicio) from public.desenvolvimento_periodos where usuario_id=p_usuario_id and grupo='principal') where id=p_usuario_id and exists(select 1 from public.desenvolvimento_periodos where usuario_id=p_usuario_id and grupo='principal');
end $$;
revoke all on function private.corrigir_datas_periodos(uuid,jsonb) from public,anon;
grant execute on function private.corrigir_datas_periodos(uuid,jsonb) to authenticated;
create or replace function public.salvar_periodos_desenvolvimento(p_usuario_id uuid,p_periodos jsonb) returns void language sql security invoker set search_path='' as $$ select private.corrigir_datas_periodos(p_usuario_id,p_periodos); $$;
create or replace function private.listar_associados_presenca_periodo(p_tipo_lista_id uuid,p_data date)
returns table(id uuid,nome_completo text,data_entrada_tufra date)
language plpgsql stable security definer set search_path='' as $$
declare v_nome text;
begin
 if auth.uid() is null or not (private.eh_responsavel_lista_presenca(p_tipo_lista_id) or private.pode_gerenciar_calendario()) then raise exception 'Sem autorização para esta lista.'; end if;
 select t.nome into v_nome from public.tipos_lista_presenca t where t.id=p_tipo_lista_id and t.ativo;
 return query select u.id,u.nome_completo,u.data_entrada_tufra from public.usuarios u where u.status='ativo'
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

drop policy desenvolvimento_periodos_leitura on public.desenvolvimento_periodos;
create policy desenvolvimento_periodos_leitura on public.desenvolvimento_periodos for select to authenticated using (
 usuario_id in(select id from public.usuarios where auth_id=(select auth.uid())) or private.pode_gerenciar_calendario()
 or exists(select 1 from public.responsaveis_lista_presenca r join public.usuarios u on u.id=r.usuario_id join public.tipos_lista_presenca t on t.id=r.tipo_lista_id where u.auth_id=(select auth.uid()) and t.nome in ('Desenvolvimento','Banco sábado','Corrente Principal')));
create or replace function private.conferir_presencas_desenvolvimento(p_usuario_id uuid)
returns table(data date,lista text,status text) language plpgsql stable security definer set search_path='' as $$
begin
 if auth.uid() is null or not private.eh_tesoureiro() then raise exception 'Sem autorização.'; end if;
 return query select a.data,t.nome,p.status from public.presencas p
 join public.atividades a on a.id=p.atividade_id join public.tipos_lista_presenca t on t.id=p.tipo_lista_id
 where p.usuario_id=p_usuario_id and t.nome in ('Desenvolvimento','Banco sábado','Corrente Principal')
 and exists(select 1 from public.desenvolvimento_periodos d where d.usuario_id=p_usuario_id)
 and not exists(select 1 from public.desenvolvimento_periodos d where d.usuario_id=p_usuario_id
 and d.data_inicio<=a.data and (d.data_fim is null or a.data<d.data_fim)
 and ((t.nome='Banco sábado' and d.grupo='banco_sabado') or (t.nome='Desenvolvimento' and d.grupo in ('banco_terca','corrente_terca')) or (t.nome='Corrente Principal' and d.grupo='principal')))
 order by a.data,t.nome;
end $$;

CREATE OR REPLACE FUNCTION public.sincronizar_confirmacao_presenca(p_atividade_id uuid)
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
and (v_grupo is null or v_grupo not in ('banco_terca','corrente_terca')) then return; end if; select tlp.id into v_tipo_lista_id from public.tipos_lista_presenca tlp
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
end; $function$;

commit;

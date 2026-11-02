-- API de cerimônias: acesso controlado exclusivamente por RPC.
create or replace function public.cerimonias_gerenciar(p_acao text, p_dados jsonb default '{}'::jsonb)
returns jsonb language plpgsql security definer set search_path='' as $$
declare
 v_usuario uuid; v_gestor boolean; v_admin boolean; v_pagador boolean; v_valores boolean;
 v_cerimonia uuid; v_id uuid; v_assoc uuid; v_externo text; v_leitura boolean; v_batismo boolean;
 v_periodo uuid; v_preco numeric; v_pago numeric; v_vagas integer; v_ocupadas integer;
 v_data date; v_valor numeric; v_status text; v_result jsonb; v_tem_leitura boolean;
begin
 select id into v_usuario from public.usuarios where auth_id=auth.uid() and status='ativo';
 if v_usuario is null then raise exception 'Acesso não autorizado.' using errcode='42501'; end if;
 select exists(select 1 from public.responsaveis_financeiro rf where rf.usuario_id=v_usuario) into v_gestor;
 select coalesce(r.pode_gerenciar,false),coalesce(r.pode_confirmar_pagamento,false),coalesce(r.pode_configurar_valores,false)
 into v_admin,v_pagador,v_valores from public.cerimonias_responsaveis r where r.usuario_id=v_usuario;

 v_admin:=v_gestor or coalesce(v_admin,false);
 v_pagador:=v_gestor or coalesce(v_pagador,false);
 v_valores:=v_gestor or coalesce(v_valores,false);
 if not(v_admin or v_pagador or v_valores) then raise exception 'Sem permissão para cerimônias.' using errcode='42501'; end if;

 if p_acao='acesso' then
  return jsonb_build_object('gerenciar',v_admin,'pagamentos',v_pagador,'valores',v_valores,'gestao_app',v_gestor);
 elsif p_acao='listar' then
  return jsonb_build_object('cerimonias',(select coalesce(jsonb_agg(to_jsonb(c) order by c.data_oficial desc),'[]'::jsonb) from public.cerimonias_tufra c));
 elsif p_acao='associados' then
  if not v_admin then raise exception 'Sem permissão.' using errcode='42501'; end if;
  return jsonb_build_object('associados',(select coalesce(jsonb_agg(jsonb_build_object('id',u.id,'nome',u.nome_completo) order by u.nome_completo),'[]'::jsonb)
   from public.usuarios u where u.status='ativo'));
 elsif p_acao='detalhe' then
  if not(v_admin or v_pagador or v_valores) then raise exception 'Sem permissão para consultar participantes.' using errcode='42501'; end if;
  v_cerimonia:=(p_dados->>'cerimonia_id')::uuid;
  return jsonb_build_object(
   'cerimonia',(select to_jsonb(c) from public.cerimonias_tufra c where c.id=v_cerimonia),
   'periodos',(select coalesce(jsonb_agg(to_jsonb(x) order by x.data_leitura,x.periodo),'[]'::jsonb) from public.cerimonias_periodos_leitura x where x.cerimonia_id=v_cerimonia),
   'participantes',(select coalesce(jsonb_agg(to_jsonb(t) order by t.criado_em),'[]'::jsonb) from (
    select p.*,coalesce(u.nome_completo,p.nome_externo) nome,
     coalesce((select sum(pg.valor) from public.cerimonias_pagamentos pg where pg.participante_id=p.id),0) valor_pago
    from public.cerimonias_participantes p left join public.usuarios u on u.id=p.associado_id where p.cerimonia_id=v_cerimonia and p.situacao<>'cancelado'
   ) t));
 elsif p_acao='salvar_cerimonia' then
  if not v_valores then raise exception 'Sem permissão para configurar valores.' using errcode='42501'; end if;
  v_id:=nullif(p_dados->>'id','')::uuid;
  if v_id is null then
   insert into public.cerimonias_tufra(titulo,data_oficial,prazo_interesse,prazo_pagamento,abertura_publico,
    valor_leitura_associado,valor_batismo_associado,valor_conjunto_associado,valor_leitura_externo,valor_batismo_externo,status)
   values(trim(p_dados->>'titulo'),(p_dados->>'data_oficial')::date,nullif(p_dados->>'prazo_interesse','')::date,
    nullif(p_dados->>'prazo_pagamento','')::date,nullif(p_dados->>'abertura_publico','')::date,
    (p_dados->>'valor_leitura_associado')::numeric,(p_dados->>'valor_batismo_associado')::numeric,
    (p_dados->>'valor_conjunto_associado')::numeric,(p_dados->>'valor_leitura_externo')::numeric,
    (p_dados->>'valor_batismo_externo')::numeric,coalesce(p_dados->>'status','planejada'))
   returning id into v_id;
  else
   if exists(select 1 from public.cerimonias_participantes where cerimonia_id=v_id) then
    raise exception 'Cerimônia com inscrições: valores não podem ser alterados sem revisão dos pagamentos.'; end if;
   update public.cerimonias_tufra set titulo=trim(p_dados->>'titulo'),data_oficial=(p_dados->>'data_oficial')::date,
    prazo_interesse=nullif(p_dados->>'prazo_interesse','')::date,prazo_pagamento=nullif(p_dados->>'prazo_pagamento','')::date,
    abertura_publico=nullif(p_dados->>'abertura_publico','')::date,
    valor_leitura_associado=(p_dados->>'valor_leitura_associado')::numeric,
    valor_batismo_associado=(p_dados->>'valor_batismo_associado')::numeric,
    valor_conjunto_associado=(p_dados->>'valor_conjunto_associado')::numeric,
    valor_leitura_externo=(p_dados->>'valor_leitura_externo')::numeric,
    valor_batismo_externo=(p_dados->>'valor_batismo_externo')::numeric,status=p_dados->>'status' where id=v_id;
   if not found then raise exception 'Cerimônia não encontrada.'; end if;
  end if;
  return jsonb_build_object('id',v_id);
 elsif p_acao='salvar_periodo' then
  if not v_admin then raise exception 'Sem permissão.' using errcode='42501'; end if;
  v_cerimonia:=(p_dados->>'cerimonia_id')::uuid;
  insert into public.cerimonias_periodos_leitura(cerimonia_id,data_leitura,periodo,vagas)
  values(v_cerimonia,(p_dados->>'data_leitura')::date,trim(p_dados->>'periodo'),(p_dados->>'vagas')::integer)
  returning id into v_id;
  return jsonb_build_object('id',v_id);
 elsif p_acao='inscrever' then
  if not v_admin then raise exception 'Sem permissão.' using errcode='42501'; end if;
  v_cerimonia:=(p_dados->>'cerimonia_id')::uuid;
  v_id:=nullif(p_dados->>'id','')::uuid;
  v_assoc:=nullif(p_dados->>'associado_id','')::uuid;
  v_externo:=nullif(trim(p_dados->>'nome_externo'),'');
  v_leitura:=coalesce((p_dados->>'leitura')::boolean,false);
  v_batismo:=coalesce((p_dados->>'batismo')::boolean,false);
  v_periodo:=nullif(p_dados->>'periodo_leitura_id','')::uuid;
  if not(v_leitura or v_batismo) then raise exception 'Selecione uma atividade.'; end if;
  if v_assoc is not null and not exists(select 1 from public.usuarios where id=v_assoc and status='ativo') then raise exception 'Associado inválido.'; end if;
  if v_assoc is null and (v_externo is null or length(v_externo)<3) then raise exception 'Informe o nome do participante externo.'; end if;
  if v_assoc is not null and v_externo is not null then raise exception 'Selecione associado ou externo, não ambos.'; end if;
  if v_periodo is not null and not v_leitura then raise exception 'Período informado sem leitura.'; end if;
  if v_periodo is not null and not exists(select 1 from public.cerimonias_periodos_leitura where id=v_periodo and cerimonia_id=v_cerimonia) then raise exception 'Período inválido.'; end if;
  if v_id is null then
   insert into public.cerimonias_participantes(cerimonia_id,associado_id,nome_externo,leitura,batismo,periodo_leitura_id,padrinho,madrinha)
   values(v_cerimonia,v_assoc,v_externo,v_leitura,v_batismo,v_periodo,nullif(trim(p_dados->>'padrinho'),''),nullif(trim(p_dados->>'madrinha'),''))
   returning id into v_id;
  else
   update public.cerimonias_participantes set leitura=v_leitura,batismo=v_batismo,periodo_leitura_id=v_periodo,
    padrinho=nullif(trim(p_dados->>'padrinho'),''),madrinha=nullif(trim(p_dados->>'madrinha'),'')
   where id=v_id and cerimonia_id=v_cerimonia and situacao in ('interesse','espera');
   if not found then raise exception 'Inscrição não encontrada ou já confirmada.'; end if;
  end if;
  return jsonb_build_object('id',v_id);
 elsif p_acao='excluir_inscricao' then
  if not v_admin then raise exception 'Sem permissão.' using errcode='42501'; end if;
  v_id:=(p_dados->>'participante_id')::uuid;
  perform 1 from public.cerimonias_participantes where id=v_id for update;
  if not found then raise exception 'Inscrição não encontrada.'; end if;
  if exists(select 1 from public.cerimonias_pagamentos where participante_id=v_id) then
   raise exception 'Inscrição com pagamento: não é possível excluir sem conciliação financeira.';
  end if;
  update public.cerimonias_participantes set situacao='cancelado',periodo_leitura_id=null where id=v_id;
  return jsonb_build_object('excluido',true);
 elsif p_acao='confirmar_pagamento' then
  if not v_pagador then raise exception 'Sem permissão para confirmar pagamentos.' using errcode='42501'; end if;
  v_id:=(p_dados->>'participante_id')::uuid;
  v_valor:=(p_dados->>'valor')::numeric;
  if coalesce(p_dados->>'forma_pagamento','') not in ('PIX','Dinheiro','Débito','Crédito','Transferência','Boleto','Outro') then raise exception 'Forma de pagamento inválida.'; end if;
  if v_valor<=0 or v_valor>100000 then raise exception 'Valor inválido.'; end if;
  perform 1 from public.cerimonias_participantes where id=v_id and situacao<>'cancelado' for update;
  if not found then raise exception 'Inscrição inexistente ou cancelada.'; end if;
  insert into public.cerimonias_pagamentos(participante_id,valor,data_pagamento,confirmado_por,forma_pagamento)
   values(v_id,v_valor,coalesce(nullif(p_dados->>'data_pagamento','')::date,(now() at time zone 'America/Sao_Paulo')::date),v_usuario,p_dados->>'forma_pagamento');
  return jsonb_build_object('registrado',true);
 elsif p_acao='confirmar_vaga' then
  if not v_admin then raise exception 'Sem permissão.' using errcode='42501'; end if;
  v_id:=(p_dados->>'participante_id')::uuid;
  select periodo_leitura_id,valor_previsto,situacao,leitura into v_periodo,v_preco,v_status,v_tem_leitura
  from public.cerimonias_participantes where id=v_id for update;
  if not found or v_status='cancelado' then raise exception 'Inscrição inválida.'; end if;
  select coalesce(sum(valor),0) into v_pago from public.cerimonias_pagamentos where participante_id=v_id;
  if v_pago<v_preco then raise exception 'Pagamento insuficiente para garantir a vaga.'; end if;
  if v_tem_leitura and v_periodo is null then raise exception 'Defina o período de leitura antes de confirmar a vaga.'; end if;
  if v_periodo is not null then
   perform pg_advisory_xact_lock(hashtext(v_periodo::text));
   select vagas into v_vagas from public.cerimonias_periodos_leitura where id=v_periodo;
   select count(*) into v_ocupadas from public.cerimonias_participantes
    where periodo_leitura_id=v_periodo and situacao='confirmado' and id<>v_id;
   if v_ocupadas>=v_vagas then raise exception 'Período sem vagas.'; end if;
  end if;
  update public.cerimonias_participantes set situacao='confirmado' where id=v_id;
  return jsonb_build_object('confirmado',true);
 elsif p_acao='salvar_resultado' then
  if not v_admin then raise exception 'Sem permissão.' using errcode='42501'; end if;
  v_id:=(p_dados->>'participante_id')::uuid;
  update public.cerimonias_participantes set
   orixa_frente=case when leitura then nullif(trim(p_dados->>'orixa_frente'),'') else orixa_frente end,
   orixa_adjunto=case when leitura then nullif(trim(p_dados->>'orixa_adjunto'),'') else orixa_adjunto end,
   leitura_realizada_em=case when leitura then nullif(p_dados->>'leitura_realizada_em','')::date else leitura_realizada_em end,
   batismo_realizado_em=case when batismo then nullif(p_dados->>'batismo_realizado_em','')::date else batismo_realizado_em end
  where id=v_id and situacao='confirmado';
  if not found then raise exception 'Participante não confirmado.'; end if;
  update public.fichas_associados f
  set historico_umbanda=coalesce(f.historico_umbanda,'{}'::jsonb)
    || case when p.leitura and p.leitura_realizada_em is not null and p.orixa_frente is not null and p.orixa_adjunto is not null
       then jsonb_build_object('orixaFrente',p.orixa_frente,'orixaAdjunto',p.orixa_adjunto)
       else '{}'::jsonb end
    || case when p.batismo and p.batismo_realizado_em is not null
       then jsonb_build_object('batizadoUmbanda',true,'dataBatismo',to_char(p.batismo_realizado_em,'YYYY-MM-DD'),
         'terreiroBatismo','TUFRA','cidadeBatismo','Sorocaba','estadoBatismo','SP')
       else '{}'::jsonb end
  from public.cerimonias_participantes p
  where p.id=v_id and p.associado_id=f.usuario_id;
  return jsonb_build_object('salvo',true);
 elsif p_acao='responsaveis' then
  if not v_gestor then raise exception 'Sem permissão.' using errcode='42501'; end if;
  return jsonb_build_object('usuarios',(select coalesce(jsonb_agg(jsonb_build_object('id',u.id,'nome',u.nome_completo,
   'gerenciar',coalesce(r.pode_gerenciar,false),'pagamentos',coalesce(r.pode_confirmar_pagamento,false),
   'valores',coalesce(r.pode_configurar_valores,false)) order by u.nome_completo),'[]'::jsonb)
   from public.usuarios u left join public.cerimonias_responsaveis r on r.usuario_id=u.id where u.status='ativo'));
 elsif p_acao='salvar_responsavel' then
  if not v_gestor then raise exception 'Sem permissão.' using errcode='42501'; end if;
  v_id:=(p_dados->>'usuario_id')::uuid;
  if not exists(select 1 from public.usuarios where id=v_id and status='ativo') then raise exception 'Usuário inválido.'; end if;
  insert into public.cerimonias_responsaveis(usuario_id,pode_gerenciar,pode_confirmar_pagamento,pode_configurar_valores)
  values(v_id,coalesce((p_dados->>'gerenciar')::boolean,false),
   coalesce((p_dados->>'pagamentos')::boolean,false),coalesce((p_dados->>'valores')::boolean,false))
  on conflict(usuario_id) do update set pode_gerenciar=excluded.pode_gerenciar,
   pode_confirmar_pagamento=excluded.pode_confirmar_pagamento,pode_configurar_valores=excluded.pode_configurar_valores;
  return jsonb_build_object('salvo',true);
 end if;
 raise exception 'Operação desconhecida.';
end;
$$;
revoke all on function public.cerimonias_gerenciar(text,jsonb) from public,anon;
grant execute on function public.cerimonias_gerenciar(text,jsonb) to authenticated;

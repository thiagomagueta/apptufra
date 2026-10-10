-- Etapa 5: conferência administrativa; acesso de teste continua obrigatório.
create table public.responsaveis_conferencia_financeiro (
 usuario_id uuid primary key references public.usuarios(id), criado_em timestamptz not null default now()
);
alter table public.responsaveis_conferencia_financeiro enable row level security;
revoke all on public.responsaveis_conferencia_financeiro from public,anon,authenticated;
grant select on public.responsaveis_conferencia_financeiro to authenticated;
create policy conferencia_responsaveis_leitura on public.responsaveis_conferencia_financeiro for select to authenticated
 using (usuario_id in(select id from public.usuarios where auth_id=auth.uid()) or public.usuario_pode_gerenciar_permissoes());
-- Inicialmente somente Thiago; demais responsáveis são escolhidos em Permissões.
insert into public.responsaveis_conferencia_financeiro(usuario_id)
 select u.id from public.usuarios u join public.responsaveis_financeiro r on r.usuario_id=u.id
 where u.email='prof.thiago.magueta@gmail.com' and u.status='ativo';
alter table public.financeiro_comprovantes_envios add column motivo_recusa text not null default '' check(length(motivo_recusa)<=1000);
create unique index financeiro_envios_recebimento_unico on public.financeiro_comprovantes_envios(recebimento_id) where recebimento_id is not null;
create index financeiro_envios_status_data on public.financeiro_comprovantes_envios(status,enviado_em);
create function private.financeiro_pode_conferir() returns boolean language sql stable security definer set search_path='' as $$
 select auth.uid() is not null and coalesce(public.usuario_pode_acessar_financeiro(),false) and exists(
 select 1 from public.usuarios u join public.responsaveis_conferencia_financeiro r on r.usuario_id=u.id where u.auth_id=auth.uid() and u.status='ativo');
$$;
create function public.financeiro_pode_conferir() returns boolean language sql stable security invoker set search_path='' as $$select private.financeiro_pode_conferir();$$;
revoke all on function private.financeiro_pode_conferir(),public.financeiro_pode_conferir() from public,anon;
grant execute on function private.financeiro_pode_conferir(),public.financeiro_pode_conferir() to authenticated;
create policy conferencia_envios_leitura on public.financeiro_comprovantes_envios for select to authenticated using(private.financeiro_pode_conferir());
create policy conferencia_destinacoes_leitura on public.financeiro_comprovantes_destinacoes for select to authenticated using(private.financeiro_pode_conferir());
create policy conferencia_arquivos_leitura on storage.objects for select to authenticated using(bucket_id='financeiro-comprovantes' and private.financeiro_pode_conferir() and exists(select 1 from public.financeiro_comprovantes_envios e where e.arquivo_path=name));
-- Baixas somente pelo fluxo transacional, impedindo alteração direta pelos testadores.
revoke insert,update,delete on public.financeiro_recebimentos,public.financeiro_pagamento_aplicacoes from authenticated,anon;
create function private.financeiro_conferir(p_envio uuid,p_decisao text,p_motivo text) returns jsonb
 language plpgsql security definer set search_path='' as $$
declare e public.financeiro_comprovantes_envios%rowtype; autor uuid; rid bigint; d record; c public.financeiro_cobrancas%rowtype; pago numeric;
begin
 if not coalesce(private.financeiro_pode_conferir(),false) then raise exception 'Acesso não autorizado para conferir pagamentos.'; end if;
 if p_decisao is null or p_decisao not in('aprovado','rejeitado') then raise exception 'Decisão inválida.'; end if;
 if length(coalesce(p_motivo,''))>1000 or (p_decisao='rejeitado' and length(btrim(coalesce(p_motivo,'')))=0) then raise exception 'Informe o motivo da recusa (até 1000 caracteres).'; end if;
 select id into autor from public.usuarios where auth_id=auth.uid() and status='ativo';
 select * into e from public.financeiro_comprovantes_envios where id=p_envio for update;
 if not found then raise exception 'Comprovante não encontrado.'; end if;
 if e.status<>'aguardando_conferencia' then
  if e.status=p_decisao then return jsonb_build_object('status',e.status,'recebimento_id',e.recebimento_id,'ja_conferido',true); end if;
  raise exception 'Este pagamento já foi conferido. Atualize a lista.';
 end if;
 -- Mesma ordem de bloqueio usada pelo envio; saldo validado novamente ao confirmar.
 perform 1 from public.financeiro_cobrancas where id in(select cobranca_id from public.financeiro_comprovantes_destinacoes where envio_id=p_envio) order by id for update;
 if p_decisao='aprovado' then
  if not exists(select 1 from public.financeiro_comprovantes_destinacoes where envio_id=p_envio)
   or (select sum(valor) from public.financeiro_comprovantes_destinacoes where envio_id=p_envio)<>e.valor then raise exception 'Distribuição inconsistente. Nenhuma baixa realizada.'; end if;
  for d in select * from public.financeiro_comprovantes_destinacoes where envio_id=p_envio order by cobranca_id loop
   select * into c from public.financeiro_cobrancas where id=d.cobranca_id;
   if not found or c.status not in('aberta','parcial') or c.usuario_id<>d.usuario_id then raise exception 'Cobrança indisponível. Nenhuma baixa realizada.'; end if;
   select coalesce(sum(valor_aplicado),0) into pago from public.financeiro_pagamento_aplicacoes where cobranca_id=c.id;
   if d.valor>c.valor_original-pago then raise exception 'Saldo da cobrança mudou. Nenhuma baixa realizada.'; end if;
  end loop;
  insert into public.financeiro_recebimentos(usuario_id,valor_recebido,forma_pagamento,data_pagamento,observacao)
   values(e.enviado_por,e.valor,e.forma_pagamento,e.data_pagamento,'Comprovante '||e.id::text||case when e.observacao<>'' then ': '||e.observacao else '' end) returning id into rid;
  insert into public.financeiro_pagamento_aplicacoes(recebimento_id,cobranca_id,valor_aplicado)
   select rid,cobranca_id,valor from public.financeiro_comprovantes_destinacoes where envio_id=p_envio order by cobranca_id;
 end if;
 update public.financeiro_comprovantes_envios set status=p_decisao,conferido_por=autor,conferido_em=now(),recebimento_id=rid,
  motivo_recusa=case when p_decisao='rejeitado' then btrim(p_motivo) else '' end where id=p_envio;
 return jsonb_build_object('status',p_decisao,'recebimento_id',rid,'ja_conferido',false);
end;$$;
create function public.financeiro_conferir(p_envio uuid,p_decisao text,p_motivo text default '') returns jsonb
 language sql security invoker set search_path='' as $$select private.financeiro_conferir(p_envio,p_decisao,p_motivo);$$;
revoke all on function private.financeiro_conferir(uuid,text,text),public.financeiro_conferir(uuid,text,text) from public,anon;
grant execute on function private.financeiro_conferir(uuid,text,text),public.financeiro_conferir(uuid,text,text) to authenticated;
create function private.financeiro_conferencia_listar(p_status text,p_offset integer) returns jsonb
 language plpgsql stable security definer set search_path='' as $$
begin
 if not coalesce(private.financeiro_pode_conferir(),false) then raise exception 'Acesso não autorizado.'; end if;
 if p_status is null or p_status not in('aguardando_conferencia','aprovado','rejeitado') or p_offset is null or p_offset<0 then raise exception 'Filtro inválido.'; end if;
 return jsonb_build_object('total',(select count(*) from public.financeiro_comprovantes_envios where status=p_status),
 'envios',(select coalesce(jsonb_agg(t order by t.enviado_em,t.id),'[]'::jsonb) from (
 select e.*,u.nome_completo nome_conferente,
 (select coalesce(jsonb_agg(jsonb_build_object('cobranca_id',d.cobranca_id,'usuario_id',d.usuario_id,'nome',a.nome_completo,'descricao',d.descricao,'valor',d.valor,'competencia',c.competencia,'tipo',c.tipo) order by a.nome_completo,c.competencia,d.cobranca_id),'[]'::jsonb)
 from public.financeiro_comprovantes_destinacoes d join public.usuarios a on a.id=d.usuario_id join public.financeiro_cobrancas c on c.id=d.cobranca_id where d.envio_id=e.id) destinacoes
 from public.financeiro_comprovantes_envios e left join public.usuarios u on u.id=e.conferido_por where e.status=p_status order by e.enviado_em,e.id limit 30 offset p_offset)t));
end;$$;
create function public.financeiro_conferencia_listar(p_status text default 'aguardando_conferencia',p_offset integer default 0) returns jsonb
 language sql stable security invoker set search_path='' as $$select private.financeiro_conferencia_listar(p_status,p_offset);$$;
revoke all on function private.financeiro_conferencia_listar(text,integer),public.financeiro_conferencia_listar(text,integer) from public,anon;
grant execute on function private.financeiro_conferencia_listar(text,integer),public.financeiro_conferencia_listar(text,integer) to authenticated;
create function private.financeiro_conferencia_pendentes() returns bigint language plpgsql stable security definer set search_path='' as $$
begin
 if not coalesce(private.financeiro_pode_conferir(),false) then return 0; end if;
 return (select count(*) from public.financeiro_comprovantes_envios where status='aguardando_conferencia');
end;$$;
create function public.financeiro_conferencia_pendentes() returns bigint language sql stable security invoker set search_path='' as $$select private.financeiro_conferencia_pendentes();$$;
revoke all on function private.financeiro_conferencia_pendentes(),public.financeiro_conferencia_pendentes() from public,anon;
grant execute on function private.financeiro_conferencia_pendentes(),public.financeiro_conferencia_pendentes() to authenticated;
create table private.financeiro_conferencia_permissoes_auditoria(
 id bigint generated always as identity primary key,realizado_por uuid not null references public.usuarios(id),registrado_em timestamptz not null default now(),anteriores uuid[] not null,posteriores uuid[] not null
);
alter table private.financeiro_conferencia_permissoes_auditoria enable row level security;
revoke all on private.financeiro_conferencia_permissoes_auditoria from public,anon,authenticated;
create function private.financeiro_conferencia_responsaveis(p_usuarios uuid[] default null) returns jsonb
 language plpgsql security definer set search_path='' as $$
declare anteriores uuid[]; autor uuid;
begin
 if auth.uid() is null or not coalesce(public.usuario_pode_gerenciar_permissoes(),false) or not coalesce(public.usuario_pode_acessar_financeiro(),false) then raise exception 'Acesso não autorizado para gerenciar responsáveis.'; end if;
 if not exists(select 1 from public.usuarios where auth_id=auth.uid() and status='ativo') then raise exception 'Usuário inativo.'; end if;
 if p_usuarios is not null then
  perform pg_advisory_xact_lock(hashtextextended('financeiro_conferencia_responsaveis',0));
  if cardinality(p_usuarios)=0 or cardinality(p_usuarios)>100 or exists(select 1 from unnest(p_usuarios) x(id) where x.id is null or not exists(select 1 from public.usuarios u join public.responsaveis_financeiro r on r.usuario_id=u.id where u.id=x.id and u.status='ativo')) then raise exception 'Escolha pelo menos um responsável ativo autorizado para os testes financeiros.'; end if;
  select coalesce(array_agg(usuario_id),'{}') into anteriores from public.responsaveis_conferencia_financeiro;
  select id into autor from public.usuarios where auth_id=auth.uid();
  delete from public.responsaveis_conferencia_financeiro where not(usuario_id=any(p_usuarios));
  insert into public.responsaveis_conferencia_financeiro(usuario_id) select distinct unnest(p_usuarios) on conflict do nothing;
  insert into private.financeiro_conferencia_permissoes_auditoria(realizado_por,anteriores,posteriores) values(autor,anteriores,p_usuarios);
 end if;
 return jsonb_build_object('pessoas',(select coalesce(jsonb_agg(t order by t.nome_completo),'[]'::jsonb) from(select u.id,u.nome_completo from public.usuarios u join public.responsaveis_financeiro r on r.usuario_id=u.id where u.status='ativo')t),
 'selecionados',(select coalesce(jsonb_agg(usuario_id),'[]'::jsonb) from public.responsaveis_conferencia_financeiro));
end;$$;
create function public.financeiro_conferencia_responsaveis(p_usuarios uuid[] default null) returns jsonb
 language sql security invoker set search_path='' as $$select private.financeiro_conferencia_responsaveis(p_usuarios);$$;
revoke all on function private.financeiro_conferencia_responsaveis(uuid[]),public.financeiro_conferencia_responsaveis(uuid[]) from public,anon;
grant execute on function private.financeiro_conferencia_responsaveis(uuid[]),public.financeiro_conferencia_responsaveis(uuid[]) to authenticated;

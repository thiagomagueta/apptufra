
begin;
create table public.financeiro_comprovantes_envios (
 id uuid primary key, enviado_por uuid not null references public.usuarios(id),
 nome_pagador text not null, valor numeric(10,2) not null check(valor>0),
 data_pagamento date not null, forma_pagamento text not null check(forma_pagamento in ('pix','dinheiro','debito','credito')),
 observacao text not null default '' check(length(observacao)<=1000),
 arquivo_path text not null unique, arquivo_nome text not null,
 status text not null default 'aguardando_conferencia' check(status in ('aguardando_conferencia','aprovado','rejeitado')),
 enviado_em timestamptz not null default now(),
 conferido_por uuid references public.usuarios(id), conferido_em timestamptz,
 recebimento_id bigint references public.financeiro_recebimentos(id)
);
create table public.financeiro_comprovantes_destinacoes (
 envio_id uuid not null references public.financeiro_comprovantes_envios(id),
 cobranca_id bigint not null references public.financeiro_cobrancas(id),
 usuario_id uuid not null references public.usuarios(id), descricao text not null,
 valor numeric(10,2) not null check(valor>0), primary key(envio_id,cobranca_id)
);
create index on public.financeiro_comprovantes_destinacoes(usuario_id);
create index on public.financeiro_comprovantes_destinacoes(cobranca_id);
alter table public.financeiro_comprovantes_envios enable row level security;
alter table public.financeiro_comprovantes_destinacoes enable row level security;
revoke all on public.financeiro_comprovantes_envios,public.financeiro_comprovantes_destinacoes from anon,authenticated;
grant select on public.financeiro_comprovantes_envios,public.financeiro_comprovantes_destinacoes to authenticated;
create function private.financeiro_envio_visivel(p_envio uuid) returns boolean
language sql stable security definer set search_path='' as $$
 select auth.uid() is not null and public.usuario_pode_acessar_financeiro() and exists(
 select 1 from public.financeiro_comprovantes_envios e
 where e.id=p_envio and (e.enviado_por in(select id from public.usuarios where auth_id=auth.uid())
 or exists(select 1 from public.financeiro_comprovantes_destinacoes d join public.usuarios u on u.id=d.usuario_id where d.envio_id=e.id and u.auth_id=auth.uid())));
$$;
revoke all on function private.financeiro_envio_visivel(uuid) from public,anon;
grant execute on function private.financeiro_envio_visivel(uuid) to authenticated;
create policy comprovantes_envios_leitura on public.financeiro_comprovantes_envios for select to authenticated using(private.financeiro_envio_visivel(id));
create policy comprovantes_destinacoes_leitura on public.financeiro_comprovantes_destinacoes for select to authenticated using(
 public.usuario_pode_acessar_financeiro() and (usuario_id in(select id from public.usuarios where auth_id=auth.uid())
 or exists(select 1 from public.financeiro_comprovantes_envios e join public.usuarios u on u.id=e.enviado_por where e.id=envio_id and u.auth_id=auth.uid())));
insert into storage.buckets(id,name,public,file_size_limit,allowed_mime_types)
values('financeiro-comprovantes','financeiro-comprovantes',false,10485760,array['image/jpeg','image/png','application/pdf']);
create policy comprovantes_upload on storage.objects for insert to authenticated with check(
 bucket_id='financeiro-comprovantes' and (storage.foldername(name))[1]=auth.uid()::text and public.usuario_pode_acessar_financeiro());
create policy comprovantes_leitura on storage.objects for select to authenticated using(
 bucket_id='financeiro-comprovantes' and public.usuario_pode_acessar_financeiro() and (
 (storage.foldername(name))[1]=auth.uid()::text or exists(select 1 from public.financeiro_comprovantes_envios e where e.arquivo_path=name and private.financeiro_envio_visivel(e.id))));
create function private.financeiro_pessoas_envio() returns table(usuario_id uuid,nome text)
language sql stable security definer set search_path='' as $$
 select u.id,u.nome_completo from public.usuarios u
 where auth.uid() is not null and public.usuario_pode_acessar_financeiro() and u.status='ativo' and (
 u.auth_id=auth.uid() or exists(select 1 from public.financeiro_grupo_integrantes a
 join public.financeiro_grupo_integrantes b on b.grupo_id=a.grupo_id
 join public.usuarios eu on eu.id=a.usuario_id
 join public.financeiro_grupos_compartilhados g on g.id=a.grupo_id and g.ativo
 where eu.auth_id=auth.uid() and a.fim_vigencia is null and b.fim_vigencia is null and b.usuario_id=u.id))
 order by u.nome_completo;
$$;
revoke all on function private.financeiro_pessoas_envio() from public,anon;
grant execute on function private.financeiro_pessoas_envio() to authenticated;
create function private.financeiro_comprovante_opcoes() returns jsonb
language plpgsql stable security definer set search_path='' as $$
begin
 if auth.uid() is null or not coalesce(public.usuario_pode_acessar_financeiro(),false) then raise exception 'Acesso não autorizado.'; end if;
 return jsonb_build_object('pessoas',(select coalesce(jsonb_agg(to_jsonb(p)),'[]') from private.financeiro_pessoas_envio() p),
 'cobrancas',(select coalesce(jsonb_agg(to_jsonb(t)),'[]') from (
 select c.id,c.usuario_id,c.tipo,c.competencia,c.descricao,c.valor_original,
 greatest(0,c.valor_original-coalesce((select sum(a.valor_aplicado) from public.financeiro_pagamento_aplicacoes a where a.cobranca_id=c.id),0)) as saldo,
 coalesce((select sum(d.valor) from public.financeiro_comprovantes_destinacoes d join public.financeiro_comprovantes_envios e on e.id=d.envio_id where d.cobranca_id=c.id and e.status='aguardando_conferencia'),0) as pendente
 from public.financeiro_cobrancas c where c.usuario_id in(select usuario_id from private.financeiro_pessoas_envio()) and c.status in('aberta','parcial') order by c.competencia,c.id) t));
end;
$$;
create function public.financeiro_comprovante_opcoes() returns jsonb
language sql stable security invoker set search_path='' as $$
 select private.financeiro_comprovante_opcoes();
$$;
revoke all on function private.financeiro_comprovante_opcoes(),public.financeiro_comprovante_opcoes() from public,anon;
grant execute on function private.financeiro_comprovante_opcoes(),public.financeiro_comprovante_opcoes() to authenticated;
create function private.financeiro_comprovante_enviar(p_id uuid,p_valor numeric,p_data date,p_forma text,p_observacao text,p_path text,p_nome text,p_destinacoes jsonb)
returns uuid language plpgsql security definer set search_path='' as $$
declare autor uuid; autor_nome text; c public.financeiro_cobrancas%rowtype; d record; pago numeric; pendente numeric; existente public.financeiro_comprovantes_envios%rowtype;
begin
 if auth.uid() is null or not coalesce(public.usuario_pode_acessar_financeiro(),false) then raise exception 'Acesso não autorizado.'; end if;
 select id,nome_completo into autor,autor_nome from public.usuarios where auth_id=auth.uid() and status='ativo';
 if autor is null then raise exception 'Associado ativo não encontrado.'; end if;
 perform pg_advisory_xact_lock(hashtextextended(p_id::text,0));
 select * into existente from public.financeiro_comprovantes_envios where id=p_id;
 if found then
  if existente.enviado_por=autor then return existente.id; else raise exception 'Identificador indisponível.'; end if;
 end if;
 if p_id is null or p_valor is null or p_valor<=0 or p_valor<>round(p_valor,2) or p_data is null or p_data>(now() at time zone 'America/Sao_Paulo')::date or p_forma is null or p_forma not in('pix','dinheiro','debito','credito') then raise exception 'Valor, data ou forma de pagamento inválidos.'; end if;
 if p_path is null or p_path not like auth.uid()::text||'/'||p_id::text||'/%' or p_nome is null or length(p_nome)>255 or length(coalesce(p_observacao,''))>1000 then raise exception 'Dados do comprovante inválidos.'; end if;
 if not exists(select 1 from storage.objects where bucket_id='financeiro-comprovantes' and name=p_path) then raise exception 'Anexe o comprovante antes de enviar.'; end if;
 if p_destinacoes is null or jsonb_typeof(p_destinacoes)<>'array' or jsonb_array_length(p_destinacoes) not between 1 and 100 then raise exception 'Selecione as cobranças.'; end if;
 if (select count(*)<>count(distinct cobranca_id) or sum(valor)<>p_valor or bool_or(valor is null or valor<=0 or valor<>round(valor,2) or cobranca_id is null) from jsonb_to_recordset(p_destinacoes) as x(cobranca_id bigint,valor numeric)) then raise exception 'Distribuição inválida ou total diferente do pagamento.'; end if;
 -- Bloqueio ordenado também impede dois envios de reservar o mesmo saldo.
 perform 1 from public.financeiro_cobrancas where id in(select cobranca_id from jsonb_to_recordset(p_destinacoes) as x(cobranca_id bigint)) order by id for update;
 insert into public.financeiro_comprovantes_envios(id,enviado_por,nome_pagador,valor,data_pagamento,forma_pagamento,observacao,arquivo_path,arquivo_nome)
 values(p_id,autor,autor_nome,p_valor,p_data,p_forma,coalesce(p_observacao,''),p_path,p_nome);
 for d in select * from jsonb_to_recordset(p_destinacoes) as x(cobranca_id bigint,valor numeric) loop
  select * into c from public.financeiro_cobrancas where id=d.cobranca_id;
  if not found or c.status not in('aberta','parcial') or c.usuario_id not in(select usuario_id from private.financeiro_pessoas_envio()) then raise exception 'Cobrança indisponível ou pessoa sem vínculo.'; end if;
  select coalesce(sum(valor_aplicado),0) into pago from public.financeiro_pagamento_aplicacoes where cobranca_id=c.id;
  select coalesce(sum(dd.valor),0) into pendente from public.financeiro_comprovantes_destinacoes dd join public.financeiro_comprovantes_envios e on e.id=dd.envio_id where dd.cobranca_id=c.id and e.status='aguardando_conferencia';
  if d.valor>c.valor_original-pago-pendente then raise exception 'O valor ultrapassa o saldo disponível da cobrança. Atualize a lista.'; end if;
  insert into public.financeiro_comprovantes_destinacoes(envio_id,cobranca_id,usuario_id,descricao,valor)
  values(p_id,c.id,c.usuario_id,coalesce(c.descricao,c.tipo||' '||coalesce(c.competencia::text,'')),d.valor);
 end loop;
 return p_id;
end;
$$;
create function public.financeiro_comprovante_enviar(p_id uuid,p_valor numeric,p_data date,p_forma text,p_observacao text,p_path text,p_nome text,p_destinacoes jsonb)
returns uuid language sql security invoker set search_path='' as $$ select private.financeiro_comprovante_enviar(p_id,p_valor,p_data,p_forma,p_observacao,p_path,p_nome,p_destinacoes); $$;
revoke all on function private.financeiro_comprovante_enviar(uuid,numeric,date,text,text,text,text,jsonb),public.financeiro_comprovante_enviar(uuid,numeric,date,text,text,text,text,jsonb) from public,anon;
grant execute on function private.financeiro_comprovante_enviar(uuid,numeric,date,text,text,text,text,jsonb),public.financeiro_comprovante_enviar(uuid,numeric,date,text,text,text,text,jsonb) to authenticated;
commit;

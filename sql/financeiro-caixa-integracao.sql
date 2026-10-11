-- Integração por leitura da fonte confirmada: cada recebimento aparece uma única vez.
insert into public.financeiro_categorias(tipo,nome) values('receita','Acordos de dívida') on conflict do nothing;
create table private.financeiro_categorias_origens (
 codigo text primary key, categoria_id bigint not null references public.financeiro_categorias(id)
);
alter table private.financeiro_categorias_origens enable row level security;
revoke all on private.financeiro_categorias_origens from public,anon,authenticated;
insert into private.financeiro_categorias_origens(codigo,categoria_id)
 select x.codigo,c.id from (values('mensalidade','Mensalidades'),('obrigacao','Obrigações'),('acordo','Acordos de dívida'),('outras','Outras entradas')) x(codigo,nome) join public.financeiro_categorias c on c.tipo='receita' and c.nome=x.nome;
insert into storage.buckets(id,name,public,file_size_limit,allowed_mime_types)
 values('financeiro-caixa-anexos','financeiro-caixa-anexos',false,10485760,array['application/pdf','image/jpeg','image/png']);
create policy caixa_anexos_upload on storage.objects for insert to authenticated with check(
 bucket_id='financeiro-caixa-anexos' and private.financeiro_pode_negociar() and split_part(name,'/',1)=auth.uid()::text
 and exists(select 1 from public.financeiro_lancamentos l where l.id::text=split_part(name,'/',2) and l.status='ativo'));
create policy caixa_anexos_leitura on storage.objects for select to authenticated using(
 bucket_id='financeiro-caixa-anexos' and private.financeiro_pode_negociar()
 and exists(select 1 from public.financeiro_lancamentos l where l.id::text=split_part(name,'/',2)));
create function private.financeiro_caixa_comprovante_visivel(p_path text) returns boolean language sql stable security definer set search_path='' as $$
 select auth.uid() is not null and coalesce(private.financeiro_pode_negociar(),false) and exists(select 1 from public.financeiro_comprovantes_envios e where e.arquivo_path=p_path and e.status='aprovado' and e.recebimento_id is not null);
$$;
revoke all on function private.financeiro_caixa_comprovante_visivel(text) from public,anon,authenticated;
grant execute on function private.financeiro_caixa_comprovante_visivel(text) to authenticated;
create policy caixa_comprovantes_confirmados on storage.objects for select to authenticated using(bucket_id='financeiro-comprovantes' and private.financeiro_caixa_comprovante_visivel(name));
create function private.financeiro_lancamento_anexos(p_id bigint) returns jsonb language plpgsql stable security definer set search_path='' as $$
begin
 if not coalesce(private.financeiro_pode_negociar(),false) then raise exception 'Acesso não autorizado.';end if;
 if not exists(select 1 from public.financeiro_lancamentos where id=p_id) then raise exception 'Lançamento não encontrado.';end if;
 return (select coalesce(jsonb_agg(jsonb_build_object('path',o.name,'nome',regexp_replace(split_part(o.name,'/',3),'^[^_]+_',''),'data',o.created_at,'responsavel',coalesce(u.nome_completo,'Tesouraria')) order by o.created_at),'[]') from storage.objects o left join public.usuarios u on u.auth_id::text=split_part(o.name,'/',1) where o.bucket_id='financeiro-caixa-anexos' and split_part(o.name,'/',2)=p_id::text);
end;$$;
create function public.financeiro_lancamento_anexos(p_id bigint) returns jsonb language sql stable security invoker set search_path='' as $$select private.financeiro_lancamento_anexos(p_id);$$;
revoke all on function private.financeiro_lancamento_anexos(bigint),public.financeiro_lancamento_anexos(bigint) from public,anon,authenticated;
grant execute on function private.financeiro_lancamento_anexos(bigint),public.financeiro_lancamento_anexos(bigint) to authenticated;

create or replace function private.financeiro_lancamentos_listar(p_inicio date,p_fim date,p_tipo text,p_categoria bigint,p_offset integer) returns jsonb language plpgsql stable security definer set search_path='' as $$
declare resultado jsonb;
begin
 if not coalesce(private.financeiro_pode_negociar(),false) then raise exception 'Acesso não autorizado.';end if;
 if p_inicio is null or p_fim is null or p_fim<p_inicio or p_offset is null or p_offset<0 or (p_tipo is not null and p_tipo not in('receita','despesa')) then raise exception 'Filtros inválidos.';end if;
 with aplicacoes as (
 select a.recebimento_id,a.cobranca_id,a.valor_aplicado,c.descricao,c.competencia,u.nome_completo associado,
 m.categoria_id,cat.nome categoria,ap.acordo_id,
 (select coalesce(jsonb_agg(jsonb_build_object('descricao',oc.descricao,'competencia',oc.competencia,'valor',orig.valor_incorporado) order by orig.id),'[]') from public.financeiro_acordo_origens orig join public.financeiro_cobrancas oc on oc.id=orig.cobranca_id where orig.acordo_id=ap.acordo_id) origens_acordo
 from public.financeiro_pagamento_aplicacoes a join public.financeiro_cobrancas c on c.id=a.cobranca_id join public.usuarios u on u.id=c.usuario_id
 left join public.financeiro_acordo_parcelas ap on ap.cobranca_id=c.id
 join private.financeiro_categorias_origens m on m.codigo=case when ap.id is not null then 'acordo' when c.tipo='mensalidade' then 'mensalidade' when exists(select 1 from public.financeiro_obrigacao_participantes o where o.cobranca_id=c.id) then 'obrigacao' else 'outras' end
 join public.financeiro_categorias cat on cat.id=m.categoria_id
 ), manuais as(
 select l.data_movimento,l.id,'manual' origem,c.tipo,l.status,l.valor,
 to_jsonb(l)||jsonb_build_object('origem','manual','categoria',c.nome,'tipo',c.tipo,'responsavel',u.nome_completo) dados
 from public.financeiro_lancamentos l join public.financeiro_categorias c on c.id=l.categoria_id join public.usuarios u on u.id=l.registrado_por
 where l.data_movimento between p_inicio and p_fim and (p_tipo is null or c.tipo=p_tipo) and (p_categoria is null or c.id=p_categoria)
 ), confirmados as(
 select r.data_pagamento data_movimento,r.id,'confirmado' origem,'receita'::text tipo,'ativo'::text status,
 case when p_categoria is null then r.valor_recebido else (select coalesce(sum(a.valor_aplicado),0) from aplicacoes a where a.recebimento_id=r.id and a.categoria_id=p_categoria) end valor,
 jsonb_build_object('id',r.id,'origem','confirmado','tipo','receita','status','ativo','data_movimento',r.data_pagamento,
 'valor',case when p_categoria is null then r.valor_recebido else (select coalesce(sum(a.valor_aplicado),0) from aplicacoes a where a.recebimento_id=r.id and a.categoria_id=p_categoria) end,
 'valor_total',r.valor_recebido,'categoria',(select string_agg(distinct a.categoria,' + ' order by a.categoria) from aplicacoes a where a.recebimento_id=r.id),
 'descricao','Pagamento confirmado #'||r.id,'forma_pagamento',r.forma_pagamento,'favorecido',e.nome_pagador,'observacao',e.observacao,'responsavel',u.nome_completo,
 'arquivo_path',e.arquivo_path,'arquivo_nome',e.arquivo_nome,'conferido_em',e.conferido_em,
 'destinacoes',(select coalesce(jsonb_agg(to_jsonb(a) order by a.associado,a.competencia,a.cobranca_id),'[]') from aplicacoes a where a.recebimento_id=r.id)) dados
 from public.financeiro_recebimentos r join public.financeiro_comprovantes_envios e on e.recebimento_id=r.id and e.status='aprovado' join public.usuarios u on u.id=e.conferido_por
 where r.data_pagamento between p_inicio and p_fim and (p_tipo is null or p_tipo='receita') and (p_categoria is null or exists(select 1 from aplicacoes a where a.recebimento_id=r.id and a.categoria_id=p_categoria))
 ), filtrados as(select * from manuais union all select * from confirmados),
 pagina as(select * from filtrados order by data_movimento desc,origem,id desc limit 30 offset p_offset)
 select jsonb_build_object('total',(select count(*) from filtrados),'receitas',(select coalesce(sum(valor),0) from filtrados where tipo='receita' and status='ativo'),'despesas',(select coalesce(sum(valor),0) from filtrados where tipo='despesa' and status='ativo'),'lancamentos',(select coalesce(jsonb_agg(dados order by data_movimento desc,origem,id desc),'[]') from pagina)) into resultado;
 return resultado;
end;$$;

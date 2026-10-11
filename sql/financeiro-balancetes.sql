-- Etapa 12: resumo sanitizado e versões fechadas. Acesso apenas ao Financeiro.
begin;
create table private.financeiro_balancetes (
 id bigint generated always as identity primary key,
 competencia date not null check(extract(day from competencia)=1),
 versao integer not null check(versao>0),
 requisicao uuid not null unique,
 resumo jsonb not null,
 fechado_por uuid not null references public.usuarios(id),
 fechado_em timestamptz not null default now(),
 motivo text not null check(length(btrim(motivo)) between 1 and 1000),
 unique(competencia,versao)
);
alter table private.financeiro_balancetes enable row level security;
revoke all on private.financeiro_balancetes from public,anon,authenticated;

create function private.financeiro_balancete_previa(p_competencia date)
returns jsonb language plpgsql stable security definer set search_path='' as $$
declare pagina jsonb; linhas jsonb:='[]'; l jsonb; a jsonb; grupos jsonb:='{}'; chave text;
 inicio date; fim date; deslocamento integer:=0; quantidade integer:=0; entradas numeric:=0; saidas numeric:=0; aplicado numeric; pendente numeric:=0; categorias jsonb; resumo jsonb;
begin
 if auth.uid() is null or not coalesce(private.financeiro_pode_negociar(),false) then raise exception 'Acesso não autorizado.';end if;
 if p_competencia is null or extract(day from p_competencia)<>1 or extract(year from p_competencia) not between 2000 and 2100 then raise exception 'Mês inválido.';end if;
 inicio:=p_competencia; fim:=(inicio+interval '1 month'-interval '1 day')::date;
 loop
  pagina:=private.financeiro_lancamentos_listar(inicio,fim,null,null,deslocamento);
  linhas:=linhas||(pagina->'lancamentos');
  exit when deslocamento+30>=(pagina->>'total')::integer;
  deslocamento:=deslocamento+30;
 end loop;
 for l in select value from jsonb_array_elements(linhas) loop
  if l->>'status'<>'ativo' then continue;end if;
  quantidade:=quantidade+1;
  if l->>'tipo'='receita' then entradas:=entradas+(l->>'valor')::numeric;else saidas:=saidas+(l->>'valor')::numeric;end if;
  if l->>'origem'='confirmado' then
   aplicado:=0;
   for a in select value from jsonb_array_elements(l->'destinacoes') loop
    chave:='receita:'||(a->>'categoria_id');
    grupos:=jsonb_set(grupos,array[chave],jsonb_build_object('tipo','receita','categoria_id',(a->>'categoria_id')::bigint,'categoria',a->>'categoria','valor',coalesce((grupos->chave->>'valor')::numeric,0)+(a->>'valor_aplicado')::numeric));
    aplicado:=aplicado+(a->>'valor_aplicado')::numeric;
   end loop;
   pendente:=pendente+abs((l->>'valor')::numeric-aplicado);
  else
   chave:=(l->>'tipo')||':'||(l->>'categoria_id');
   grupos:=jsonb_set(grupos,array[chave],jsonb_build_object('tipo',l->>'tipo','categoria_id',(l->>'categoria_id')::bigint,'categoria',l->>'categoria','valor',coalesce((grupos->chave->>'valor')::numeric,0)+(l->>'valor')::numeric));
  end if;
 end loop;
 select coalesce(jsonb_agg(value order by value->>'tipo' desc,value->>'categoria',value->>'categoria_id'),'[]') into categorias from jsonb_each(grupos);
 resumo:=jsonb_build_object('competencia',inicio,'entradas',entradas,'saidas',saidas,'resultado',entradas-saidas,'quantidade',quantidade,'divergencia_classificacao',pendente,'categorias',categorias);
 return resumo||jsonb_build_object('digest',md5(resumo::text));
end;$$;

create function private.financeiro_balancete_fechar(p_competencia date,p_digest text,p_requisicao uuid,p_motivo text)
returns jsonb language plpgsql security definer set search_path='' as $$
declare autor uuid; anterior private.financeiro_balancetes%rowtype; previa jsonb; v integer; registro private.financeiro_balancetes%rowtype;
begin
 if auth.uid() is null or not coalesce(private.financeiro_pode_negociar(),false) then raise exception 'Acesso não autorizado.';end if;
 select id into strict autor from public.usuarios where auth_id=auth.uid() and status='ativo';
 if p_requisicao is null or p_motivo is null or length(btrim(p_motivo)) not between 1 and 1000 then raise exception 'Informe o motivo do fechamento.';end if;
 perform pg_advisory_xact_lock(hashtextextended(p_requisicao::text,12));
 select * into registro from private.financeiro_balancetes where requisicao=p_requisicao;
 if found then
  if registro.fechado_por<>autor or registro.competencia is distinct from p_competencia or registro.resumo->>'digest' is distinct from p_digest or registro.motivo<>btrim(p_motivo) then raise exception 'Identificador utilizado em outra operação.';end if;
  return jsonb_build_object('id',registro.id,'versao',registro.versao);
 end if;
 previa:=private.financeiro_balancete_previa(p_competencia);
 if previa->>'digest' is distinct from p_digest then raise exception 'Os lançamentos mudaram. Gere e confira uma nova prévia.';end if;
 if (previa->>'divergencia_classificacao')::numeric<>0 then raise exception 'Há recebimentos com classificação divergente. Confira o Caixa antes de fechar.';end if;
 perform pg_advisory_xact_lock(hashtextextended(p_competencia::text,12));
 select * into anterior from private.financeiro_balancetes where competencia=p_competencia order by versao desc limit 1;
 if found and anterior.resumo->>'digest'=p_digest then raise exception 'Este balancete já está fechado com os mesmos valores.';end if;
 v:=coalesce(anterior.versao,0)+1;
 insert into private.financeiro_balancetes(competencia,versao,requisicao,resumo,fechado_por,motivo) values(p_competencia,v,p_requisicao,previa,autor,btrim(p_motivo)) returning * into registro;
 return jsonb_build_object('id',registro.id,'versao',v);
end;$$;

create function private.financeiro_balancetes_historico(p_competencia date)
returns jsonb language plpgsql stable security definer set search_path='' as $$
begin
 if auth.uid() is null or not coalesce(private.financeiro_pode_negociar(),false) then raise exception 'Acesso não autorizado.';end if;
 return (select coalesce(jsonb_agg(jsonb_build_object('id',b.id,'competencia',b.competencia,'versao',b.versao,'fechado_em',b.fechado_em,'responsavel',u.nome_completo,'motivo',b.motivo,'resumo',b.resumo) order by b.competencia desc,b.versao desc),'[]') from private.financeiro_balancetes b join public.usuarios u on u.id=b.fechado_por where p_competencia is null or b.competencia=p_competencia);
end;$$;
create function public.financeiro_balancete_previa(p_competencia date) returns jsonb language sql stable security invoker set search_path='' as $$select private.financeiro_balancete_previa(p_competencia);$$;
create function public.financeiro_balancete_fechar(p_competencia date,p_digest text,p_requisicao uuid,p_motivo text) returns jsonb language sql security invoker set search_path='' as $$select private.financeiro_balancete_fechar(p_competencia,p_digest,p_requisicao,p_motivo);$$;
create function public.financeiro_balancetes_historico(p_competencia date default null) returns jsonb language sql stable security invoker set search_path='' as $$select private.financeiro_balancetes_historico(p_competencia);$$;
do $$declare f record;begin
 for f in select oid::regprocedure identidade from pg_proc where pronamespace in('private'::regnamespace,'public'::regnamespace) and proname in('financeiro_balancete_previa','financeiro_balancete_fechar','financeiro_balancetes_historico') loop
 execute format('revoke all on function %s from public,anon,authenticated',f.identidade);
 execute format('grant execute on function %s to authenticated',f.identidade);
 end loop;
end;$$;
commit;

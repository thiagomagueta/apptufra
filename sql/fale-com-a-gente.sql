-- Piloto restrito a Tesoureiro. A lista de responsáveis NÃO libera acesso no piloto.
create schema if not exists private;
create table public.fale_atendimentos (
 id uuid primary key default gen_random_uuid(), usuario_id uuid not null references public.usuarios(id),
 assunto text not null check (length(trim(assunto)) between 1 and 160),
 categoria text not null check (categoria in ('Pedido de ajuda','Sugestão','Dificuldade','Relato','Outro')),
 situacao text not null default 'nao_lido' check (situacao in ('nao_lido','lido','em_acompanhamento','aguardando_confirmacao','finalizado')),
 criado_em timestamptz not null default now(), atualizado_em timestamptz not null default now(),
 encerramento_solicitado_por uuid references public.usuarios(id), encerramento_solicitado_em timestamptz,
 finalizado_em timestamptz, avaliacao text check (avaliacao in ('satisfeito','parcialmente_satisfeito','nao_satisfeito')),
 comentario_avaliacao text check (length(comentario_avaliacao)<=4000), avaliado_em timestamptz
);
create table public.fale_mensagens (
 id bigint generated always as identity primary key,
 atendimento_id uuid not null references public.fale_atendimentos(id),
 autor_id uuid not null references public.usuarios(id), autor_nome text not null,
 tipo text not null check (tipo in ('associado','resposta','interna','encerramento','evento')),
 texto text not null check (length(trim(texto)) between 1 and 10000), criado_em timestamptz not null default clock_timestamp()
);
create table public.fale_leituras (
 atendimento_id uuid not null references public.fale_atendimentos(id),
 usuario_id uuid not null references public.usuarios(id), equipe boolean not null,
 ultima_mensagem bigint not null default 0, lido_em timestamptz not null default now(),
 primary key(atendimento_id,usuario_id,equipe)
);
create table public.fale_responsaveis (
 usuario_id uuid primary key references public.usuarios(id), criado_em timestamptz not null default now(),
 criado_por uuid not null references public.usuarios(id)
);
create index fale_atendimentos_usuario_idx on public.fale_atendimentos(usuario_id,atualizado_em desc);
create index fale_atendimentos_situacao_idx on public.fale_atendimentos(situacao,atualizado_em desc);
create index fale_mensagens_atendimento_idx on public.fale_mensagens(atendimento_id,id);
alter table public.fale_atendimentos enable row level security;
alter table public.fale_mensagens enable row level security;
alter table public.fale_leituras enable row level security;
alter table public.fale_responsaveis enable row level security;
-- Sem acesso direto: operações passam pela RPC com validação e transação no servidor.
revoke all on public.fale_atendimentos,public.fale_mensagens,public.fale_leituras,public.fale_responsaveis from anon,authenticated;
revoke all on sequence public.fale_mensagens_id_seq from anon,authenticated;

create or replace function private.fale_com_a_gente(p_acao text,p_dados jsonb default '{}'::jsonb)
returns jsonb language plpgsql security definer set search_path='' as $$
declare
 v_usuario public.usuarios%rowtype; v_t public.fale_atendimentos%rowtype;
 v_tesoureiro boolean; v_equipe boolean; v_admin boolean:=coalesce((p_dados->>'equipe')::boolean,false);
 v_id uuid; v_tipo text; v_texto text; v_result jsonb; v_max bigint;
 v_ids uuid[]; v_situacao text; v_offset integer;
begin
 if auth.uid() is null then raise exception 'Entre no aplicativo para continuar.' using errcode='42501'; end if;
 select * into v_usuario from public.usuarios where auth_id=auth.uid() and status='ativo';
 if v_usuario.id is null then raise exception 'Usuário sem acesso.' using errcode='42501'; end if;
 select exists(select 1 from public.usuario_funcoes uf join public.funcoes f on f.id=uf.funcao_id
   where uf.usuario_id=v_usuario.id and f.nome='Tesoureiro' and f.ativo) into v_tesoureiro;
 select exists(select 1 from public.fale_responsaveis where usuario_id=v_usuario.id) into v_equipe;
 if p_acao='acesso' then return jsonb_build_object('permitido',true,'equipe',v_equipe,'gerenciar',v_tesoureiro,'piloto',false,'usuario_id',v_usuario.id); end if;
 if p_acao in ('responsaveis','salvar_responsaveis') and not v_tesoureiro then
   raise exception 'Somente a Gestão APP pode autorizar responsáveis.' using errcode='42501';
 end if;
 if v_admin and not v_equipe then
   raise exception 'Sem autorização para acompanhar os atendimentos da equipe.' using errcode='42501';
 end if;

 if p_acao='responsaveis' then
   return jsonb_build_object('usuarios',(select coalesce(jsonb_agg(jsonb_build_object('id',u.id,'nome',u.nome_completo,'selecionado',r.usuario_id is not null) order by u.nome_completo),'[]'::jsonb)
     from public.usuarios u left join public.fale_responsaveis r on r.usuario_id=u.id where u.status='ativo' or r.usuario_id is not null));
 elsif p_acao='salvar_responsaveis' then
   if jsonb_typeof(p_dados->'usuarios') is distinct from 'array' then raise exception 'Seleção inválida.'; end if;
   select coalesce(array_agg(distinct value::uuid),'{}'::uuid[]) into v_ids from jsonb_array_elements_text(p_dados->'usuarios');
   if exists(select 1 from unnest(v_ids) x where not exists(select 1 from public.usuarios where id=x)) then raise exception 'Usuário inválido.'; end if;
   perform pg_advisory_xact_lock(hashtext('fale_responsaveis'));
   delete from public.fale_responsaveis where not (usuario_id=any(v_ids));
   insert into public.fale_responsaveis(usuario_id,criado_por) select x,v_usuario.id from unnest(v_ids) x on conflict do nothing;
   return jsonb_build_object('salvo',true);
 elsif p_acao='criar' then
   v_texto:=trim(p_dados->>'texto');
   if v_texto is null or length(v_texto) not between 1 and 10000 then raise exception 'Escreva uma mensagem de até 10.000 caracteres.'; end if;
   insert into public.fale_atendimentos(usuario_id,assunto,categoria) values(v_usuario.id,trim(p_dados->>'assunto'),p_dados->>'categoria') returning id into v_id;
   insert into public.fale_mensagens(atendimento_id,autor_id,autor_nome,tipo,texto) values(v_id,v_usuario.id,v_usuario.nome_completo,'associado',v_texto);
   return jsonb_build_object('id',v_id);
 elsif p_acao='avisos' then
   return jsonb_build_object(
    'equipe',case when v_equipe then (select count(*) from public.fale_atendimentos a where a.situacao<>'finalizado' and exists(select 1 from public.fale_mensagens m
      where m.atendimento_id=a.id and m.tipo='associado' and m.id>coalesce((select ultima_mensagem from public.fale_leituras l where l.atendimento_id=a.id and l.usuario_id=v_usuario.id and l.equipe),0))) else 0 end,
    'meus',(select count(*) from public.fale_atendimentos a where a.usuario_id=v_usuario.id and (a.situacao='aguardando_confirmacao' or exists(select 1 from public.fale_mensagens m
      where m.atendimento_id=a.id and m.tipo in ('resposta','encerramento') and m.id>coalesce((select ultima_mensagem from public.fale_leituras l where l.atendimento_id=a.id and l.usuario_id=v_usuario.id and not l.equipe),0)))));
 elsif p_acao='listar' then
   v_offset:=greatest(0,least(coalesce((p_dados->>'offset')::integer,0),1000000));
   select coalesce(jsonb_agg(to_jsonb(t) order by t.atualizado_em desc),'[]'::jsonb) into v_result from (
     select a.*,u.nome_completo as nome,
       exists(select 1 from public.fale_mensagens m where m.atendimento_id=a.id
         and ((v_admin and m.tipo='associado') or (not v_admin and m.tipo in ('resposta','encerramento')))
         and m.id>coalesce((select ultima_mensagem from public.fale_leituras l where l.atendimento_id=a.id and l.usuario_id=v_usuario.id and l.equipe=v_admin),0)) as novo
     from public.fale_atendimentos a join public.usuarios u on u.id=a.usuario_id
     where (v_admin or a.usuario_id=v_usuario.id)
       and (coalesce(p_dados->>'situacao','')='' or a.situacao=p_dados->>'situacao')
       and (coalesce(p_dados->>'usuario_id','')='' or a.usuario_id=(p_dados->>'usuario_id')::uuid)
       and (coalesce(p_dados->>'busca','')='' or u.nome_completo ilike '%'||(p_dados->>'busca')||'%' or a.assunto ilike '%'||(p_dados->>'busca')||'%')
       and (coalesce(p_dados->>'inicio','')='' or a.criado_em >= ((p_dados->>'inicio')::date::timestamp at time zone 'America/Sao_Paulo'))
       and (coalesce(p_dados->>'fim','')='' or a.criado_em < (((p_dados->>'fim')::date+1)::timestamp at time zone 'America/Sao_Paulo'))
     order by a.atualizado_em desc limit 50 offset v_offset
   ) t;
   return jsonb_build_object('atendimentos',v_result);
 end if;

 v_id:=(p_dados->>'id')::uuid;
 select * into v_t from public.fale_atendimentos where id=v_id for update;
 if v_t.id is null or (not v_admin and v_t.usuario_id<>v_usuario.id) then raise exception 'Atendimento não encontrado.' using errcode='42501'; end if;

 if p_acao='detalhe' then
   if v_admin and v_t.situacao='nao_lido' then
     update public.fale_atendimentos set situacao='lido',atualizado_em=clock_timestamp() where id=v_id;
   end if;
   select coalesce(max(id),0) into v_max from public.fale_mensagens where atendimento_id=v_id and (v_admin or tipo<>'interna');
   insert into public.fale_leituras(atendimento_id,usuario_id,equipe,ultima_mensagem) values(v_id,v_usuario.id,v_admin,v_max)
     on conflict(atendimento_id,usuario_id,equipe) do update set ultima_mensagem=excluded.ultima_mensagem,lido_em=clock_timestamp();
   return jsonb_build_object('atendimento',(select to_jsonb(a)||jsonb_build_object('nome',u.nome_completo) from public.fale_atendimentos a join public.usuarios u on u.id=a.usuario_id where a.id=v_id),
     'mensagens',(select coalesce(jsonb_agg(to_jsonb(m) order by m.id),'[]'::jsonb) from public.fale_mensagens m where atendimento_id=v_id and (v_admin or tipo<>'interna')),
     'leituras',case when v_admin then (select coalesce(jsonb_agg(jsonb_build_object('nome',u.nome_completo,'lido_em',l.lido_em)),'[]'::jsonb) from public.fale_leituras l join public.usuarios u on u.id=l.usuario_id where l.atendimento_id=v_id and l.equipe) else '[]'::jsonb end);
 elsif p_acao='avaliar' then
   if v_admin or v_t.usuario_id<>v_usuario.id or v_t.situacao<>'finalizado' then raise exception 'Confirme o encerramento antes de avaliar.'; end if;
   if v_t.avaliacao is not null then raise exception 'Avaliação já registrada.'; end if;
   if coalesce(p_dados->>'avaliacao','') not in ('satisfeito','parcialmente_satisfeito','nao_satisfeito') then raise exception 'Selecione a avaliação.'; end if;
   update public.fale_atendimentos set avaliacao=p_dados->>'avaliacao',comentario_avaliacao=trim(p_dados->>'comentario'),avaliado_em=clock_timestamp() where id=v_id;
   return jsonb_build_object('salvo',true);
 end if;

 if v_t.situacao='finalizado' then raise exception 'Atendimento finalizado. Abra outro atendimento para continuar.'; end if;
 if p_acao='mensagem' then
   v_texto:=trim(p_dados->>'texto');
   if v_texto is null or length(v_texto) not between 1 and 10000 then raise exception 'Escreva uma mensagem de até 10.000 caracteres.'; end if;
   v_tipo:=case when v_admin then case when coalesce((p_dados->>'interna')::boolean,false) then 'interna' else 'resposta' end else 'associado' end;
   insert into public.fale_mensagens(atendimento_id,autor_id,autor_nome,tipo,texto) values(v_id,v_usuario.id,v_usuario.nome_completo,v_tipo,v_texto);
   update public.fale_atendimentos set atualizado_em=clock_timestamp(),
     situacao=case when v_tipo='resposta' or (situacao='aguardando_confirmacao' and v_tipo='associado') then 'em_acompanhamento' else situacao end,
     encerramento_solicitado_por=case when v_tipo='interna' then encerramento_solicitado_por else null end,
     encerramento_solicitado_em=case when v_tipo='interna' then encerramento_solicitado_em else null end where id=v_id;
 elsif p_acao='encerrar' and v_admin then
   v_texto:='A equipe solicitou o encerramento deste atendimento. Aguarda confirmação do associado.';
   if v_t.situacao='aguardando_confirmacao' then raise exception 'O encerramento já aguarda confirmação.'; end if;
   insert into public.fale_mensagens(atendimento_id,autor_id,autor_nome,tipo,texto) values(v_id,v_usuario.id,v_usuario.nome_completo,'encerramento',v_texto);
   update public.fale_atendimentos set situacao='aguardando_confirmacao',encerramento_solicitado_por=v_usuario.id,encerramento_solicitado_em=clock_timestamp(),atualizado_em=clock_timestamp() where id=v_id;
 elsif p_acao='confirmar' and not v_admin and v_t.usuario_id=v_usuario.id then
   if v_t.situacao<>'aguardando_confirmacao' then raise exception 'A equipe ainda não solicitou o encerramento.'; end if;
   update public.fale_atendimentos set situacao='finalizado',finalizado_em=clock_timestamp(),atualizado_em=clock_timestamp() where id=v_id;
   insert into public.fale_mensagens(atendimento_id,autor_id,autor_nome,tipo,texto) values(v_id,v_usuario.id,v_usuario.nome_completo,'evento','Encerramento confirmado pelo associado.');
 else raise exception 'Operação não permitida.' using errcode='42501';
 end if;
 return jsonb_build_object('salvo',true);
end;
$$;
revoke all on function private.fale_com_a_gente(text,jsonb) from public,anon;
grant usage on schema private to authenticated;
grant execute on function private.fale_com_a_gente(text,jsonb) to authenticated;
create or replace function public.fale_com_a_gente(p_acao text,p_dados jsonb default '{}'::jsonb)
returns jsonb language sql security invoker set search_path='' as $$ select private.fale_com_a_gente(p_acao,p_dados); $$;
revoke all on function public.fale_com_a_gente(text,jsonb) from public,anon;
grant execute on function public.fale_com_a_gente(text,jsonb) to authenticated;


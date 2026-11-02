-- Integração automática de cerimônias ao Caixa. Aplicar após os SQLs de cerimônias.
-- Categorias: Leitura=22, Batismo=23. O balancete já usa financeiro_lancamentos.
create table if not exists private.cerimonias_lancamentos_vinculos (
 participante_id uuid not null references public.cerimonias_participantes(id),
 pagamento_id uuid not null references public.cerimonias_pagamentos(id),
 categoria_id bigint not null references public.financeiro_categorias(id),
 lancamento_id bigint not null unique references public.financeiro_lancamentos(id),
 primary key(pagamento_id,categoria_id)
);
revoke all on private.cerimonias_lancamentos_vinculos from public,anon,authenticated;

create or replace function private.cerimonias_sincronizar_caixa(p_participante uuid)
returns void language plpgsql security definer set search_path='' as $$
declare p record; pg record; v_total numeric(14,2); v_leitura numeric(14,2); v_batismo numeric(14,2);
 v_alocado_leitura numeric(14,2):=0; v_alocado_batismo numeric(14,2):=0;
 v_parte_leitura numeric(14,2); v_parte_batismo numeric(14,2); v_categoria bigint; v_valor numeric(14,2);
 v_lancamento bigint; v_nome text; v_descricao text;
begin
 select cp.*,ct.valor_leitura_associado,ct.valor_batismo_associado,ct.valor_conjunto_associado,
 ct.valor_leitura_externo,ct.valor_batismo_externo
 into p from public.cerimonias_participantes cp join public.cerimonias_tufra ct on ct.id=cp.cerimonia_id
 where cp.id=p_participante for update;
 if not found then raise exception 'Participante inexistente'; end if;
 select coalesce(u.nome_completo,p.nome_externo) into v_nome from public.cerimonias_participantes cp
 left join public.usuarios u on u.id=cp.associado_id where cp.id=p_participante;
 select coalesce(sum(valor),0) into v_total from public.cerimonias_pagamentos where participante_id=p_participante;
 if p.leitura and p.batismo then
   if p.associado_id is not null then
     v_leitura:=round(v_total/2,2); v_batismo:=v_total-v_leitura;
   else
     v_leitura:=round(v_total*p.valor_leitura_externo/nullif(p.valor_leitura_externo+p.valor_batismo_externo,0),2);
     v_batismo:=v_total-v_leitura;
   end if;
 elsif p.leitura then v_leitura:=v_total;v_batismo:=0;
 else v_leitura:=0;v_batismo:=v_total; end if;
 -- Distribui o valor acumulado entre pagamentos na ordem de confirmação.
 for pg in select * from public.cerimonias_pagamentos where participante_id=p_participante order by data_pagamento,criado_em,id loop
   v_parte_leitura:=least(pg.valor,greatest(0,v_leitura-v_alocado_leitura));
   v_parte_batismo:=pg.valor-v_parte_leitura;
   v_alocado_leitura:=v_alocado_leitura+v_parte_leitura;
   v_alocado_batismo:=v_alocado_batismo+v_parte_batismo;
   for v_categoria,v_valor in select 22::bigint,v_parte_leitura union all select 23::bigint,v_parte_batismo loop
     select lancamento_id into v_lancamento from private.cerimonias_lancamentos_vinculos
     where pagamento_id=pg.id and categoria_id=v_categoria;
     if v_valor=0 then
       if v_lancamento is not null then
         update public.financeiro_lancamentos set status='cancelado',atualizado_em=clock_timestamp()
         where id=v_lancamento and status<>'cancelado';
       end if;
     else
       v_descricao:=case when v_categoria=22 then 'Leitura de Búzios' else 'Batismo' end||' — '||v_nome;
       if v_lancamento is null then
         insert into public.financeiro_lancamentos(categoria_id,data_movimento,descricao,valor,forma_pagamento,favorecido,observacao,registrado_por)
         values(v_categoria,pg.data_pagamento,left(v_descricao,300),v_valor,pg.forma_pagamento,left(v_nome,150),
         'Pagamento de cerimônia '||pg.id,pg.confirmado_por) returning id into v_lancamento;
         insert into private.cerimonias_lancamentos_vinculos(participante_id,pagamento_id,categoria_id,lancamento_id)
         values(p_participante,pg.id,v_categoria,v_lancamento);
       else
         update public.financeiro_lancamentos set valor=v_valor,status='ativo',atualizado_em=clock_timestamp()
         where id=v_lancamento;
       end if;
     end if;
   end loop;
 end loop;
end;$$;
revoke all on function private.cerimonias_sincronizar_caixa(uuid) from public,anon,authenticated;

create or replace function private.cerimonias_pagamento_caixa_trigger()
returns trigger language plpgsql security definer set search_path='' as $$
begin
 perform private.cerimonias_sincronizar_caixa(new.participante_id);
 return new;
end;$$;
drop trigger if exists cerimonias_pagamento_caixa on public.cerimonias_pagamentos;
create trigger cerimonias_pagamento_caixa after insert on public.cerimonias_pagamentos
for each row execute function private.cerimonias_pagamento_caixa_trigger();

create or replace function private.cerimonias_participante_caixa_trigger()
returns trigger language plpgsql security definer set search_path='' as $$
begin
 if old.leitura is distinct from new.leitura or old.batismo is distinct from new.batismo then
   perform private.cerimonias_sincronizar_caixa(new.id);
 end if;
 return new;
end;$$;
drop trigger if exists cerimonias_participante_caixa on public.cerimonias_participantes;
create trigger cerimonias_participante_caixa after update of leitura,batismo on public.cerimonias_participantes
for each row execute function private.cerimonias_participante_caixa_trigger();

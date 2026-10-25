-- Teste com ROLLBACK: não confirma alterações em cadastros nem presenças.
begin;

do $test$
declare v_usuario uuid; v_auth uuid; v_terca uuid; v_sabado uuid; v_presencas bigint; v_result jsonb; v_err boolean:=false; v_inicio date;
begin
 select u.auth_id into v_auth from public.usuarios u join public.usuario_funcoes uf on uf.usuario_id=u.id join public.funcoes f on f.id=uf.funcao_id where f.nome='Tesoureiro' and u.auth_id is not null limit 1;
 perform set_config('request.jwt.claim.sub',v_auth::text,true);
 select d.usuario_id,coalesce(u.data_entrada_tufra,'2020-01-01'::date) into v_usuario,v_inicio from public.desenvolvimento_periodos d join public.usuarios u on u.id=d.usuario_id where u.status='ativo' and (u.data_entrada_tufra is null or u.data_entrada_tufra<='2026-01-01') limit 1;
 if v_usuario is null then raise exception 'Nenhum cadastro apto ao teste transacional.'; end if;
 select id into v_terca from public.tipos_lista_presenca where nome='Desenvolvimento';
 select id into v_sabado from public.tipos_lista_presenca where nome='Banco sábado';
 select count(*) into v_presencas from public.presencas;
 perform public.salvar_periodos_desenvolvimento(v_usuario,replace('[{"grupo":"banco_terca","data_inicio":"2020-01-01","data_fim":"2026-06-01"},{"grupo":"banco_sabado","data_inicio":"2026-06-01","data_fim":"2026-09-01"},{"grupo":"corrente_terca","data_inicio":"2026-09-01","data_fim":null}]','2020-01-01',v_inicio::text)::jsonb);
 if not exists(select 1 from public.listar_associados_presenca_periodo(v_terca,'2026-05-31') where id=v_usuario) then raise exception 'Teste terça antes falhou'; end if;
 if exists(select 1 from public.listar_associados_presenca_periodo(v_terca,'2026-06-01') where id=v_usuario) then raise exception 'Teste terça durante sábado falhou'; end if;
 if not exists(select 1 from public.listar_associados_presenca_periodo(v_sabado,'2026-06-01') where id=v_usuario) then raise exception 'Teste sábado falhou'; end if;
 if not exists(select 1 from public.listar_associados_presenca_periodo(v_terca,'2026-09-01') where id=v_usuario) then raise exception 'Teste retorno falhou'; end if;
 if (select count(*) from public.presencas)<>v_presencas then raise exception 'Presenças alteradas'; end if;
 begin
  perform public.salvar_periodos_desenvolvimento(v_usuario,'[{"grupo":"banco_sabado","data_inicio":"2026-06-01","data_fim":"2026-09-01"},{"grupo":"banco_terca","data_inicio":"2026-08-01","data_fim":null}]'::jsonb);
 exception when others then v_err:=true; end;
 if not v_err then raise exception 'Aceitou sobreposição'; end if;
 perform set_config('request.jwt.claim.sub','',true);
 v_err:=false;
 begin perform public.salvar_periodos_desenvolvimento(v_usuario,'[]'::jsonb); exception when others then v_err:=true; end;
 if not v_err then raise exception 'Aceitou usuário sem sessão'; end if;
end $test$;
select 'OK: limites de datas, ida/volta, sobreposição, autorização e preservação das presenças; transação revertida' as teste;
rollback;


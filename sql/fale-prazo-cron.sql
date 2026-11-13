create extension if not exists pg_cron with schema pg_catalog;
grant usage on schema cron to postgres;
grant all privileges on all tables in schema cron to postgres;
select cron.schedule('fale-encerrar-apos-5-dias','* * * * *','select private.finalizar_fale_por_prazo();');

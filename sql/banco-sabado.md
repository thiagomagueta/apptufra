# Banco sábado e histórico do Desenvolvimento

Estado: implementação preparada na branch `banco-sabado-periodos`; **não ativada em produção**. A instalação automática no Supabase retornou `Invalid or expired requestState` tanto em execute_sql quanto em apply_migration. A consulta posterior confirmou que a tabela nova não existe. A branch main permanece intacta.

## Instalação

Executar no projeto **apptufra** estes arquivos, nesta ordem (cada um possui menos de 100 linhas):

1. `banco-sabado-01.sql`: cria a função filha, a lista e a tabela protegida; inicializa os períodos com o enquadramento atual. Não altera presenças nem atribuições atuais.
2. `banco-sabado-02.sql`: instala as operações de alteração atômica dos períodos e consulta das chamadas por data.
3. `banco-sabado-03.sql`: encaminha as ausências da confirmação prévia para a lista correspondente ao período.

Depois de confirmar a estrutura e executar o teste transacional, integrar a branch em main e verificar a publicação no Cloudflare. **Não publicar o JavaScript antes de instalar e validar os três blocos.**

A lista Banco sábado começa sem responsáveis: eles são definidos na tela já existente de responsáveis pelas listas. Não foram transferidas pessoas reais para o sábado, porque nomes e datas ainda serão informados pela gestão.

## Uso

Em Gestão APP → usuário ativo → Histórico do Desenvolvimento:

- Escolher Banco do Desenvolvimento, Corrente do Desenvolvimento ou Banco sábado.
- Informar a data real da mudança, inclusive retroativa, e registrar.
- Para corrigir uma data ou um grupo anterior, usar Salvar correção no período correspondente.
- O dia da mudança já pertence ao novo grupo. O fim do período é a data da próxima mudança (exclusiva).
- A mudança de funções e os períodos são gravados na mesma transação. A alteração é restrita à Tesouraria, como as atribuições de funções existentes.
- A data de entrada no TUFRA não é alterada; não é permitido iniciar um período antes dela.
- Não há agendamento futuro: a data precisa ser até hoje em São Paulo.

Os períodos precisam ser contínuos e sem sobreposição. A regra de histórico abrange os três grupos do Desenvolvimento. Outras funções, como Cambone e Cantina, continuam independentes.

## Exibição e frequência

As chamadas usam o grupo na data da atividade. Dashboard e resumo do associado mostram as listas históricas e somente as datas correspondentes aos seus períodos. Relatórios e exportações usam a mesma regra. O nome Banco sábado aparece por inteiro no dashboard.

Lançamentos fora do período permanecem no banco e são excluídos da frequência. O editor lista esses registros para conferência; o relatório geral sinaliza com `!`. As funções antigas não aparecem como atuais. Alterações de ida e volta não apagam presenças.

O quadro de próximas atividades mantém o calendário geral já existente; o acesso à confirmação considera se a pessoa participa daquela gira. O relatório de justificativas e a relação de quem não respondeu também respeitam os períodos.

## Validação

Executado localmente:

- `node tests/desenvolvimento-periodos.cjs`: limites inclusivo/exclusivo, ida e retorno, listas históricas, ausência de histórico, filtro de atividades, exibição do nome completo e exclusão de falta fora do período sem apagar o lançamento.
- `node --check` em todos os arquivos JavaScript alterados.

Pendente: execução do SQL e do teste `tests/desenvolvimento-periodos.sql`, validação de RLS e RPCs no banco e teste visual autenticado após a instalação. O endereço do aplicativo também retornou erro de conexão no navegador desta sessão.

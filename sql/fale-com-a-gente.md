# Fale com a gente — liberado

Todos os associados com conta ativa podem enviar e acompanhar somente seus próprios atendimentos. Apenas os selecionados em fale_responsaveis acessam a visão de equipe, respostas, anotações internas, histórico geral e pedidos de encerramento. O cargo Tesoureiro não concede acesso à equipe. A Gestão APP continua restrita aos gestores existentes e só eles podem editar a lista de responsáveis.

As tabelas continuam sem acesso direto por anon/authenticated, com RLS; todas as operações passam pela RPC autenticada e checagem de titularidade. Avisos da equipe não são retornados aos não autorizados. Remover um responsável revoga as próximas operações sem apagar o histórico.

Uma resposta da equipe inicia o acompanhamento automaticamente. Notas internas não são exibidas ao associado. A equipe solicita encerramento sem parecer obrigatório, o associado confirma e depois avalia. Atendimento finalizado não reabre. Os avisos são contadores dentro do APP, não push, email ou WhatsApp.


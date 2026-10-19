# Fale com a gente — piloto

O módulo é independente dos Atendimentos Fraternos existentes. Nesta implantação somente usuários ativos com função **Tesoureiro** ativa podem abrir qualquer operação, inclusive na visão pessoal. O servidor valida o cargo a cada chamada. Nenhum membro recebe acesso apenas por constar em `fale_responsaveis` nesta fase.

Entradas:
- Início: cartão imediatamente após Próxima atividade.
- ADM: Atendimentos — Fale com a gente.
- ADM → Gestão APP: Responsáveis — Fale com a gente.

As tabelas têm RLS habilitada e nenhum acesso direto de `anon`/`authenticated`. O aviso informativo de RLS sem políticas é intencional neste modelo de acesso exclusivo via RPC. A função pública é invoker; a implementação privada definer usa `search_path` vazio, autenticação, usuário ativo, cargo e titularidade explícitos. Não há chave privilegiada no cliente. A seleção dos responsáveis ocorre em transação.

Estados: não lido → lido → em acompanhamento → aguardando confirmação → finalizado. Respostas não encerram o atendimento. Apenas o próprio titular, na visão pessoal, confirma o encerramento. Avaliação é aceita uma vez, após finalizar, sem reabrir. Complementos enquanto aguarda confirmação retomam acompanhamento; notas internas não alteram a solicitação. Finalizados são somente leitura, exceto pelo envio da avaliação pendente.

Avisos são contadores dentro do APP, consultados na abertura e a cada 30 segundos nas telas de entrada enquanto a aba está visível; não são push, email ou WhatsApp. A lista geral e cada conversa possuem atualização manual.

Para liberação futura é necessário alterar explicitamente a regra no servidor: permitir a visão pessoal a associados ativos e restringir operações de equipe aos selecionados. A gestão de responsáveis deverá continuar restrita à gestão autorizada. Não há botão de liberação pública nesta versão.

Validação: `tests/fale-com-a-gente.sql` executa testes com perfis reais em transação com rollback, sem conservar registros de teste. `tests/fale-ui.cjs` usa Playwright com RPC simulada para testar telas e fluxo em celular e desktop, sem gerar atendimento real; requer Playwright instalado e Chromium disponível (opcionalmente via `FALE_CHROMIUM_PATH`).

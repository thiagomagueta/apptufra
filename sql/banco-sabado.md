# Histórico de funções e listas de presença

Instalado: Banco sábado é função filha de Médium em Desenvolvimento. As listas respeitam os períodos de Banco de terça, Corrente do Desenvolvimento, Banco sábado e Corrente Principal. A saída das correntes também encerra a participação nas chamadas.

## Uso atual

- Em Gestão APP → pessoa → Funções, marque e desmarque normalmente. Salvar funções registra automaticamente a data atual de São Paulo.
- Principal e Desenvolvimento são alternativos. Escolher Principal desmarca Desenvolvimento e seus grupos; escolher um grupo do Desenvolvimento marca o pai e desmarca os grupos alternativos.
- A tela de funções não possui edição de datas nem bloqueio dos quadradinhos.
- No Resumo do associado, Histórico das mudanças de função apresenta as datas e permite à Tesouraria corrigi-las. A correção ajusta a fronteira entre os dois períodos sem alterar funções.
- Datas retroativas são corrigidas no resumo. A data de entrada no TUFRA permanece independente.
- Alterações no mesmo dia usam o enquadramento final daquele dia, sem criar períodos de duração zero.
- Presenças anteriores são preservadas. Registros fora do período não entram na frequência.

## Banco

Os blocos `banco-sabado-01.sql`, `02.sql` e `03.sql` correspondem à instalação inicial. O complemento `funcoes-periodos-automaticos.sql` instala as mudanças automáticas pela lista de funções e a correção de datas no resumo. Gravação de funções, períodos e histórico de Ogam/Cambone/Cantina ocorre na mesma transação. Apenas a Tesouraria pode alterar funções e corrigir os períodos; leitura e chamadas mantêm os controles por pessoa, diretoria e responsáveis.

## Validação

- `node tests/desenvolvimento-periodos.cjs`: limites, ida/volta, Principal, histórico, nome completo e frequência.
- `node tests/funcoes-lista.cjs`: quadradinhos liberados, escolha de Principal/Desenvolvimento e preservação de funções independentes.
- `tests/funcoes-periodos-automaticos.sql`: teste transacional com ROLLBACK para data automática, transferência Principal, correção no resumo, retorno, saída, autorização e preservação de presenças.

A publicação pode ser acompanhada pelos checks Cloudflare Workers no GitHub. O navegador remoto desta sessão retornou erro de conexão; a validação visual autenticada não foi concluída.

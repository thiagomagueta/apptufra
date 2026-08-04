# Gestão TUFRA

Sistema de gestão da Tenda de Umbanda Francisco de Assis.

## Objetivo do projeto

Criar um aplicativo para celular que auxilie na administração da TUFRA, começando pelo controle de acesso e pelo cadastro de associados.

O sistema será desenvolvido gradualmente, permitindo testes e aprovação de cada tela antes do início da próxima etapa.

---

# Versão atual

Versão: 0.1

Status: Em desenvolvimento

---

# Sequência de desenvolvimento

- [x] Tela de login
- [ ] Cadastro de usuário
- [ ] Dashboard
- [ ] Cadastro de associados
- [ ] Ficha do associado
- [ ] Financeiro

---

# Tela 01 — Login

## Status

Concluída.

## Objetivo

Permitir que um usuário informe suas credenciais para acessar o sistema.

## Elementos da tela

- Logo da TUFRA
- Nome TUFRA
- Nome completo da instituição
- Campo Usuário
- Campo Senha
- Botão para mostrar ou ocultar a senha
- Link Esqueci minha senha
- Botão Entrar
- Link Criar cadastro

## Regras atuais

- O campo Usuário é obrigatório.
- O campo Senha é obrigatório.
- O sistema deve informar quando algum campo não estiver preenchido.
- A autenticação real será implementada posteriormente.
- O link Criar cadastro deverá abrir a Tela 02.

---

# Tela 02 — Cadastro de usuário

## Status

Próxima tela a ser desenvolvida.

## Objetivo

Permitir que uma pessoa solicite acesso ao aplicativo.

Neste momento, não haverá separação entre cadastro de usuário e cadastro de associado.

## Campos iniciais

- Nome completo
- CPF
- Data de nascimento
- Telefone celular
- E-mail
- Usuário
- Senha
- Confirmar senha
- Aceite dos termos de uso e privacidade

## Situação do cadastro

Todo novo cadastro deverá receber automaticamente a situação:

`Aguardando aprovação`

## Possíveis situações

- Aguardando aprovação
- Aprovado
- Reprovado
- Bloqueado

## Regras de aprovação

- O usuário poderá preencher e enviar seu cadastro.
- O cadastro não dará acesso imediato ao sistema.
- Após o envio, aparecerá uma mensagem informando que o pedido está aguardando aprovação.
- Somente um administrador poderá aprovar o cadastro.
- Enquanto estiver aguardando aprovação, o usuário não poderá acessar o Dashboard.
- Um cadastro reprovado também não poderá acessar o sistema.
- Um usuário bloqueado perderá o acesso até ser liberado novamente.

## Validações previstas

- Todos os campos obrigatórios deverão ser preenchidos.
- O CPF deverá possuir formato válido.
- O e-mail deverá possuir formato válido.
- A senha e a confirmação da senha deverão ser iguais.
- O usuário não poderá ser repetido.
- O CPF não poderá ser repetido.
- O e-mail não poderá ser repetido.
- A senha deverá possuir um tamanho mínimo, a ser definido.

---

# Tela 03 — Dashboard

## Status

Planejada.

## Objetivo

Ser a primeira tela apresentada após o acesso aprovado.

## Funções iniciais

- Acessar associados
- Acessar financeiro
- Visualizar informações resumidas
- Acessar configurações
- Sair do sistema

---

# Tela 04 — Cadastro de associados

## Status

Planejada.

## Objetivo

Cadastrar os associados utilizando as informações da ficha oficial da TUFRA.

---

# Tela 05 — Ficha do associado

## Status

Planejada.

## Objetivo

Consultar, editar e acompanhar as informações de cada associado.

---

# Tela 06 — Financeiro

## Status

Planejada.

## Objetivo

Controlar mensalidades, entradas, saídas e informações financeiras da TUFRA.

---

# Perfis de acesso futuros

Os perfis não serão implementados na primeira versão.

Posteriormente, o sistema deverá permitir diferentes níveis de acesso:

## 1. Associado

Terá acesso somente às telas e informações autorizadas para associados.

## 2. Pai Pequeno

Terá acesso às funções administrativas e religiosas definidas pela direção.

## 3. Secretaria

Terá acesso ao cadastro, consulta e atualização dos associados.

## 4. Tesoureiro

Terá acesso às mensalidades, entradas, saídas e relatórios financeiros.

## 5. Administrador

Terá acesso completo ao sistema, incluindo:

- Aprovação de usuários
- Bloqueio de usuários
- Definição de perfis
- Configuração de permissões
- Administração geral do aplicativo

---

# Regra de desenvolvimento

Cada tela deverá passar pelas seguintes etapas:

1. Definição dos requisitos
2. Criação da estrutura HTML
3. Criação do estilo visual
4. Programação das funções
5. Teste no celular
6. Aprovação
7. Marcação da tela como concluída

Após uma tela ser aprovada, ela somente será alterada para correção de erros ou por decisão do responsável pelo projeto.

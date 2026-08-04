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

Requisitos definidos.

Próxima etapa: criação do layout da tela.

## Objetivo

Permitir que qualquer pessoa solicite acesso ao aplicativo.

O usuário deverá preencher o próprio cadastro. O administrador não precisará realizar o cadastro manualmente.

## Fluxo

1. O usuário abre a tela de login.
2. Toca em `Criar cadastro`.
3. Preenche os dados pessoais e os dados da conta.
4. Envia a solicitação de acesso.
5. O sistema registra o cadastro com a situação `Aguardando aprovação`.
6. O usuário visualiza uma mensagem informando que a solicitação foi enviada.
7. Um administrador analisa a solicitação.
8. O administrador poderá aprovar ou reprovar o cadastro.
9. No momento da aprovação, o administrador deverá definir o perfil de acesso.
10. Após a aprovação, o usuário poderá acessar o sistema.

## Organização do cadastro

O sistema terá um único cadastro de usuário, organizado internamente em dois grupos de informações.

### Dados pessoais

- Nome completo
- CPF
- Data de nascimento
- Telefone celular
- E-mail

### Dados da conta

- Usuário
- Senha
- Confirmação da senha
- Status
- Perfil de acesso
- Data e hora da solicitação
- Data e hora da aprovação
- Usuário responsável pela aprovação
- Data e hora do último acesso

## Campos visíveis na tela de cadastro

- Nome completo
- CPF
- Data de nascimento
- Telefone celular
- E-mail
- Usuário
- Senha
- Confirmar senha
- Aceite dos termos de uso e privacidade

## Campos gerados automaticamente

Os campos abaixo não serão preenchidos pelo usuário:

- Status
- Data e hora da solicitação
- Data e hora da aprovação
- Usuário responsável pela aprovação
- Data e hora do último acesso
- Perfil de acesso

## Situações possíveis

- Aguardando aprovação
- Ativo
- Reprovado
- Bloqueado

## Regras de acesso

### Aguardando aprovação

- Não poderá acessar o Dashboard.
- Deverá receber uma mensagem informando que o cadastro ainda está em análise.

### Ativo

- Poderá acessar o sistema de acordo com o perfil definido.

### Reprovado

- Não poderá acessar o sistema.
- Deverá receber uma mensagem informando que a solicitação não foi aprovada.

### Bloqueado

- Não poderá acessar o sistema.
- Deverá receber uma mensagem informando que o acesso está bloqueado.

## Tela de aprovação

A tela de aprovação deverá mostrar:

- Nome completo
- CPF
- Telefone
- E-mail
- Data e hora da solicitação
- Status atual
- Campo para escolha do perfil
- Campo de observações
- Botão Reprovar
- Botão Aprovar

## Perfis previstos

Os perfis serão implementados posteriormente.

- Associado
- Pai Pequeno
- Secretaria
- Tesoureiro
- Administrador

Ao aprovar o cadastro, o administrador deverá selecionar um perfil.

## Alteração dos próprios dados

O usuário poderá alterar os próprios dados sem depender de aprovação de um administrador.

Isso inclui:

- Nome completo
- CPF
- Data de nascimento
- Telefone celular
- E-mail
- Usuário
- Senha

O perfil de acesso e o status continuarão sendo definidos pela administração.

## Validações previstas

- Todos os campos obrigatórios deverão ser preenchidos.
- O CPF deverá possuir formato válido.
- O e-mail deverá possuir formato válido.
- A senha e a confirmação da senha deverão ser iguais.
- O usuário não poderá ser repetido.
- O CPF não poderá ser repetido.
- O e-mail não poderá ser repetido.
- O aceite dos termos deverá ser obrigatório.
- O tamanho mínimo da senha será definido antes da programação.

## Registros administrativos

O sistema deverá registrar automaticamente:

- Data e hora da solicitação
- Data e hora da aprovação
- Usuário responsável pela aprovação
- Data e hora do último acesso

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

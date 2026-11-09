# Entrega 2 — Implementação Inicial do Banco de Dados

## 1. Objetivo

Esta documentação apresenta a implementação inicial do banco de dados do projeto **TicketLab**, desenvolvido para auxiliar no planejamento e na organização financeira de eventos, conectando organizadores e fornecedores de serviços.

O banco de dados foi implementado em MySQL e estruturado para armazenar informações de usuários, organizadores, fornecedores, eventos, serviços, faixas de preços e propostas comerciais.

A implementação contempla oito tabelas, com definição de campos, tipos de dados, chaves primárias, chaves estrangeiras e restrições de integridade.

## 2. Sistema de gerenciamento de banco de dados

- **SGBD:** MySQL
- **Banco de dados:** `trocaticket`
- **Mecanismo de armazenamento:** InnoDB
- **Conjunto de caracteres:** utf8mb4

## 3. Estrutura das tabelas

### 3.1. Tabela `usuarios`

Armazena os dados de cadastro e autenticação dos usuários do sistema, incluindo organizadores, fornecedores e administradores. Também registra informações relacionadas à aprovação ou rejeição dos cadastros.

| Campo | Tipo de dado | Restrições |
|---|---|---|
| id | INT | Chave primária, incremento automático |
| nome | VARCHAR(250) | NOT NULL |
| email | VARCHAR(250) | NOT NULL, UNIQUE |
| telefone | VARCHAR(30) | NOT NULL |
| senha_hash | VARCHAR(250) | NOT NULL |
| tipo | VARCHAR(50) | NOT NULL |
| status | VARCHAR(50) | NOT NULL |
| criado_em | DATETIME | NOT NULL, padrão CURRENT_TIMESTAMP |
| cidade | VARCHAR(100) | Opcional |
| estado | CHAR(2) | Opcional |
| analisado_por | INT | Opcional, chave estrangeira para usuarios.id |
| data_analise | DATETIME | Opcional |
| motivo_rejeicao | VARCHAR(500) | Opcional |

**Restrições e relacionamentos:**
- `id` é a chave primária.
- `email` possui restrição de unicidade.
- `tipo` aceita somente `ORGANIZADOR`, `FORNECEDOR` ou `ADMINISTRADOR`.
- `status` aceita somente `PENDENTE`, `APROVADO` ou `REJEITADO`.
- `analisado_por` referencia outro registro da própria tabela `usuarios`, permitindo identificar o usuário responsável pela análise do cadastro.

### 3.2. Tabela `organizadores`

Armazena informações específicas dos usuários cadastrados como organizadores de eventos.

| Campo | Tipo de dado | Restrições |
|---|---|---|
| id_usuario | INT | Chave primária e chave estrangeira para usuarios.id |
| tipo_pessoa | VARCHAR(50) | NOT NULL |
| documento | VARCHAR(20) | NOT NULL, UNIQUE |
| data_nascimento | DATE | Opcional |

**Restrições e relacionamentos:**
- `id_usuario` é simultaneamente chave primária e estrangeira.
- `tipo_pessoa` aceita somente `PJ` (Pessoa Jurídica) ou `PF` (Pessoa Física).
- `documento` possui restrição de unicidade.
- Cada registro de organizador está associado a um usuário existente.

### 3.3. Tabela `fornecedores`

Armazena informações específicas dos fornecedores cadastrados no sistema.

| Campo | Tipo de dado | Restrições |
|---|---|---|
| id_usuario | INT | Chave primária e chave estrangeira para usuarios.id |
| CNPJ | VARCHAR(40) | NOT NULL, UNIQUE |
| categoria_atuacao | VARCHAR(255) | NOT NULL |
| razao_social | VARCHAR(200) | Opcional |
| regiao_atendimento | VARCHAR(200) | Opcional |
| descricao | TEXT | Opcional |
| site | VARCHAR(255) | Opcional |

**Restrições e relacionamentos:**
- `id_usuario` é simultaneamente chave primária e estrangeira.
- `CNPJ` possui restrição de unicidade.
- Cada fornecedor está associado a um usuário existente.

### 3.4. Tabela `eventos`

Armazena os eventos cadastrados pelos organizadores, incluindo informações de localização, data, horário, público esperado e orçamento.

| Campo | Tipo de dado | Restrições |
|---|---|---|
| id | INT | Chave primária, incremento automático |
| id_organizador | INT | NOT NULL, chave estrangeira para organizadores.id_usuario |
| nome | VARCHAR(100) | NOT NULL |
| descricao | TEXT | Opcional |
| local | VARCHAR(200) | NOT NULL |
| data_evento | DATE | NOT NULL |
| horario | TIME | NOT NULL |
| publico_min | INT | NOT NULL |
| publico_max | INT | NOT NULL |
| status | VARCHAR(20) | NOT NULL |
| orcamento_previsto | DECIMAL(12,2) | Opcional |

**Restrições e relacionamentos:**
- `id` é a chave primária.
- `id_organizador` referencia um organizador existente.
- `status` aceita somente `PLANEJAMENTO`, `CONFIRMADO` ou `CANCELADO`.
- `publico_max` deve ser maior que `publico_min`.
- `orcamento_previsto` pode ser nulo ou possuir valor igual ou superior a zero.

### 3.5. Tabela `servicos`

Armazena os serviços disponibilizados pelos fornecedores, incluindo nome, descrição, categoria e situação do cadastro.

| Campo | Tipo de dado | Restrições |
|---|---|---|
| id | INT | Chave primária, incremento automático |
| id_fornecedor | INT | NOT NULL, chave estrangeira para fornecedores.id_usuario |
| nome | VARCHAR(200) | NOT NULL |
| descricao | TEXT | NOT NULL |
| categoria | VARCHAR(100) | NOT NULL |
| status | VARCHAR(20) | NOT NULL, padrão ATIVO |

**Restrições e relacionamentos:**
- `id` é a chave primária.
- `id_fornecedor` referencia um fornecedor existente.
- `status` aceita somente `ATIVO` ou `RASCUNHO`.
- Um fornecedor pode possuir vários serviços cadastrados.

### 3.6. Tabela `precos_servicos`

Armazena as faixas de preços dos serviços de acordo com a quantidade de pessoas atendidas.

| Campo | Tipo de dado | Restrições |
|---|---|---|
| id | INT | Chave primária, incremento automático |
| id_servico | INT | NOT NULL, chave estrangeira para servicos.id |
| publico_max | INT | NOT NULL |
| publico_min | INT | NOT NULL |
| preco | DECIMAL(10,2) | NOT NULL |

**Restrições e relacionamentos:**
- `id` é a chave primária.
- `id_servico` referencia um serviço existente.
- `publico_max` deve ser maior que `publico_min`.
- Um serviço pode possuir diferentes faixas de preço.

### 3.7. Tabela `eventos_servicos`

Relaciona os eventos aos serviços selecionados, registrando o preço aplicado a cada serviço no evento.

| Campo | Tipo de dado | Restrições |
|---|---|---|
| id | INT | Chave primária, incremento automático |
| id_evento | INT | NOT NULL, chave estrangeira para eventos.id |
| id_servico | INT | NOT NULL, chave estrangeira para servicos.id |
| preco_aplicado | DECIMAL(10,2) | NOT NULL |

**Restrições e relacionamentos:**
- `id` é a chave primária.
- `id_evento` referencia um evento existente.
- `id_servico` referencia um serviço existente.
- A combinação `id_evento` e `id_servico` possui restrição de unicidade, impedindo que o mesmo serviço seja vinculado mais de uma vez ao mesmo evento.

### 3.8. Tabela `propostas`

Armazena as propostas comerciais enviadas pelos fornecedores para os serviços relacionados aos eventos.

| Campo | Tipo de dado | Restrições |
|---|---|---|
| id | INT | Chave primária, incremento automático |
| id_evento | INT | NOT NULL, chave estrangeira para eventos.id |
| id_servico | INT | NOT NULL, chave estrangeira para servicos.id |
| id_fornecedor | INT | NOT NULL, chave estrangeira para fornecedores.id_usuario |
| valor | DECIMAL(10,2) | NOT NULL |
| prazo_dias | INT | NOT NULL |
| observacao | TEXT | Opcional |
| status | VARCHAR(20) | NOT NULL, padrão ENVIADA |
| criado_em | DATETIME | NOT NULL, padrão CURRENT_TIMESTAMP |
| atualizado_em | DATETIME | NOT NULL, padrão CURRENT_TIMESTAMP, atualizado automaticamente |

**Restrições e relacionamentos:**
- `id` é a chave primária.
- `id_evento` referencia um evento existente.
- `id_servico` referencia um serviço existente.
- `id_fornecedor` referencia um fornecedor existente.
- A combinação `id_evento` e `id_servico` possui restrição de unicidade.
- `valor` deve ser maior que zero.
- `prazo_dias` deve ser maior que zero.
- `status` aceita somente `ENVIADA`, `EM_ANALISE`, `SELECIONADA` ou `RECUSADA`.
- `criado_em` registra automaticamente a data e o horário de criação.
- `atualizado_em` é atualizado automaticamente quando o registro sofre alterações.

## 4. Relacionamentos entre as tabelas

A estrutura implementada estabelece os seguintes relacionamentos:

| Tabela de origem | Campo | Tabela relacionada | Campo referenciado |
|---|---|---|---|
| organizadores | id_usuario | usuarios | id |
| fornecedores | id_usuario | usuarios | id |
| eventos | id_organizador | organizadores | id_usuario |
| servicos | id_fornecedor | fornecedores | id_usuario |
| precos_servicos | id_servico | servicos | id |
| eventos_servicos | id_evento | eventos | id |
| eventos_servicos | id_servico | servicos | id |
| propostas | id_evento | eventos | id |
| propostas | id_servico | servicos | id |
| propostas | id_fornecedor | fornecedores | id_usuario |
| usuarios | analisado_por | usuarios | id |

Os relacionamentos permitem associar usuários aos seus respectivos perfis, vincular organizadores aos eventos, fornecedores aos serviços e relacionar serviços e propostas aos eventos.

## 5. Integridade dos dados

A implementação utiliza mecanismos de integridade do MySQL para manter a consistência das informações:

- **Chaves primárias (PRIMARY KEY):** identificam unicamente os registros de cada tabela.
- **Chaves estrangeiras (FOREIGN KEY):** garantem que os relacionamentos apontem para registros existentes.
- **Restrições de unicidade (UNIQUE):** evitam duplicidades em campos como e-mail, CNPJ e documento, além de combinações específicas de evento e serviço.
- **Restrições CHECK:** validam valores permitidos para determinados campos e condições numéricas, como faixas de público, valores de propostas e status.
- **NOT NULL:** impede a ausência de valores nos campos obrigatórios.
- **DEFAULT:** define valores iniciais automaticamente quando aplicável.

## 6. Considerações finais

A implementação inicial do banco de dados do TicketLab contempla oito tabelas que representam as principais entidades e operações do sistema.

A estrutura permite armazenar usuários e seus perfis, cadastrar eventos e serviços, definir faixas de preços, relacionar serviços aos eventos e registrar propostas comerciais dos fornecedores.

A utilização de chaves primárias, chaves estrangeiras e restrições de integridade contribui para a organização, consistência e confiabilidade dos dados armazenados.

Esta documentação representa a estrutura implementada no banco de dados MySQL `trocaticket` no momento da elaboração desta entrega.
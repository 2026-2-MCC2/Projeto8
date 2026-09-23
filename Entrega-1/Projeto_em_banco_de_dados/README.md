# Banco de Dados — TicketLab

## 1. Objetivo

O banco de dados do TicketLab foi desenvolvido em MySQL para armazenar os usuários da plataforma, os dados específicos de Organizadores e Fornecedores, os eventos, os serviços oferecidos e as associações entre eventos e serviços.

## 2. Estrutura do Banco

- **SGBD:** MySQL
- **Banco:** `trocaticket`

### Arquivos principais

- [`schema.sql`](./schema.sql)
- [`diagrama-banco.pdf`](./diagrama-banco.pdf)

---

## 3. Tabelas

### usuarios

| Campo      | Tipo         | Restrição          |
| ---------- | ------------ | ------------------ |
| id         | INT          | PK, AUTO_INCREMENT |
| nome       | VARCHAR(250) | NOT NULL           |
| email      | VARCHAR(250) | UNIQUE, NOT NULL   |
| telefone   | VARCHAR(30)  | NOT NULL           |
| senha_hash | VARCHAR(250) | NOT NULL           |
| tipo       | VARCHAR(50)  | NOT NULL, CHECK    |
| status     | VARCHAR(50)  | NOT NULL, CHECK    |

### organizadores

| Campo           | Tipo        | Restrição            |
| --------------- | ----------- | -------------------- |
| id_usuario      | INT         | PK, FK → usuarios.id |
| tipo_pessoa     | VARCHAR(50) | NOT NULL, CHECK      |
| documento       | VARCHAR(20) | UNIQUE, NOT NULL     |
| data_nascimento | DATE        | NULL                 |

### fornecedores

| Campo             | Tipo         | Restrição            |
| ----------------- | ------------ | -------------------- |
| id_usuario        | INT          | PK, FK → usuarios.id |
| CNPJ              | VARCHAR(40)  | UNIQUE, NOT NULL     |
| categoria_atuacao | VARCHAR(255) | NOT NULL             |

### eventos

| Campo          | Tipo         | Restrição                               |
| -------------- | ------------ | --------------------------------------- |
| id             | INT          | PK, AUTO_INCREMENT                      |
| id_organizador | INT          | FK → organizadores.id_usuario, NOT NULL |
| nome           | VARCHAR(100) | NOT NULL                                |
| descricao      | TEXT         | NULL                                    |
| local          | VARCHAR(200) | NOT NULL                                |
| data_evento    | DATE         | NOT NULL                                |
| horario        | TIME         | NOT NULL                                |
| publico_min    | INT          | NOT NULL                                |
| publico_max    | INT          | NOT NULL                                |
| status         | VARCHAR(20)  | NOT NULL, CHECK                         |

### servicos

| Campo         | Tipo         | Restrição                              |
| ------------- | ------------ | -------------------------------------- |
| id            | INT          | PK, AUTO_INCREMENT                     |
| id_fornecedor | INT          | FK → fornecedores.id_usuario, NOT NULL |
| nome          | VARCHAR(200) | NOT NULL                               |
| descricao     | TEXT         | NOT NULL                               |
| categoria     | VARCHAR(100) | NOT NULL                               |

### precos_servicos

| Campo       | Tipo          | Restrição                  |
| ----------- | ------------- | -------------------------- |
| id          | INT           | PK, AUTO_INCREMENT         |
| id_servico  | INT           | FK → servicos.id, NOT NULL |
| publico_max | INT           | NOT NULL                   |
| publico_min | INT           | NOT NULL                   |
| preco       | DECIMAL(10,2) | NOT NULL                   |

### eventos_servicos

| Campo          | Tipo          | Restrição                  |
| -------------- | ------------- | -------------------------- |
| id             | INT           | PK, AUTO_INCREMENT         |
| id_evento      | INT           | FK → eventos.id, NOT NULL  |
| id_servico     | INT           | FK → servicos.id, NOT NULL |
| preco_aplicado | DECIMAL(10,2) | NOT NULL                   |

---

## 4. Relacionamentos

- `usuarios` 1 : 0..1 `organizadores`
- `usuarios` 1 : 0..1 `fornecedores`
- `organizadores` 1 : N `eventos`
- `fornecedores` 1 : N `servicos`
- `servicos` 1 : N `precos_servicos`
- `eventos` N : N `servicos`, por meio de `eventos_servicos`

### Chaves estrangeiras

- `organizadores.id_usuario` → `usuarios.id`
- `fornecedores.id_usuario` → `usuarios.id`
- `eventos.id_organizador` → `organizadores.id_usuario`
- `servicos.id_fornecedor` → `fornecedores.id_usuario`
- `precos_servicos.id_servico` → `servicos.id`
- `eventos_servicos.id_evento` → `eventos.id`
- `eventos_servicos.id_servico` → `servicos.id`

---

## 5. Regras e Restrições

### Valores permitidos

**usuarios.tipo**

- `ORGANIZADOR`
- `FORNECEDOR`
- `ADMINISTRADOR`

**usuarios.status**

- `PENDENTE`
- `APROVADO`
- `REJEITADO`

**organizadores.tipo_pessoa**

- `PF`
- `PJ`

**eventos.status**

- `PLANEJAMENTO`
- `CONFIRMADO`
- `CANCELADO`

### Regras de integridade

- `publico_max > publico_min` em `eventos`
- `publico_max > publico_min` em `precos_servicos`
- `usuarios.email` deve ser único
- `organizadores.documento` deve ser único
- `fornecedores.CNPJ` deve ser único
- `eventos_servicos (id_evento, id_servico)` deve ser único

---

## 6. Arquivos

- [`README.md`](./README.md) — documentação do banco
- [`schema.sql`](./schema.sql) — script de criação do banco
- [`diagrama-banco.pdf`](./diagrama-banco.pdf) — diagrama da modelagem

---

## 7. Observação

O `schema.sql`, o diagrama e esta documentação representam a estrutura do banco de dados utilizada no projeto TicketLab.

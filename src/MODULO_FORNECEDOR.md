# Modulo do Fornecedor - TicketLab

Este documento descreve o modulo do fornecedor: telas, API, banco de dados, como executar e como testar.

## 1. Resultado da analise

| Camada | O que existia | Consequencia |
| --- | --- | --- |
| Frontend (React 19 + Vite) | Telas do organizador, login e cadastro. Layout compartilhado em `LayoutOrganizador`. Chamadas via `services/api.js` com JWT em `sessionStorage`. | O modulo reaproveita layout, estilos, `apiRequest` e `RotaPrivada`. |
| Backend (Express 5 + mysql2) | Cadastro, login, `/usuarios`, `/eventos`. Autorizacao por perfil via JWT. Login so libera usuarios `APROVADO`. | Nao havia nenhum endpoint de servicos, oportunidades ou propostas. Foram criados. |
| MySQL (`schema.sql`) | `usuarios`, `fornecedores`, `servicos`, `precos_servicos`, `eventos`, `eventos_servicos`. | Nao existe tabela de propostas. A migration `001` cria `propostas` e adiciona `servicos.status`. |

Prototipo (Bolt): telas de fornecedor identificadas: Dashboard, Meus servicos, Novo servico, Oportunidades, Detalhe da oportunidade, Minhas propostas e Minha conta.

### Decisoes e diferencas em relacao ao prototipo

- **Categorias**: o prototipo usa "Musica, Som, Iluminacao...". O cadastro real grava `ALIMENTACAO, DECORACAO, SEGURANCA, ENTRETENIMENTO, ESTRUTURA, FOTOGRAFIA, OUTROS`. O modulo usa as categorias reais.
- **Oportunidade** = evento com status `PLANEJAMENTO` e data futura. O schema nao registra "categoria solicitada" nem "orcamento estimado" por evento, entao essas informacoes do prototipo nao foram exibidas (nao existem no banco).
- **Servico** = 1 linha em `servicos` + 1 faixa de preco em `precos_servicos`. A edicao altera a primeira faixa cadastrada.
- **Status da proposta**: o fornecedor cria (`ENVIADA`) e pode retirar enquanto estiver `ENVIADA`. Passar para `EM_ANALISE`, `SELECIONADA` ou `RECUSADA` e acao do organizador, que ainda nao tem tela/endpoint no projeto.
- **Avaliacao, "resposta media" e mensagens** do prototipo nao fazem parte dos requisitos nem do schema e nao foram implementadas.

## 2. Banco de dados

Arquivo: `src/Backend/migrations/001_fornecedor_propostas.sql` (nao altera nem remove colunas existentes).

```sql
ALTER TABLE servicos ADD COLUMN status VARCHAR(20) NOT NULL DEFAULT 'ATIVO',
  ADD CONSTRAINT chk_servicos_status CHECK (status IN ('ATIVO','RASCUNHO'));

CREATE TABLE propostas (
  id INT PRIMARY KEY AUTO_INCREMENT,
  id_evento INT NOT NULL,        -- FK eventos.id
  id_servico INT NOT NULL,       -- FK servicos.id
  id_fornecedor INT NOT NULL,    -- FK fornecedores.id_usuario
  valor DECIMAL(10,2) NOT NULL CHECK (valor > 0),
  prazo_dias INT NOT NULL CHECK (prazo_dias > 0),
  observacao TEXT,
  status VARCHAR(20) NOT NULL DEFAULT 'ENVIADA'
         CHECK (status IN ('ENVIADA','EM_ANALISE','SELECIONADA','RECUSADA')),
  criado_em DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  atualizado_em DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  UNIQUE KEY uq_proposta_evento_servico (id_evento, id_servico)
);
```

### Aplicar com seguranca

1. Faca backup: `mysqldump -u <usuario> -p trocaticket > backup_antes_001.sql`
2. Aplique: `mysql -u <usuario> -p trocaticket < src/Backend/migrations/001_fornecedor_propostas.sql`
3. Os servicos que ja existem ficam com `status = 'ATIVO'` (valor padrao).
4. Rollback: `DROP TABLE propostas; ALTER TABLE servicos DROP CONSTRAINT chk_servicos_status, DROP COLUMN status;`

## 3. API

Todas as rotas ficam em `/fornecedor`, exigem `Authorization: Bearer <jwt>`, perfil `FORNECEDOR` e cadastro `APROVADO` no banco (verificado a cada requisicao). O id do fornecedor vem sempre do JWT, nunca do corpo ou da URL.

| Metodo | Rota | Descricao | Respostas |
| --- | --- | --- | --- |
| GET | `/fornecedor/perfil` | Dados do usuario e do fornecedor | 200 |
| PATCH | `/fornecedor/perfil` | Altera `nome`, `email`, `telefone`, `categoria_atuacao`; ou troca senha com `senha_atual` + `nova_senha`. CNPJ, tipo e status sao imutaveis | 200, 400, 403 (senha atual errada), 409 (e-mail duplicado) |
| GET | `/fornecedor/dashboard` | Contagens e 3 oportunidades recentes | 200 |
| GET | `/fornecedor/servicos` | Servicos do fornecedor com preco e faixa de publico | 200 |
| GET | `/fornecedor/servicos/:id` | Um servico | 200, 404 |
| POST | `/fornecedor/servicos` | `{nome, descricao, categoria, preco, publico_min, publico_max, status?}` | 201, 400 |
| PUT | `/fornecedor/servicos/:id` | Mesmo corpo do POST | 200, 400, 404 |
| DELETE | `/fornecedor/servicos/:id` | Exclui se nao tiver propostas nem eventos vinculados | 200, 404, 409 |
| GET | `/fornecedor/oportunidades?busca=` | Eventos `PLANEJAMENTO` futuros (busca por nome/local) | 200 |
| GET | `/fornecedor/oportunidades/:id` | Evento + servicos ativos do fornecedor com preco de tabela e proposta existente | 200, 404 |
| GET | `/fornecedor/propostas?status=` | Propostas do fornecedor | 200, 400 |
| GET | `/fornecedor/propostas/:id` | Uma proposta | 200, 404 |
| POST | `/fornecedor/propostas` | `{id_evento, id_servico, valor, prazo_dias, observacao?}` | 201, 400, 404, 409 |
| DELETE | `/fornecedor/propostas/:id` | Retira proposta ainda `ENVIADA` | 200, 404, 409 |

Erros seguem o padrao existente: `{ "mensagem": "..." }`. Recursos de outro fornecedor retornam 404 (nao revelam que existem).

## 4. Matriz funcionalidade, tela, endpoint e banco

| Funcionalidade | Tela (rota do frontend) | Endpoint | Tabelas / operacao MySQL |
| --- | --- | --- | --- |
| Login e redirecionamento | `/login` | `POST /login` (existente) | `usuarios` SELECT; bloqueia status diferente de `APROVADO` |
| Resumo e oportunidades recentes | `/fornecedor/dashboard` | `GET /fornecedor/dashboard` | `eventos`, `propostas`, `servicos` (COUNT), `usuarios`/`fornecedores` |
| Listar servicos | `/fornecedor/servicos` | `GET /fornecedor/servicos` | `servicos` JOIN `precos_servicos` |
| Cadastrar servico | `/fornecedor/servicos/novo` | `POST /fornecedor/servicos` | `servicos` INSERT + `precos_servicos` INSERT (transacao) |
| Editar servico | `/fornecedor/servicos/:id/editar` | `GET` e `PUT /fornecedor/servicos/:id` | `servicos` UPDATE + `precos_servicos` UPDATE (transacao) |
| Excluir servico | `/fornecedor/servicos` | `DELETE /fornecedor/servicos/:id` | `precos_servicos` DELETE + `servicos` DELETE; checa `propostas` e `eventos_servicos` |
| Listar e buscar oportunidades | `/fornecedor/oportunidades` | `GET /fornecedor/oportunidades` | `eventos` JOIN `usuarios` (organizador), subconsulta em `propostas` |
| Ver oportunidade | `/fornecedor/oportunidades/:id` | `GET /fornecedor/oportunidades/:id` | `eventos`, `servicos`, `precos_servicos`, `propostas` |
| Enviar proposta | `/fornecedor/oportunidades/:id` | `POST /fornecedor/propostas` | `propostas` INSERT (UNIQUE evita duplicidade); valida `servicos` e `eventos` |
| Acompanhar propostas | `/fornecedor/propostas` | `GET /fornecedor/propostas` | `propostas` JOIN `eventos` JOIN `servicos` |
| Retirar proposta | `/fornecedor/propostas` | `DELETE /fornecedor/propostas/:id` | `propostas` DELETE (apenas `ENVIADA`, apenas do dono) |
| Editar perfil | `/fornecedor/minha-conta` | `GET` e `PATCH /fornecedor/perfil` | `usuarios` UPDATE + `fornecedores` UPDATE (transacao) |
| Alterar senha | `/fornecedor/minha-conta` | `PATCH /fornecedor/perfil` | `usuarios.senha_hash` (bcrypt) |

## 5. Arquivos

Criados:

- `src/Backend/pool.js`, `src/Backend/middlewares/auth.js`, `src/Backend/routes/fornecedor.js`
- `src/Backend/migrations/001_fornecedor_propostas.sql`, `src/Backend/.env.example`
- `src/Backend/tests/fornecedor.integration.test.js`
- `src/Frontend/src/services/fornecedor.js`, `src/Frontend/src/utils/fornecedor.js`, `src/Frontend/src/hooks/useCarregar.js`
- `src/Frontend/src/components/fornecedor/LayoutFornecedor.jsx`, `Componentes.jsx`
- `src/Frontend/src/pages/Fornecedor/` (7 paginas + `fornecedor.css`)

Modificados:

- `src/Backend/server.js`: middlewares movidos para `middlewares/auth.js`, montagem de `/fornecedor`, porta por `PORT`.
- `src/Backend/package.json`: scripts `start` e `test`.
- `src/Frontend/src/App.jsx`: rotas `/fornecedor/*`.
- `src/Frontend/src/components/organizador/RotaPrivada.jsx`: parametro `tipo` (padrao `ORGANIZADOR`).
- `src/Frontend/src/components/organizador/LayoutOrganizador.jsx`: props opcionais `perfil` e `menu` (padrao inalterado).
- `src/Frontend/src/pages/Login/Login.jsx`: fornecedor segue para `/fornecedor/dashboard`.

## 6. Como executar

```bash
# Banco
mysql -u root -p < Entrega-1/Projeto_em_banco_de_dados/schema.sql
mysql -u root -p trocaticket < src/Backend/migrations/001_fornecedor_propostas.sql

# Backend
cd src/Backend
cp .env.example .env        # ajuste DB_* e JWT_SECRET
npm install
npm start                   # http://localhost:3000

# Frontend
cd src/Frontend
npm install
npm run dev                 # usa VITE_API_URL ou http://localhost:3000
```

Aprovacao de cadastro: ainda nao existe tela de administrador. Para liberar um fornecedor recem-cadastrado:

```sql
UPDATE usuarios SET status = 'APROVADO' WHERE email = 'fornecedor@exemplo.com';
```

## 7. Como testar

Use um banco separado (nunca o de desenvolvimento): os testes criam e removem seus proprios registros.

```bash
mysql -u root -p -e "CREATE DATABASE trocaticket_test"
# aplique schema.sql e a migration 001 nesse banco (troque USE trocaticket por USE trocaticket_test)
cd src/Backend
cp .env.example .env.test   # DB_NAME=trocaticket_test, PORT=3100, JWT_SECRET=qualquer
node --env-file=.env.test server.js     # terminal 1
npm test                                # terminal 2
```

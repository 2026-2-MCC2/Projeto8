# Banco de Dados — TrocaTicket

## Objetivo

O banco de dados do TrocaTicket foi desenvolvido em MySQL para armazenar as principais informações utilizadas pela plataforma de planejamento e precificação de eventos.

A modelagem contempla usuários, organizadores, fornecedores, eventos, serviços, preços dos serviços e a associação entre eventos e serviços.

## Diagrama

![Diagrama do Banco de Dados](./diagrama-banco.pdf)

## Tabelas

### usuarios

Armazena os dados básicos dos usuários da plataforma.

- **PK:** `id`
- **UK:** `email`
- `nome`
- `telefone`
- `senha_hash`
- `tipo`
- `status`

Os tipos de usuário são:

- `ORGANIZADOR`
- `FORNECEDOR`
- `ADMINISTRADOR`

Os possíveis status são:

- `PENDENTE`
- `APROVADO`
- `REJEITADO`

### organizadores

Armazena os dados específicos dos usuários que possuem perfil de Organizador.

- **PK/FK:** `id_usuario` → `usuarios.id`
- `tipo_pessoa`
- **UK:** `documento`
- `data_nascimento`

O campo `tipo_pessoa` permite:

- `PF`
- `PJ`

### fornecedores

Armazena os dados específicos dos usuários que possuem perfil de Fornecedor.

- **PK/FK:** `id_usuario` → `usuarios.id`
- **UK:** `CNPJ`
- `categoria_atuacao`

### eventos

Armazena os eventos planejados pelos organizadores.

- **PK:** `id`
- **FK:** `id_organizador` → `organizadores.id_usuario`
- `nome`
- `descricao`
- `horario`
- `data_evento`
- `publico_min`
- `publico_max`
- `local`
- `status`

Os possíveis status do evento são:

- `PLANEJAMENTO`
- `CONFIRMADO`
- `CANCELADO`

### servicos

Armazena os serviços oferecidos pelos fornecedores.

- **PK:** `id`
- **FK:** `id_fornecedor` → `fornecedores.id_usuario`
- `nome`
- `descricao`
- `categoria`

### precos_servicos

Armazena os preços dos serviços de acordo com as faixas de público.

- **PK:** `id`
- **FK:** `id_servico` → `servicos.id`
- `preco`
- `publico_min`
- `publico_max`

Um mesmo serviço pode possuir diferentes faixas de preço conforme o público esperado.

### eventos_servicos

Relaciona eventos e serviços.

- **PK:** `id`
- **FK:** `id_evento` → `eventos.id`
- **FK:** `id_servico` → `servicos.id`
- `preco_aplicado`

Essa tabela permite o relacionamento muitos-para-muitos entre eventos e serviços.

## Relacionamentos

1. `usuarios` → `organizadores`  
   Um usuário pode possuir um cadastro de Organizador.

2. `usuarios` → `fornecedores`  
   Um usuário pode possuir um cadastro de Fornecedor.

3. `organizadores` → `eventos`  
   Um Organizador pode criar vários eventos.

4. `fornecedores` → `servicos`  
   Um Fornecedor pode cadastrar vários serviços.

5. `servicos` → `precos_servicos`  
   Um Serviço pode possuir várias faixas de preço.

6. `eventos` ↔ `servicos`  
   Eventos e serviços possuem relacionamento muitos-para-muitos, implementado pela tabela `eventos_servicos`.

## Regras e restrições

### Chaves únicas

- `usuarios.email`
- `organizadores.documento`
- `fornecedores.CNPJ`
- `eventos_servicos (id_evento, id_servico)`

A restrição composta em `eventos_servicos` impede que o mesmo serviço seja associado duas vezes ao mesmo evento.

### Restrições CHECK

A modelagem possui validações para garantir que:

```text
publico_min < publico_max
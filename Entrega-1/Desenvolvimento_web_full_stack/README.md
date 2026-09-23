# TicketLab — Desenvolvimento Web Full Stack

## Sobre o projeto

O TicketLab é uma plataforma desenvolvida para auxiliar na organização financeira de eventos universitários, conectando organizadores e fornecedores e permitindo o planejamento dos custos do evento.

Esta pasta contém o desenvolvimento do frontend da aplicação e sua integração com a API do TicketLab.

## Equipe

- Brian Walter
- Rafael Nhocanse
- Max Tocantins Quaglia

## Tecnologias

- React
- Vite
- JavaScript
- Node.js
- Express
- MySQL
- JWT
- Git/GitHub

## Pré-requisitos

Para executar o projeto, é necessário ter instalado:

- Node.js
- npm

## Como executar

### 1. Instalar as dependências do frontend

Abra um terminal dentro desta pasta:

```bash
npm install
```

### 2. Iniciar o backend

Abra um **segundo terminal** e acesse a pasta do backend:

```bash
cd ../../src/Backend
```

Instale as dependências:

```bash
npm install
```

Configure o arquivo `.env` conforme as configurações do ambiente e inicie o servidor:

```bash
node server.js
```

O backend será executado na porta `3000`.

### 3. Iniciar o frontend

Volte ao terminal do frontend, que deve estar na pasta:

```text
Entrega-1/Desenvolvimento_web_full_stack
```

Execute:

```bash
npm run dev
```

Após iniciar, o Vite exibirá no terminal o endereço local da aplicação.

## Modo Demonstração

O projeto possui um **Modo Demonstração** para facilitar a avaliação da aplicação.

Esse modo permite acessar o fluxo principal do Organizador sem necessidade de utilizar uma conta real ou de configurar o banco de dados MySQL para iniciar a demonstração.

### Para utilizar

1. Inicie o backend.
2. Inicie o frontend.
3. Acesse a aplicação pelo endereço informado pelo Vite.
4. Utilize o acesso ao **Modo Demonstração** disponibilizado na aplicação.

O modo demonstração utiliza dados próprios para apresentação e não requer uma conta real de usuário.

## Funcionalidades desenvolvidas

- Login
- Cadastro de organizador
- Cadastro de fornecedor
- Dashboard do organizador
- Criação de eventos
- Visualização de eventos
- Navegação entre telas
- Modo Demonstração
- Integração entre frontend e backend
- Integração com banco de dados

## Observação

Para avaliação da aplicação, recomenda-se utilizar o **Modo Demonstração** quando não houver uma configuração do banco de dados disponível no ambiente de execução.

A configuração do banco de dados e sua documentação estão disponíveis na pasta correspondente da Entrega 1.

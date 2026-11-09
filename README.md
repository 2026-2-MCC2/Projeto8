# FECAP — Fundação de Comércio Álvares Penteado

<p align="center">
  <a href="https://www.fecap.br/">
    <img src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRhZPrRa89Kma0ZZogxm0pi-tCn_TLKeHGVxywp-LXAFGR3B1DPouAJYHgKZGV0XTEf4AE&usqp=CAU"
         alt="FECAP — Fundação de Comércio Álvares Penteado"
         border="0">
  </a>
</p>

# TicketLab

## Projeto Interdisciplinar — Ciência da Computação

**Integrantes:** [Brian Walter](https://github.com/Brian-Walter), [Max Tocantins Quaglia](https://github.com/maxtq) e [Rafael Nhoncanse](https://github.com/Rafael1285).

**Professores orientadores:** [Cristina Machado Corrêa Leite](https://www.linkedin.com/in/cristina-machado-corr%C3%AAa-leite-630309160/), [David de Oliveira Lemes](https://www.linkedin.com/in/dolemes/), [Francisco de Souza Escobar](https://www.linkedin.com/in/francisco-escobar/), [Jésus Gomes](https://www.linkedin.com/in/j%C3%A9sus-gomes-83b769108/) e [Kátia Bossi](https://www.linkedin.com/in/katia-bossi/).

Projeto desenvolvido no curso de Ciência da Computação da FECAP.

---

## Descrição

<p align="center">
  <img src="./imagens/previa-prototipo.png"
       alt="Tela inicial do protótipo do TicketLab"
       width="800">
  <br>
  <em>Tela inicial do protótipo da plataforma TicketLab.</em>
</p>

O **TicketLab** é uma plataforma web desenvolvida como Projeto Interdisciplinar do curso de Ciência da Computação da FECAP. Seu objetivo é auxiliar na **organização financeira e no planejamento de eventos universitários**, conectando organizadores e fornecedores em um único ambiente.

A plataforma contempla três perfis de usuário:

- **Organizador:** cadastra eventos, organiza custos e acompanha as propostas recebidas.
- **Fornecedor:** consulta oportunidades e envia propostas para os serviços solicitados.
- **Administrador:** gerencia usuários, analisa solicitações de cadastro e acompanha informações do sistema.

Com os custos consolidados, o público previsto e a margem de lucro definida pelo organizador, o sistema permite estimar o valor necessário do ingresso para o evento.

Para o escopo do projeto, cada evento possui apenas um tipo de ingresso. O MVP não realiza venda de ingressos nem processamento de pagamentos: seu foco é o planejamento, a cotação de fornecedores e a estimativa do valor do ticket.

## Funcionalidades

| ID | Requisito funcional | Descrição |
| --- | --- | --- |
| RF01 | Autocadastro de Organizador | Permite que um organizador crie uma conta, inicialmente pendente de análise administrativa. |
| RF02 | Autocadastro de Fornecedor | Permite que um fornecedor realize seu cadastro e aguarde aprovação. |
| RF03 | Aprovação de cadastros | Permite ao administrador aprovar ou rejeitar usuários cadastrados. |
| RF04 | Autenticação e perfis | Controla o acesso conforme os perfis de Administrador, Organizador e Fornecedor. |
| RF05 | Cadastro de eventos | Permite ao organizador cadastrar informações e características do evento. |
| RF06 | Itens de composição de custo | Permite organizar serviços e produtos que compõem o orçamento do evento. |
| RF07 | Custos do evento | Permite registrar custos operacionais e outros custos não provenientes de propostas. |
| RF08 | Publicação para cotação | Disponibiliza eventos e itens para fornecedores aprovados. |
| RF09 | Consulta de eventos | Permite que fornecedores consultem eventos disponíveis para envio de propostas. |
| RF10 | Envio de propostas | Permite que fornecedores enviem propostas vinculadas aos itens dos eventos. |
| RF11 | Comparação de propostas | Permite ao organizador comparar as propostas recebidas. |
| RF12 | Consolidação do orçamento | Permite selecionar propostas e consolidar os custos do evento. |
| RF13 | Cálculo do ticket | Estima o valor do ingresso com base nos custos, no público e na margem definida. |
| RF14 | Visão administrativa | Permite consultas e acompanhamento gerencial das informações do sistema. |

### Cálculo do ticket

O cálculo considera a margem definida sobre a receita:

```text
Ticket = Custo Total / [Público × (1 − Margem)]
```

O sistema deve validar os valores informados para evitar cálculos com dados inválidos.

## Estrutura de pastas

A estrutura abaixo destaca os diretórios principais do repositório e evita listar arquivos gerados ou dependências instaladas localmente.

```text
Projeto8/
│
├── documentos/
│   ├── Entrega-1/
│   │   ├── Calculo-II/
│   │   ├── Desenvolvimento_web_full_stack/
│   │   ├── Gestao_empresarial_e_dinamicas_das_organizacoes/
│   │   ├── Projeto_em_banco_de_dados/
│   │   └── Projeto_Interdisciplinar_programacao_web/
│   │
│   ├── Entrega-2/
│   │   ├── Calculo_II/
│   │   ├── Desenvolvimento_web_full_stack/
│   │   ├── Gestao_empresarial_e_dinamicas_das_organizacoes/
│   │   ├── Projeto_em_banco_de_dados/
│   │   └── Projeto_Interdisciplinar_programacao_web/
│   │
│   └── tecnicos/
│       └── MODO_DEMONSTRACAO.md
│
├── imagens/
│   └── previa-prototipo.png
│
├── src/
│   ├── Backend/
│   └── Frontend/
│
└── README.md
```

### Organização das principais pastas

**`documentos/`**  
Reúne os materiais acadêmicos, documentos e entregas produzidos ao longo do desenvolvimento do TicketLab.

**`documentos/Entrega-1/` e `documentos/Entrega-2/`**  
Organizam os materiais de cada etapa do projeto por disciplina, incluindo documentos de Cálculo II, Desenvolvimento Web Full Stack, Gestão Empresarial, Projeto em Banco de Dados e Projeto Interdisciplinar.

**`documentos/tecnicos/`**  
Contém documentação técnica complementar, incluindo instruções do Modo Demonstração e informações do módulo de Fornecedor.

**`imagens/`**  
Armazena imagens utilizadas na documentação e apresentação do projeto.

**`src/Backend/`**  
Contém a API desenvolvida com Node.js e Express, incluindo rotas, autenticação, regras de negócio, integração com MySQL e testes.

**`src/Frontend/`**  
Contém a aplicação web desenvolvida com React e Vite, incluindo páginas, componentes, recursos visuais e serviços de comunicação com a API.

**`backup_antes_001.sql`**  
Arquivo de backup do banco de dados mantido na raiz do repositório.

## Banco de Dados

O TicketLab utiliza **MySQL** como sistema de gerenciamento de banco de dados.

A documentação da modelagem e os arquivos relacionados estão disponíveis em:

- [Projeto em Banco de Dados — Entrega 1](./documentos/Entrega-1/Projeto_em_banco_de_dados/)
- [Diagrama do Banco de Dados (PDF)](./documentos/Entrega-1/Projeto_em_banco_de_dados/diagrama-banco.pdf)
- [Script de criação do banco (schema.sql)](./documentos/Entrega-1/Projeto_em_banco_de_dados/schema.sql)

Entre as principais entidades do sistema estão:

- Usuários
- Organizadores
- Fornecedores
- Eventos
- Serviços
- Preços de serviços
- Serviços associados aos eventos

## Protótipo

O protótipo navegável do TicketLab foi desenvolvido utilizando o **Bolt** e apresenta os principais fluxos e telas previstos para os perfis de Administrador, Organizador e Fornecedor.

- [Acessar o protótipo do TicketLab](https://bolt.new/p/71361906)

## Aplicação

A aplicação está organizada em frontend e backend.

| Camada | Tecnologia principal | Responsabilidade |
| --- | --- | --- |
| Frontend | React + Vite | Interface e interação com o usuário. |
| Backend | Node.js + Express | API, autenticação e regras de negócio. |
| Banco de dados | MySQL | Persistência dos dados da aplicação. |

### Estado atual do desenvolvimento

O projeto possui ambiente de frontend e backend, integração com MySQL e Modo Demonstração.

No fluxo real integrado ao backend, já foram validadas a criação e a listagem de eventos, além das informações de eventos exibidas no dashboard do Organizador. Outras telas do módulo Organizador ainda podem utilizar dados demonstrativos ou estar em etapa de integração; portanto, a existência de uma tela na interface não significa necessariamente que todo o seu fluxo esteja conectado ao banco de dados.

O Modo Demonstração permite apresentar fluxos com dados temporários em memória. Ele não deve ser confundido com a autenticação e a persistência de dados do ambiente real. Consulte a [documentação técnica do Modo Demonstração](./documentos/tecnicos/MODO_DEMONSTRACAO.md).

### Ambientes publicados

- **Frontend:** [Acessar TicketLab](https://velvety-puppy-1dcdf0.netlify.app)
- **Backend:** [API TicketLab no Railway](https://ticketlab-backend-production.up.railway.app)

## Instalação e execução local

### Requisitos

- [Node.js](https://nodejs.org/)
- npm
- [Git](https://git-scm.com/)
- [MySQL](https://dev.mysql.com/downloads/)
- Editor de código, como [Visual Studio Code](https://code.visualstudio.com/)

### 1. Clonar o repositório

```bash
git clone https://github.com/2026-2-MCC2/Projeto8.git
cd Projeto8
```

### 2. Configurar o Backend

Acesse a pasta do backend:

```bash
cd src/Backend
```

Instale as dependências:

```bash
npm install
```

Crie o arquivo `.env` com as variáveis necessárias para a conexão com o MySQL e para a autenticação JWT. Use o arquivo `.env.example` como referência, quando disponível. **Não compartilhe nem versione credenciais ou segredos do ambiente.**

Depois de configurar o banco e as variáveis de ambiente, inicie a API:

```bash
node server.js
```

A porta utilizada é definida pela configuração do backend. Verifique a mensagem exibida no terminal para confirmar o endereço local.

### 3. Configurar o Frontend

Abra outro terminal na raiz do projeto e acesse:

```bash
cd src/Frontend
```

Instale as dependências:

```bash
npm install
```

Inicie o servidor de desenvolvimento:

```bash
npm run dev
```

O Vite exibirá no terminal o endereço local para acessar a aplicação, normalmente `http://localhost:5173`.

## Modo Demonstração

O TicketLab possui um **Modo Demonstração** para facilitar a apresentação e a avaliação dos fluxos da plataforma sem depender de uma conta real para esse ambiente demonstrativo.

Para utilizar:

1. Inicie o backend.
2. Inicie o frontend.
3. Acesse a aplicação pelo endereço informado pelo Vite.
4. Selecione a opção **Modo Demonstração** na interface.

Os dados demonstrativos são temporários e mantidos em memória enquanto o processo do backend estiver em execução. Eles não representam registros persistidos no banco de dados do ambiente real.

Consulte os detalhes, perfis disponíveis, limitações e endpoints na [documentação técnica do Modo Demonstração](./documentos/tecnicos/MODO_DEMONSTRACAO.md).

## Tecnologias

### Frontend

- React
- React Router
- Vite
- JavaScript
- CSS

### Backend

- Node.js
- Express
- JSON Web Token (JWT)
- bcrypt
- mysql2

### Banco de Dados

- MySQL
- MySQL Workbench

### Desenvolvimento e documentação

- Git
- GitHub
- Postman
- Bolt
- Visual Studio Code

## Documentação do projeto

Os materiais acadêmicos e técnicos estão organizados por etapa e disciplina.

### Entrega 1

- [Cálculo II](./documentos/Entrega-1/Calculo-II/)
- [Gestão Empresarial e Dinâmicas das Organizações](./documentos/Entrega-1/Gestao_empresarial_e_dinamicas_das_organizacoes/)
- [Desenvolvimento Web Full Stack](./documentos/Entrega-1/Desenvolvimento_web_full_stack/)
- [Projeto em Banco de Dados](./documentos/Entrega-1/Projeto_em_banco_de_dados/)
- [Projeto Interdisciplinar — Programação Web](./documentos/Entrega-1/Projeto_Interdisciplinar_programacao_web/)

### Entrega 2

- [Cálculo II](./documentos/Entrega-2/Calculo_II/)
- [Gestão Empresarial e Dinâmicas das Organizações](./documentos/Entrega-2/Gestao_empresarial_e_dinamicas_das_organizacoes/)
- [Desenvolvimento Web Full Stack](./documentos/Entrega-2/Desenvolvimento_web_full_stack/)
- [Projeto em Banco de Dados](./documentos/Entrega-2/Projeto_em_banco_de_dados/)
- [Projeto Interdisciplinar — Programação Web](./documentos/Entrega-2/Projeto_Interdisciplinar_programacao_web/)

### Código-fonte

- [Frontend](./src/Frontend/)
- [Backend](./src/Backend/)

## Equipe

| Integrante |
| --- |
| Brian Walter |
| Max Tocantins Quaglia |
| Rafael Nhoncanse |

## Licença

Este projeto foi desenvolvido para fins acadêmicos no âmbito do curso de Ciência da Computação da FECAP. Não há, nesta documentação, indicação de uma licença de distribuição específica.

## Referências

1. [React](https://react.dev/)
2. [Vite](https://vite.dev/)
3. [Express](https://expressjs.com/)
4. [MySQL](https://dev.mysql.com/doc/)
5. [Node.js](https://nodejs.org/)
6. [Git](https://git-scm.com/)
7. [Bolt](https://bolt.new/)
8. [Postman](https://www.postman.com/)

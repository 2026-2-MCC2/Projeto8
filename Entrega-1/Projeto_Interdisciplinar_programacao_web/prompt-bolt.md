Quero criar um protótipo web completo, moderno, profissional e altamente interativo chamado TROCATICKET.

IMPORTANTE:
Este projeto é um PROTÓTIPO FRONTEND para apresentação acadêmica. Não preciso de backend real, banco de dados real, autenticação real ou pagamentos reais neste momento.

Quero uma aplicação navegável e visualmente refinada, usando dados mockados, mas com aparência e comportamento de um produto real.

==================================================
1. OBJETIVO DO TROCATICKET
==================================================

O TrocaTicket é uma plataforma web para planejamento e gestão financeira de eventos.

A plataforma ajuda organizadores a:

- criar eventos;
- definir data, local e público esperado;
- organizar custos;
- encontrar fornecedores e serviços;
- consultar oportunidades;
- receber e comparar propostas;
- selecionar serviços;
- consolidar custos;
- calcular uma estimativa de preço do ingresso.

A plataforma possui três perfis principais:

1. ORGANIZADOR
2. FORNECEDOR
3. ADMINISTRADOR

O foco do protótipo é mostrar claramente como esses três perfis utilizariam a plataforma.

Não criar funcionalidades de venda de ingressos ou pagamento real.
O TrocaTicket é focado no planejamento, orçamento, fornecedores e cálculo estimado do ticket.

==================================================
2. TECNOLOGIAS
==================================================

Utilize:

- React
- Vite
- JavaScript ou TypeScript
- React Router
- Tailwind CSS ou CSS modular bem organizado
- Componentização adequada
- Dados mockados locais
- Ícones através de uma biblioteca apropriada, como Lucide React

A aplicação deve ser organizada e fácil de entender.

Não criar backend.

Não criar APIs externas.

Não depender de serviços pagos.

Toda a experiência deve funcionar localmente.

==================================================
3. IDENTIDADE VISUAL
==================================================

A identidade visual deve ser moderna, tecnológica, profissional e agradável.

Utilize a LOGO OFICIAL DO TROCATICKET que será enviada junto ao projeto.

O arquivo da logo estará disponível como:

/public/logo_navbar_web.webp

NÃO recrie a logo com texto.
NÃO substitua a logo por outra imagem.
Utilize exatamente o arquivo fornecido.

A identidade visual deve utilizar principalmente:

- azul/índigo/roxo como cor principal;
- branco;
- tons muito claros de cinza;
- cinza escuro para textos;
- verde para estados positivos;
- amarelo/laranja para avisos;
- vermelho para ações destrutivas.

Estilo visual:

- moderno;
- clean;
- profissional;
- cards arredondados;
- sombras suaves;
- bastante espaço em branco;
- tipografia moderna;
- hierarquia visual clara;
- microinterações;
- transições suaves;
- hover states;
- botões com feedback visual;
- responsividade completa.

Evitar aparência genérica de template.

Quero que pareça um produto SaaS moderno.

==================================================
4. HOME PAGE
==================================================

A Home é MUITO IMPORTANTE.

Ela deve ser uma página pública extremamente bonita e interativa, capaz de chamar a atenção de alguém que nunca conheceu o TrocaTicket.

Não quero uma Home genérica.

Criar:

Navbar:

- logo TrocaTicket à esquerda;
- Início;
- Como funciona;
- Serviços;
- Sobre;
- botão "Entrar";
- botão principal "Começar agora".

A navbar deve ficar elegante e ter comportamento sticky durante o scroll.

------------------------------------------
HERO
------------------------------------------

Criar um hero moderno com uma frase forte:

"Planeje seu evento.
Encontre os serviços.
Saiba quanto seu ingresso precisa custar."

Subtexto:

"Organize eventos, encontre fornecedores, compare propostas e tenha uma visão clara dos seus custos em um só lugar."

Botões:

"Começar agora"
"Explorar a plataforma"

Ao lado do texto, NÃO colocar apenas uma imagem estática.

Criar uma representação visual interativa do sistema.

Pode ser um dashboard/simulador estilizado mostrando:

- evento;
- público;
- serviços;
- custos;
- ticket estimado.

Adicionar pequenas animações e elementos flutuantes.

------------------------------------------
SIMULADOR INTERATIVO
------------------------------------------

Criar uma seção chamada:

"Comece a planejar seu evento"

O usuário deve conseguir interagir com:

Tipo de evento:
- Festa universitária
- Festival
- Evento corporativo
- Show

Público esperado:

slider entre 100 e 2000 pessoas.

Serviços:

- DJ
- Decoração
- Segurança
- Fotografia
- Som
- Iluminação
- Efeitos especiais

Ao selecionar/desselecionar serviços ou alterar o público, atualizar visualmente:

- quantidade de serviços;
- custo estimado;
- custo por pessoa;
- ticket estimado.

Utilizar valores MOCKADOS coerentes.

A fórmula de estimativa do ticket deve ser:

Ticket = Custo Total / [Público × (1 − Margem)]

Utilizar uma margem configurável no protótipo.

Mostrar os números com animações suaves.

Adicionar uma indicação:

"Simulação demonstrativa"

para deixar claro que os valores são fictícios.

------------------------------------------
COMO FUNCIONA
------------------------------------------

Criar seção:

"Do planejamento ao seu evento"

Mostrar 3 passos:

01
Crie seu evento

"Defina data, local, público e informações principais."

02
Encontre e compare serviços

"Encontre fornecedores e organize propostas para seu evento."

03
Calcule seu ticket

"Tenha uma estimativa dos custos e do valor necessário do ingresso."

Utilizar cards ou uma timeline moderna.

------------------------------------------
SERVIÇOS
------------------------------------------

Criar seção:

"Tudo o que seu evento precisa"

Cards interativos para:

- Música
- Decoração
- Segurança
- Fotografia
- Som e iluminação
- Entretenimento

Cards devem possuir:

- ícone;
- título;
- descrição;
- hover;
- pequena animação.

------------------------------------------
PROBLEMA / SOLUÇÃO
------------------------------------------

Criar uma seção visual mostrando:

ANTES:

- planilhas;
- mensagens;
- anotações;
- vários fornecedores;
- cálculos separados.

DEPOIS:

TrocaTicket

Evento
↓
Serviços
↓
Custos
↓
Propostas
↓
Consolidação
↓
Ticket estimado

Essa seção deve explicar visualmente o valor da plataforma.

------------------------------------------
CTA
------------------------------------------

Criar uma seção final:

"Seu próximo evento começa aqui."

"Planeje, organize e tome decisões com mais clareza."

Botão:

"Criar meu evento"

------------------------------------------
FOOTER
------------------------------------------

Footer profissional contendo:

- logo;
- descrição curta;
- links;
- Produto;
- Empresa;
- Suporte;
- direitos reservados.

==================================================
5. LOGIN
==================================================

Criar tela de Login.

Elementos:

- logo;
- email;
- senha;
- mostrar/ocultar senha;
- lembrar-me;
- botão Entrar;
- esqueci minha senha;
- link para cadastro.

Como é protótipo, o login deve aceitar dados mockados.

Criar usuários demonstrativos:

Organizador:
organizador@trocaticket.com

Fornecedor:
fornecedor@trocaticket.com

Administrador:
admin@trocaticket.com

Senha demonstrativa:

123456

Ao entrar, direcionar para o dashboard correspondente ao perfil.

Também criar uma opção visual discreta para:

"Entrar como demonstração"

ou permitir escolher o perfil apenas para facilitar a apresentação acadêmica.

==================================================
6. CADASTRO
==================================================

Criar tela:

"Como você deseja utilizar o TrocaTicket?"

Cards:

ORGANIZADOR
"Planeje eventos, organize custos e encontre fornecedores."

FORNECEDOR
"Ofereça seus serviços e encontre novas oportunidades."

Cada card deve possuir botão para continuar.

------------------------------------------
CADASTRO ORGANIZADOR
------------------------------------------

Campos:

- nome;
- telefone;
- email;
- senha;
- confirmar senha;
- tipo de pessoa: PF/PJ.

Se PF:

- CPF;
- data de nascimento.

Se PJ:

- CNPJ.

Criar validações visuais.

Mostrar mensagens de erro.

Mostrar estado de sucesso.

Depois do cadastro:

"Cadastro enviado para aprovação."

------------------------------------------
CADASTRO FORNECEDOR
------------------------------------------

Campos:

- nome;
- telefone;
- email;
- senha;
- confirmar senha;
- CNPJ;
- categoria de atuação.

Categorias:

- Música
- Decoração
- Segurança
- Fotografia
- Som
- Iluminação
- Entretenimento
- Outros

Mostrar mensagem:

"Cadastro enviado para aprovação."

==================================================
7. ORGANIZADOR
==================================================

Criar layout interno para o Organizador.

Sidebar moderna com:

- logo;
- Dashboard;
- Meus eventos;
- Buscar serviços;
- Cotações;
- Resumo de custos;
- Cálculo do ticket;
- Minha conta;
- Sair.

Sidebar deve funcionar responsivamente.

No mobile, transformar em menu/drawer.

------------------------------------------
DASHBOARD DO ORGANIZADOR
------------------------------------------

Criar dashboard moderno.

Header:

"Olá, Brian!"

"Tenha uma visão geral dos seus eventos e acompanhe seu planejamento."

Cards:

Eventos em planejamento
2

Eventos confirmados
1

Eventos concluídos
1

Criar seção "Meus eventos".

Mostrar:

Festa da Computação
15/10/2026
300–500 pessoas
Em planejamento

Choppada Universitária
20/11/2026
500–800 pessoas
Em planejamento

Criar seção:

"Ações rápidas"

Botões:

+ Criar evento
Buscar serviços
Ver cotações

Adicionar pequenos gráficos/cards de resumo financeiro quando fizer sentido.

------------------------------------------
MEUS EVENTOS
------------------------------------------

Criar tela completa.

Header:

"Meus eventos"

Descrição:

"Gerencie os eventos que você está planejando e acompanhe seus respectivos custos e cotações."

Botão:

"+ Criar novo evento"

Adicionar:

- busca;
- filtro por status;
- cards/lista de eventos.

Status:

- Em planejamento
- Confirmado
- Cancelado
- Concluído

Quando não houver eventos para o filtro:

"Nenhum evento encontrado"

------------------------------------------
CRIAR EVENTO
------------------------------------------

Criar formulário completo.

Campos:

- nome do evento;
- descrição;
- data;
- horário;
- local;
- público mínimo;
- público máximo;
- status.

Exemplo:

Festa da Computação

Data:
15/10/2026

Horário:
22:00

Local:
São Paulo

Público:
300–500

Criar validações.

Após salvar:

mostrar feedback visual de sucesso e adicionar o evento aos dados mockados.

------------------------------------------
DETALHES DO EVENTO
------------------------------------------

Criar página de detalhes.

Mostrar:

- nome;
- data;
- horário;
- local;
- público;
- status;
- descrição.

Mostrar resumo financeiro:

Custo atual
R$ 18.450

Serviços selecionados
6

Ticket estimado
R$ 46,13

Criar abas:

Visão geral
Custos
Serviços
Cotações

------------------------------------------
CUSTOS DO EVENTO
------------------------------------------

Criar tela para organização dos custos.

Categorias:

- fornecedores;
- estrutura;
- decoração;
- segurança;
- alimentação;
- outros.

Mostrar tabela:

Item
Categoria
Valor
Status

Adicionar:

"+ Adicionar custo"

Criar modal para adicionar custo.

Atualizar total automaticamente.

------------------------------------------
BUSCAR SERVIÇOS
------------------------------------------

Criar catálogo visual de fornecedores/serviços.

Cards contendo:

- nome;
- categoria;
- descrição;
- faixa de preço;
- faixa de público;
- localização;
- botão "Ver serviço".

Filtros:

- categoria;
- faixa de preço;
- público;
- localização.

Adicionar busca.

------------------------------------------
DETALHE DO SERVIÇO
------------------------------------------

Mostrar:

- nome do fornecedor;
- categoria;
- descrição;
- serviço;
- faixa de público;
- preço;
- informações adicionais.

Botão:

"Solicitar cotação"

------------------------------------------
COTAÇÕES
------------------------------------------

Criar dashboard de cotações.

Mostrar:

- evento;
- serviço;
- fornecedor;
- proposta;
- status.

Status:

- Aguardando
- Recebida
- Em análise
- Selecionada
- Recusada

------------------------------------------
PROPOSTAS
------------------------------------------

Criar tela para visualizar propostas recebidas.

Cada proposta deve mostrar:

Fornecedor
Serviço
Valor
Prazo
Observações

Botões:

"Ver proposta"
"Selecionar"
"Recusar"

------------------------------------------
COMPARAÇÃO
------------------------------------------

Criar uma tela de comparação de propostas.

Mostrar tabela comparativa:

Fornecedor
Serviço
Valor
Público
Observações

Permitir selecionar uma proposta.

Destacar visualmente a proposta selecionada.

------------------------------------------
RESUMO DE CUSTOS
------------------------------------------

Criar dashboard financeiro.

Mostrar:

Custo de serviços
Custos adicionais
Custo total
Público estimado
Custo por pessoa

Adicionar gráfico de distribuição de custos.

Usar dados mockados.

------------------------------------------
CÁLCULO DO TICKET
------------------------------------------

Criar uma tela muito visual.

Mostrar:

Custo total
Público esperado
Margem desejada
Ticket estimado

Adicionar slider ou input para margem.

Exemplo:

Custo total:
R$ 18.450

Público:
500

Margem:
20%

Ticket estimado:
R$ 46,13

Usar a fórmula:

Ticket = Custo Total / [Público × (1 − Margem)]

Atualizar o resultado em tempo real.

Adicionar explicação visual da fórmula.

==================================================
8. FORNECEDOR
==================================================

Criar layout próprio para fornecedor.

Sidebar:

- Dashboard
- Meu perfil
- Meus serviços
- Oportunidades
- Minhas propostas
- Minha conta
- Sair

------------------------------------------
DASHBOARD FORNECEDOR
------------------------------------------

Cards:

Oportunidades disponíveis
Propostas enviadas
Propostas aceitas
Serviços cadastrados

Mostrar oportunidades recentes.

------------------------------------------
MEUS SERVIÇOS
------------------------------------------

Criar tela para fornecedor cadastrar e administrar serviços.

Cada serviço deve mostrar:

- nome;
- categoria;
- descrição;
- preço;
- público mínimo;
- público máximo;
- status.

Botão:

"+ Novo serviço"

------------------------------------------
CRIAR SERVIÇO
------------------------------------------

Campos:

- nome;
- descrição;
- categoria;
- preço;
- público mínimo;
- público máximo.

Criar validação.

------------------------------------------
OPORTUNIDADES
------------------------------------------

Mostrar eventos disponíveis para fornecedores.

Cards:

Nome do evento
Data
Local
Público esperado
Categoria solicitada

Botão:

"Ver oportunidade"

------------------------------------------
DETALHE DA OPORTUNIDADE
------------------------------------------

Mostrar:

- evento;
- organizador;
- data;
- local;
- público;
- serviço solicitado;
- informações adicionais.

Botão:

"Enviar proposta"

------------------------------------------
ENVIAR PROPOSTA
------------------------------------------

Criar formulário:

- serviço;
- valor;
- prazo;
- observações.

Botão:

"Enviar proposta"

Mostrar confirmação.

------------------------------------------
MINHAS PROPOSTAS
------------------------------------------

Lista de propostas.

Status:

- Enviada
- Em análise
- Selecionada
- Recusada

==================================================
9. ADMINISTRADOR
==================================================

Criar layout próprio para administrador.

Sidebar:

- Dashboard
- Aprovar cadastros
- Usuários
- Eventos
- Relatórios
- Minha conta
- Sair

------------------------------------------
DASHBOARD ADMINISTRADOR
------------------------------------------

Cards:

Usuários
Organizadores
Fornecedores
Eventos
Propostas

Mostrar atividade recente.

------------------------------------------
APROVAÇÃO DE CADASTROS
------------------------------------------

Criar tela com usuários pendentes.

Tabela:

Nome
Email
Tipo
Data
Status

Botões:

"Aprovar"
"Rejeitar"
"Ver detalhes"

Mostrar modal de confirmação.

------------------------------------------
USUÁRIOS
------------------------------------------

Mostrar:

Nome
Email
Tipo
Status

Filtros:

Organizador
Fornecedor
Administrador

Status:

Pendente
Aprovado
Rejeitado

------------------------------------------
EVENTOS
------------------------------------------

Mostrar eventos da plataforma.

Filtros por status.

------------------------------------------
RELATÓRIOS
------------------------------------------

Criar uma tela visual com dados mockados.

Mostrar:

- total de eventos;
- eventos por status;
- fornecedores;
- propostas;
- custos.

Adicionar gráficos simples.

==================================================
10. NAVEGAÇÃO
==================================================

TODAS as telas precisam ser navegáveis.

Não criar botões que não fazem nada.

Todos os principais botões devem levar a alguma tela, modal ou feedback.

Criar rotas usando React Router.

Rotas públicas:

/
 /login
 /cadastro
 /cadastro/organizador
 /cadastro/fornecedor

Organizador:

/organizador/dashboard
/organizador/eventos
/organizador/eventos/novo
/organizador/eventos/:id
/organizador/eventos/:id/custos
/organizador/servicos
/organizador/cotacoes
/organizador/propostas
/organizador/comparacao
/organizador/resumo-custos
/organizador/calculo-ticket
/organizador/minha-conta

Fornecedor:

/fornecedor/dashboard
/fornecedor/servicos
/fornecedor/servicos/novo
/fornecedor/oportunidades
/fornecedor/oportunidades/:id
/fornecedor/propostas
/fornecedor/minha-conta

Administrador:

/admin/dashboard
/admin/aprovacoes
/admin/usuarios
/admin/eventos
/admin/relatorios
/admin/minha-conta

Criar também:

/404

Página:

"Página não encontrada"

Botão:

"Voltar para o início"

==================================================
11. DADOS MOCKADOS
==================================================

Utilizar dados realistas.

Eventos:

1.
Festa da Computação
15/10/2026
São Paulo
300–500
Em planejamento

2.
Choppada Universitária
20/11/2026
São Paulo
500–800
Em planejamento

Criar fornecedores fictícios como:

Pulse Eventos
Lumi Decor
SoundWave Produções
SafeFest Segurança
Click Moments

Criar serviços e propostas fictícias para demonstrar os fluxos.

Os dados devem parecer consistentes entre as telas.

Por exemplo:

Se uma proposta for selecionada, ela deve aparecer no resumo de custos.

Se um serviço for adicionado a um evento, o custo total deve mudar.

Se o público ou margem mudar no cálculo do ticket, o resultado deve mudar.

==================================================
12. INTERAÇÕES IMPORTANTES
==================================================

Quero uma aplicação realmente interativa.

Implementar:

- hover states;
- transições;
- modais;
- dropdowns;
- filtros;
- busca;
- tabs;
- sliders;
- formulários;
- validação;
- mensagens de sucesso;
- mensagens de erro;
- estados vazios;
- loading states simulados;
- tooltips quando fizer sentido;
- animações suaves;
- cards interativos.

Evitar animações exageradas.

A interface deve parecer profissional.

==================================================
13. RESPONSIVIDADE
==================================================

O projeto precisa funcionar em:

- desktop;
- notebook;
- tablet;
- celular.

No desktop:

sidebar fixa ou bem estruturada.

No mobile:

sidebar deve virar menu/drawer.

Tabelas devem possuir comportamento responsivo.

Cards devem reorganizar automaticamente.

A Home deve ser totalmente responsiva.

==================================================
14. ACESSIBILIDADE
==================================================

Utilizar:

- HTML semântico;
- labels;
- aria-label quando necessário;
- foco visível;
- contraste adequado;
- botões reais;
- navegação por teclado quando possível.

==================================================
15. UX
==================================================

A experiência precisa ser intuitiva.

O usuário nunca deve ficar sem saber:

- onde está;
- o que pode fazer;
- qual ação acabou de executar;
- se uma operação funcionou;
- como voltar.

Adicionar breadcrumbs nas telas internas quando fizer sentido.

Adicionar confirmações para ações importantes.

==================================================
16. VISUAL DA APLICAÇÃO
==================================================

Quero que a aplicação tenha aparência de produto SaaS profissional.

Referência estética:

- dashboards modernos;
- cards limpos;
- bordas arredondadas;
- sombras discretas;
- gradientes sutis;
- azul/índigo/roxo;
- animações suaves;
- tipografia moderna.

Não exagerar em gradientes.

Não utilizar visual infantil.

Não utilizar excesso de emojis.

Utilizar ícones profissionais.

Não criar uma interface genérica de "AI generated website".

Quero uma identidade visual própria para o TrocaTicket.

==================================================
17. HOME — EXPERIÊNCIA PREMIUM
==================================================

A Home deve ser a parte mais impactante do projeto.

Adicionar pequenas animações de entrada ao fazer scroll.

Elementos podem aparecer suavemente.

O simulador deve ser o destaque da Home.

Quando o usuário interagir com o slider de público:

300 pessoas
→ atualizar números

500 pessoas
→ atualizar números

800 pessoas
→ atualizar números

Quando adicionar/remover serviços:

→ atualizar custo total

→ atualizar custo por pessoa

→ atualizar ticket estimado

Mostrar uma pequena animação numérica quando os valores mudarem.

Isso deve funcionar de verdade no frontend.

==================================================
18. ESTADOS
==================================================

Criar:

Loading state
Empty state
Error state
Success state

Exemplo:

"Nenhum evento encontrado"

"Nenhuma proposta recebida"

"Nenhum fornecedor encontrado"

"Cadastro enviado com sucesso"

"Proposta enviada com sucesso"

==================================================
19. IMPORTANTE SOBRE ESCOPO
==================================================

NÃO criar:

- pagamentos reais;
- venda de ingressos;
- integração bancária;
- marketplace real;
- backend;
- banco de dados real;
- APIs externas;
- sistema de email real.

Tudo deve ser demonstrativo/mockado.

O objetivo é apresentar a experiência e o fluxo do produto.

==================================================
20. ORGANIZAÇÃO DO CÓDIGO
==================================================

Organizar componentes reutilizáveis.

Criar estrutura semelhante a:

src/
  components/
  layouts/
  pages/
  data/
  hooks/
  utils/
  assets/
  routes/

Criar componentes reutilizáveis para:

- Button
- Card
- Modal
- Input
- Select
- Badge
- Sidebar
- Navbar
- Table
- EmptyState
- LoadingState
- StatCard

Não duplicar componentes desnecessariamente.

==================================================
21. FINALIZAÇÃO
==================================================

Depois de construir tudo:

1. Verifique todas as rotas.
2. Verifique todos os links.
3. Verifique os botões.
4. Verifique os formulários.
5. Verifique os filtros.
6. Verifique o simulador da Home.
7. Verifique o cálculo do ticket.
8. Verifique a responsividade.
9. Verifique se não existem páginas vazias.
10. Verifique se não existem erros de console.
11. Verifique se não existem links quebrados.
12. Verifique se todas as páginas possuem navegação de retorno.
13. Verifique se a logo fornecida está sendo utilizada corretamente.
14. Verifique se os dados mockados são consistentes entre as telas.

IMPORTANTE:

Não simplifique o projeto removendo telas para economizar tempo.

Quero o protótipo completo.

Priorize qualidade visual, navegação, consistência e experiência do usuário.

O resultado final deve parecer uma plataforma SaaS real chamada TrocaTicket pronta para ser apresentada em uma demonstração acadêmica.
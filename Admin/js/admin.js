// 1) "Banco" fake — array de objetos representando a tabela cadastros, cria uma variavel e deixa guardado um banco de dados em memória, para simular a persistência de dados. Cada objeto representa um cadastro, com id, tipo, nome, email, data e status.
let cadastros = [
  { id: 1, tipo: "organizador", nome: "Ana Beatriz Souza", email: "ana.souza@email.com", data: "22/08/2026", status: "pendente" },
  { id: 2, tipo: "fornecedor",  nome: "Buffet Sabor & Arte", email: "contato@saborarte.com", data: "23/08/2026", status: "pendente" },
  { id: 3, tipo: "organizador", nome: "Carlos Menezes", email: "carlos.menezes@email.com", data: "24/08/2026", status: "pendente" },
  { id: 4, tipo: "fornecedor",  nome: "Som & Luz Eventos", email: "contato@somluz.com", data: "20/08/2026", status: "aprovado" },
  { id: 5, tipo: "fornecedor",  nome: "Espaço Verde Locações", email: "espacoverde@email.com", data: "19/08/2026", status: "rejeitado" }
];

let filtroAtual = "pendente"; //variavel pra guar o filtro atual, que começa em pendente quando abre o site, e vai mudando conforme o usuário clica nas abas.

// 2) Desenha a lista na tela a partir do array, aqui cria-se a função renderizarLista, que vai pegar o array de cadastros e filtrar de acordo com o filtroAtual, se estiver na aba todos, ele mostra todos os cadastros, se estiver na aba pendente, ele filtra e mostra apenas os cadastros com status pendente, e assim por diante. Se não houver nenhum cadastro no filtro atual, ele mostra uma mensagem de vazio.
function renderizarLista() {
  const container = document.getElementById("lista");
  const itensFiltrados = filtroAtual === "todos"
    ? cadastros
    : cadastros.filter(c => c.status === filtroAtual);

  if (itensFiltrados.length === 0) {
    container.innerHTML = `<div class="vazio">Nenhum cadastro nessa categoria.</div>`;  
    return;
  }
//aqui ele pega os itens filtrados e cria o HTML de cada cadastro chamando a função criarCartaoHTML, e junta tudo em uma string com join("") e coloca dentro do container da lista. 
  container.innerHTML = itensFiltrados.map(c => criarCartaoHTML(c)).join("");
}

// 3) Monta o HTML de um cadastro, aqui ele faz com que se o tipo do cadastro for "organizador", ele coloca o rótulo "Organizador", se for "fornecedor", ele coloca o rótulo "Fornecedor". E também faz a mesma coisa com o status, se for "pendente", ele coloca o rótulo "Pendente", se for "aprovado", ele coloca o rótulo "Aprovado", se for "rejeitado", ele coloca o rótulo "Rejeitado".
function criarCartaoHTML(c) {
  const rotuloTipo = c.tipo === "organizador" ? "Organizador" : "Fornecedor";
  const rotuloStatus = { pendente: "Pendente", aprovado: "Aprovado", rejeitado: "Rejeitado" }[c.status];

  //aqui ele cria os botões de ação dependendo do status do cadastro, se for pendente, ele mostra os botões de aprovar e rejeitar, se for aprovado ou rejeitado, ele mostra o botão de voltar para pendente.
  let botoes;
  if (c.status === "pendente") {
    botoes = `
      <div class="acoes">
        <button class="btn-aprovar" data-id="${c.id}" data-acao="aprovado">Aprovar</button>
        <button class="btn-rejeitar" data-id="${c.id}" data-acao="rejeitado">Rejeitar</button>
      </div>`;
  } else {
    botoes = `
      <div class="acoes">
        <button class="btn-desfazer" data-id="${c.id}" data-acao="pendente">Voltar para pendente</button>
      </div>`;
  }

  //aqui ele monta o HTML do cartão do cadastro, colocando o nome, tipo, email, data e status, e também os botões de ação dependendo do status.
  return `
    <div class="cartao">
      <div class="cartao-topo">
        <div>
          <span class="nome">${c.nome}</span>
          <span class="tipo ${c.tipo}">${rotuloTipo}</span>
          <div class="email">${c.email}</div>
          <div class="data">Cadastrado em ${c.data}</div>
        </div>
        <span class="status ${c.status}">${rotuloStatus}</span>
      </div>
      ${botoes}
    </div>`;
}

// 4) Atualiza o status de um cadastro, aqui ele cria a função atualizarStatus, que recebe o id do cadastro e o novo status, e atualiza o status do cadastro no array de cadastros, e depois chama a função renderizarLista para atualizar a lista na tela.
function atualizarStatus(id, novoStatus) {
  const cadastro = cadastros.find(c => c.id === id);
  if (cadastro) cadastro.status = novoStatus;
  renderizarLista();
}

// 5) aqui ele delega o evento de clique para o container da lista, e verifica se o elemento clicado é um botão com data-acao, se for, ele pega o id e a ação do botão e chama a função atualizarStatus para atualizar o status do cadastro. se nao for um botão, ele retorna e nao faz nada. Tambem adiciona um"number" para converter o id para número, pois o dataset retorna uma string.
document.getElementById("lista").addEventListener("click", function (evento) {
  const botao = evento.target.closest("button[data-acao]");
  if (!botao) return;
  const id = Number(botao.dataset.id);
  const acao = botao.dataset.acao;
  atualizarStatus(id, acao);
});

// 6) aqui ele adiciona o evento de clique para as abas, e verifica se o elemento clicado é uma aba, se for, ele remove a classe "ativa" de todas as abas e adiciona a classe "ativa" na aba clicada, e atualiza o filtroAtual com o filtro da aba clicada, e chama a função renderizarLista para atualizar a lista na tela.
document.getElementById("abas").addEventListener("click", function (evento) {
  const aba = evento.target.closest(".aba");
  if (!aba) return;
  document.querySelectorAll(".aba").forEach(a => a.classList.remove("ativa"));
  aba.classList.add("ativa");
  filtroAtual = aba.dataset.filtro;
  renderizarLista();
});

// 6) aqui ele chama a função renderizarLista para desenhar a lista na tela quando o site é carregado, e assim ele mostra os cadastros pendentes por padrão. Sem essa chamada, a lista ficaria vazia até que o usuário clicasse em uma aba.
renderizarLista();
// 1) "Banco" fake — array de objetos representando a tabela cadastros
let cadastros = [
  { id: 1, tipo: "organizador", nome: "Ana Beatriz Souza", email: "ana.souza@email.com", data: "22/08/2026", status: "pendente" },
  { id: 2, tipo: "fornecedor",  nome: "Buffet Sabor & Arte", email: "contato@saborarte.com", data: "23/08/2026", status: "pendente" },
  { id: 3, tipo: "organizador", nome: "Carlos Menezes", email: "carlos.menezes@email.com", data: "24/08/2026", status: "pendente" },
  { id: 4, tipo: "fornecedor",  nome: "Som & Luz Eventos", email: "contato@somluz.com", data: "20/08/2026", status: "aprovado" },
  { id: 5, tipo: "fornecedor",  nome: "Espaço Verde Locações", email: "espacoverde@email.com", data: "19/08/2026", status: "rejeitado" }
];

let filtroAtual = "pendente";

// 2) Desenha a lista na tela a partir do array
function renderizarLista() {
  const container = document.getElementById("lista");
  const itensFiltrados = filtroAtual === "todos"
    ? cadastros
    : cadastros.filter(c => c.status === filtroAtual);

  if (itensFiltrados.length === 0) {
    container.innerHTML = `<div class="vazio">Nenhum cadastro nessa categoria.</div>`;  
    return;
  }

  container.innerHTML = itensFiltrados.map(c => criarCartaoHTML(c)).join("");
}

// 3) Monta o HTML de um cadastro
function criarCartaoHTML(c) {
  const rotuloTipo = c.tipo === "organizador" ? "Organizador" : "Fornecedor";
  const rotuloStatus = { pendente: "Pendente", aprovado: "Aprovado", rejeitado: "Rejeitado" }[c.status];

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

// 4) Muda o status de um cadastro pelo id
function atualizarStatus(id, novoStatus) {
  const cadastro = cadastros.find(c => c.id === id);
  if (cadastro) cadastro.status = novoStatus;
  renderizarLista();
}

// 5) Delegação de evento: um único listener cobre todos os botões,
// mesmo os recriados a cada render
document.getElementById("lista").addEventListener("click", function (evento) {
  const botao = evento.target.closest("button[data-acao]");
  if (!botao) return;
  const id = Number(botao.dataset.id);
  const acao = botao.dataset.acao;
  atualizarStatus(id, acao);
});

document.getElementById("abas").addEventListener("click", function (evento) {
  const aba = evento.target.closest(".aba");
  if (!aba) return;
  document.querySelectorAll(".aba").forEach(a => a.classList.remove("ativa"));
  aba.classList.add("ativa");
  filtroAtual = aba.dataset.filtro;
  renderizarLista();
});

// 6) Primeira renderização ao carregar a página
renderizarLista();
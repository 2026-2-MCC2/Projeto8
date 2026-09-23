//  "Banco" fake — array de objetos representando a tabela cadastros, cria uma variavel e deixa guardado um banco de dados em memória, para simular a persistência de dados. Cada objeto representa um cadastro, com id, tipo, nome, email, data e status.
let cadastros = [
  {
      id: 1,
      tipo: "organizador",
      nome: "Ana Beatriz Souza",
      email: "ana.souza@email.com",
      telefone: "(11) 99999-1111",
      cidade: "São Paulo",
      estado: "SP",
      data: "22/08/2026",
      status: "pendente",
      eventosCadastrados: 3,
  },
  {
      id: 2,
      tipo: "fornecedor",
      nome: "Buffet Sabor & Arte",
      razaoSocial: "Sabor & Arte Eventos LTDA",
      cnpj: "12.345.678/0001-90",
      categoria: "Buffet e Gastronomia",
      email: "contato@saborarte.com",
      telefone: "(11) 98888-2222",
      cidade: "São Paulo",
      estado: "SP",
      regiaoAtendimento: "São Paulo e região",
      descricao:
          "Serviço de buffet para casamentos, festas e eventos corporativos.",
      site: "https://www.saborarte.com",
      data: "23/08/2026",
      status: "pendente",
  },
  {
      id: 3,
      tipo: "organizador",
      nome: "Carlos Menezes",
      email: "carlos.menezes@email.com",
      telefone: "(11) 97777-3333",
      cidade: "Campinas",
      estado: "SP",
      data: "24/08/2026",
      status: "pendente",
      eventosCadastrados: 1,
  },
  {
      id: 4,
      tipo: "fornecedor",
      nome: "Som & Luz Eventos",
      razaoSocial: "Som & Luz Produções LTDA",
      cnpj: "23.456.789/0001-01",
      categoria: "Som e Iluminação",
      email: "contato@somluz.com",
      telefone: "(11) 96666-4444",
      cidade: "São Paulo",
      estado: "SP",
      regiaoAtendimento: "Grande São Paulo",
      descricao: "Equipamentos de som, iluminação e estrutura para eventos.",
      site: "https://www.somluz.com",
      data: "20/08/2026",
      status: "aprovado",
      analisadoPor: "Administrador",
      dataAnalise: "20/08/2026 14:30",
  },
  {
      id: 5,
      tipo: "fornecedor",
      nome: "Espaço Verde Locações",
      razaoSocial: "Espaço Verde Eventos LTDA",
      cnpj: "34.567.890/0001-12",
      categoria: "Espaços para eventos",
      email: "espacoverde@email.com",
      telefone: "(11) 95555-5555",
      cidade: "Osasco",
      estado: "SP",
      regiaoAtendimento: "Grande São Paulo",
      descricao: "Locação de espaço e estrutura para eventos.",
      site: "",
      data: "19/08/2026",
      status: "rejeitado",
      analisadoPor: "Administrador",
      dataAnalise: "19/08/2026 10:15",
      motivoRejeicao: "Documentação incompleta.",
  },
];


let filtroAtual = "pendente"; //variavel pra guardar o filtro atual, que começa em pendente quando abre o site, e vai mudando conforme o usuário clica nas abas.
let buscaCadastroAtual = "";
let tipoCadastroAtual = "todos";


// Desenha a lista na tela a partir do array, aqui cria-se a função renderizarLista, que vai pegar o array de cadastros e filtrar de acordo com o filtroAtual, se estiver na aba todos, ele mostra todos os cadastros, se estiver na aba pendente, ele filtra e mostra apenas os cadastros com status pendente, e assim por diante. Se não houver nenhum cadastro no filtro atual, ele mostra uma mensagem de vazio.
function renderizarLista() {
  atualizarContagensAbas("abas", cadastros);


  const container = document.getElementById("lista");


  const busca = buscaCadastroAtual.trim().toLowerCase();


  const itensFiltrados = cadastros.filter((c) => {
      const correspondeStatus =
          filtroAtual === "todos" || c.status === filtroAtual;


      const correspondeTipo =
          tipoCadastroAtual === "todos" || c.tipo === tipoCadastroAtual;


      const correspondeBusca =
          !busca ||
          c.nome.toLowerCase().includes(busca) ||
          c.email.toLowerCase().includes(busca);


      return correspondeStatus && correspondeTipo && correspondeBusca;
  });


  if (itensFiltrados.length === 0) {
      container.innerHTML = `<div class="vazio">Nenhum cadastro nessa categoria.</div>`;
      return;
  }
  //aqui ele pega os itens filtrados e cria o HTML de cada cadastro chamando a função criarCartaoHTML, e junta tudo em uma string com join("") e coloca dentro do container da lista.
  container.innerHTML = itensFiltrados
      .map((c) => criarCartaoHTML(c))
      .join("");
}
// os rótulos de status do cadastro nunca mudam, então ficam aqui fora,
// declarados uma única vez — em vez de recriar esse objeto toda vez que
// criarCartaoHTML rodar pra cada cartão da lista.
const ROTULOS_STATUS_CADASTRO = {
  pendente: "Pendente",
  aprovado: "Aprovado",
  rejeitado: "Rejeitado",
};


function criarCartaoHTML(c) {
  const rotuloTipo = c.tipo === "organizador" ? "Organizador" : "Fornecedor";
  const rotuloStatus = ROTULOS_STATUS_CADASTRO[c.status];


  //aqui ele cria os botões de ação dependendo do status do cadastro, se for pendente, ele mostra os botões de aprovar e rejeitar, se for aprovado ou rejeitado, ele mostra o botão de voltar para pendente.
  let botoes;


  if (c.status === "pendente") {
      botoes = `
      <div class="acoes">
        <button class="btn-detalhes-cadastro" data-id="${c.id}" data-detalhes="true">
            Ver detalhes
        </button>
        <button class="btn-aprovar" data-id="${c.id}" data-acao="aprovado">
           Aprovar
        </button>
        <button class="btn-rejeitar" data-id="${c.id}" data-acao="rejeitado">
           Rejeitar
        </button>
      </div>`;
  } else {
      botoes = `
      <div class="acoes">
        <button class="btn-detalhes-cadastro" data-id="${c.id}" data-detalhes="true">
            Ver detalhes
        </button>
        <button class="btn-desfazer" data-id="${c.id}" data-acao="pendente">
            Reabrir análise
        </button>
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


  ${
      c.cidade
          ? `
    <div class="localizacao-cadastro">
        ${c.cidade} - ${c.estado}
    </div>`
          : ""
  }


  ${
      c.tipo === "fornecedor" && c.categoria
          ? `
    <div class="categoria-cadastro">
      ${c.categoria}
    </div>`
          : ""
  }
      </div>
        <span class="selo status ${c.status}">${rotuloStatus}</span>
      </div>
    ${botoes}
  </div>`;
}


// monta e insere na página um modal com todos os dados completos do
// cadastro clicado — o conteúdo muda dependendo se é organizador ou
// fornecedor — e mostra embaixo o histórico de análise, se já existir.
function abrirDetalhesCadastro(id) {
  const cadastro = cadastros.find((c) => c.id === id);


  if (!cadastro) return;


  const conteudo =
      cadastro.tipo === "fornecedor"
          ? `
        <div class="detalhes-cadastro-grid">
            <div>
                <span>Razão social</span>
                <strong>${cadastro.razaoSocial || "Não informado"}</strong>
            </div>


            <div>
                <span>Nome fantasia</span>
                <strong>${cadastro.nome}</strong>
            </div>


            <div>
                <span>CNPJ</span>
                <strong>${cadastro.cnpj || "Não informado"}</strong>
            </div>


            <div>
                <span>Categoria</span>
                <strong>${cadastro.categoria || "Não informado"}</strong>
            </div>


            <div>
                <span>E-mail</span>
                <strong>${cadastro.email}</strong>
            </div>


            <div>
                <span>Telefone</span>
                <strong>${cadastro.telefone || "Não informado"}</strong>
            </div>


            <div>
                <span>Localização</span>
                <strong>${cadastro.cidade || "Não informado"} - ${cadastro.estado || ""}</strong>
            </div>


            <div>
                <span>Área de atendimento</span>
                <strong>${cadastro.regiaoAtendimento || "Não informado"}</strong>
            </div>


            <div class="detalhe-completo">
                <span>Descrição</span>
                <strong>${cadastro.descricao || "Não informado"}</strong>
            </div>


            <div class="detalhe-completo">
                <span>Site / Portfólio</span>
                <strong>${cadastro.site || "Não informado"}</strong>
            </div>
        </div>
    `
          : `
        <div class="detalhes-cadastro-grid">
            <div>
                <span>Nome completo</span>
                <strong>${cadastro.nome}</strong>
            </div>


            <div>
                <span>E-mail</span>
                <strong>${cadastro.email}</strong>
            </div>


            <div>
                <span>Telefone</span>
                <strong>${cadastro.telefone || "Não informado"}</strong>
            </div>


            <div>
                <span>Localização</span>
                <strong>${cadastro.cidade || "Não informado"} - ${cadastro.estado || ""}</strong>
            </div>


            <div>
                <span>Eventos cadastrados</span>
                <strong>${cadastro.eventosCadastrados ?? 0}</strong>
            </div>


            <div>
                <span>Data do cadastro</span>
                <strong>${cadastro.data}</strong>
            </div>
        </div>
    `;


  const historico = cadastro.analisadoPor
      ? `
        <div class="historico-analise">
            <strong>Última análise</strong>
            <p>Analisado por: ${cadastro.analisadoPor}</p>
            <p>Data: ${cadastro.dataAnalise}</p>


            ${
                cadastro.motivoRejeicao
                    ? `<p>Motivo da rejeição: ${cadastro.motivoRejeicao}</p>`
                    : ""
            }
        </div>
    `
      : "";


  const modal = document.createElement("div");


  modal.className = "modal-overlay";
  modal.id = "modal-cadastro";


  modal.innerHTML = `
    <div class="modal-cadastro">
        <div class="modal-cadastro-topo">
            <div>
                <span class="modal-tipo">${cadastro.tipo === "fornecedor" ? "Fornecedor" : "Organizador"}</span>
                <h2>${cadastro.nome}</h2>
            </div>


            <button type="button" class="btn-fechar-modal" data-fechar-modal>
                ×
            </button>
        </div>


        ${conteudo}


        ${historico}
    </div>
`;


  document.body.appendChild(modal);
}


// Atualiza o status de um cadastro, aqui ele cria a função atualizarStatus, que recebe o id do cadastro e o novo status, e atualiza o status do cadastro no array de cadastros, e depois chama a função renderizarLista para atualizar a lista na tela.
function atualizarStatus(id, novoStatus, observacao = "") {
  const cadastro = cadastros.find((c) => c.id === id);


  if (!cadastro) return;


  cadastro.status = novoStatus;


  if (novoStatus === "aprovado" || novoStatus === "rejeitado") {
      cadastro.analisadoPor = "Administrador";
      cadastro.dataAnalise = new Date().toLocaleString("pt-BR");
  }


  if (novoStatus === "rejeitado") {
      cadastro.motivoRejeicao = observacao;
  }


  if (novoStatus === "pendente") {
      cadastro.analisadoPor = null;
      cadastro.dataAnalise = null;
      cadastro.motivoRejeicao = null;
  }


  renderizarLista();
}


// aqui ele delega o evento de clique para o container da lista, e verifica se o elemento clicado é um botão com data-acao, se for, ele pega o id e a ação do botão e chama a função atualizarStatus para atualizar o status do cadastro. se nao for um botão, ele retorna e nao faz nada. Tambem adiciona um"number" para converter o id para número, pois o dataset retorna uma string.
document.getElementById("lista").addEventListener("click", function (evento) {
  const botaoDetalhes = evento.target.closest("button[data-detalhes]");


  if (botaoDetalhes) {
      const id = Number(botaoDetalhes.dataset.id);
      abrirDetalhesCadastro(id);
      return;
  }


  const botao = evento.target.closest("button[data-acao]");
  if (!botao) return;
  const id = Number(botao.dataset.id);
  const acao = botao.dataset.acao;


  // rejeitar é a única ação sem volta fácil de perceber (o cadastro só some
  // da aba "Pendentes"), então aqui a gente pede uma confirmação antes.
  if (acao === "rejeitado") {
      abrirModalRejeicao(id);
      return;
  }


  atualizarStatus(id, acao);
});


// monta e insere na página o modal onde o administrador escolhe o motivo
// da rejeição (e pode escrever uma observação) antes de confirmar.
function abrirModalRejeicao(id) {
  const cadastro = cadastros.find((c) => c.id === id);


  if (!cadastro) return;


  const modal = document.createElement("div");


  modal.className = "modal-overlay";
  modal.id = "modal-rejeicao";


  modal.innerHTML = `
    <div class="modal-cadastro modal-rejeicao">
        <div class="modal-cadastro-topo">
            <div>
                <span class="modal-tipo">Rejeição de cadastro</span>
                <h2>${cadastro.nome}</h2>
            </div>


            <button type="button" class="btn-fechar-modal" data-fechar-rejeicao>
                ×
            </button>
        </div>


        <p class="texto-modal">
            Informe o motivo pelo qual este cadastro está sendo rejeitado.
        </p>


        <label for="motivo-rejeicao">
            Motivo
        </label>


        <select id="motivo-rejeicao">
            <option value="">Selecione um motivo</option>
            <option value="Documentação incompleta">
                Documentação incompleta
            </option>
            <option value="Dados inválidos">
                Dados inválidos
            </option>
            <option value="Informações insuficientes">
                Informações insuficientes
            </option>
            <option value="Cadastro em desacordo com as regras">
                Cadastro em desacordo com as regras
            </option>
            <option value="Outro">
                Outro
            </option>
        </select>


        <label for="observacao-rejeicao">
            Observação
        </label>


        <textarea
            id="observacao-rejeicao"
            placeholder="Escreva uma observação adicional..."
            rows="4"
        ></textarea>


        <div class="acoes modal-acoes">
            <button type="button" class="btn-desfazer" data-fechar-rejeicao>
                Cancelar
            </button>


            <button
                type="button"
                class="btn-rejeitar"
                data-confirmar-rejeicao="${id}"
            >
                Confirmar rejeição
            </button>
        </div>
    </div>
`;


  document.body.appendChild(modal);
}


// um único listener cuida dos três cliques relacionados a modal (confirmar
// a rejeição, fechar o modal de rejeição, e fechar o modal de detalhes do
// cadastro)
document.addEventListener("click", function (evento) {
  const botaoConfirmar = evento.target.closest("[data-confirmar-rejeicao]");
  if (botaoConfirmar) {
      const id = Number(botaoConfirmar.dataset.confirmarRejeicao);


      const motivo = document.getElementById("motivo-rejeicao").value;
      const observacao = document
          .getElementById("observacao-rejeicao")
          .value.trim();


      if (!motivo) {
          alert("Selecione um motivo para a rejeição.");
          return;
      }


      const textoMotivo = observacao ? `${motivo} — ${observacao}` : motivo;
      atualizarStatus(id, "rejeitado", textoMotivo);


      const modalRejeicao = document.getElementById("modal-rejeicao");
      if (modalRejeicao) modalRejeicao.remove();
      return;
  }


  if (evento.target.matches("[data-fechar-rejeicao]")) {
      const modalRejeicao = document.getElementById("modal-rejeicao");
      if (modalRejeicao) modalRejeicao.remove();
      return;
  }


  if (evento.target.matches("[data-fechar-modal]")) {
      const modalCadastro = document.getElementById("modal-cadastro");
      if (modalCadastro) modalCadastro.remove();
  }
});


// procura, dentro do nav indicado, todo elemento com [data-contagem] e
// escreve nele "(N)", contando quantos itens do array têm aquele status.
// data-contagem="todos" é um caso especial: mostra o total do array inteiro.
function atualizarContagensAbas(idDoNav, itens) {
  document.querySelectorAll(`#${idDoNav} [data-contagem]`).forEach((span) => {
      const chave = span.dataset.contagem;
      const quantidade =
          chave === "todos"
              ? itens.length
              : itens.filter((item) => item.status === chave).length;
      span.textContent = `(${quantidade})`;
  });
}


// função reaproveitável pra qualquer nav de abas da página: recebe o id do
// <nav> e uma função "aoClicar" que decide o que fazer com o filtro escolhido.
function configurarAbas(idDoNav, aoClicar) {
  document
      .getElementById(idDoNav)
      .addEventListener("click", function (evento) {
          const aba = evento.target.closest(".aba");
          if (!aba) return;
          evento.currentTarget.querySelectorAll(".aba").forEach((a) => {
              a.classList.remove("ativa");
              a.setAttribute("aria-selected", "false");
          });
          aba.classList.add("ativa");
          aba.setAttribute("aria-selected", "true");
          aoClicar(aba.dataset.filtro);
      });
}


configurarAbas("abas", function (filtro) {
  filtroAtual = filtro;
  renderizarLista();
});


// atualiza a busca por nome/e-mail a cada letra digitada no campo
document
  .getElementById("busca-cadastros")
  .addEventListener("input", function (evento) {
      buscaCadastroAtual = evento.target.value;
      renderizarLista();
  });


// atualiza o filtro de tipo (organizador/fornecedor/todos) quando o
// usuário troca a opção do <select>
document
  .getElementById("filtro-tipo-cadastro")
  .addEventListener("change", function (evento) {
      tipoCadastroAtual = evento.target.value;
      renderizarLista();
  });


// PARTE 2 — RELATÓRIO GERENCIAL
// "Banco" fake dos eventos. Cada evento tem:
// - dados gerais (nome, organizador, data, status)
// - orcamentoPrevisto: quanto o organizador reservou pra gastar no evento todo
// - categorias: a divisão desse gasto por área (buffet, decoração, etc), cada
//   uma com o valor previsto e o valor já fechado com fornecedor (atual)
// - cotacoes: uma linha por fornecedor consultado, com o status da negociação
let eventos = [
  {
      id: 1,
      nome: "Casamento Ana & Pedro",
      organizador: "Ana Beatriz Souza",
      data: "15/11/2026",
      status: "planejamento",
      orcamentoPrevisto: 25000,
      categorias: [
          { nome: "Buffet", previsto: 10000, atual: 9500 },
          { nome: "Som e Iluminação", previsto: 5000, atual: 4200 },
          { nome: "Decoração", previsto: 4000, atual: 0 },
          { nome: "Espaço", previsto: 6000, atual: 0 },
      ],
      cotacoes: [
          {
              fornecedor: "Buffet Sabor & Arte",
              categoria: "Buffet",
              status: "aprovado",
              valor: 9500,
          },
          {
              fornecedor: "Som & Luz Eventos",
              categoria: "Som e Iluminação",
              status: "aprovado",
              valor: 4200,
          },
          {
              fornecedor: "Decor Prime",
              categoria: "Decoração",
              status: "pendente",
              valor: 3800,
          },
          {
              fornecedor: "Espaço Verde Locações",
              categoria: "Espaço",
              status: "recusada",
              valor: 7200,
          },
      ],
  },
  {
      id: 2,
      nome: "Congresso Tech SP 2026",
      organizador: "Carlos Menezes",
      data: "03/10/2026",
      status: "confirmado",
      orcamentoPrevisto: 60000,
      categorias: [
          { nome: "Espaço", previsto: 25000, atual: 25000 },
          { nome: "Buffet", previsto: 15000, atual: 14200 },
          { nome: "Som e Iluminação", previsto: 12000, atual: 11800 },
          { nome: "Segurança", previsto: 8000, atual: 8000 },
      ],
      cotacoes: [
          {
              fornecedor: "Espaço Verde Locações",
              categoria: "Espaço",
              status: "aprovado",
              valor: 25000,
          },
          {
              fornecedor: "Buffet Sabor & Arte",
              categoria: "Buffet",
              status: "aprovado",
              valor: 14200,
          },
          {
              fornecedor: "Som & Luz Eventos",
              categoria: "Som e Iluminação",
              status: "aprovado",
              valor: 11800,
          },
          {
              fornecedor: "Vigilância Total",
              categoria: "Segurança",
              status: "aprovado",
              valor: 8000,
          },
      ],
  },
  {
      id: 3,
      nome: "Aniversário de 15 anos - Beatriz",
      organizador: "Ana Beatriz Souza",
      data: "28/09/2026",
      status: "concluido",
      orcamentoPrevisto: 18000,
      categorias: [
          { nome: "Buffet", previsto: 8000, atual: 7900 },
          { nome: "Decoração", previsto: 5000, atual: 5300 },
          { nome: "Som e Iluminação", previsto: 5000, atual: 4600 },
      ],
      cotacoes: [
          {
              fornecedor: "Buffet Sabor & Arte",
              categoria: "Buffet",
              status: "aprovado",
              valor: 7900,
          },
          {
              fornecedor: "Decor Prime",
              categoria: "Decoração",
              status: "aprovado",
              valor: 5300,
          },
          {
              fornecedor: "Som & Luz Eventos",
              categoria: "Som e Iluminação",
              status: "aprovado",
              valor: 4600,
          },
      ],
  },
  {
      id: 4,
      nome: "Feira de Startups Vale Tech",
      organizador: "Carlos Menezes",
      data: "12/12/2026",
      status: "cancelado",
      orcamentoPrevisto: 40000,
      categorias: [
          { nome: "Espaço", previsto: 20000, atual: 0 },
          { nome: "Buffet", previsto: 12000, atual: 0 },
      ],
      cotacoes: [
          {
              fornecedor: "Espaço Verde Locações",
              categoria: "Espaço",
              status: "pendente",
              valor: 19500,
          },
          {
              fornecedor: "Buffet Sabor & Arte",
              categoria: "Buffet",
              status: "pendente",
              valor: 11800,
          },
      ],
  },
];


let filtroEventoAtual = "todos"; // igual o filtroAtual dos cadastros, mas separado, pra não misturar as duas telas
let idsAbertos = new Set(); // guarda quais cartões de evento estão com os detalhes abertos, pra não fechar tudo de novo a cada renderização
let buscaEventoAtual = ""; // texto digitado no campo de busca, sempre comparado em minúsculo
let ordenacaoAtual = "data"; // "data" = evento mais próximo primeiro | "cadastro" = mais recém-cadastrado primeiro


// formata um número pra ficar "R$ 9.500", igual aparece em qualquer sistema financeiro
function formatarMoeda(valor) {
  return valor.toLocaleString("pt-br", {
      style: "currency",
      currency: "BRL",
      minimumFractionDigits: 0,
  });
}


// converte "15/11/2026" pra "20261115". Fazendo isso, dá pra comparar duas
// datas como texto normal e a ordem sai certa — comparando as strings originais
// ("15/11/2026" vs "03/10/2026") a ordenação ia pelo DIA primeiro, não pelo
// ano/mês, e dava resultado errado.
function converterDataParaOrdenar(dataTexto) {
  const [dia, mes, ano] = dataTexto.split("/");
  return `${ano}${mes}${dia}`;
}


// a partir das categorias e cotações de UM evento, calcula os totais que
// vão ser usados nas barras de progresso e nos textos do cartão
function calcularResumoEvento(evento) {
  const custoAtual = evento.categorias.reduce(
      (soma, cat) => soma + cat.atual,
      0,
  );
  const percentualOrcamento =
      evento.orcamentoPrevisto > 0
          ? Math.round((custoAtual / evento.orcamentoPrevisto) * 100)
          : 0;


  const totalCotacoes = evento.cotacoes.length;
  const cotacoesAprovadas = evento.cotacoes.filter(
      (c) => c.status === "aprovado",
  ).length;
  const percentualCotacoes =
      totalCotacoes > 0
          ? Math.round((cotacoesAprovadas / totalCotacoes) * 100)
          : 0;


  return {
      custoAtual,
      percentualOrcamento,
      totalCotacoes,
      cotacoesAprovadas,
      percentualCotacoes,
  };
}


// desenha os 4 cartões de resumo lá em cima da tela (sempre considerando
// TODOS os eventos, e não só os que estão filtrados na hora)
function renderizarKpis(resumosPorEvento) {
  const totalEventos = eventos.filter(
      (e) => e.status === "planejamento" || e.status === "confirmado",
  ).length;
  const orcamentoTotal = eventos.reduce(
      (soma, ev) => soma + ev.orcamentoPrevisto,
      0,
  );


  const custoTotal = eventos.reduce(
      (soma, ev) => soma + resumosPorEvento.get(ev.id).custoAtual,
      0,
  );


  const totalCotacoesGeral = eventos.reduce(
      (soma, ev) => soma + ev.cotacoes.length,
      0,
  );
  const cotacoesPendentesGeral = eventos.reduce(
      (soma, ev) =>
          soma + ev.cotacoes.filter((c) => c.status === "pendente").length,
      0,
  );
  const estourouGeral = custoTotal > orcamentoTotal;


  const container = document.getElementById("kpis");


  container.innerHTML = `
  <div class="kpi">
    <div class="kpi-rotulo">Eventos ativos</div>
    <div class="kpi-valor">${totalEventos}</div>
  </div>
  <div class="kpi">
    <div class="kpi-rotulo">Orçamento total</div>
    <div class="kpi-valor">${formatarMoeda(orcamentoTotal)}</div>
  </div>
  <div class="kpi">
    <div class="kpi-rotulo">Custo atual</div>
    <div class="kpi-valor ${estourouGeral ? "alerta" : ""}">${formatarMoeda(custoTotal)}</div>
  </div>
  <div class="kpi">
    <div class="kpi-rotulo">Cotações pendentes</div>
    <div class="kpi-valor ${cotacoesPendentesGeral > 0 ? "alerta" : ""}">${cotacoesPendentesGeral} de ${totalCotacoesGeral}</div>
  </div>`;
}
// desenha a lista de eventos, aplicando o filtro de status escolhido nas abas
function renderizarEventos() {
  // calcula o resumo (custo atual, % do orçamento, cotações aprovadas etc)
  // de cada evento AQUI, uma única vez, e guarda num Map (id do evento →
  // resumo). Assim tanto renderizarKpis quanto criarCartaoEventoHTML
  // reaproveitam o mesmo resultado, em vez de cada um calcular de novo.
  const resumosPorEvento = new Map(
      eventos.map((ev) => [ev.id, calcularResumoEvento(ev)]),
  );


  renderizarKpis(resumosPorEvento);
  atualizarContagensAbas("abas-eventos", eventos);


  const container = document.getElementById("lista-eventos");
  // 1) filtra por status (as abas de cima)
  const porStatus =
      filtroEventoAtual === "todos"
          ? eventos
          : eventos.filter((ev) => ev.status === filtroEventoAtual);


  // 2) dentro do que sobrou, filtra pelo texto da busca — compara o nome do
  // evento OU o nome do organizador, sem diferenciar maiúscula/minúscula
  const textoBusca = buscaEventoAtual.trim().toLowerCase();
  const porBusca =
      textoBusca === ""
          ? porStatus
          : porStatus.filter(
                (ev) =>
                    ev.nome.toLowerCase().includes(textoBusca) ||
                    ev.organizador.toLowerCase().includes(textoBusca),
            );


  // 3) por fim, ordena de acordo com o que estiver selecionado no <select>.
  // .slice().
  const itensFiltrados = porBusca.slice().sort((a, b) => {
      if (ordenacaoAtual === "cadastro") {
          // id maior = foi cadastrado depois = é mais recente
          return b.id - a.id;
      }
      // padrão: data do evento mais próxima primeiro
      return converterDataParaOrdenar(a.data).localeCompare(
          converterDataParaOrdenar(b.data),
      );
  });


  if (itensFiltrados.length === 0) {
      const mensagem =
          textoBusca !== ""
              ? `Nenhum evento encontrado para "${buscaEventoAtual.trim()}".`
              : "Nenhum evento nessa categoria.";
      container.innerHTML = `<div class="vazio">${mensagem}</div>`;
      return;
  }


  container.innerHTML = itensFiltrados
      .map((ev) => criarCartaoEventoHTML(ev, resumosPorEvento.get(ev.id)))
      .join("");
}


// os rótulos de status do evento e de status da cotação nunca mudam, então
// ficam aqui fora, declarados uma única vez
const ROTULOS_STATUS_EVENTO = {
  planejamento: "Em planejamento",
  confirmado: "Confirmado",
  concluido: "Concluído",
  cancelado: "Cancelado",
};
const ROTULOS_COTACAO = {
  aprovado: "Aprovado",
  pendente: "Pendente",
  recusada: "Recusada",
};


// "resumo" agora chega pronto por parâmetro (calculado uma vez só lá em
// renderizarEventos)
function criarCartaoEventoHTML(evento, resumo) {
  const rotuloStatus = ROTULOS_STATUS_EVENTO[evento.status];
  const estourouOrcamento = resumo.custoAtual > evento.orcamentoPrevisto;
  const aberto = idsAbertos.has(evento.id);


  const linhasCategorias = evento.categorias
      .map((cat) => {
          const estourouCategoria = cat.atual > cat.previsto;
          return `
  <tr class="${estourouCategoria ? "categoria-estourou" : ""}">
    <td>
      ${cat.nome}
      ${estourouCategoria ? '<span class="aviso-estouro">⚠ acima do previsto</span>' : ""}
    </td>
    <td class="numero">${formatarMoeda(cat.previsto)}</td>
    <td class="numero">${formatarMoeda(cat.atual)}</td>
  </tr>`;
      })
      .join("");


  // linhas da lista de cotações por fornecedor
  // linhas da lista de cotações por fornecedor (o objeto de rótulos agora
  // é o ROTULOS_COTACAO declarado lá em cima, fora da função)
  const linhasCotacoes = evento.cotacoes
      .map(
          (cot) => `
  <div class="cotacao-item">
    <div>
      <div class="cotacao-fornecedor">${cot.fornecedor}</div>
      <div class="cotacao-categoria">${cot.categoria}</div>
    </div>
    <div class="cotacao-valor">${cot.valor !== null ? formatarMoeda(cot.valor) : "—"}</div>
          <span class="selo cotacao-badge ${cot.status}">${ROTULOS_COTACAO[cot.status]}</span>
  </div>`,
      )
      .join("");


  return `
  <div class="cartao">
    <div class="cartao-topo">
      <div>
        <span class="nome">${evento.nome}</span>
        <div class="evento-organizador">Organizador: ${evento.organizador}</div>
        <div class="evento-data">Data do evento: ${evento.data}</div>
      </div>
      <span class="selo status ${evento.status}">${rotuloStatus}</span>
    </div>




    <div class="resumo-financeiro">
      <div class="resumo-financeiro-linha">
        <span>Custo atual / Orçamento previsto</span>
        <strong>${formatarMoeda(resumo.custoAtual)} / ${formatarMoeda(evento.orcamentoPrevisto)}</strong>
      </div>
      <div class="barra-progresso">
        <div class="barra-progresso-preenchimento ${estourouOrcamento ? "estourou" : ""}"
             style="width:${Math.min(resumo.percentualOrcamento, 100)}%"></div>
      </div>
    </div>




    <div class="resumo-cotacoes">
      <div class="resumo-financeiro-linha">
        <span>Cotações aprovadas</span>
        <strong>${resumo.cotacoesAprovadas} de ${resumo.totalCotacoes} (${resumo.percentualCotacoes}%)</strong>
      </div>
      <div class="barra-progresso">
        <div class="barra-progresso-preenchimento" style="width:${resumo.percentualCotacoes}%"></div>
      </div>
    </div>




    <button class="btn-detalhes" data-id="${evento.id}">
      ${aberto ? "Ocultar detalhes" : "Ver custos e cotações"}
    </button>




    <div class="detalhes-evento ${aberto ? "aberto" : ""}">
      <div class="detalhes-titulo">Custos por categoria</div>
      <table class="tabela-custos">
        <thead>
          <tr><th>Categoria</th><th class="numero">Previsto</th><th class="numero">Atual</th></tr>
        </thead>
        <tbody>${linhasCategorias}</tbody>
        <tfoot>
          <tr>
            <td>Total</td>
            <td class="numero">${formatarMoeda(evento.orcamentoPrevisto)}</td>
            <td class="numero">${formatarMoeda(resumo.custoAtual)}</td>
          </tr>
        </tfoot>
      </table>




      <div class="detalhes-titulo">Cotações por fornecedor</div>
      ${linhasCotacoes}
    </div>
  </div>`;
}


configurarAbas("abas-eventos", function (filtro) {
  filtroEventoAtual = filtro;
  renderizarEventos();
});


// atualiza a busca a cada letra digitada (evento "input" dispara em tempo real,
// diferente do "change" que só dispara quando você sai do campo)
document
  .getElementById("busca-eventos")
  .addEventListener("input", function (evento) {
      buscaEventoAtual = evento.target.value;
      renderizarEventos();
  });


// atualiza a ordenação quando o usuário troca a opção do <select>
document
  .getElementById("ordenar-eventos")
  .addEventListener("change", function (evento) {
      ordenacaoAtual = evento.target.value;
      renderizarEventos();
  });


// clique no botão "Ver custos e cotações" / "Ocultar detalhes" de cada cartão.
// guarda no Set idsAbertos quais eventos devem continuar abertos depois de
// renderizar de novo (senão toda hora que clicasse em algo a lista fecharia
// todos os detalhes que já estavam abertos).
document
  .getElementById("lista-eventos")
  .addEventListener("click", function (evento) {
      const botao = evento.target.closest("button[data-id]");
      if (!botao) return;
      const id = Number(botao.dataset.id);
      if (idsAbertos.has(id)) {
          idsAbertos.delete(id);
      } else {
          idsAbertos.add(id);
      }
      renderizarEventos();
  });


// PARTE 3 — NAVEGAÇÃO ENTRE AS DUAS TELAS
// textos de cabeçalho de cada tela, trocados junto com a navegação
const textosPorArea = {
  cadastros: {
      titulo: "Cadastros pendentes",
      subtitulo:
          "Aprove ou rejeite os cadastros de Organizadores e Fornecedores.",
  },
  eventos: {
      titulo: "Relatório gerencial",
      subtitulo:
          "Acompanhe o status, o orçamento e o andamento das cotações de cada evento.",
  },
};


document
  .getElementById("areaPrincipal")
  .addEventListener("click", function (evento) {
      const botao = evento.target.closest(".area-btn");
      if (!botao) return;


      const area = botao.dataset.area; // "cadastros" ou "eventos"


      // marca o botão clicado como ativo e desmarca o outro
      document
          .querySelectorAll(".area-btn")
          .forEach((b) => b.classList.remove("ativa"));
      botao.classList.add("ativa");


      // mostra a seção correspondente e esconde a outra usando o atributo hidden
      document.getElementById("view-cadastros").hidden = area !== "cadastros";
      document.getElementById("view-eventos").hidden = area !== "eventos";


      // troca o título e o subtítulo do cabeçalho de acordo com a tela
      document.getElementById("tituloPagina").textContent =
          textosPorArea[area].titulo;
      document.getElementById("subtituloPagina").textContent =
          textosPorArea[area].subtitulo;
  });


// PARTE 4 — PRIMEIRA RENDERIZAÇÃO AO CARREGAR A PÁGINA
renderizarLista(); // desenha os cadastros pendentes (tela inicial)
renderizarEventos(); // já deixa o relatório gerencial pronto por baixo dos panos,
// assim ele aparece na hora certa quando o usuário clica na aba
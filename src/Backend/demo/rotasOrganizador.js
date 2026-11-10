// Rotas do Organizador no modo demonstração: eventos e dados da própria conta.
const express = require("express");
const { ErroValidacao, validarEvento, lerEmail, lerTelefone, lerTexto } = require("../lib/validacao");

const router = express.Router();

function ordenar(eventos) {
  return [...eventos].sort((a, b) => (a.data_evento + a.horario).localeCompare(b.data_evento + b.horario));
}

// GET /eventos -> somente eventos do organizador da sessão
router.get("/", (req, res) => {
  const lista = ordenar(req.sessao.mundo.eventos.filter((e) => e.id_organizador === req.sessao.usuarioId));
  res.json(lista.map((e) => ({
    id: e.id, nome: e.nome, descricao: e.descricao, horario: e.horario, data_evento: e.data_evento,
    publico_min: e.publico_min, publico_max: e.publico_max, local: e.local, status: e.status,
  })));
});

// POST /eventos
router.post("/", (req, res) => {
  const d = validarEvento(req.body);
  const mundo = req.sessao.mundo;
  const evento = {
    id: mundo.proximo.evento++, id_organizador: req.sessao.usuarioId, ...d, status: "PLANEJAMENTO", orcamento_previsto: null,
  };
  mundo.eventos.push(evento);
  res.status(201).json({ mensagem: "Evento criado com sucesso!", id: evento.id });
});

// PATCH /usuarios/:id -> só a própria conta fictícia (nome, e-mail, telefone)
function atualizarConta(req, res) {
  const id = Number(req.params.id);
  if (!Number.isInteger(id) || id <= 0) throw new ErroValidacao("ID de usuário inválido");
  if (id !== req.sessao.usuarioId) {
    return res.status(403).json({ mensagem: "Acesso negado: você só pode alterar seu próprio cadastro" });
  }

  const body = req.body || {};
  if (body.senha !== undefined || body.senha_hash !== undefined) {
    throw new ErroValidacao("A troca de senha não está disponível no modo demonstração", 403);
  }

  const novo = {};
  if (body.nome !== undefined) novo.nome = lerTexto(body.nome, "Nome", { max: 250 });
  if (body.email !== undefined) novo.email = lerEmail(body.email);
  if (body.telefone !== undefined) novo.telefone = lerTelefone(body.telefone);
  if (Object.keys(novo).length === 0) throw new ErroValidacao("Nenhum campo válido para atualização foi enviado");

  const u = req.sessao.mundo.usuarios.find((x) => x.id === id);
  if (u) Object.assign(u, novo);
  res.json({ mensagem: "Usuário atualizado com sucesso!" });
}

// ------------------------------------------------------
// GET /catalogo/servicos e /catalogo/servicos/:id
// Mesmo formato das linhas do catálogo real (routes/catalogo.js), mas montado
// a partir dos serviços ATIVOS de fornecedores APROVADOS do "mundo" da sessão.
// ------------------------------------------------------
function linhaCatalogo(mundo, s) {
  const f = mundo.usuarios.find((u) => u.id === s.id_fornecedor && u.tipo === "FORNECEDOR");
  if (s.status !== "ATIVO" || !f || f.status !== "APROVADO") return null;
  return {
    id: s.id,
    servico_nome: s.nome,
    servico_descricao: s.descricao,
    categoria: s.categoria,
    id_fornecedor: f.id,
    fornecedor_nome: f.razao_social || f.nome,
    regiao_atendimento: f.regiao_atendimento,
    fornecedor_descricao: f.descricao,
    site: f.site,
    cidade: f.cidade,
    estado: f.estado,
    preco_min: s.preco,
    preco_max: s.preco,
    publico_min: s.publico_min,
    publico_max: s.publico_max,
  };
}

const catalogo = express.Router();

catalogo.get("/servicos", (req, res) => {
  const mundo = req.sessao.mundo;
  let lista = mundo.servicos.map((s) => linhaCatalogo(mundo, s)).filter(Boolean);

  const busca = typeof req.query.busca === "string" ? req.query.busca.trim().toLowerCase() : "";
  const categoria = typeof req.query.categoria === "string" ? req.query.categoria.trim() : "";
  if (busca) {
    lista = lista.filter((l) =>
      [l.fornecedor_nome, l.servico_nome, l.servico_descricao, l.categoria]
        .some((campo) => String(campo || "").toLowerCase().includes(busca)));
  } else if (categoria) {
    lista = lista.filter((l) => l.categoria === categoria);
  }

  lista.sort((a, b) => a.fornecedor_nome.localeCompare(b.fornecedor_nome) || a.servico_nome.localeCompare(b.servico_nome));
  res.json(lista);
});

catalogo.get("/servicos/:id", (req, res) => {
  const id = Number(req.params.id);
  if (!Number.isInteger(id) || id <= 0) return res.status(400).json({ mensagem: "ID inválido." });
  const mundo = req.sessao.mundo;
  const servico = mundo.servicos.find((s) => s.id === id);
  const linha = servico && linhaCatalogo(mundo, servico);
  if (!linha) return res.status(404).json({ mensagem: "Serviço não encontrado ou indisponível." });
  res.json(linha);
});

// ------------------------------------------------------
// GET /organizador/propostas
// Propostas recebidas nos eventos do organizador da sessão (mesmo formato
// de routes/organizador-propostas.js, com os mesmos filtros e validações).
// ------------------------------------------------------
const propostasOrganizador = express.Router();

propostasOrganizador.get("/propostas", (req, res) => {
  const mundo = req.sessao.mundo;
  const meusEventos = mundo.eventos.filter((e) => e.id_organizador === req.sessao.usuarioId);
  let filtroEvento = null;

  if (req.query.evento) {
    filtroEvento = Number(req.query.evento);
    if (!Number.isInteger(filtroEvento) || filtroEvento <= 0) {
      return res.status(400).json({ mensagem: "ID do evento inválido." });
    }
  }

  if (req.query.status && !["ENVIADA", "EM_ANALISE", "SELECIONADA", "RECUSADA"].includes(req.query.status)) {
    return res.status(400).json({ mensagem: "Status de proposta inválido." });
  }

  const lista = mundo.propostas
    .map((p) => {
      const evento = meusEventos.find((e) => e.id === p.id_evento);
      const servico = mundo.servicos.find((s) => s.id === p.id_servico);
      const f = mundo.usuarios.find((u) => u.id === p.id_fornecedor);
      if (!evento || !servico || !f) return null;
      if (filtroEvento && evento.id !== filtroEvento) return null;
      if (req.query.status && p.status !== req.query.status) return null;
      return {
        id: p.id,
        id_evento: p.id_evento,
        id_servico: p.id_servico,
        id_fornecedor: p.id_fornecedor,
        valor: Number(p.valor),
        prazo_dias: p.prazo_dias,
        observacao: p.observacao,
        status: p.status,
        criado_em: p.criado_em,
        evento_nome: evento.nome,
        data_evento: evento.data_evento,
        evento_local: evento.local,
        servico_nome: servico.nome,
        servico_categoria: servico.categoria,
        fornecedor_nome: f.razao_social || f.nome,
        fornecedor_razao_social: f.razao_social,
        regiao_atendimento: f.regiao_atendimento,
      };
    })
    .filter(Boolean)
    .sort((a, b) => b.criado_em.localeCompare(a.criado_em) || b.id - a.id);

  res.json(lista);
});

module.exports = { router, atualizarConta, catalogo, propostasOrganizador };

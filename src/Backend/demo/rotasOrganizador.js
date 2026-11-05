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

module.exports = { router, atualizarConta };

// ======================================================
// MODO DEMONSTRAÇÃO - PONTO DE ENTRADA
// ======================================================
// Montado em server.js ANTES de todas as rotas reais.
//
// Garantia de isolamento (fail-closed): toda requisição com token demo é
// atendida aqui, por uma lista fixa de rotas em memória, ou negada. Nenhuma
// requisição demo chega a um handler que fale com o MySQL.

const express = require("express");
const { ErroValidacao } = require("../lib/validacao");
const { criarSessao, resolverToken, encerrarSessao, PERFIS } = require("./sessoes");
const { USUARIO_DEMO } = require("./dados");
const rotasFornecedor = require("./rotasFornecedor");
const rotasAdmin = require("./rotasAdmin");
const { router: rotasOrganizador, atualizarConta } = require("./rotasOrganizador");

const router = express.Router();

// Limite simples por IP para a criação de sessões (evita encher a memória).
const JANELA_MS = 60 * 1000;
const MAX_POR_JANELA = 30;
const tentativas = new Map();

function limitarCriacao(req, res, next) {
  const agora = Date.now();
  const ip = req.ip || "desconhecido";
  const recentes = (tentativas.get(ip) || []).filter((t) => agora - t < JANELA_MS);
  if (recentes.length >= MAX_POR_JANELA) {
    return res.status(429).json({ mensagem: "Muitas tentativas de demonstração. Aguarde um minuto." });
  }
  recentes.push(agora);
  tentativas.set(ip, recentes);
  if (tentativas.size > 5000) tentativas.clear();
  next();
}

// POST /demo-login  { tipo: "ORGANIZADOR" | "FORNECEDOR" | "ADMINISTRADOR" }
router.post("/demo-login", limitarCriacao, (req, res) => {
  const tipo = req.body?.tipo;
  if (typeof tipo !== "string" || !PERFIS.includes(tipo)) {
    return res.status(400).json({ mensagem: "Perfil de demonstração inválido. Use ORGANIZADOR, FORNECEDOR ou ADMINISTRADOR." });
  }

  const { token } = criarSessao(tipo);
  res.status(200).json({ mensagem: "Modo demonstração iniciado", token, usuario: { ...USUARIO_DEMO[tipo], demo: true } });
});

// Guarda: só continua para o backend real quem NÃO tem token demo.
router.use((req, res, next) => {
  const cabecalho = req.headers.authorization;
  if (!cabecalho || !cabecalho.startsWith("Bearer ")) return next();

  const r = resolverToken(cabecalho.slice(7));
  if (!r.demo) return next();
  if (r.erro) return res.status(401).json({ mensagem: r.erro });

  req.sessao = r.sessao;
  req.usuario = { id: r.sessao.usuarioId, tipo: r.sessao.tipo, demo: true };
  next();
});

const exigirTipo = (tipo) => (req, res, next) =>
  req.sessao && req.sessao.tipo === tipo
    ? next()
    : res.status(403).json({ mensagem: "Acesso negado: perfil não autorizado" });

const soDemo = (req, res, next) => (req.sessao ? next() : next("router"));

// A partir daqui, só requisições demo (req.sessao definido).
const demo = express.Router();
demo.post("/demo-logout", (req, res) => {
  encerrarSessao(req.sessao.sid);
  res.json({ mensagem: "Sessão de demonstração encerrada" });
});
demo.use("/fornecedor", exigirTipo("FORNECEDOR"), rotasFornecedor);
demo.use("/admin", exigirTipo("ADMINISTRADOR"), rotasAdmin);
demo.use("/eventos", exigirTipo("ORGANIZADOR"), rotasOrganizador);
demo.patch("/usuarios/:id", atualizarConta);
demo.use((req, res) => {
  res.status(403).json({ mensagem: "Este recurso não está disponível no modo demonstração." });
});
demo.use((erro, req, res, next) => {
  if (erro instanceof ErroValidacao) return res.status(erro.status).json({ mensagem: erro.message });
  console.error("Erro no modo demonstração:", erro.message);
  res.status(500).json({ mensagem: "Erro interno do servidor" });
});

router.use(soDemo, demo);

module.exports = router;

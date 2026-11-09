// ======================================================
// SESSÕES DO MODO DEMONSTRAÇÃO
// ======================================================
// Cada clique em "demonstrar" cria uma sessão própria, com uma cópia
// independente dos dados fictícios, guardada somente na memória do processo.
//
// Isolamento:
//  - Os tokens demo são assinados com um segredo ALEATÓRIO deste processo,
//    diferente do JWT_SECRET. O backend real nunca consegue validar um token
//    demo (e o demo nunca valida um token real).
//  - Reiniciar o servidor apaga todas as sessões; os tokens antigos deixam
//    de valer e o front-end volta para o login.

const crypto = require("crypto");
const jwt = require("jsonwebtoken");
const { criarMundo, USUARIO_DEMO } = require("./dados");

const SEGREDO_DEMO = crypto.randomBytes(48).toString("hex");
const ISSUER = "ticketlab";
const AUDIENCE = "ticketlab-demo";
const DURACAO_MS = 2 * 60 * 60 * 1000;
const MAX_SESSOES = 200;

const PERFIS = ["ORGANIZADOR", "FORNECEDOR", "ADMINISTRADOR"];
const sessoes = new Map();

function limparExpiradas(agora = Date.now()) {
  for (const [sid, sessao] of sessoes) {
    if (sessao.expiraEm <= agora) sessoes.delete(sid);
  }
}

function criarSessao(tipo) {
  if (!PERFIS.includes(tipo)) return null;

  limparExpiradas();
  // Limite de memória: descarta a sessão mais antiga quando lotar.
  while (sessoes.size >= MAX_SESSOES) {
    sessoes.delete(sessoes.keys().next().value);
  }

  const sid = crypto.randomUUID();
  const usuario = USUARIO_DEMO[tipo];
  const sessao = {
    sid,
    tipo,
    usuarioId: usuario.id,
    expiraEm: Date.now() + DURACAO_MS,
    mundo: criarMundo(),
  };
  sessoes.set(sid, sessao);

  const token = jwt.sign({ id: usuario.id, tipo, demo: true, sid }, SEGREDO_DEMO, {
    expiresIn: Math.floor(DURACAO_MS / 1000),
    issuer: ISSUER,
    audience: AUDIENCE,
  });

  return { token, sessao };
}

// Resultado: { demo: false } (token não é demo -> segue para o backend real),
// { demo: true, erro } (token demo inválido/expirado) ou { demo: true, sessao }.
function resolverToken(token) {
  let payload;
  try {
    payload = jwt.verify(token, SEGREDO_DEMO, { issuer: ISSUER, audience: AUDIENCE });
  } catch (erro) {
    if (erro.name === "TokenExpiredError") {
      return { demo: true, erro: "Sessão de demonstração expirada. Entre novamente." };
    }
    return { demo: false };
  }

  const sessao = sessoes.get(payload.sid);
  if (!sessao || sessao.expiraEm <= Date.now() || sessao.tipo !== payload.tipo) {
    sessoes.delete(payload.sid);
    return { demo: true, erro: "Sessão de demonstração expirada. Entre novamente." };
  }

  return { demo: true, sessao };
}

function encerrarSessao(sid) {
  return sessoes.delete(sid);
}

module.exports = { criarSessao, resolverToken, encerrarSessao, PERFIS, _sessoes: sessoes };

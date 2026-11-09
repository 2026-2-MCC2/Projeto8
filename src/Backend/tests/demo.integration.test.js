// Testes do modo demonstração (três perfis).
//
// O próprio teste sobe o servidor numa porta livre e fala com ele por HTTP.
// Rode com:  node --env-file=.env.test --test tests/demo.integration.test.js
//
// O teste "não altera o banco real" só roda se o MySQL de teste estiver
// acessível (variáveis DB_*); os demais não dependem de banco.

const test = require("node:test");
const assert = require("node:assert/strict");
const { spawn } = require("node:child_process");
const net = require("node:net");
const path = require("node:path");
const jwt = require("jsonwebtoken");

let servidor;
let API;
let pool = null;

function portaLivre() {
  return new Promise((resolve) => {
    const s = net.createServer();
    s.listen(0, () => {
      const { port } = s.address();
      s.close(() => resolve(port));
    });
  });
}

async function api(caminho, { metodo = "GET", token, corpo } = {}) {
  const r = await fetch(`${API}${caminho}`, {
    method: metodo,
    headers: { "Content-Type": "application/json", ...(token && { Authorization: `Bearer ${token}` }) },
    body: corpo === undefined ? undefined : JSON.stringify(corpo),
  });
  const texto = await r.text();
  let dados = {};
  try { dados = texto ? JSON.parse(texto) : {}; } catch { dados = { texto }; }
  return { status: r.status, dados };
}

async function entrar(tipo) {
  const r = await api("/demo-login", { metodo: "POST", corpo: { tipo } });
  assert.equal(r.status, 200);
  return r.dados;
}

async function fotografiaBanco() {
  if (!pool) return null;
  const crypto = require("node:crypto");
  const tabelas = ["usuarios", "organizadores", "fornecedores", "eventos", "servicos", "precos_servicos", "propostas", "eventos_servicos"];
  const out = {};
  for (const t of tabelas) {
    const [linhas] = await pool.query(`SELECT * FROM ${t} ORDER BY 1`);
    out[t] = `${linhas.length}:${crypto.createHash("sha1").update(JSON.stringify(linhas)).digest("hex")}`;
  }
  return out;
}

test.before(async () => {
  const porta = await portaLivre();
  API = `http://127.0.0.1:${porta}`;
  servidor = spawn(process.execPath, ["server.js"], {
    cwd: path.join(__dirname, ".."),
    env: { ...process.env, PORT: String(porta), JWT_SECRET: process.env.JWT_SECRET || "segredo-de-teste-local-com-mais-de-32-caracteres" },
    stdio: "ignore",
  });

  for (let i = 0; i < 50; i++) {
    try {
      const r = await fetch(`${API}/`);
      if (r.ok) break;
    } catch { /* aguardando */ }
    await new Promise((r) => setTimeout(r, 100));
  }

  if (process.env.DB_HOST) {
    try {
      const p = require("../pool");
      await p.query("SELECT 1");
      pool = p;
    } catch { pool = null; }
  }
});

test.after(async () => {
  servidor?.kill();
  if (pool) await pool.end();
});

test("demo-login: valida o perfil solicitado", async () => {
  for (const corpo of [{}, { tipo: "ADMIN" }, { tipo: "administrador" }, { tipo: 1 }, undefined]) {
    const r = await api("/demo-login", { metodo: "POST", corpo });
    assert.equal(r.status, 400, JSON.stringify(corpo));
  }
});

test("demo-login: cada perfil recebe identidade e token próprios", async () => {
  const ids = new Set();
  for (const tipo of ["ORGANIZADOR", "FORNECEDOR", "ADMINISTRADOR"]) {
    const { token, usuario } = await entrar(tipo);
    assert.equal(usuario.tipo, tipo);
    assert.equal(usuario.demo, true);
    assert.ok(!("senha_hash" in usuario));
    ids.add(usuario.id);
    const claims = jwt.decode(token);
    assert.equal(claims.tipo, tipo);
    assert.equal(claims.demo, true);
    assert.ok(claims.exp - claims.iat <= 2 * 60 * 60);
  }
  assert.equal(ids.size, 3);
});

test("token demo não é válido para o JWT_SECRET real (assinatura própria)", async () => {
  const { token } = await entrar("ADMINISTRADOR");
  assert.throws(() => jwt.verify(token, process.env.JWT_SECRET || "segredo-de-teste-local-com-mais-de-32-caracteres"));
});

test("token real forjado com demo:true é recusado nas rotas reais", async () => {
  const segredo = process.env.JWT_SECRET || "segredo-de-teste-local-com-mais-de-32-caracteres";
  const falso = jwt.sign({ id: 1, tipo: "ADMINISTRADOR", demo: true }, segredo);
  const r = await api("/usuarios", { token: falso });
  assert.equal(r.status, 403);
});

test("token demo adulterado ou de outro segredo é recusado", async () => {
  const falso = jwt.sign({ id: 999997, tipo: "ADMINISTRADOR", demo: true, sid: "x" }, "outro-segredo");
  assert.equal((await api("/admin/dashboard", { token: falso })).status, 401);
  assert.equal((await api("/admin/dashboard", { token: "lixo" })).status, 401);
  assert.equal((await api("/admin/dashboard")).status, 401);
});

test("autorização por perfil: cada demo só acessa as próprias rotas", async () => {
  const org = (await entrar("ORGANIZADOR")).token;
  const forn = (await entrar("FORNECEDOR")).token;
  const adm = (await entrar("ADMINISTRADOR")).token;

  assert.equal((await api("/eventos", { token: org })).status, 200);
  assert.equal((await api("/eventos", { token: forn })).status, 403);
  assert.equal((await api("/eventos", { token: adm })).status, 403);

  assert.equal((await api("/fornecedor/dashboard", { token: forn })).status, 200);
  assert.equal((await api("/fornecedor/dashboard", { token: org })).status, 403);
  assert.equal((await api("/fornecedor/dashboard", { token: adm })).status, 403);

  assert.equal((await api("/admin/dashboard", { token: adm })).status, 200);
  assert.equal((await api("/admin/dashboard", { token: org })).status, 403);
  assert.equal((await api("/admin/dashboard", { token: forn })).status, 403);
});

test("rotas reais baseadas em banco ficam bloqueadas para qualquer token demo", async () => {
  const adm = (await entrar("ADMINISTRADOR")).token;
  assert.equal((await api("/usuarios", { token: adm })).status, 403);
  assert.equal((await api("/usuarios/1", { token: adm })).status, 403);
  assert.equal((await api("/usuarios/1", { metodo: "DELETE", token: adm })).status, 403);
  assert.equal((await api("/usuarios/1", { metodo: "PATCH", token: adm, corpo: { nome: "x" } })).status, 403);
  assert.equal((await api("/qualquer-coisa", { token: adm })).status, 403);
});

test("organizador demo: lista, cria e valida eventos", async () => {
  const { token } = await entrar("ORGANIZADOR");
  const antes = await api("/eventos", { token });
  assert.equal(antes.status, 200);
  assert.ok(antes.dados.length >= 1);
  assert.ok(antes.dados.every((e) => e.id_organizador === undefined));

  const invalido = await api("/eventos", { metodo: "POST", token, corpo: { nome: "x" } });
  assert.equal(invalido.status, 400);
  const minMaior = await api("/eventos", {
    metodo: "POST", token,
    corpo: { nome: "x", horario: "10:00", data_evento: "2030-01-01", publico_min: 50, publico_max: 10, local: "y" },
  });
  assert.equal(minMaior.status, 400);
  const dataRuim = await api("/eventos", {
    metodo: "POST", token,
    corpo: { nome: "x", horario: "10:00", data_evento: "2030-02-31", publico_min: 10, publico_max: 50, local: "y" },
  });
  assert.equal(dataRuim.status, 400);

  const criado = await api("/eventos", {
    metodo: "POST", token,
    corpo: { nome: "Meu evento demo", descricao: "d", horario: "19:30", data_evento: "2030-05-10", publico_min: 10, publico_max: 50, local: "Local" },
  });
  assert.equal(criado.status, 201);

  const depois = await api("/eventos", { token });
  assert.equal(depois.dados.length, antes.dados.length + 1);
  const novo = depois.dados.find((e) => e.id === criado.dados.id);
  assert.equal(novo.horario, "19:30:00");
  assert.equal(novo.status, "PLANEJAMENTO");
});

test("sessões demo são isoladas entre si", async () => {
  const a = (await entrar("ORGANIZADOR")).token;
  const b = (await entrar("ORGANIZADOR")).token;
  const base = (await api("/eventos", { token: b })).dados.length;
  await api("/eventos", {
    metodo: "POST", token: a,
    corpo: { nome: "Só da sessão A", horario: "10:00", data_evento: "2030-05-10", publico_min: 1, publico_max: 2, local: "L" },
  });
  assert.equal((await api("/eventos", { token: b })).dados.length, base);

  const fa = (await entrar("FORNECEDOR")).token;
  const fb = (await entrar("FORNECEDOR")).token;
  const servicoBase = (await api("/fornecedor/servicos", { token: fb })).dados.length;
  const novo = await api("/fornecedor/servicos", {
    metodo: "POST", token: fa,
    corpo: { nome: "Isolado", descricao: "d", categoria: "OUTROS", preco: 100, publico_min: 1, publico_max: 10 },
  });
  assert.equal(novo.status, 201);
  assert.equal((await api("/fornecedor/servicos", { token: fb })).dados.length, servicoBase);
});

test("fornecedor demo: serviços (criar, editar, excluir) e validações", async () => {
  const { token } = await entrar("FORNECEDOR");
  const perfil = await api("/fornecedor/perfil", { token });
  assert.equal(perfil.status, 200);
  assert.equal(perfil.dados.status, "APROVADO");

  const ruim = await api("/fornecedor/servicos", { metodo: "POST", token, corpo: { nome: "" } });
  assert.equal(ruim.status, 400);

  const corpo = { nome: "Luz cênica", descricao: "Iluminação", categoria: "ESTRUTURA", preco: 2500.5, publico_min: 10, publico_max: 500 };
  const criado = await api("/fornecedor/servicos", { metodo: "POST", token, corpo });
  assert.equal(criado.status, 201);
  const id = criado.dados.servico.id;

  const edit = await api(`/fornecedor/servicos/${id}`, { metodo: "PUT", token, corpo: { ...corpo, preco: 3000 } });
  assert.equal(edit.status, 200);
  assert.equal(edit.dados.servico.preco, 3000);

  assert.equal((await api(`/fornecedor/servicos/${id}`, { metodo: "DELETE", token })).status, 200);
  assert.equal((await api(`/fornecedor/servicos/${id}`, { token })).status, 404);
});

test("fornecedor demo: oportunidades, envio e retirada de proposta", async () => {
  const { token } = await entrar("FORNECEDOR");
  const ops = await api("/fornecedor/oportunidades", { token });
  assert.equal(ops.status, 200);
  assert.ok(ops.dados.length > 0);

  const busca = await api("/fornecedor/oportunidades?busca=feira", { token });
  assert.ok(busca.dados.length >= 1 && busca.dados.every((e) => /feira/i.test(e.nome + e.local)));

  const livre = ops.dados.find((e) => e.minhas_propostas === 0);
  const det = await api(`/fornecedor/oportunidades/${livre.id}`, { token });
  assert.equal(det.status, 200);
  assert.equal(det.dados.aberta, true);
  const servico = det.dados.servicos.find((s) => !s.id_proposta);
  assert.ok(servico);

  const antes = (await api("/fornecedor/propostas", { token })).dados.length;
  const enviada = await api("/fornecedor/propostas", {
    metodo: "POST", token, corpo: { id_evento: livre.id, id_servico: servico.id, valor: 1999.9, prazo_dias: 5, observacao: "ok" },
  });
  assert.equal(enviada.status, 201);
  assert.equal(enviada.dados.proposta.status, "ENVIADA");

  const dup = await api("/fornecedor/propostas", {
    metodo: "POST", token, corpo: { id_evento: livre.id, id_servico: servico.id, valor: 10, prazo_dias: 5 },
  });
  assert.equal(dup.status, 409);
  const invalida = await api("/fornecedor/propostas", {
    metodo: "POST", token, corpo: { id_evento: livre.id, id_servico: servico.id, valor: -1, prazo_dias: 5 },
  });
  assert.equal(invalida.status, 400);

  assert.equal((await api("/fornecedor/propostas", { token })).dados.length, antes + 1);
  const dash = await api("/fornecedor/dashboard", { token });
  assert.equal(dash.dados.propostas_enviadas, antes + 1);

  assert.equal((await api(`/fornecedor/propostas/${enviada.dados.proposta.id}`, { metodo: "DELETE", token })).status, 200);
  assert.equal((await api("/fornecedor/propostas", { token })).dados.length, antes);

  const analisada = (await api("/fornecedor/propostas?status=EM_ANALISE", { token })).dados[0];
  assert.equal((await api(`/fornecedor/propostas/${analisada.id}`, { metodo: "DELETE", token })).status, 409);
  assert.equal((await api("/fornecedor/propostas?status=XX", { token })).status, 400);
});

test("fornecedor demo: perfil não aceita troca de senha", async () => {
  const { token } = await entrar("FORNECEDOR");
  const ok = await api("/fornecedor/perfil", { metodo: "PATCH", token, corpo: { nome: "Novo Nome" } });
  assert.equal(ok.status, 200);
  assert.equal(ok.dados.perfil.nome, "Novo Nome");
  const senha = await api("/fornecedor/perfil", { metodo: "PATCH", token, corpo: { senha_atual: "123456", nova_senha: "654321" } });
  assert.equal(senha.status, 403);
});

test("administrador demo: indicadores, listagens e análise de cadastros", async () => {
  const { token } = await entrar("ADMINISTRADOR");
  const dash = await api("/admin/dashboard", { token });
  assert.equal(dash.status, 200);
  assert.ok(dash.dados.totais.organizadores > 0 && dash.dados.totais.fornecedores > 0);

  assert.equal((await api("/admin/relatorios", { token })).dados.eventos_por_status.length, 4);
  const eventos = await api("/admin/eventos", { token });
  assert.ok(eventos.dados.some((e) => e.status === "CONCLUIDO"));
  assert.ok(eventos.dados.some((e) => e.propostas.length > 0));

  const pend = await api("/admin/cadastros?status=PENDENTE", { token });
  assert.ok(pend.dados.length >= 2);
  const alvo = pend.dados.find((c) => c.tipo === "FORNECEDOR");

  const semMotivo = await api(`/admin/cadastros/${alvo.id}/status`, { metodo: "PATCH", token, corpo: { status: "REJEITADO" } });
  assert.equal(semMotivo.status, 400);
  assert.equal((await api(`/admin/cadastros/${alvo.id}/status`, { metodo: "PATCH", token, corpo: { status: "XX" } })).status, 400);
  assert.equal((await api("/admin/cadastros/424242/status", { metodo: "PATCH", token, corpo: { status: "APROVADO" } })).status, 404);

  const aprovado = await api(`/admin/cadastros/${alvo.id}/status`, { metodo: "PATCH", token, corpo: { status: "APROVADO" } });
  assert.equal(aprovado.status, 200);
  assert.equal(aprovado.dados.cadastro.status, "APROVADO");
  assert.equal(aprovado.dados.cadastro.tipo, "FORNECEDOR");

  const rej = await api(`/admin/cadastros/${alvo.id}/status`, { metodo: "PATCH", token, corpo: { status: "REJEITADO", motivo: "Documento ilegível" } });
  assert.equal(rej.dados.cadastro.motivo_rejeicao, "Documento ilegível");
  const reab = await api(`/admin/cadastros/${alvo.id}/status`, { metodo: "PATCH", token, corpo: { status: "PENDENTE" } });
  assert.equal(reab.dados.cadastro.status, "PENDENTE");
  assert.equal(reab.dados.cadastro.motivo_rejeicao, null);

  const pend2 = await api("/admin/cadastros?status=PENDENTE", { token });
  assert.equal(pend2.dados.length, pend.dados.length);

  // a análise de uma sessão não vaza para outra
  const outra = (await entrar("ADMINISTRADOR")).token;
  await api(`/admin/cadastros/${alvo.id}/status`, { metodo: "PATCH", token, corpo: { status: "APROVADO" } });
  const naOutra = await api("/admin/cadastros?status=PENDENTE", { token: outra });
  assert.equal(naOutra.dados.length, pend.dados.length);
});

test("encerramento: demo-logout invalida o token", async () => {
  const { token } = await entrar("ORGANIZADOR");
  assert.equal((await api("/eventos", { token })).status, 200);
  assert.equal((await api("/demo-logout", { metodo: "POST", token })).status, 200);
  const r = await api("/eventos", { token });
  assert.equal(r.status, 401);
  assert.match(r.dados.mensagem, /expirada/i);
});

test("expiração: token demo vencido é recusado com 401", async () => {
  const sessoes = require("../demo/sessoes");
  // O segredo é interno ao processo do servidor; aqui validamos a regra
  // no módulo carregado neste processo (mesmo código do servidor).
  const { token } = sessoes.criarSessao("ORGANIZADOR");
  assert.equal(sessoes.resolverToken(token).demo, true);
  const sid = jwt.decode(token).sid;
  sessoes._sessoes.get(sid).expiraEm = Date.now() - 1;
  const r = sessoes.resolverToken(token);
  assert.equal(r.demo, true);
  assert.ok(r.erro);
});

test("login normal continua funcionando para credenciais inválidas (400/401)", async () => {
  assert.equal((await api("/login", { metodo: "POST", corpo: {} })).status, 400);
  if (pool) {
    assert.equal((await api("/login", { metodo: "POST", corpo: { email: "nao@existe.com", senha: "123456" } })).status, 401);
  }
});

test("operações demo não alteram o banco real", { skip: process.env.DB_HOST ? false : "sem banco configurado" }, async (t) => {
  if (!pool) return t.skip("MySQL de teste inacessível");
  const antes = await fotografiaBanco();

  const adm = (await entrar("ADMINISTRADOR")).token;
  const forn = (await entrar("FORNECEDOR")).token;
  const org = (await entrar("ORGANIZADOR")).token;

  await api("/admin/cadastros/101/status", { metodo: "PATCH", token: adm, corpo: { status: "REJEITADO", motivo: "teste" } });
  // ids reais possíveis também não são afetados: o token demo não chega ao banco
  const [reais] = await pool.query("SELECT id FROM usuarios LIMIT 3");
  for (const { id } of reais) {
    await api(`/admin/cadastros/${id}/status`, { metodo: "PATCH", token: adm, corpo: { status: "REJEITADO", motivo: "teste" } });
    await api(`/usuarios/${id}`, { metodo: "DELETE", token: adm });
    await api(`/usuarios/${id}`, { metodo: "PATCH", token: adm, corpo: { nome: "HACK" } });
  }
  await api("/fornecedor/servicos", { metodo: "POST", token: forn, corpo: { nome: "Demo", descricao: "d", categoria: "OUTROS", preco: 10, publico_min: 1, publico_max: 2 } });
  await api("/eventos", { metodo: "POST", token: org, corpo: { nome: "Demo", horario: "10:00", data_evento: "2030-05-10", publico_min: 1, publico_max: 2, local: "L" } });

  assert.deepEqual(await fotografiaBanco(), antes);
});

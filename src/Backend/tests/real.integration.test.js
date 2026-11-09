// Testes das rotas reais alteradas na revisão final: login, POST/GET /eventos
// (validação compartilhada) e PATCH /usuarios/:id (troca de senha).
// Exige o MySQL de TESTE (variáveis DB_*). Rode com:
//   node --env-file=.env.test --test tests/real.integration.test.js

const test = require("node:test");
const assert = require("node:assert/strict");
const { spawn } = require("node:child_process");
const net = require("node:net");
const path = require("node:path");
const bcrypt = require("bcrypt");
const pool = require("../pool");

let servidor;
let API;
const sufixo = Date.now();
const SENHA = "senha123";

function portaLivre() {
  return new Promise((resolve) => {
    const s = net.createServer();
    s.listen(0, () => { const { port } = s.address(); s.close(() => resolve(port)); });
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

async function criarOrganizador(nome) {
  const email = `real-${nome}-${sufixo}@teste.com`;
  const [u] = await pool.query(
    `INSERT INTO usuarios (nome, email, telefone, senha_hash, tipo, status) VALUES (?, ?, '11999990000', ?, 'ORGANIZADOR', 'APROVADO')`,
    [nome, email, bcrypt.hashSync(SENHA, 4)]
  );
  await pool.query("INSERT INTO organizadores (id_usuario, tipo_pessoa, documento) VALUES (?, 'PF', ?)", [u.insertId, `${sufixo}${u.insertId}`.slice(-11)]);
  const login = await api("/login", { metodo: "POST", corpo: { email, senha: SENHA } });
  return { id: u.insertId, email, token: login.dados.token };
}

test.before(async () => {
  const porta = await portaLivre();
  API = `http://127.0.0.1:${porta}`;
  servidor = spawn(process.execPath, ["server.js"], {
    cwd: path.join(__dirname, ".."), env: { ...process.env, PORT: String(porta) }, stdio: "ignore",
  });
  for (let i = 0; i < 50; i++) {
    try { if ((await fetch(`${API}/`)).ok) break; } catch { /* aguardando */ }
    await new Promise((r) => setTimeout(r, 100));
  }
});

test.after(async () => { servidor?.kill(); await pool.end(); });

test("login normal devolve token sem a propriedade demo", async () => {
  const org = await criarOrganizador("Login");
  assert.ok(org.token);
  const payload = JSON.parse(Buffer.from(org.token.split(".")[1], "base64url").toString());
  assert.equal(payload.demo, undefined);
  assert.equal(payload.tipo, "ORGANIZADOR");
});

test("eventos reais: cria, lista só os próprios e valida entrada", async () => {
  const a = await criarOrganizador("EvA");
  const b = await criarOrganizador("EvB");
  const corpo = { nome: "Evento Real", descricao: "d", horario: "20:00", data_evento: "2031-03-01", publico_min: 10, publico_max: 100, local: "Salão" };

  assert.equal((await api("/eventos", { metodo: "POST", token: a.token, corpo })).status, 201);
  assert.equal((await api("/eventos", { token: a.token })).dados.length, 1);
  assert.equal((await api("/eventos", { token: b.token })).dados.length, 0);

  const invalidos = [
    {}, { ...corpo, nome: 5 }, { ...corpo, publico_min: 100, publico_max: 10 }, { ...corpo, data_evento: "01/03/2031" },
    { ...corpo, data_evento: "2031-02-30" }, { ...corpo, horario: "25:00" }, { ...corpo, nome: "x".repeat(101) },
  ];
  for (const c of invalidos) {
    assert.equal((await api("/eventos", { metodo: "POST", token: a.token, corpo: c })).status, 400, JSON.stringify(c));
  }
  assert.equal((await api("/eventos", { metodo: "POST", corpo })).status, 401);
});

test("PATCH /usuarios/:id: troca de senha realmente grava hash bcrypt", async () => {
  const u = await criarOrganizador("Senha");
  const r = await api(`/usuarios/${u.id}`, { metodo: "PATCH", token: u.token, corpo: { senha: "novaSenha1" } });
  assert.equal(r.status, 200);

  assert.equal((await api("/login", { metodo: "POST", corpo: { email: u.email, senha: SENHA } })).status, 401);
  assert.equal((await api("/login", { metodo: "POST", corpo: { email: u.email, senha: "novaSenha1" } })).status, 200);
});

test("PATCH /usuarios/:id: senha_hash enviado pelo cliente é ignorado", async () => {
  const u = await criarOrganizador("Hash");
  const [[antes]] = await pool.query("SELECT senha_hash FROM usuarios WHERE id = ?", [u.id]);
  const r = await api(`/usuarios/${u.id}`, { metodo: "PATCH", token: u.token, corpo: { nome: "Hash Novo", senha_hash: "invasor" } });
  assert.equal(r.status, 200);
  const [[depois]] = await pool.query("SELECT senha_hash, nome FROM usuarios WHERE id = ?", [u.id]);
  assert.equal(depois.senha_hash, antes.senha_hash);
  assert.equal(depois.nome, "Hash Novo");
});

test("PATCH /usuarios/:id: não permite alterar outro usuário", async () => {
  const a = await criarOrganizador("PA");
  const b = await criarOrganizador("PB");
  assert.equal((await api(`/usuarios/${b.id}`, { metodo: "PATCH", token: a.token, corpo: { nome: "x" } })).status, 403);
  assert.equal((await api(`/usuarios/${a.id}`, { metodo: "PATCH", token: a.token, corpo: { senha: "123" } })).status, 400);
});

test("rotas administrativas reais continuam exigindo ADMINISTRADOR", async () => {
  const a = await criarOrganizador("NaoAdmin");
  assert.equal((await api("/admin/dashboard", { token: a.token })).status, 403);
  assert.equal((await api("/usuarios", { token: a.token })).status, 403);
  assert.equal((await api("/fornecedor/dashboard", { token: a.token })).status, 403);
});

// ---------- Cadastro e gestão administrativa (rotas reais, banco de teste) ----------

async function criarAdmin() {
  const email = `admin-${sufixo}-${Math.random().toString(36).slice(2, 8)}@teste.com`;
  const [u] = await pool.query(
    `INSERT INTO usuarios (nome, email, telefone, senha_hash, tipo, status) VALUES ('Admin Teste', ?, '11999990000', ?, 'ADMINISTRADOR', 'APROVADO')`,
    [email, bcrypt.hashSync(SENHA, 4)]
  );
  const login = await api("/login", { metodo: "POST", corpo: { email, senha: SENHA } });
  return { id: u.insertId, token: login.dados.token };
}

test("cadastro de organizador: fica PENDENTE e não consegue logar até ser aprovado", async () => {
  const email = `org-cadastro-${sufixo}@teste.com`;
  const cadastro = await api("/organizadores", {
    metodo: "POST",
    corpo: { nome: "Org Cadastro", email, senha: "SenhaTeste123", telefone: "11999990000", tipo_pessoa: "PF", documento: `9${String(sufixo).slice(-10)}`, data_nascimento: "1995-05-05" },
  });
  assert.equal(cadastro.status, 201);
  const [[u]] = await pool.query("SELECT tipo, status FROM usuarios WHERE email = ?", [email]);
  assert.equal(u.tipo, "ORGANIZADOR");
  assert.equal(u.status, "PENDENTE");
  assert.equal((await api("/login", { metodo: "POST", corpo: { email, senha: "SenhaTeste123" } })).status, 403);
});

test("administrador real: aprova, rejeita e reabre cadastro (status muda, tipo não)", async () => {
  const admin = await criarAdmin();
  const email = `org-aprov-${sufixo}@teste.com`;
  await api("/organizadores", {
    metodo: "POST",
    corpo: { nome: "Org Aprov", email, senha: "SenhaTeste123", telefone: "11999990000", tipo_pessoa: "PJ", documento: `8${String(sufixo).slice(-12)}` },
  });
  const [[novo]] = await pool.query("SELECT id FROM usuarios WHERE email = ?", [email]);

  const pend = await api("/admin/cadastros?status=PENDENTE", { token: admin.token });
  assert.equal(pend.status, 200);
  assert.ok(pend.dados.some((c) => c.id === novo.id));

  const rejSemMotivo = await api(`/admin/cadastros/${novo.id}/status`, { metodo: "PATCH", token: admin.token, corpo: { status: "REJEITADO" } });
  assert.equal(rejSemMotivo.status, 400);

  const aprov = await api(`/admin/cadastros/${novo.id}/status`, { metodo: "PATCH", token: admin.token, corpo: { status: "APROVADO" } });
  assert.equal(aprov.status, 200);
  const [[depois]] = await pool.query("SELECT tipo, status, analisado_por FROM usuarios WHERE id = ?", [novo.id]);
  assert.equal(depois.status, "APROVADO");
  assert.equal(depois.tipo, "ORGANIZADOR");
  assert.equal(depois.analisado_por, admin.id);
  assert.equal((await api("/login", { metodo: "POST", corpo: { email, senha: "SenhaTeste123" } })).status, 200);

  const rej = await api(`/admin/cadastros/${novo.id}/status`, { metodo: "PATCH", token: admin.token, corpo: { status: "REJEITADO", motivo: "Dados inválidos" } });
  assert.equal(rej.dados.cadastro.motivo_rejeicao, "Dados inválidos");
  const reab = await api(`/admin/cadastros/${novo.id}/status`, { metodo: "PATCH", token: admin.token, corpo: { status: "PENDENTE" } });
  assert.equal(reab.dados.cadastro.status, "PENDENTE");

  // nunca atua sobre outro administrador
  assert.equal((await api(`/admin/cadastros/${admin.id}/status`, { metodo: "PATCH", token: admin.token, corpo: { status: "REJEITADO", motivo: "x" } })).status, 404);
});

test("administrador real: dashboard, eventos e relatórios respondem no formato esperado", async () => {
  const admin = await criarAdmin();
  const dash = await api("/admin/dashboard", { token: admin.token });
  assert.equal(dash.status, 200);
  assert.ok("organizadores" in dash.dados.totais && Array.isArray(dash.dados.atividades) && "cadastros_aprovados" in dash.dados.saude);
  const ev = await api("/admin/eventos", { token: admin.token });
  assert.equal(ev.status, 200);
  assert.ok(Array.isArray(ev.dados));
  const rel = await api("/admin/relatorios", { token: admin.token });
  assert.equal(rel.status, 200);
  assert.equal(rel.dados.eventos_por_status.length, 4);
});

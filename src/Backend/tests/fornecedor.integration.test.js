// Testes de integração do módulo do fornecedor.
//
// Exercitam a API HTTP real e conferem o resultado direto no MySQL.
// Rode contra um banco de TESTE (nunca o de produção/desenvolvimento):
//
//   1. Crie o banco de teste com schema.sql + migrations/001 (ver README)
//   2. node --env-file=.env.test server.js          (terminal 1)
//   3. node --env-file=.env.test --test tests/      (terminal 2)
//
// O banco é lido das mesmas variáveis DB_* usadas pelo servidor.

const test = require("node:test");
const assert = require("node:assert/strict");
const bcrypt = require("bcrypt");
const pool = require("../pool");

const API = process.env.TEST_API_URL || `http://localhost:${process.env.PORT || 3100}`;
const SENHA = "senha123";
const sufixo = Date.now();

async function api(caminho, { metodo = "GET", token, corpo } = {}) {
  const resposta = await fetch(`${API}${caminho}`, {
    method: metodo,
    headers: {
      "Content-Type": "application/json",
      ...(token && { Authorization: `Bearer ${token}` }),
    },
    body: corpo === undefined ? undefined : JSON.stringify(corpo),
  });

  const texto = await resposta.text();
  let dados = {};
  try {
    dados = texto ? JSON.parse(texto) : {};
  } catch {
    dados = { texto };
  }

  return { status: resposta.status, dados };
}

async function criarUsuario({ nome, tipo, status = "APROVADO", cnpj, categoria }) {
  const email = `${tipo.toLowerCase()}-${nome}-${sufixo}@teste.com`;
  const [usuario] = await pool.query(
    `INSERT INTO usuarios (nome, email, telefone, senha_hash, tipo, status)
     VALUES (?, ?, '11999990000', ?, ?, ?)`,
    [nome, email, bcrypt.hashSync(SENHA, 4), tipo, status]
  );

  if (tipo === "FORNECEDOR") {
    await pool.query(
      "INSERT INTO fornecedores (id_usuario, CNPJ, categoria_atuacao) VALUES (?, ?, ?)",
      [usuario.insertId, cnpj, categoria]
    );
  } else {
    await pool.query(
      "INSERT INTO organizadores (id_usuario, tipo_pessoa, documento) VALUES (?, 'PF', ?)",
      [usuario.insertId, `${sufixo}${usuario.insertId}`.slice(-11)]
    );
  }

  return { id: usuario.insertId, email };
}

async function criarEvento(idOrganizador, { nome, dias, status = "PLANEJAMENTO", local = "São Paulo" }) {
  const [resultado] = await pool.query(
    `INSERT INTO eventos (id_organizador, nome, descricao, local, data_evento, horario,
                          publico_min, publico_max, status)
     VALUES (?, ?, 'desc', ?, DATE_ADD(CURDATE(), INTERVAL ? DAY), '20:00:00', 100, 500, ?)`,
    [idOrganizador, nome, local, dias, status]
  );
  return resultado.insertId;
}

const ctx = {};
const emailsCadastroTeste = [];

const servicoValido = {
  nome: "DJ para eventos universitários",
  descricao: "Set de 4 horas com equipamento próprio.",
  categoria: "ENTRETENIMENTO",
  preco: 2800,
  publico_min: 100,
  publico_max: 1500,
};

test.before(async () => {
  ctx.fornA = await criarUsuario({ nome: "ForA", tipo: "FORNECEDOR", cnpj: `A${sufixo}`.slice(0, 14), categoria: "ENTRETENIMENTO" });
  ctx.fornB = await criarUsuario({ nome: "ForB", tipo: "FORNECEDOR", cnpj: `B${sufixo}`.slice(0, 14), categoria: "DECORACAO" });
  ctx.fornPend = await criarUsuario({ nome: "ForPend", tipo: "FORNECEDOR", status: "PENDENTE", cnpj: `C${sufixo}`.slice(0, 14), categoria: "OUTROS" });
  ctx.org = await criarUsuario({ nome: "Org", tipo: "ORGANIZADOR" });

  for (const chave of ["fornA", "fornB", "org"]) {
    const { status, dados } = await api("/login", { metodo: "POST", corpo: { email: ctx[chave].email, senha: SENHA } });
    assert.equal(status, 200, `login de ${chave}`);
    ctx[chave].token = dados.token;
  }

  ctx.eventoFuturo = await criarEvento(ctx.org.id, { nome: `Festa Aberta ${sufixo}`, dias: 30, local: "Campinas" });
  ctx.eventoOutro = await criarEvento(ctx.org.id, { nome: `Choppada ${sufixo}`, dias: 45 });
  ctx.eventoPassado = await criarEvento(ctx.org.id, { nome: `Evento Passado ${sufixo}`, dias: -10 });
  ctx.eventoCancelado = await criarEvento(ctx.org.id, { nome: `Evento Cancelado ${sufixo}`, dias: 20, status: "CANCELADO" });
});

test.after(async () => {
  const ids = [ctx.fornA.id, ctx.fornB.id, ctx.fornPend.id];

  if (emailsCadastroTeste.length > 0) {
    const [usuariosCadastro] = await pool.query(
      "SELECT id FROM usuarios WHERE email IN (?)",
      [emailsCadastroTeste]
    );

    ids.push(...usuariosCadastro.map((usuario) => usuario.id));
  }
  await pool.query("DELETE FROM propostas WHERE id_fornecedor IN (?)", [ids]);
  await pool.query("DELETE FROM precos_servicos WHERE id_servico IN (SELECT id FROM servicos WHERE id_fornecedor IN (?))", [ids]);
  await pool.query("DELETE FROM servicos WHERE id_fornecedor IN (?)", [ids]);
  await pool.query("DELETE FROM eventos WHERE id_organizador = ?", [ctx.org.id]);
  await pool.query("DELETE FROM fornecedores WHERE id_usuario IN (?)", [ids]);
  await pool.query("DELETE FROM organizadores WHERE id_usuario = ?", [ctx.org.id]);
  await pool.query("DELETE FROM usuarios WHERE id IN (?)", [[...ids, ctx.org.id]]);
  await pool.end();
});

test("autenticação e autorização", async (t) => {
  await t.test("sem token -> 401", async () => {
    assert.equal((await api("/fornecedor/servicos")).status, 401);
  });

  await t.test("token de organizador -> 403", async () => {
    assert.equal((await api("/fornecedor/servicos", { token: ctx.org.token })).status, 403);
    assert.equal((await api("/fornecedor/dashboard", { token: ctx.org.token })).status, 403);
  });

  await t.test("fornecedor pendente não consegue fazer login (regra de aprovação)", async () => {
    const { status } = await api("/login", { metodo: "POST", corpo: { email: ctx.fornPend.email, senha: SENHA } });
    assert.equal(status, 403);
  });

  await t.test("token de fornecedor não acessa rotas do organizador", async () => {
    assert.equal((await api("/eventos", { token: ctx.fornA.token })).status, 403);
  });

  await t.test("organizador continua listando só os próprios eventos", async () => {
    const { status, dados } = await api("/eventos", { token: ctx.org.token });
    assert.equal(status, 200);
    assert.ok(dados.some((e) => e.id === ctx.eventoFuturo));
  });
});

test("perfil", async (t) => {
  await t.test("GET devolve dados de usuarios + fornecedores, sem senha", async () => {
    const { status, dados } = await api("/fornecedor/perfil", { token: ctx.fornA.token });
    assert.equal(status, 200);
    assert.equal(dados.nome, "ForA");
    assert.equal(dados.categoria_atuacao, "ENTRETENIMENTO");
    assert.ok(dados.cnpj);
    assert.equal(dados.senha_hash, undefined);
  });

  await t.test("PATCH grava nome, telefone e categoria no MySQL; CNPJ é imutável", async () => {
    const [[antes]] = await pool.query("SELECT CNPJ FROM fornecedores WHERE id_usuario = ?", [ctx.fornA.id]);
    const { status } = await api("/fornecedor/perfil", {
      metodo: "PATCH",
      token: ctx.fornA.token,
      corpo: { nome: "ForA Novo", telefone: "11988887777", categoria_atuacao: "ESTRUTURA", cnpj: "00000000000000", status: "REJEITADO", tipo: "ADMINISTRADOR" },
    });
    assert.equal(status, 200);

    const [[linha]] = await pool.query(
      `SELECT u.nome, u.telefone, u.tipo, u.status, f.categoria_atuacao, f.CNPJ
         FROM usuarios u JOIN fornecedores f ON f.id_usuario = u.id WHERE u.id = ?`,
      [ctx.fornA.id]
    );
    assert.equal(linha.nome, "ForA Novo");
    assert.equal(linha.telefone, "11988887777");
    assert.equal(linha.categoria_atuacao, "ESTRUTURA");
    assert.equal(linha.CNPJ, antes.CNPJ);
    assert.equal(linha.tipo, "FORNECEDOR");
    assert.equal(linha.status, "APROVADO");
  });

  await t.test("validações -> 400", async () => {
    for (const corpo of [{ telefone: "123" }, { email: "sem-arroba" }, { nome: "   " }, { categoria_atuacao: "XYZ" }, {}]) {
      const { status } = await api("/fornecedor/perfil", { metodo: "PATCH", token: ctx.fornA.token, corpo });
      assert.equal(status, 400, JSON.stringify(corpo));
    }
  });

  await t.test("e-mail duplicado -> 409", async () => {
    const { status } = await api("/fornecedor/perfil", { metodo: "PATCH", token: ctx.fornA.token, corpo: { email: ctx.fornB.email } });
    assert.equal(status, 409);
  });

  await t.test("troca de senha exige senha atual e grava hash bcrypt", async () => {
    const errada = await api("/fornecedor/perfil", { metodo: "PATCH", token: ctx.fornB.token, corpo: { senha_atual: "xxxxxx", nova_senha: "novaSenha1" } });
    assert.equal(errada.status, 403);

    const ok = await api("/fornecedor/perfil", { metodo: "PATCH", token: ctx.fornB.token, corpo: { senha_atual: SENHA, nova_senha: "novaSenha1" } });
    assert.equal(ok.status, 200);

    const login = await api("/login", { metodo: "POST", corpo: { email: ctx.fornB.email, senha: "novaSenha1" } });
    assert.equal(login.status, 200);
  });
});

test("serviços", async (t) => {
  await t.test("validações -> 400", async () => {
    const invalidos = [
      { ...servicoValido, nome: "" },
      { ...servicoValido, preco: 0 },
      { ...servicoValido, preco: "abc" },
      { ...servicoValido, categoria: "MUSICA" },
      { ...servicoValido, publico_min: 500, publico_max: 500 },
      { ...servicoValido, publico_min: -1 },
      { ...servicoValido, status: "INVALIDO" },
      { ...servicoValido, descricao: undefined },
    ];
    for (const corpo of invalidos) {
      const { status } = await api("/fornecedor/servicos", { metodo: "POST", token: ctx.fornA.token, corpo });
      assert.equal(status, 400, JSON.stringify(corpo));
    }
  });

  await t.test("POST grava em servicos + precos_servicos com o id do JWT", async () => {
    const { status, dados } = await api("/fornecedor/servicos", {
      metodo: "POST",
      token: ctx.fornA.token,
      corpo: { ...servicoValido, id_fornecedor: ctx.fornB.id },
    });
    assert.equal(status, 201);
    ctx.servicoA = dados.servico.id;

    const [[s]] = await pool.query("SELECT * FROM servicos WHERE id = ?", [ctx.servicoA]);
    assert.equal(s.id_fornecedor, ctx.fornA.id, "ignora id_fornecedor do corpo");
    assert.equal(s.status, "ATIVO");
    const [precos] = await pool.query("SELECT * FROM precos_servicos WHERE id_servico = ?", [ctx.servicoA]);
    assert.equal(precos.length, 1);
    assert.equal(Number(precos[0].preco), 2800);
    assert.equal(precos[0].publico_min, 100);
    assert.equal(precos[0].publico_max, 1500);
  });

  await t.test("cria serviço em rascunho e serviço do fornecedor B", async () => {
    const r = await api("/fornecedor/servicos", { metodo: "POST", token: ctx.fornA.token, corpo: { ...servicoValido, nome: "Rascunho", status: "RASCUNHO" } });
    assert.equal(r.status, 201);
    ctx.servicoRascunho = r.dados.servico.id;

    const b = await api("/fornecedor/servicos", { metodo: "POST", token: ctx.fornB.token, corpo: { ...servicoValido, nome: "Decor B", categoria: "DECORACAO", preco: 4200 } });
    assert.equal(b.status, 201);
    ctx.servicoB = b.dados.servico.id;
  });

  await t.test("listagem mostra só os serviços do próprio fornecedor", async () => {
    const a = await api("/fornecedor/servicos", { token: ctx.fornA.token });
    assert.deepEqual(a.dados.map((s) => s.id).sort(), [ctx.servicoA, ctx.servicoRascunho].sort());
    const item = a.dados.find((s) => s.id === ctx.servicoA);
    assert.equal(item.preco, 2800);
    assert.equal(item.categoria, "ENTRETENIMENTO");

    const b = await api("/fornecedor/servicos", { token: ctx.fornB.token });
    assert.deepEqual(b.dados.map((s) => s.id), [ctx.servicoB]);
  });

  await t.test("isolamento: B não lê, edita nem exclui serviço de A (404)", async () => {
    assert.equal((await api(`/fornecedor/servicos/${ctx.servicoA}`, { token: ctx.fornB.token })).status, 404);
    assert.equal((await api(`/fornecedor/servicos/${ctx.servicoA}`, { metodo: "PUT", token: ctx.fornB.token, corpo: servicoValido })).status, 404);
    assert.equal((await api(`/fornecedor/servicos/${ctx.servicoA}`, { metodo: "DELETE", token: ctx.fornB.token })).status, 404);
    const [[s]] = await pool.query("SELECT nome FROM servicos WHERE id = ?", [ctx.servicoA]);
    assert.equal(s.nome, servicoValido.nome);
  });

  await t.test("PUT atualiza serviço e preço no MySQL", async () => {
    const { status } = await api(`/fornecedor/servicos/${ctx.servicoA}`, {
      metodo: "PUT",
      token: ctx.fornA.token,
      corpo: { ...servicoValido, nome: "DJ premium", preco: 3500.5, publico_max: 2000 },
    });
    assert.equal(status, 200);
    const [[s]] = await pool.query(
      `SELECT s.nome, p.preco, p.publico_max FROM servicos s JOIN precos_servicos p ON p.id_servico = s.id WHERE s.id = ?`,
      [ctx.servicoA]
    );
    assert.equal(s.nome, "DJ premium");
    assert.equal(Number(s.preco), 3500.5);
    assert.equal(s.publico_max, 2000);
  });

  await t.test("id inválido -> 400", async () => {
    assert.equal((await api("/fornecedor/servicos/abc", { token: ctx.fornA.token })).status, 400);
  });
});

test("oportunidades", async (t) => {
  await t.test("lista só eventos em planejamento com data futura", async () => {
    const { status, dados } = await api("/fornecedor/oportunidades", { token: ctx.fornA.token });
    assert.equal(status, 200);
    const ids = dados.map((e) => e.id);
    assert.ok(ids.includes(ctx.eventoFuturo));
    assert.ok(ids.includes(ctx.eventoOutro));
    assert.ok(!ids.includes(ctx.eventoPassado), "passado fora");
    assert.ok(!ids.includes(ctx.eventoCancelado), "cancelado fora");
    const evento = dados.find((e) => e.id === ctx.eventoFuturo);
    assert.equal(evento.organizador_nome, "Org");
    assert.equal(evento.minhas_propostas, 0);
    assert.equal(Object.keys(evento).some((k) => /email|telefone|senha/.test(k)), false);
  });

  await t.test("busca por nome/local", async () => {
    const { dados } = await api(`/fornecedor/oportunidades?busca=Campinas`, { token: ctx.fornA.token });
    const ids = dados.map((e) => e.id);
    assert.ok(ids.includes(ctx.eventoFuturo));
    assert.ok(!ids.includes(ctx.eventoOutro));
    const curinga = await api(`/fornecedor/oportunidades?busca=%25`, { token: ctx.fornA.token });
    assert.equal(curinga.dados.length, 0, "% é tratado como texto, não curinga");
  });

  await t.test("detalhe traz só serviços ativos do fornecedor, com preço de tabela", async () => {
    const { status, dados } = await api(`/fornecedor/oportunidades/${ctx.eventoFuturo}`, { token: ctx.fornA.token });
    assert.equal(status, 200);
    assert.equal(dados.aberta, true);
    assert.deepEqual(dados.servicos.map((s) => s.id), [ctx.servicoA], "sem rascunho e sem serviço de B");
    assert.equal(dados.servicos[0].preco_tabela, 3500.5);
  });

  await t.test("evento cancelado/passado sem proposta -> 404", async () => {
    assert.equal((await api(`/fornecedor/oportunidades/${ctx.eventoCancelado}`, { token: ctx.fornA.token })).status, 404);
    assert.equal((await api(`/fornecedor/oportunidades/${ctx.eventoPassado}`, { token: ctx.fornA.token })).status, 404);
  });
});

test("propostas", async (t) => {
  const proposta = () => ({ id_evento: ctx.eventoFuturo, id_servico: ctx.servicoA, valor: 3200, prazo_dias: 7, observacao: "Inclui backup" });

  await t.test("validações -> 400", async () => {
    for (const corpo of [
      { ...proposta(), valor: 0 },
      { ...proposta(), valor: "x" },
      { ...proposta(), prazo_dias: 0 },
      { ...proposta(), prazo_dias: 1.5 },
      { ...proposta(), id_evento: "a" },
      { ...proposta(), id_servico: undefined },
      { ...proposta(), observacao: 123 },
    ]) {
      const { status } = await api("/fornecedor/propostas", { metodo: "POST", token: ctx.fornA.token, corpo });
      assert.equal(status, 400, JSON.stringify(corpo));
    }
  });

  await t.test("não propõe com serviço de outro fornecedor ou em rascunho (404)", async () => {
    assert.equal((await api("/fornecedor/propostas", { metodo: "POST", token: ctx.fornA.token, corpo: { ...proposta(), id_servico: ctx.servicoB } })).status, 404);
    assert.equal((await api("/fornecedor/propostas", { metodo: "POST", token: ctx.fornA.token, corpo: { ...proposta(), id_servico: ctx.servicoRascunho } })).status, 404);
  });

  await t.test("não propõe para evento passado/cancelado (409)", async () => {
    assert.equal((await api("/fornecedor/propostas", { metodo: "POST", token: ctx.fornA.token, corpo: { ...proposta(), id_evento: ctx.eventoPassado } })).status, 409);
    assert.equal((await api("/fornecedor/propostas", { metodo: "POST", token: ctx.fornA.token, corpo: { ...proposta(), id_evento: ctx.eventoCancelado } })).status, 409);
  });

  await t.test("POST grava a proposta no MySQL com status ENVIADA e id do JWT", async () => {
    const { status, dados } = await api("/fornecedor/propostas", {
      metodo: "POST",
      token: ctx.fornA.token,
      corpo: { ...proposta(), id_fornecedor: ctx.fornB.id, status: "SELECIONADA" },
    });
    assert.equal(status, 201);
    ctx.propostaA = dados.proposta.id;
    assert.equal(dados.proposta.evento_nome, `Festa Aberta ${sufixo}`);

    const [[linha]] = await pool.query("SELECT * FROM propostas WHERE id = ?", [ctx.propostaA]);
    assert.equal(linha.id_fornecedor, ctx.fornA.id);
    assert.equal(linha.status, "ENVIADA", "status não é escolhido pelo cliente");
    assert.equal(Number(linha.valor), 3200);
    assert.equal(linha.prazo_dias, 7);
    assert.equal(linha.observacao, "Inclui backup");
  });

  await t.test("proposta duplicada para o mesmo serviço/evento -> 409", async () => {
    assert.equal((await api("/fornecedor/propostas", { metodo: "POST", token: ctx.fornA.token, corpo: proposta() })).status, 409);
    const [[{ total }]] = await pool.query("SELECT COUNT(*) AS total FROM propostas WHERE id_fornecedor = ?", [ctx.fornA.id]);
    assert.equal(total, 1);
  });

  await t.test("a oportunidade passa a refletir a proposta enviada", async () => {
    const lista = await api("/fornecedor/oportunidades", { token: ctx.fornA.token });
    assert.equal(lista.dados.find((e) => e.id === ctx.eventoFuturo).minhas_propostas, 1);
    const det = await api(`/fornecedor/oportunidades/${ctx.eventoFuturo}`, { token: ctx.fornA.token });
    assert.equal(det.dados.servicos[0].status_proposta, "ENVIADA");
    assert.equal(det.dados.servicos[0].valor_proposta, 3200);
  });

  await t.test("listagem e detalhe: A vê a sua, B não vê nada (404 no detalhe)", async () => {
    const a = await api("/fornecedor/propostas", { token: ctx.fornA.token });
    assert.deepEqual(a.dados.map((p) => p.id), [ctx.propostaA]);
    assert.equal(a.dados[0].servico_nome, "DJ premium");
    assert.equal(a.dados[0].valor, 3200);

    const filtrada = await api("/fornecedor/propostas?status=RECUSADA", { token: ctx.fornA.token });
    assert.equal(filtrada.dados.length, 0);
    assert.equal((await api("/fornecedor/propostas?status=XX", { token: ctx.fornA.token })).status, 400);

    const b = await api("/fornecedor/propostas", { token: ctx.fornB.token });
    assert.deepEqual(b.dados, []);
    assert.equal((await api(`/fornecedor/propostas/${ctx.propostaA}`, { token: ctx.fornB.token })).status, 404);
  });

  await t.test("B não consegue retirar proposta de A", async () => {
    assert.equal((await api(`/fornecedor/propostas/${ctx.propostaA}`, { metodo: "DELETE", token: ctx.fornB.token })).status, 404);
    const [[{ total }]] = await pool.query("SELECT COUNT(*) AS total FROM propostas WHERE id = ?", [ctx.propostaA]);
    assert.equal(total, 1);
  });

  await t.test("serviço com proposta não pode ser excluído (409)", async () => {
    assert.equal((await api(`/fornecedor/servicos/${ctx.servicoA}`, { metodo: "DELETE", token: ctx.fornA.token })).status, 409);
  });

  await t.test("dashboard reflete os dados reais", async () => {
    const { status, dados } = await api("/fornecedor/dashboard", { token: ctx.fornA.token });
    assert.equal(status, 200);
    assert.equal(dados.propostas_enviadas, 1);
    assert.equal(dados.propostas_aceitas, 0);
    assert.equal(dados.servicos_cadastrados, 2);
    assert.ok(dados.oportunidades_abertas >= 2);
    assert.ok(dados.oportunidades_recentes.length >= 1 && dados.oportunidades_recentes.length <= 3);
    assert.equal(dados.fornecedor.nome, "ForA Novo");
  });

  await t.test("proposta já analisada não pode ser retirada (409); selecionada conta no dashboard", async () => {
    await pool.query("UPDATE propostas SET status = 'SELECIONADA' WHERE id = ?", [ctx.propostaA]);
    assert.equal((await api(`/fornecedor/propostas/${ctx.propostaA}`, { metodo: "DELETE", token: ctx.fornA.token })).status, 409);
    const dash = await api("/fornecedor/dashboard", { token: ctx.fornA.token });
    assert.equal(dash.dados.propostas_aceitas, 1);
    await pool.query("UPDATE propostas SET status = 'ENVIADA' WHERE id = ?", [ctx.propostaA]);
  });

  await t.test("proposta ENVIADA pode ser retirada e some do MySQL", async () => {
    const { status } = await api(`/fornecedor/propostas/${ctx.propostaA}`, { metodo: "DELETE", token: ctx.fornA.token });
    assert.equal(status, 200);
    const [[{ total }]] = await pool.query("SELECT COUNT(*) AS total FROM propostas WHERE id = ?", [ctx.propostaA]);
    assert.equal(total, 0);
    assert.equal((await api(`/fornecedor/propostas/${ctx.propostaA}`, { metodo: "DELETE", token: ctx.fornA.token })).status, 404);
  });

  await t.test("serviço sem propostas pode ser excluído (remove precos_servicos junto)", async () => {
    const { status } = await api(`/fornecedor/servicos/${ctx.servicoA}`, { metodo: "DELETE", token: ctx.fornA.token });
    assert.equal(status, 200);
    const [[{ s }]] = await pool.query("SELECT COUNT(*) AS s FROM servicos WHERE id = ?", [ctx.servicoA]);
    const [[{ p }]] = await pool.query("SELECT COUNT(*) AS p FROM precos_servicos WHERE id_servico = ?", [ctx.servicoA]);
    assert.equal(s + p, 0);
  });
});

test("cadastro rejeitado depois do login derruba o acesso", async () => {
  await pool.query("UPDATE usuarios SET status = 'REJEITADO' WHERE id = ?", [ctx.fornB.id]);
  const { status } = await api("/fornecedor/servicos", { token: ctx.fornB.token });
  assert.equal(status, 403);
});


test("cadastro de fornecedor", async (t) => {
  const criarCadastro = (sobrescritos = {}) => ({
    nome: "Fornecedor de Teste",
    email: `cadastro-${sufixo}@teste.com`,
    senha: "SenhaTeste123!",
    telefone: "11999998888",
    cnpj: `1${String(sufixo).slice(-13)}`,
    categoria_atuacao: "ENTRETENIMENTO",
    ...sobrescritos,
  });

  await t.test("cadastro válido grava usuário e fornecedor no MySQL", async () => {
    const corpo = criarCadastro();
    emailsCadastroTeste.push(corpo.email);

    const { status, dados } = await api("/fornecedores", {
      metodo: "POST",
      corpo,
    });

    assert.equal(status, 201);
    assert.ok(dados.id);

    const [[usuario]] = await pool.query(
      `SELECT id, nome, email, telefone, senha_hash, tipo, status
       FROM usuarios WHERE id = ?`,
      [dados.id]
    );

    assert.ok(usuario);
    assert.equal(usuario.nome, corpo.nome);
    assert.equal(usuario.email, corpo.email);
    assert.equal(usuario.telefone, corpo.telefone);
    assert.equal(usuario.tipo, "FORNECEDOR");
    assert.equal(usuario.status, "PENDENTE");
    assert.notEqual(usuario.senha_hash, corpo.senha);
    assert.equal(
      await bcrypt.compare(corpo.senha, usuario.senha_hash),
      true
    );

    const [[fornecedor]] = await pool.query(
      `SELECT id_usuario, CNPJ, categoria_atuacao
       FROM fornecedores WHERE id_usuario = ?`,
      [dados.id]
    );

    assert.ok(fornecedor);
    assert.equal(fornecedor.id_usuario, dados.id);
    assert.equal(fornecedor.CNPJ, corpo.cnpj);
    assert.equal(fornecedor.categoria_atuacao, corpo.categoria_atuacao);
  });

  await t.test("campo obrigatório ausente -> 400", async () => {
    const corpo = criarCadastro();
    delete corpo.telefone;

    assert.equal(
      (await api("/fornecedores", {
        metodo: "POST",
        corpo,
      })).status,
      400
    );
  });

  await t.test("CNPJ com tamanho incorreto -> 400", async () => {
    const corpo = criarCadastro({
      email: `cadastro-cnpj-invalido-${sufixo}@teste.com`,
      cnpj: "123",
    });

    emailsCadastroTeste.push(corpo.email);

    assert.equal(
      (await api("/fornecedores", {
        metodo: "POST",
        corpo,
      })).status,
      400
    );
  });

  await t.test("e-mail duplicado -> 409", async () => {
    const corpo = criarCadastro({
      email: ctx.fornA.email,
      cnpj: `2${String(sufixo).slice(-13)}`,
    });

    const { status } = await api("/fornecedores", {
      metodo: "POST",
      corpo,
    });

    assert.equal(status, 409);
  });

  await t.test("CNPJ duplicado -> 409 e não deixa usuário órfão", async () => {
    const [[existente]] = await pool.query(
      "SELECT CNPJ FROM fornecedores WHERE id_usuario = ?",
      [ctx.fornA.id]
    );

    const corpo = criarCadastro({
      email: `cadastro-cnpj-duplicado-${sufixo}@teste.com`,
      cnpj: existente.CNPJ,
    });

    emailsCadastroTeste.push(corpo.email);

    const { status } = await api("/fornecedores", {
      metodo: "POST",
      corpo,
    });

    assert.equal(status, 409);

    const [[{ total }]] = await pool.query(
      "SELECT COUNT(*) AS total FROM usuarios WHERE email = ?",
      [corpo.email]
    );

    assert.equal(total, 0);
  });
});

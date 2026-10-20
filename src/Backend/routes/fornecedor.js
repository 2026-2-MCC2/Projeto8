// ======================================================
// MÓDULO DO FORNECEDOR
// ======================================================
// Todas as rotas deste arquivo ficam sob o prefixo /fornecedor
// (ver app.use no server.js) e exigem:
//
//   1. JWT válido                         -> autenticarToken
//   2. perfil FORNECEDOR no token         -> autorizarPerfis
//   3. cadastro APROVADO no banco         -> exigirFornecedorAprovado
//
// O id do fornecedor SEMPRE vem do JWT (req.usuario.id), nunca do corpo
// ou da URL. Por isso um fornecedor não consegue ler nem alterar dados
// de outro: todas as consultas filtram por id_fornecedor = req.usuario.id.

const express = require("express");
const bcrypt = require("bcrypt");
const pool = require("../pool");
const { autenticarToken, autorizarPerfis } = require("../middlewares/auth");

const router = express.Router();

// Mesmas categorias oferecidas no cadastro do fornecedor (CadastroFornecedor.jsx).
const CATEGORIAS = [
  "ALIMENTACAO",
  "DECORACAO",
  "SEGURANCA",
  "ENTRETENIMENTO",
  "ESTRUTURA",
  "FOTOGRAFIA",
  "OUTROS",
];

const STATUS_SERVICO = ["ATIVO", "RASCUNHO"];
const PRECO_MAXIMO = 99999999.99; // limite de DECIMAL(10,2)
const REGEX_EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// ------------------------------------------------------
// Helpers
// ------------------------------------------------------

class ErroValidacao extends Error {
  constructor(mensagem, status = 400) {
    super(mensagem);
    this.status = status;
  }
}

function lerId(valor) {
  const numero = Number(valor);
  return Number.isInteger(numero) && numero > 0 ? numero : null;
}

function exigirId(valor, rotulo = "ID") {
  const id = lerId(valor);
  if (id === null) {
    throw new ErroValidacao(`${rotulo} inválido`);
  }
  return id;
}

function lerTexto(valor, rotulo, { min = 1, max, obrigatorio = true } = {}) {
  if (valor === undefined || valor === null || valor === "") {
    if (obrigatorio) {
      throw new ErroValidacao(`${rotulo} é obrigatório`);
    }
    return null;
  }

  if (typeof valor !== "string") {
    throw new ErroValidacao(`${rotulo} deve ser um texto`);
  }

  const texto = valor.trim();

  if (texto.length < min) {
    throw new ErroValidacao(
      min === 1
        ? `${rotulo} não pode ser vazio`
        : `${rotulo} deve ter pelo menos ${min} caracteres`
    );
  }

  if (max && texto.length > max) {
    throw new ErroValidacao(`${rotulo} deve ter no máximo ${max} caracteres`);
  }

  return texto;
}

function lerInteiroPositivo(valor, rotulo, maximo = 2147483647) {
  const numero = typeof valor === "string" && valor.trim() === "" ? NaN : Number(valor);

  if (!Number.isInteger(numero) || numero <= 0 || numero > maximo) {
    throw new ErroValidacao(`${rotulo} deve ser um número inteiro positivo`);
  }

  return numero;
}

function lerValor(valor, rotulo) {
  const numero = typeof valor === "string" && valor.trim() === "" ? NaN : Number(valor);

  if (!Number.isFinite(numero) || numero <= 0 || numero > PRECO_MAXIMO) {
    throw new ErroValidacao(`${rotulo} deve ser um valor maior que zero`);
  }

  // duas casas decimais, como em DECIMAL(10,2)
  return Math.round(numero * 100) / 100;
}

function lerCategoria(valor, rotulo = "Categoria") {
  const categoria = lerTexto(valor, rotulo, { max: 100 });

  if (!CATEGORIAS.includes(categoria)) {
    throw new ErroValidacao(`${rotulo} inválida`);
  }

  return categoria;
}

function lerTelefone(valor) {
  const telefone = lerTexto(valor, "Telefone", { max: 30 });

  if (!/^\d{10,11}$/.test(telefone)) {
    throw new ErroValidacao("Telefone inválido. Informe DDD + número, somente dígitos");
  }

  return telefone;
}

function lerEmail(valor) {
  const email = lerTexto(valor, "E-mail", { max: 250 });

  if (!REGEX_EMAIL.test(email)) {
    throw new ErroValidacao("E-mail inválido");
  }

  return email;
}

// Valida e normaliza o corpo de um serviço (criação e edição).
function validarServico(body = {}) {
  const nome = lerTexto(body.nome, "Nome do serviço", { max: 200 });
  const descricao = lerTexto(body.descricao, "Descrição", { max: 5000 });
  const categoria = lerCategoria(body.categoria);
  const preco = lerValor(body.preco, "Preço base");
  const publicoMin = lerInteiroPositivo(body.publico_min, "Público mínimo");
  const publicoMax = lerInteiroPositivo(body.publico_max, "Público máximo");

  if (publicoMin >= publicoMax) {
    throw new ErroValidacao("O público mínimo deve ser menor que o público máximo");
  }

  const status = body.status === undefined ? "ATIVO" : body.status;

  if (!STATUS_SERVICO.includes(status)) {
    throw new ErroValidacao("Status do serviço inválido");
  }

  return { nome, descricao, categoria, preco, publicoMin, publicoMax, status };
}

// Executa fn(conexao) dentro de uma transação, com COMMIT/ROLLBACK automáticos.
async function emTransacao(fn) {
  const conexao = await pool.getConnection();

  try {
    await conexao.beginTransaction();
    const resultado = await fn(conexao);
    await conexao.commit();
    return resultado;
  } catch (erro) {
    await conexao.rollback();
    throw erro;
  } finally {
    conexao.release();
  }
}

// ------------------------------------------------------
// Middlewares do módulo
// ------------------------------------------------------

// Confirma no banco que o usuário do token ainda é um FORNECEDOR APROVADO.
// O JWT dura 2h; se o cadastro for rejeitado nesse intervalo, o acesso cai
// na próxima requisição.
async function exigirFornecedorAprovado(req, res, next) {
  const [linhas] = await pool.query(
    `SELECT u.id, u.status
       FROM usuarios u
       JOIN fornecedores f ON f.id_usuario = u.id
      WHERE u.id = ? AND u.tipo = 'FORNECEDOR'`,
    [req.usuario.id]
  );

  if (linhas.length === 0) {
    return res.status(403).json({ mensagem: "Fornecedor não encontrado" });
  }

  if (linhas[0].status !== "APROVADO") {
    return res.status(403).json({ mensagem: "Cadastro não aprovado" });
  }

  next();
}

router.use(autenticarToken, autorizarPerfis("FORNECEDOR"), exigirFornecedorAprovado);

// ======================================================
// PERFIL
// ======================================================

async function buscarPerfil(idFornecedor, executor = pool) {
  const [linhas] = await executor.query(
    `SELECT u.id, u.nome, u.email, u.telefone, u.status,
            f.CNPJ AS cnpj, f.categoria_atuacao
       FROM usuarios u
       JOIN fornecedores f ON f.id_usuario = u.id
      WHERE u.id = ?`,
    [idFornecedor]
  );

  return linhas[0] || null;
}

// GET /fornecedor/perfil
router.get("/perfil", async (req, res) => {
  const perfil = await buscarPerfil(req.usuario.id);

  if (!perfil) {
    return res.status(404).json({ mensagem: "Fornecedor não encontrado" });
  }

  res.json(perfil);
});

// PATCH /fornecedor/perfil
// Campos aceitos: nome, email, telefone, categoria_atuacao e, para troca
// de senha, senha_atual + nova_senha. CNPJ, tipo e status não são alteráveis.
router.patch("/perfil", async (req, res) => {
  const body = req.body || {};
  const usuarios = {};
  const fornecedor = {};

  if (body.nome !== undefined) usuarios.nome = lerTexto(body.nome, "Nome", { max: 250 });
  if (body.email !== undefined) usuarios.email = lerEmail(body.email);
  if (body.telefone !== undefined) usuarios.telefone = lerTelefone(body.telefone);
  if (body.categoria_atuacao !== undefined) {
    fornecedor.categoria_atuacao = lerCategoria(body.categoria_atuacao, "Categoria de atuação");
  }

  if (body.nova_senha !== undefined || body.senha_atual !== undefined) {
    if (typeof body.nova_senha !== "string" || typeof body.senha_atual !== "string") {
      throw new ErroValidacao("Informe a senha atual e a nova senha");
    }

    if (body.nova_senha.length < 6) {
      throw new ErroValidacao("A nova senha deve ter pelo menos 6 caracteres");
    }

    const [linhas] = await pool.query("SELECT senha_hash FROM usuarios WHERE id = ?", [
      req.usuario.id,
    ]);

    if (!bcrypt.compareSync(body.senha_atual, linhas[0].senha_hash)) {
      throw new ErroValidacao("Senha atual incorreta", 403);
    }

    usuarios.senha_hash = bcrypt.hashSync(body.nova_senha, 10);
  }

  if (Object.keys(usuarios).length === 0 && Object.keys(fornecedor).length === 0) {
    throw new ErroValidacao("Nenhum campo válido para atualização foi enviado");
  }

  await emTransacao(async (conexao) => {
    if (Object.keys(usuarios).length > 0) {
      await conexao.query("UPDATE usuarios SET ? WHERE id = ?", [usuarios, req.usuario.id]);
    }

    if (Object.keys(fornecedor).length > 0) {
      await conexao.query("UPDATE fornecedores SET ? WHERE id_usuario = ?", [
        fornecedor,
        req.usuario.id,
      ]);
    }
  });

  res.json({
    mensagem: "Perfil atualizado com sucesso!",
    perfil: await buscarPerfil(req.usuario.id),
  });
});

// ======================================================
// DASHBOARD
// ======================================================

const SQL_OPORTUNIDADE_ABERTA = `e.status = 'PLANEJAMENTO' AND e.data_evento >= CURDATE()`;

// GET /fornecedor/dashboard
router.get("/dashboard", async (req, res) => {
  const id = req.usuario.id;

  const [[contagens]] = await pool.query(
    `SELECT
        (SELECT COUNT(*) FROM eventos e WHERE ${SQL_OPORTUNIDADE_ABERTA})              AS oportunidades_abertas,
        (SELECT COUNT(*) FROM propostas WHERE id_fornecedor = ?)                       AS propostas_enviadas,
        (SELECT COUNT(*) FROM propostas WHERE id_fornecedor = ? AND status = 'SELECIONADA') AS propostas_aceitas,
        (SELECT COUNT(*) FROM servicos WHERE id_fornecedor = ?)                        AS servicos_cadastrados`,
    [id, id, id]
  );

  const [oportunidades] = await pool.query(
    `SELECT e.id, e.nome, e.local, e.data_evento, e.horario, e.publico_min, e.publico_max
       FROM eventos e
      WHERE ${SQL_OPORTUNIDADE_ABERTA}
      ORDER BY e.id DESC
      LIMIT 3`
  );

  const perfil = await buscarPerfil(id);

  res.json({
    fornecedor: { nome: perfil.nome, categoria_atuacao: perfil.categoria_atuacao },
    ...contagens,
    oportunidades_recentes: oportunidades,
  });
});

// ======================================================
// SERVIÇOS
// ======================================================
// Um serviço = 1 linha em `servicos` + 1 linha em `precos_servicos`
// (preço base para a faixa de público informada).

const SQL_SERVICO_COM_PRECO = `
  SELECT s.id, s.nome, s.descricao, s.categoria, s.status,
         p.preco, p.publico_min, p.publico_max
    FROM servicos s
    LEFT JOIN precos_servicos p
           ON p.id = (SELECT MIN(p2.id) FROM precos_servicos p2 WHERE p2.id_servico = s.id)
`;

async function buscarServico(idServico, idFornecedor, executor = pool) {
  const [linhas] = await executor.query(
    `${SQL_SERVICO_COM_PRECO} WHERE s.id = ? AND s.id_fornecedor = ?`,
    [idServico, idFornecedor]
  );

  return linhas[0] || null;
}

// GET /fornecedor/servicos
router.get("/servicos", async (req, res) => {
  const [linhas] = await pool.query(
    `${SQL_SERVICO_COM_PRECO} WHERE s.id_fornecedor = ? ORDER BY s.id DESC`,
    [req.usuario.id]
  );

  res.json(linhas);
});

// GET /fornecedor/servicos/:id
router.get("/servicos/:id", async (req, res) => {
  const servico = await buscarServico(exigirId(req.params.id), req.usuario.id);

  if (!servico) {
    return res.status(404).json({ mensagem: "Serviço não encontrado" });
  }

  res.json(servico);
});

// POST /fornecedor/servicos
router.post("/servicos", async (req, res) => {
  const dados = validarServico(req.body);

  const id = await emTransacao(async (conexao) => {
    const [servico] = await conexao.query(
      `INSERT INTO servicos (id_fornecedor, nome, descricao, categoria, status)
       VALUES (?, ?, ?, ?, ?)`,
      [req.usuario.id, dados.nome, dados.descricao, dados.categoria, dados.status]
    );

    await conexao.query(
      `INSERT INTO precos_servicos (id_servico, publico_min, publico_max, preco)
       VALUES (?, ?, ?, ?)`,
      [servico.insertId, dados.publicoMin, dados.publicoMax, dados.preco]
    );

    return servico.insertId;
  });

  res.status(201).json({
    mensagem: "Serviço cadastrado com sucesso!",
    servico: await buscarServico(id, req.usuario.id),
  });
});

// PUT /fornecedor/servicos/:id
// Atualiza o serviço e a faixa de preço principal (a primeira cadastrada).
router.put("/servicos/:id", async (req, res) => {
  const id = exigirId(req.params.id);
  const dados = validarServico(req.body);

  const existente = await buscarServico(id, req.usuario.id);

  if (!existente) {
    return res.status(404).json({ mensagem: "Serviço não encontrado" });
  }

  await emTransacao(async (conexao) => {
    await conexao.query(
      `UPDATE servicos SET nome = ?, descricao = ?, categoria = ?, status = ?
        WHERE id = ? AND id_fornecedor = ?`,
      [dados.nome, dados.descricao, dados.categoria, dados.status, id, req.usuario.id]
    );

    const [faixa] = await conexao.query(
      "SELECT MIN(id) AS id FROM precos_servicos WHERE id_servico = ?",
      [id]
    );

    if (faixa[0].id) {
      await conexao.query(
        `UPDATE precos_servicos SET publico_min = ?, publico_max = ?, preco = ? WHERE id = ?`,
        [dados.publicoMin, dados.publicoMax, dados.preco, faixa[0].id]
      );
    } else {
      await conexao.query(
        `INSERT INTO precos_servicos (id_servico, publico_min, publico_max, preco)
         VALUES (?, ?, ?, ?)`,
        [id, dados.publicoMin, dados.publicoMax, dados.preco]
      );
    }
  });

  res.json({
    mensagem: "Serviço atualizado com sucesso!",
    servico: await buscarServico(id, req.usuario.id),
  });
});

// DELETE /fornecedor/servicos/:id
// Só remove serviços que ainda não foram usados em propostas nem em eventos.
router.delete("/servicos/:id", async (req, res) => {
  const id = exigirId(req.params.id);

  const existente = await buscarServico(id, req.usuario.id);

  if (!existente) {
    return res.status(404).json({ mensagem: "Serviço não encontrado" });
  }

  const [[uso]] = await pool.query(
    `SELECT
        (SELECT COUNT(*) FROM propostas WHERE id_servico = ?)        AS propostas,
        (SELECT COUNT(*) FROM eventos_servicos WHERE id_servico = ?) AS eventos`,
    [id, id]
  );

  if (uso.propostas > 0 || uso.eventos > 0) {
    return res.status(409).json({
      mensagem:
        "Este serviço já possui propostas ou está vinculado a eventos e não pode ser excluído. Altere o status para Rascunho para ocultá-lo.",
    });
  }

  await emTransacao(async (conexao) => {
    await conexao.query("DELETE FROM precos_servicos WHERE id_servico = ?", [id]);
    await conexao.query("DELETE FROM servicos WHERE id = ? AND id_fornecedor = ?", [
      id,
      req.usuario.id,
    ]);
  });

  res.json({ mensagem: "Serviço excluído com sucesso!" });
});

// ======================================================
// OPORTUNIDADES (eventos abertos para receber propostas)
// ======================================================
// Oportunidade = evento em PLANEJAMENTO, com data futura.
// O schema atual não registra "categoria solicitada" nem "orçamento estimado"
// por evento, então esses dados não são expostos.

const CAMPOS_OPORTUNIDADE = `
  e.id, e.nome, e.descricao, e.local, e.data_evento, e.horario,
  e.publico_min, e.publico_max, e.status,
  u.nome AS organizador_nome
`;

// GET /fornecedor/oportunidades?busca=
router.get("/oportunidades", async (req, res) => {
  const busca = typeof req.query.busca === "string" ? req.query.busca.trim() : "";
  const parametros = [req.usuario.id];
  let filtro = "";

  if (busca) {
    filtro = "AND (e.nome LIKE ? OR e.local LIKE ?)";
    const termo = `%${busca.replace(/[\\%_]/g, "\\$&")}%`;
    parametros.push(termo, termo);
  }

  const [linhas] = await pool.query(
    `SELECT ${CAMPOS_OPORTUNIDADE},
            (SELECT COUNT(*) FROM propostas pr
              WHERE pr.id_evento = e.id AND pr.id_fornecedor = ?) AS minhas_propostas
       FROM eventos e
       JOIN usuarios u ON u.id = e.id_organizador
      WHERE ${SQL_OPORTUNIDADE_ABERTA} ${filtro}
      ORDER BY e.data_evento ASC, e.horario ASC
      LIMIT 100`,
    parametros
  );

  res.json(linhas);
});

// GET /fornecedor/oportunidades/:id
// Devolve o evento e, para cada serviço ATIVO do fornecedor, se ele já
// enviou proposta e qual o preço de tabela para o público do evento.
router.get("/oportunidades/:id", async (req, res) => {
  const idEvento = exigirId(req.params.id);

  const [eventos] = await pool.query(
    `SELECT ${CAMPOS_OPORTUNIDADE}
       FROM eventos e
       JOIN usuarios u ON u.id = e.id_organizador
      WHERE e.id = ?
        AND ( (${SQL_OPORTUNIDADE_ABERTA})
              OR EXISTS (SELECT 1 FROM propostas pr
                          WHERE pr.id_evento = e.id AND pr.id_fornecedor = ?) )`,
    [idEvento, req.usuario.id]
  );

  if (eventos.length === 0) {
    return res.status(404).json({ mensagem: "Oportunidade não encontrada" });
  }

  const evento = eventos[0];

  const [servicos] = await pool.query(
    `SELECT s.id, s.nome, s.categoria,
            pr.id AS id_proposta, pr.status AS status_proposta, pr.valor AS valor_proposta,
            COALESCE(
              (SELECT p.preco FROM precos_servicos p
                WHERE p.id_servico = s.id
                  AND p.publico_min <= ? AND p.publico_max >= ?
                ORDER BY p.id LIMIT 1),
              (SELECT p.preco FROM precos_servicos p
                WHERE p.id_servico = s.id ORDER BY p.id LIMIT 1)
            ) AS preco_tabela
       FROM servicos s
       LEFT JOIN propostas pr ON pr.id_servico = s.id AND pr.id_evento = ?
      WHERE s.id_fornecedor = ? AND s.status = 'ATIVO'
      ORDER BY s.nome`,
    [evento.publico_max, evento.publico_max, idEvento, req.usuario.id]
  );

  res.json({
    evento,
    aberta: evento.status === "PLANEJAMENTO" && evento.data_evento >= hojeISO(),
    servicos,
  });
});

function hojeISO() {
  const agora = new Date();
  const mes = String(agora.getMonth() + 1).padStart(2, "0");
  const dia = String(agora.getDate()).padStart(2, "0");
  return `${agora.getFullYear()}-${mes}-${dia}`;
}

// ======================================================
// PROPOSTAS
// ======================================================

const SQL_PROPOSTA = `
  SELECT pr.id, pr.id_evento, pr.id_servico, pr.valor, pr.prazo_dias,
         pr.observacao, pr.status, pr.criado_em,
         e.nome AS evento_nome, e.data_evento, e.local AS evento_local,
         s.nome AS servico_nome, s.categoria AS servico_categoria
    FROM propostas pr
    JOIN eventos e  ON e.id = pr.id_evento
    JOIN servicos s ON s.id = pr.id_servico
`;

// GET /fornecedor/propostas?status=
router.get("/propostas", async (req, res) => {
  const parametros = [req.usuario.id];
  let filtro = "";

  if (req.query.status) {
    if (!["ENVIADA", "EM_ANALISE", "SELECIONADA", "RECUSADA"].includes(req.query.status)) {
      throw new ErroValidacao("Status inválido");
    }
    filtro = "AND pr.status = ?";
    parametros.push(req.query.status);
  }

  const [linhas] = await pool.query(
    `${SQL_PROPOSTA} WHERE pr.id_fornecedor = ? ${filtro} ORDER BY pr.criado_em DESC, pr.id DESC`,
    parametros
  );

  res.json(linhas);
});

// POST /fornecedor/propostas
// body: { id_evento, id_servico, valor, prazo_dias, observacao? }
router.post("/propostas", async (req, res) => {
  const body = req.body || {};

  const idEvento = exigirId(body.id_evento, "Evento");
  const idServico = exigirId(body.id_servico, "Serviço");
  const valor = lerValor(body.valor, "Valor da proposta");
  const prazoDias = lerInteiroPositivo(body.prazo_dias, "Prazo de entrega", 3650);
  const observacao = lerTexto(body.observacao, "Observações", {
    max: 2000,
    obrigatorio: false,
  });

  // O serviço precisa ser do fornecedor logado e estar ATIVO.
  const [servicos] = await pool.query(
    "SELECT id FROM servicos WHERE id = ? AND id_fornecedor = ? AND status = 'ATIVO'",
    [idServico, req.usuario.id]
  );

  if (servicos.length === 0) {
    return res.status(404).json({ mensagem: "Serviço não encontrado ou não está ativo" });
  }

  // O evento precisa estar aberto para propostas.
  const [eventos] = await pool.query(
    `SELECT e.id FROM eventos e WHERE e.id = ? AND ${SQL_OPORTUNIDADE_ABERTA}`,
    [idEvento]
  );

  if (eventos.length === 0) {
    return res.status(409).json({ mensagem: "Este evento não está mais recebendo propostas" });
  }

  let resultado;

  try {
    [resultado] = await pool.query(
      `INSERT INTO propostas
         (id_evento, id_servico, id_fornecedor, valor, prazo_dias, observacao, status)
       VALUES (?, ?, ?, ?, ?, ?, 'ENVIADA')`,
      [idEvento, idServico, req.usuario.id, valor, prazoDias, observacao]
    );
  } catch (erro) {
    if (erro.code === "ER_DUP_ENTRY") {
      return res.status(409).json({
        mensagem: "Você já enviou uma proposta com este serviço para este evento",
      });
    }
    throw erro;
  }

  const [linhas] = await pool.query(`${SQL_PROPOSTA} WHERE pr.id = ?`, [resultado.insertId]);

  res.status(201).json({ mensagem: "Proposta enviada com sucesso!", proposta: linhas[0] });
});

// GET /fornecedor/propostas/:id
router.get("/propostas/:id", async (req, res) => {
  const [linhas] = await pool.query(`${SQL_PROPOSTA} WHERE pr.id = ? AND pr.id_fornecedor = ?`, [
    exigirId(req.params.id),
    req.usuario.id,
  ]);

  if (linhas.length === 0) {
    return res.status(404).json({ mensagem: "Proposta não encontrada" });
  }

  res.json(linhas[0]);
});

// DELETE /fornecedor/propostas/:id
// O fornecedor só pode retirar propostas que o organizador ainda não analisou.
// (Mudança de status para EM_ANALISE/SELECIONADA/RECUSADA é do organizador.)
router.delete("/propostas/:id", async (req, res) => {
  const id = exigirId(req.params.id);

  const [resultado] = await pool.query(
    "DELETE FROM propostas WHERE id = ? AND id_fornecedor = ? AND status = 'ENVIADA'",
    [id, req.usuario.id]
  );

  if (resultado.affectedRows === 1) {
    return res.json({ mensagem: "Proposta retirada com sucesso!" });
  }

  // Não apagou: distingue "não existe / é de outro fornecedor" de "já foi analisada".
  const [existe] = await pool.query(
    "SELECT status FROM propostas WHERE id = ? AND id_fornecedor = ?",
    [id, req.usuario.id]
  );

  if (existe.length === 0) {
    return res.status(404).json({ mensagem: "Proposta não encontrada" });
  }

  res.status(409).json({
    mensagem: "Esta proposta já foi analisada pelo organizador e não pode ser retirada",
  });
});

// ======================================================
// TRATAMENTO DE ERROS DO MÓDULO
// ======================================================
// O Express 5 encaminha rejeições de handlers async para cá.

router.use((erro, req, res, next) => {
  if (erro instanceof ErroValidacao) {
    return res.status(erro.status).json({ mensagem: erro.message });
  }

  if (erro.code === "ER_DUP_ENTRY") {
    return res.status(409).json({ mensagem: "E-mail já cadastrado" });
  }

  console.error("Erro no módulo do fornecedor:", erro.message);
  res.status(500).json({ mensagem: "Erro interno do servidor" });
});

module.exports = router;

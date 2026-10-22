// ======================================================
// MÓDULO DO ADMINISTRADOR

const express = require("express");
const pool = require("../pool");
const { autenticarToken, autorizarPerfis } = require("../middlewares/auth");

const router = express.Router();

router.use(autenticarToken, autorizarPerfis("ADMINISTRADOR"));

// Helpers

class ErroValidacao extends Error {
  constructor(mensagem, status = 400) {
    super(mensagem);
    this.status = status;
  }
}

const STATUS_CADASTRO = ["PENDENTE", "APROVADO", "REJEITADO"];

// "2026-10-21 19:28:00" -> "2026-10-21T19:28:00" (o navegador entende melhor)
function paraIso(valor) {
  return valor ? String(valor).replace(" ", "T") : null;
}

// Consulta única usada na listagem e na resposta do PATCH,
// assim o front-end sempre recebe o cadastro no mesmo formato.
const SQL_CADASTRO = `
  SELECT u.id, u.tipo, u.nome, u.email, u.telefone, u.status,
         u.cidade, u.estado, u.criado_em, u.data_analise, u.motivo_rejeicao,
         adm.nome AS analisado_por_nome,
         o.tipo_pessoa, o.documento,
         (SELECT COUNT(*) FROM eventos e WHERE e.id_organizador = u.id)
           AS eventos_cadastrados,
         f.CNPJ AS cnpj, f.categoria_atuacao, f.razao_social,
         f.regiao_atendimento, f.descricao, f.site
    FROM usuarios u
    LEFT JOIN organizadores o ON o.id_usuario = u.id
    LEFT JOIN fornecedores f ON f.id_usuario = u.id
    LEFT JOIN usuarios adm ON adm.id = u.analisado_por
   WHERE u.tipo IN ('ORGANIZADOR', 'FORNECEDOR')
`;

function formatarCadastro(linha) {
  const cadastro = {
    id: linha.id,
    tipo: linha.tipo,
    nome: linha.nome,
    email: linha.email,
    telefone: linha.telefone,
    status: linha.status,
    cidade: linha.cidade,
    estado: linha.estado,
    criado_em: paraIso(linha.criado_em),
    data_analise: paraIso(linha.data_analise),
    motivo_rejeicao: linha.motivo_rejeicao,
    analisado_por_nome: linha.analisado_por_nome,
  };

  if (linha.tipo === "ORGANIZADOR") {
    cadastro.tipo_pessoa = linha.tipo_pessoa;
    cadastro.documento = linha.documento;
    cadastro.eventos_cadastrados = linha.eventos_cadastrados;
  } else {
    cadastro.cnpj = linha.cnpj;
    cadastro.categoria_atuacao = linha.categoria_atuacao;
    cadastro.razao_social = linha.razao_social;
    cadastro.regiao_atendimento = linha.regiao_atendimento;
    cadastro.descricao = linha.descricao;
    cadastro.site = linha.site;
  }

  return cadastro;
}

router.get("/cadastros", async (req, res) => {
  const parametros = [];
  let filtro = "";

  if (req.query.status) {
    if (!STATUS_CADASTRO.includes(req.query.status)) {
      throw new ErroValidacao("Status inválido");
    }
    filtro = "AND u.status = ?";
    parametros.push(req.query.status);
  }

  const [linhas] = await pool.query(
    `${SQL_CADASTRO} ${filtro} ORDER BY u.criado_em DESC, u.id DESC`,
    parametros
  );

  res.json(linhas.map(formatarCadastro));
});

// ------------------------------------------------------
// PATCH /admin/cadastros/:id/status
// body: { status: "APROVADO" | "REJEITADO" | "PENDENTE", motivo? }
//
//   APROVADO  -> aprova o cadastro
//   REJEITADO -> rejeita (o motivo é obrigatório)
//   PENDENTE  -> "reabrir análise": limpa quem analisou e o motivo
// ------------------------------------------------------
router.patch("/cadastros/:id/status", async (req, res) => {
  const id = Number(req.params.id);
  if (!Number.isInteger(id) || id <= 0) {
    throw new ErroValidacao("ID inválido");
  }

  const { status, motivo } = req.body || {};

  if (!STATUS_CADASTRO.includes(status)) {
    throw new ErroValidacao("Status inválido");
  }

  let motivoRejeicao = null;
  if (status === "REJEITADO") {
    motivoRejeicao = typeof motivo === "string" ? motivo.trim() : "";
    if (!motivoRejeicao) {
      throw new ErroValidacao("Informe o motivo da rejeição");
    }
    if (motivoRejeicao.length > 500) {
      throw new ErroValidacao("O motivo deve ter no máximo 500 caracteres");
    }
  }

  // Só mexe em organizadores e fornecedores (nunca em outro administrador).
  const [existe] = await pool.query(
    "SELECT id FROM usuarios WHERE id = ? AND tipo IN ('ORGANIZADOR', 'FORNECEDOR')",
    [id]
  );

  if (existe.length === 0) {
    return res.status(404).json({ mensagem: "Cadastro não encontrado" });
  }

  if (status === "PENDENTE") {
    await pool.query(
      `UPDATE usuarios
          SET status = 'PENDENTE', analisado_por = NULL,
              data_analise = NULL, motivo_rejeicao = NULL
        WHERE id = ?`,
      [id]
    );
  } else {
    await pool.query(
      `UPDATE usuarios
          SET status = ?, analisado_por = ?, data_analise = NOW(),
              motivo_rejeicao = ?
        WHERE id = ?`,
      [status, req.usuario.id, motivoRejeicao, id]
    );
  }

  const [linhas] = await pool.query(`${SQL_CADASTRO} AND u.id = ?`, [id]);

  res.json({
    mensagem: "Cadastro atualizado com sucesso",
    cadastro: formatarCadastro(linhas[0]),
  });
});

// ------------------------------------------------------
// GET /admin/dashboard
// Números da visão geral: totais, atividade recente e saúde da plataforma.
// Tudo é calculado na hora a partir do banco (nada fica guardado à parte).
// ------------------------------------------------------

// Percentual inteiro; sem base de comparação (0 itens) vira 0%.
function percentual(parte, total) {
  return total > 0 ? Math.round((parte / total) * 100) : 0;
}

const TITULO_ATIVIDADE = {
  CADASTRO_PENDENTE: (detalhe) =>
    detalhe === "FORNECEDOR"
      ? "Novo fornecedor aguardando aprovação"
      : "Novo organizador aguardando aprovação",
  CADASTRO_APROVADO: (detalhe) =>
    detalhe === "FORNECEDOR"
      ? "Fornecedor aprovado"
      : "Organizador aprovado",
  PROPOSTA_ENVIADA: () => "Nova proposta enviada",
  PROPOSTA_SELECIONADA: () => "Proposta selecionada",
};

router.get("/dashboard", async (req, res) => {
  const [[usuarios]] = await pool.query(`
    SELECT
      COALESCE(SUM(tipo = 'ORGANIZADOR' AND status = 'APROVADO'), 0) AS organizadores,
      COALESCE(SUM(tipo = 'FORNECEDOR' AND status = 'APROVADO'), 0) AS fornecedores,
      COALESCE(SUM(status = 'APROVADO'
                   AND criado_em >= NOW() - INTERVAL 30 DAY), 0) AS novos_usuarios_30d,
      COALESCE(SUM(status = 'APROVADO'), 0) AS aprovados,
      COALESCE(SUM(status = 'REJEITADO'), 0) AS rejeitados
    FROM usuarios
    WHERE tipo IN ('ORGANIZADOR', 'FORNECEDOR')
  `);

  const [[eventos]] = await pool.query(`
    SELECT
      COALESCE(SUM(e.status IN ('PLANEJAMENTO', 'CONFIRMADO')), 0) AS ativos,
      COALESCE(SUM(e.status = 'CONFIRMADO'), 0) AS confirmados,
      COALESCE(SUM(e.status <> 'CANCELADO'), 0) AS nao_cancelados,
      COALESCE(SUM(e.status <> 'CANCELADO' AND EXISTS (
        SELECT 1 FROM eventos_servicos es WHERE es.id_evento = e.id
      )), 0) AS com_orcamento,
      COALESCE(SUM(e.status IN ('PLANEJAMENTO', 'CONFIRMADO') AND EXISTS (
        SELECT 1 FROM propostas p WHERE p.id_evento = e.id
      )), 0) AS ativos_com_proposta
    FROM eventos e
  `);

  const [atividades] = await pool.query(`
    SELECT * FROM (
      SELECT 'CADASTRO_PENDENTE' AS tipo, u.id AS ref, u.nome AS descricao,
             u.tipo AS detalhe, u.criado_em AS quando
        FROM usuarios u
       WHERE u.status = 'PENDENTE' AND u.tipo IN ('ORGANIZADOR', 'FORNECEDOR')
      UNION ALL
      SELECT 'CADASTRO_APROVADO', u.id, u.nome, u.tipo, u.data_analise
        FROM usuarios u
       WHERE u.status = 'APROVADO' AND u.data_analise IS NOT NULL
      UNION ALL
      SELECT 'PROPOSTA_ENVIADA', p.id, e.nome, NULL, p.criado_em
        FROM propostas p JOIN eventos e ON e.id = p.id_evento
      UNION ALL
      SELECT 'PROPOSTA_SELECIONADA', p.id, e.nome, NULL, p.atualizado_em
        FROM propostas p JOIN eventos e ON e.id = p.id_evento
       WHERE p.status = 'SELECIONADA'
    ) AS atividades
    ORDER BY quando DESC
    LIMIT 6
  `);

  const analisados = Number(usuarios.aprovados) + Number(usuarios.rejeitados);

  res.json({
    totais: {
      organizadores: Number(usuarios.organizadores),
      fornecedores: Number(usuarios.fornecedores),
      eventos_ativos: Number(eventos.ativos),
      novos_usuarios_30d: Number(usuarios.novos_usuarios_30d),
      eventos_confirmados: Number(eventos.confirmados),
    },
    atividades: atividades.map((a) => ({
      id: `${a.tipo}-${a.ref}`,
      tipo: a.tipo,
      titulo: TITULO_ATIVIDADE[a.tipo](a.detalhe),
      descricao: a.descricao,
      criado_em: paraIso(a.quando),
    })),
    saude: {
      eventos_orcamento_completo: percentual(
        Number(eventos.com_orcamento),
        Number(eventos.nao_cancelados)
      ),
      eventos_com_propostas: percentual(
        Number(eventos.ativos_com_proposta),
        Number(eventos.ativos)
      ),
      cadastros_aprovados: percentual(Number(usuarios.aprovados), analisados),
    },
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

  console.error("Erro no módulo do administrador:", erro.message);
  res.status(500).json({ mensagem: "Erro interno do servidor" });
});

module.exports = router;
const express = require("express");
const pool = require("../pool");
const { autenticarToken, autorizarPerfis } = require("../middlewares/auth");

const router = express.Router();

// Todas as consultas são limitadas aos eventos do organizador autenticado.
router.use(autenticarToken, autorizarPerfis("ORGANIZADOR"));

router.get("/propostas", async (req, res, next) => {
  try {
    const idOrganizador = req.usuario.id;

    const [usuarios] = await pool.query(
      "SELECT id FROM usuarios WHERE id = ? AND tipo = 'ORGANIZADOR' AND status = 'APROVADO'",
      [idOrganizador]
    );

    if (!usuarios.length) {
      return res.status(403).json({ mensagem: "Organizador não aprovado ou não encontrado." });
    }

    const parametros = [idOrganizador];
    let filtroEvento = "";

    if (req.query.evento) {
      const idEvento = Number(req.query.evento);
      if (!Number.isInteger(idEvento) || idEvento <= 0) {
        return res.status(400).json({ mensagem: "ID do evento inválido." });
      }
      filtroEvento = " AND e.id = ?";
      parametros.push(idEvento);
    }

    if (req.query.status) {
      const statusPermitidos = ["ENVIADA", "EM_ANALISE", "SELECIONADA", "RECUSADA"];
      if (!statusPermitidos.includes(req.query.status)) {
        return res.status(400).json({ mensagem: "Status de proposta inválido." });
      }
      filtroEvento += " AND pr.status = ?";
      parametros.push(req.query.status);
    }

    const [propostas] = await pool.query(
      `SELECT
          pr.id,
          pr.id_evento,
          pr.id_servico,
          pr.id_fornecedor,
          pr.valor,
          pr.prazo_dias,
          pr.observacao,
          pr.status,
          pr.criado_em,
          e.nome AS evento_nome,
          e.data_evento,
          e.local AS evento_local,
          s.nome AS servico_nome,
          s.categoria AS servico_categoria,
          u.nome AS fornecedor_nome,
          f.razao_social AS fornecedor_razao_social,
          f.regiao_atendimento
       FROM propostas pr
       INNER JOIN eventos e ON e.id = pr.id_evento
       INNER JOIN servicos s ON s.id = pr.id_servico
       INNER JOIN fornecedores f ON f.id_usuario = pr.id_fornecedor
       INNER JOIN usuarios u ON u.id = pr.id_fornecedor
       WHERE e.id_organizador = ? ${filtroEvento}
       ORDER BY pr.criado_em DESC, pr.id DESC`,
      parametros
    );

    res.json(propostas.map((p) => ({
      ...p,
      fornecedor_nome: p.fornecedor_razao_social || p.fornecedor_nome,
      valor: Number(p.valor),
    })));
  } catch (error) {
    next(error);
  }
});

router.use((error, req, res, next) => {
  console.error("Erro ao listar propostas do organizador:", error.message);
  res.status(500).json({ mensagem: "Não foi possível carregar as propostas recebidas." });
});

module.exports = router;

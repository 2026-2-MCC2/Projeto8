const express = require("express");
const pool = require("../pool");
const { autenticarToken, autorizarPerfis } = require("../middlewares/auth");
const router = express.Router();

router.use(autenticarToken, autorizarPerfis("ORGANIZADOR"));

router.use(async (req, res, next) => {
  try {
    const [rows] = await pool.query(
      "SELECT status FROM usuarios WHERE id = ? AND tipo = 'ORGANIZADOR'",
      [req.usuario.id]
    );
    if (!rows.length || rows[0].status !== "APROVADO") {
      return res.status(403).json({ mensagem: "Cadastro de organizador não aprovado." });
    }
    next();
  } catch (error) { next(error); }
});

const SQL = `
  SELECT s.id, s.nome AS servico_nome, s.descricao AS servico_descricao,
         s.categoria, f.id_usuario AS id_fornecedor,
         COALESCE(NULLIF(f.razao_social, ''), u.nome) AS fornecedor_nome,
         f.regiao_atendimento, f.descricao AS fornecedor_descricao, f.site,
         u.cidade, u.estado, MIN(p.preco) AS preco_min, MAX(p.preco) AS preco_max,
         MIN(p.publico_min) AS publico_min, MAX(p.publico_max) AS publico_max
    FROM servicos s
    JOIN fornecedores f ON f.id_usuario = s.id_fornecedor
    JOIN usuarios u ON u.id = f.id_usuario
    LEFT JOIN precos_servicos p ON p.id_servico = s.id
   WHERE s.status = 'ATIVO' AND u.tipo = 'FORNECEDOR' AND u.status = 'APROVADO'
   GROUP BY s.id, s.nome, s.descricao, s.categoria, f.id_usuario,
            f.razao_social, f.regiao_atendimento, f.descricao, f.site,
            u.nome, u.cidade, u.estado
`;

router.get("/servicos", async (req, res, next) => {
  try {
    let sql = SQL;
    const params = [];
    const busca = typeof req.query.busca === "string" ? req.query.busca.trim() : "";
    const categoria = typeof req.query.categoria === "string" ? req.query.categoria.trim() : "";
    if (busca) {
      sql += " HAVING fornecedor_nome LIKE ? OR servico_nome LIKE ? OR servico_descricao LIKE ? OR categoria LIKE ?";
      const termo = `%${busca}%`;
      params.push(termo, termo, termo, termo);
    } else if (categoria) {
      sql += " HAVING categoria = ?";
      params.push(categoria);
    }
    sql += " ORDER BY fornecedor_nome, servico_nome";
    const [rows] = await pool.query(sql, params);
    res.json(rows);
  } catch (error) { next(error); }
});

router.get("/servicos/:id", async (req, res, next) => {
  try {
    const id = Number(req.params.id);
    if (!Number.isInteger(id) || id <= 0) return res.status(400).json({ mensagem: "ID inválido." });
    const [rows] = await pool.query(`${SQL} HAVING s.id = ?`, [id]);
    if (!rows.length) return res.status(404).json({ mensagem: "Serviço não encontrado ou indisponível." });
    res.json(rows[0]);
  } catch (error) { next(error); }
});

router.use((error, req, res, next) => {
  console.error("Erro no catálogo:", error.message);
  res.status(500).json({ mensagem: "Não foi possível carregar o catálogo." });
});
module.exports = router;

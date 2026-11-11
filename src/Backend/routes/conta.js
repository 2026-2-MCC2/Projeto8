// ======================================================
// CONTA DO USUÁRIO LOGADO (qualquer perfil)
// ======================================================
// Rotas sob o prefixo /conta (ver app.use no server.js). O id do usuário
// SEMPRE vem do JWT (req.usuario.id), nunca do corpo ou da URL.

const express = require("express");
const bcrypt = require("bcrypt");
const pool = require("../pool");
const { autenticarToken } = require("../middlewares/auth");

const router = express.Router();

// PATCH /conta/senha
// body: { senha_atual, nova_senha }
// Diferente do PATCH /usuarios/:id, aqui a senha ATUAL é conferida antes de
// trocar: quem só tem o token (sessão aberta num computador alheio, por
// exemplo) não consegue trocar a senha sem saber a atual.
router.patch("/senha", autenticarToken, async (req, res, next) => {
  try {
    const { senha_atual: senhaAtual, nova_senha: novaSenha } = req.body || {};

    if (typeof senhaAtual !== "string" || typeof novaSenha !== "string" || !senhaAtual || !novaSenha) {
      return res.status(400).json({ mensagem: "Informe a senha atual e a nova senha." });
    }

    if (novaSenha.length < 6) {
      return res.status(400).json({ mensagem: "A nova senha deve ter pelo menos 6 caracteres." });
    }

    // O bcrypt só considera os primeiros 72 bytes da senha.
    if (novaSenha.length > 72) {
      return res.status(400).json({ mensagem: "A nova senha deve ter no máximo 72 caracteres." });
    }

    if (novaSenha === senhaAtual) {
      return res.status(400).json({ mensagem: "A nova senha deve ser diferente da atual." });
    }

    const [linhas] = await pool.query("SELECT senha_hash FROM usuarios WHERE id = ?", [req.usuario.id]);

    if (!linhas.length) {
      return res.status(404).json({ mensagem: "Usuário não encontrado." });
    }

    // Atenção: nunca usar 401 aqui. O front-end entende 401 como "sessão expirada".
    if (!(await bcrypt.compare(senhaAtual, linhas[0].senha_hash))) {
      return res.status(403).json({ mensagem: "Senha atual incorreta." });
    }

    const novoHash = await bcrypt.hash(novaSenha, 10);
    await pool.query("UPDATE usuarios SET senha_hash = ? WHERE id = ?", [novoHash, req.usuario.id]);

    res.json({ mensagem: "Senha alterada com sucesso!" });
  } catch (erro) {
    next(erro);
  }
});

module.exports = router;
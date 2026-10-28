// Redefine a senha de um usuário. Uso apenas em DESENVOLVIMENTO.
// Uso:  node scripts/redefinir-senha.js 'email' 'nova-senha'
const bcrypt = require("bcrypt");
const connection = require("../db");

const [email, senha] = process.argv.slice(2);

if (!email || !senha) {
  console.error("Uso: node scripts/redefinir-senha.js 'email' 'nova-senha'");
  process.exit(1);
}

if (senha.length < 6) {
  console.error("A senha deve ter no mínimo 6 caracteres.");
  process.exit(1);
}

const senhaHash = bcrypt.hashSync(senha, 10);

connection.query(
  "UPDATE usuarios SET senha_hash = ? WHERE email = ?",
  [senhaHash, email],
  (erro, resultado) => {
    if (erro) {
      console.error(erro.message);
    } else if (resultado.affectedRows === 0) {
      console.error("Nenhum usuário encontrado com esse e-mail.");
    } else {
      console.log("Senha redefinida com sucesso.");
    }
    connection.end();
  },
);
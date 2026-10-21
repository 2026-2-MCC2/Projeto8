// Cria um usuário ADMINISTRADOR já aprovado.
// Uso:  node scripts/criar-admin.js 'email' 'senha' 'Nome opcional'
const bcrypt = require("bcrypt");
const connection = require("../db");

const [email, senha, nome = "Administrador TicketLab"] = process.argv.slice(2);

if (!email || !senha) {
  console.error("Uso: node scripts/criar-admin.js 'email' 'senha' 'Nome'");
  process.exit(1);
}

if (senha.length < 6) {
  console.error("A senha deve ter no mínimo 6 caracteres.");
  process.exit(1);
}

const senhaHash = bcrypt.hashSync(senha, 10);

connection.query(
  `INSERT INTO usuarios (nome, email, telefone, senha_hash, tipo, status)
   VALUES (?, ?, ?, ?, 'ADMINISTRADOR', 'APROVADO')`,
  [nome, email, "11999990000", senhaHash],
  (erro, resultado) => {
    if (erro) {
      console.error(
        erro.code === "ER_DUP_ENTRY"
          ? "Já existe um usuário com esse e-mail."
          : erro.message,
      );
    } else {
      console.log(`Administrador criado com id ${resultado.insertId}.`);
    }
    connection.end();
  },
);
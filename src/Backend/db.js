
const mysql = require("mysql2");
require("dotenv").config();

const pool = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  port: process.env.DB_PORT,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  enableKeepAlive: true,
  keepAliveInitialDelay: 0,
});

// Verifica a conexão com o banco.
pool.getConnection((error, connection) => {
  if (error) {
    console.error("Erro ao conectar ao MySQL:", error.message);
    return;
  }

  console.log("Conectado ao MySQL com sucesso!");
  connection.release();
});

// Exporta o pool para utilização nas rotas.
module.exports = pool;

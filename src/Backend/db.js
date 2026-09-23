const mysql = require("mysql2");
require("dotenv").config();

const connection = mysql.createConnection({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  port: process.env.DB_PORT,
});

connection.connect((error) => {
  if (error) {
    console.error("ERRO COMPLETO DO MYSQL:");
    console.error(error);
    return;
  }

  console.log("Conectado ao MySQL com sucesso!");
});

module.exports = connection;

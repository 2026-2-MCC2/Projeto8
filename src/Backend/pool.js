const mysql = require("mysql2/promise");
require("dotenv").config();

// Pool usado pelas rotas novas (módulo do fornecedor).
// O db.js (conexão única, com callbacks) continua sendo usado pelas rotas antigas.
//
// dateStrings: DATE/TIME chegam como "YYYY-MM-DD"/"HH:MM:SS" (sem deslocamento de fuso).
// decimalNumbers: DECIMAL chega como number (valores em reais).
const pool = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  port: process.env.DB_PORT,
  waitForConnections: true,
  connectionLimit: 10,
  dateStrings: true,
  decimalNumbers: true,
});

module.exports = pool;

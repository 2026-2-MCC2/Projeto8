const connection = require("./db");

connection.query("SELECT * FROM usuarios", (error, results) => {
  if (error) {
    console.error("Erro na consulta:", error.message);
    return;
  }

  console.log("Usuários encontrados:");
  console.log(results);
});

const express = require("express");

const connection = require("./db");

const app = express();

app.use(express.json());

app.get("/", (req, res) => {
  res.send("TrocaTicket API funcionando!");
});

app.get("/usuarios", (req, res) => {
  connection.query("SELECT * FROM usuarios", (error, results) => {
    if (error) {
      console.error("Erro ao cadastrar usuario", error.message);

      res.status(500).json({ mensagem: "Erro ao buscar usuários" });
      return;
    }

    res.json(results);
  });
});

app.get("/usuarios/:id", (req, res) => {
  const id = req.params.id;

  connection.query(
    "SELECT * FROM usuarios WHERE id = ?",
    [id],
    (error, results) => {
      if (error) {
        console.error("Erro ao buscar usuário:", error.message);

        res.status(500).json({
          mensagem: "Erro ao buscar usuário",
        });

        return;
      }

      if (results.length === 0) {
        res.status(404).json({
          mensagem: "Usuário não encontrado",
        });

        return;
      }

      res.json(results[0]);
    },
  );
});

app.patch("/usuarios/:id", (req, res) => {
  const id = req.params.id;

  console.log(id);
  console.log(req.body);

  connection.query(
    "UPDATE usuarios SET ? WHERE id = ?",
    [req.body, id],
    (error, results) => {
      if (error) {
        console.error("Erro ao atualizar usuário:", error.message);
        res.status(500).json({
          mensagem: "Erro ao atualizar usuário",
        });
        return;
      }

      if (results.affectedRows === 0) {
        res.status(404).json({
          mensagem: "Usuário não encontrado",
        });
        return;
      }

      res.json({
        mensagem: "Usuário atualizado com sucesso!",
      });
    },
  );
});

app.post("/usuarios", (req, res) => {
  const { nome, email, senha, telefone, tipo } = req.body;
  const sql = `
    INSERT INTO usuarios
    (nome, email, telefone, senha_hash, tipo, status)
    VALUES (?, ?, ?, ?, ?, ?)
`;
  connection.query(
    sql,
    [nome, email, telefone, senha, tipo, "PENDENTE"],
    (error, results) => {
      if (error) {
        console.error("Erro ao cadastrar usuário:", error.message);
        return;
      }
      console.log("Usuário cadastrado com sucesso!");
      res.status(201).json({
        mensagem: "Usuário cadastrado com sucesso!",
        id: results.insertId,
      });
    },
  );
});

app.listen(3000, () => {
  console.log("Servidor rodando na porta 3000");
});

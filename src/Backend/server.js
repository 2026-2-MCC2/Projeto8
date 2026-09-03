const express = require("express");

// Importa a conexão com o banco de dados MySQL
// que configuramos no arquivo db.js.
const connection = require("./db");

// Cria uma aplicação utilizando o Express.
const app = express();


// ======================================================
// MIDDLEWARE
// ======================================================

// Permite que o Express consiga interpretar JSON
// enviado no corpo (body) das requisições.
//
// Exemplo de JSON enviado pelo Postman:
//
// {
//     "nome": "Brian",
//     "email": "brian@email.com"
// }
//
// Depois disso, conseguimos acessar esses dados
// através de req.body.
app.use(express.json());


// ======================================================
// ROTA PRINCIPAL
// ======================================================

// GET /
//
// Essa é uma rota simples para verificar se a API
// está funcionando.
//
// req = request (requisição enviada pelo cliente)
// res = response (resposta enviada pela API)
app.get("/", (req, res) => {

  // Envia uma mensagem de texto como resposta.
  res.send("TrocaTicket API funcionando!");

});


// ======================================================
// GET /usuarios
// ======================================================

// Essa rota busca todos os usuários cadastrados
// na tabela "usuarios" do banco de dados.
//
// Método HTTP: GET
// URL: /usuarios
//
// Exemplo:
// GET http://localhost:3000/usuarios
app.get("/usuarios", (req, res) => {

  // Executa uma consulta SQL no banco.
  //
  // SELECT * significa que queremos buscar
  // todas as colunas da tabela usuarios.
  connection.query(
    "SELECT * FROM usuarios",
    (error, results) => {

      // Se acontecer algum erro durante a consulta,
      // entramos neste bloco.
      if (error) {

        // Mostra o erro no terminal para ajudar
        // durante o desenvolvimento.
        console.error(
          "Erro ao buscar usuario",
          error.message
        );

        // Retorna HTTP 500.
        //
        // 500 = Internal Server Error
        // Significa que aconteceu um erro interno
        // no servidor.
        res.status(500).json({
          mensagem: "Erro ao buscar usuários"
        });

        // Interrompe a execução da função.
        return;
      }

      // Se não houve erro, enviamos os resultados
      // encontrados no banco como JSON.
      res.json(results);

    }
  );

});


// ======================================================
// GET /usuarios/:id
// ======================================================

// Essa rota busca um usuário específico pelo ID.
//
// O ":id" é um parâmetro da URL.
//
// Exemplo:
// GET /usuarios/2
//
// Nesse caso, o valor de ":id" será 2.
app.get("/usuarios/:id", (req, res) => {

  // req.params contém os parâmetros presentes na URL.
  //
  // Em /usuarios/2:
  //
  // req.params.id = "2"
  //
  // Guardamos esse valor na constante id.
  const id = req.params.id;


  // Executa uma consulta SQL procurando
  // pelo usuário cujo ID seja igual ao valor recebido.
  connection.query(

    // O "?" é um placeholder.
    // O valor real será fornecido separadamente
    // no array [id].
    "SELECT * FROM usuarios WHERE id = ?",

    // O mysql2 substitui o primeiro "?" pelo valor de id.
    [id],

    (error, results) => {

      // Verifica se ocorreu algum erro no banco.
      if (error) {

        console.error(
          "Erro ao buscar usuário:",
          error.message
        );

        // HTTP 500 = erro interno do servidor.
        res.status(500).json({
          mensagem: "Erro ao buscar usuário"
        });

        return;
      }


      // results é um array contendo os registros
      // encontrados pela consulta.
      //
      // Se o array tiver tamanho 0, significa que
      // nenhum usuário foi encontrado.
      if (results.length === 0) {

        // HTTP 404 = Not Found.
        //
        // Usamos 404 porque o recurso solicitado
        // não existe.
        res.status(404).json({
          mensagem: "Usuário não encontrado"
        });

        return;
      }


      // Como estamos procurando apenas um ID,
      // esperamos apenas um usuário.
      //
      // results[0] pega o primeiro registro
      // encontrado no array.
      res.json(results[0]);

    }
  );

});


// ======================================================
// PATCH /usuarios/:id
// ======================================================

// PATCH é utilizado para atualizar parcialmente
// um recurso.
//
// Exemplo:
//
// PATCH /usuarios/2
//
// Body:
//
// {
//     "nome": "Fornecedor Novo"
// }
//
// Nesse caso, somente o nome será alterado.
app.patch("/usuarios/:id", (req, res) => {

  // Pega o ID enviado na URL.
  //
  // Exemplo:
  // PATCH /usuarios/2
  //
  // req.params.id = "2"
  const id = req.params.id;


  // Mostra o ID no terminal.
  // Isso foi utilizado durante nossos testes
  // para verificar se o Express estava recebendo
  // corretamente o parâmetro da URL.


  // Mostra no terminal os dados enviados
  // no corpo da requisição.
  //
  // Exemplo:
  //
  // {
  //     nome: "Fornecedor Novo"
  // }


  // Executa o UPDATE no banco de dados.
  connection.query(

    // O mysql2 permite utilizar um objeto no SET.
    //
    // Se req.body for:
    //
    // {
    //     nome: "Fornecedor Novo"
    // }
    //
    // o mysql2 transforma isso em uma atualização
    // correspondente à coluna nome.
    //
    // O segundo "?" representa o ID do usuário.
    "UPDATE usuarios SET ? WHERE id = ?",


    // Primeiro valor:
    // req.body -> campos que serão atualizados
    //
    // Segundo valor:
    // id -> usuário que será atualizado.
    [req.body, id],


    (error, results) => {

      // Verifica se aconteceu algum erro
      // durante o UPDATE.
      if (error) {

        console.error(
          "Erro ao atualizar usuário:",
          error.message
        );

        // HTTP 500 = erro interno do servidor.
        res.status(500).json({
          mensagem: "Erro ao atualizar usuário"
        });

        return;
      }


      // affectedRows informa quantas linhas
      // foram afetadas pela operação.
      //
      // Se for 0, significa que nenhum usuário
      // com aquele ID foi encontrado/alterado.
      if (results.affectedRows === 0) {

        // HTTP 404 = usuário não encontrado.
        res.status(404).json({
          mensagem: "Usuário não encontrado"
        });

        return;
      }


      // Se chegou até aqui, o usuário foi atualizado
      // com sucesso.
      res.json({
        mensagem: "Usuário atualizado com sucesso!"
      });

    }
  );

});


app.delete("/usuarios/:id", (req, res) => {

    const id = req.params.id;

    connection.query(
        "DELETE FROM usuarios WHERE id = ?",
        [id],
        (error, results) => {

            if (error) {
                console.error(
                    "Erro ao deletar usuário:",
                    error.message
                );

                res.status(500).json({
                    mensagem: "Erro ao deletar usuário"
                });

                return;
            }

            if (results.affectedRows === 0) {
                res.status(404).json({
                    mensagem: "Usuário não encontrado"
                });

                return;
            }

            res.status(200).json({
                mensagem: "Usuário deletado com sucesso!"
            });

        }
    );

});

// ======================================================
// POST /usuarios
// ======================================================

// POST é utilizado para criar um novo recurso.
//
// Neste caso, estamos criando um novo usuário.
//
// Exemplo:
//
// POST /usuarios
//
// Body:
//
// {
//     "nome": "João",
//     "email": "joao@email.com",
//     "senha": "123456",
//     "telefone": "11999999999",
//     "tipo": "ORGANIZADOR"
// }
app.post("/usuarios", (req, res) => {

  // Retira do req.body os campos que precisamos
  // para cadastrar o usuário.
  //
  // Isso é chamado de destructuring em JavaScript.
  const {
    nome,
    email,
    senha,
    telefone,
    tipo
  } = req.body;


  // SQL responsável por inserir um novo usuário.
  //
  // Os "?" são placeholders.
  // Os valores reais serão enviados no array abaixo.
  const sql = `
        INSERT INTO usuarios
        (nome, email, telefone, senha_hash, tipo, status)
        VALUES (?, ?, ?, ?, ?, ?)
    `;


  // Executa o INSERT no banco.
  connection.query(

    sql,

    // Os valores seguem exatamente a mesma
    // ordem dos "?" presentes na SQL.
    //
    // nome      -> primeiro ?
    // email     -> segundo ?
    // telefone  -> terceiro ?
    // senha     -> quarto ?
    // tipo      -> quinto ?
    // PENDENTE  -> sexto ?
    [
      nome,
      email,
      telefone,
      senha,
      tipo,
      "PENDENTE"
    ],


    (error, results) => {

      // Verifica se aconteceu algum erro
      // durante o cadastro.
      if (error) {

        console.error(
          "Erro ao cadastrar usuário:",
          error.message
        );

        // Por enquanto apenas interrompemos
        // a execução em caso de erro.
        //
        // Futuramente vamos melhorar esse tratamento
        // para retornar o status HTTP adequado.
        return;
      }


      // Mostra no terminal que o cadastro funcionou.
      console.log(
        "Usuário cadastrado com sucesso!"
      );


      // HTTP 201 = Created.
      //
      // Indica que um novo recurso foi criado.
      res.status(201).json({

        mensagem:
          "Usuário cadastrado com sucesso!",

        // insertId contém o ID gerado automaticamente
        // pelo AUTO_INCREMENT do MySQL.
        id: results.insertId

      });

    }
  );

});


// ======================================================
// INICIALIZAÇÃO DO SERVIDOR
// ======================================================

// Inicia o servidor na porta 3000.
//
// Depois disso podemos acessar:
//
// http://localhost:3000
//
// O callback será executado quando o servidor
// começar a funcionar.
app.listen(3000, () => {

  console.log(
    "Servidor rodando na porta 3000"
  );

});
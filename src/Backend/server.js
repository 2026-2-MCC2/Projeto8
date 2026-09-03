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

        res.status(500).json({
          mensagem: "Erro ao cadastrar usuário"
        });

        return;
      }


      // HTTP 201 = Created.
      //
      // Indica que um novo recurso foi criado.
      res.status(201).json({
        mensagem: "Usuário cadastrado com sucesso!",

        // insertId contém o ID gerado automaticamente
        // pelo AUTO_INCREMENT do MySQL.
        id: results.insertId
      });

    }
  );

});


// ======================================================
// POST /organizadores
// ======================================================

// Rota responsável pelo autocadastro de um Organizador.
//
// O cadastro precisa criar dois registros no banco:
//
// 1. Um registro na tabela "usuarios"
// 2. Um registro na tabela "organizadores"
//
// As duas tabelas ficam relacionadas pelo ID do usuário.
//
// Como as duas operações fazem parte do mesmo cadastro,
// vamos utilizar uma transação do MySQL.
//
// Se tudo der certo:
//     COMMIT
//
// Se alguma operação falhar:
//     ROLLBACK

app.post("/organizadores", (req, res) => {

  // Retira do req.body os campos necessários
  // para realizar o cadastro.
  //
  // Os primeiros campos pertencem à tabela "usuarios".
  // Os últimos campos pertencem à tabela "organizadores".
  const {
    nome,
    email,
    senha,
    telefone,
    tipo_pessoa,
    documento,
    data_nascimento
  } = req.body;


  // ==================================================
  // VALIDAÇÃO DOS CAMPOS OBRIGATÓRIOS
  // ==================================================

  // Verifica se algum dos campos necessários
  // não foi informado pelo usuário.
  if (
    !nome ||
    !email ||
    !senha ||
    !telefone ||
    !tipo_pessoa ||
    !documento ||
    !data_nascimento
  ) {

    res.status(400).json({
      mensagem: "Todos os campos são obrigatórios"
    });

    return;
  }


  // ==================================================
  // VALIDAÇÃO DO TIPO DE PESSOA
  // ==================================================

  // O banco aceita somente PF ou PJ.
  if (tipo_pessoa !== "PF" && tipo_pessoa !== "PJ") {

    res.status(400).json({
      mensagem: "Tipo de pessoa deve ser 'PF' ou 'PJ'"
    });

    return;
  }


  // ==================================================
  // VALIDAÇÃO DA DATA DE NASCIMENTO
  // ==================================================

  // Converte a data recebida para um objeto Date.
  const data = new Date(data_nascimento);


  // Verifica se a data informada é inválida.
  if (isNaN(data.getTime())) {

    res.status(400).json({
      mensagem: "Data de nascimento inválida"
    });

    return;
  }


  // Verifica se a data de nascimento está no futuro.
  if (data > new Date()) {

    res.status(400).json({
      mensagem: "Data de nascimento não pode ser no futuro"
    });

    return;
  }


  // ==================================================
  // SQL DO USUÁRIO
  // ==================================================

  // SQL responsável por inserir o usuário.
  //
  // Os "?" são placeholders.
  // Os valores reais serão enviados no array abaixo.
  const sql = `
        INSERT INTO usuarios
        (nome, email, telefone, senha_hash, tipo, status)
        VALUES (?, ?, ?, ?, ?, ?)
    `;


  // ==================================================
  // INÍCIO DA TRANSAÇÃO
  // ==================================================

  // Inicia uma transação no MySQL.
  //
  // A partir daqui, as alterações poderão ser
  // confirmadas com COMMIT ou desfeitas com ROLLBACK.
  connection.beginTransaction((error) => {

    // Verifica se houve algum problema ao iniciar
    // a transação.
    if (error) {

      console.error(
        "Erro ao iniciar transação:",
        error.message
      );

      res.status(500).json({
        mensagem: "Erro ao iniciar cadastro"
      });

      return;
    }


    // ==================================================
    // PRIMEIRO INSERT
    // ==================================================

    // Insere os dados básicos na tabela "usuarios".
    connection.query(
      sql,

      // Os valores seguem exatamente a mesma
      // ordem dos "?" presentes na SQL.
      [
        nome,
        email,
        telefone,
        senha,
        "ORGANIZADOR",
        "PENDENTE"
      ],

      (error, results) => {

        // Se o primeiro INSERT falhar,
        // desfazemos a transação.
        if (error) {

          connection.rollback(() => {

            console.error(
              "Erro ao cadastrar usuário:",
              error.message
            );


            // ER_DUP_ENTRY significa que
            // tentamos inserir um valor que
            // deveria ser único, mas já existe.
            if (error.code === "ER_DUP_ENTRY") {

              res.status(409).json({
                mensagem: "E-mail já cadastrado"
              });

              return;
            }


            res.status(500).json({
              mensagem: "Erro ao cadastrar usuário"
            });

          });

          return;
        }


        // ==================================================
        // SQL DO ORGANIZADOR
        // ==================================================

        // SQL responsável por inserir os dados
        // específicos do organizador.
        const sqlOrganizador = `
                    INSERT INTO organizadores
                    (id_usuario, tipo_pessoa, documento, data_nascimento)
                    VALUES (?, ?, ?, ?)
                `;


        // ==================================================
        // SEGUNDO INSERT
        // ==================================================

        // Insere os dados específicos do organizador.
        connection.query(
          sqlOrganizador,

          // results.insertId contém o ID gerado
          // automaticamente pelo primeiro INSERT.
          //
          // Esse ID será utilizado como
          // id_usuario na tabela organizadores.
          [
            results.insertId,
            tipo_pessoa,
            documento,
            data_nascimento
          ],

          (error) => {

            // Se o segundo INSERT falhar,
            // desfazemos também o primeiro INSERT.
            if (error) {

              connection.rollback(() => {

                console.error(
                  "Erro ao cadastrar organizador:",
                  error.message
                );


                // Verifica se o erro aconteceu
                // porque o documento já existe.
                if (error.code === "ER_DUP_ENTRY") {

                  res.status(409).json({
                    mensagem: "Documento já cadastrado"
                  });

                  return;
                }


                res.status(500).json({
                  mensagem: "Erro ao cadastrar organizador"
                });

              });

              return;
            }


            // ==================================================
            // COMMIT
            // ==================================================

            // Os dois INSERTs foram executados com sucesso.
            //
            // Agora confirmamos definitivamente
            // todas as alterações realizadas
            // durante a transação.
            connection.commit((error) => {

              // Verifica se houve algum problema
              // ao confirmar a transação.
              if (error) {

                // Se o COMMIT falhar, tentamos
                // desfazer a transação.
                connection.rollback(() => {

                  console.error(
                    "Erro ao confirmar cadastro:",
                    error.message
                  );

                  res.status(500).json({
                    mensagem: "Erro ao confirmar cadastro"
                  });

                });

                return;
              }


              // ==================================================
              // RESPOSTA DE SUCESSO
              // ==================================================

              // HTTP 201 = Created.
              //
              // Só chegamos aqui depois que:
              //
              // 1. O usuário foi criado.
              // 2. O organizador foi criado.
              // 3. O COMMIT foi realizado.
              res.status(201).json({
                mensagem: "Organizador cadastrado com sucesso!",
                id: results.insertId
              });

            });

          }
        );

      }
    );

  });

});

// ======================================================
// POST /fornecedores
// ======================================================
// Rota responsável pelo autocadastro de um Fornecedor.
//
// O cadastro precisa criar dois registros no banco:
//
// 1. Um registro na tabela "usuarios"
// 2. Um registro na tabela "fornecedores"
//
// As duas tabelas ficam relacionadas pelo ID do usuário.
//
// Neste momento estamos utilizando uma transação,
// mas ainda não adicionamos COMMIT nem ROLLBACK.
// Vamos fazer essas partes separadamente.

// ======================================================
// POST /fornecedores
// ======================================================
// Rota responsável pelo autocadastro de um Fornecedor.
//
// O cadastro precisa criar dois registros no banco:
//
// 1. Um registro na tabela "usuarios"
// 2. Um registro na tabela "fornecedores"
//
// As duas tabelas ficam relacionadas pelo ID do usuário.
//
// Como são dois INSERTs que fazem parte do mesmo cadastro,
// utilizamos uma transação.
//
// Se tudo der certo:
//     COMMIT
//
// Se alguma operação falhar:
//     ROLLBACK

app.post("/fornecedores", (req, res) => {

  // ==================================================
  // DADOS RECEBIDOS
  // ==================================================

  // Retira do req.body os campos necessários
  // para realizar o cadastro do fornecedor.
  const {
    nome,
    email,
    senha,
    telefone,
    cnpj,
    categoria_atuacao
  } = req.body;


  // ==================================================
  // VALIDAÇÃO DOS CAMPOS OBRIGATÓRIOS
  // ==================================================

  // Verifica se algum dos campos necessários
  // não foi informado pelo usuário.
  if (
    !nome ||
    !email ||
    !senha ||
    !telefone ||
    !cnpj ||
    !categoria_atuacao
  ) {

    res.status(400).json({
      mensagem: "Todos os campos são obrigatórios"
    });

    return;
  }


  // ==================================================
  // VALIDAÇÃO DO CNPJ
  // ==================================================

  // Neste momento estamos esperando que o CNPJ
  // seja informado somente com números.
  //
  // Exemplo:
  // 12345678000199
  //
  // Por isso verificamos se possui exatamente
  // 14 caracteres.
  if (cnpj.length !== 14) {

    res.status(400).json({
      mensagem: "CNPJ deve ter 14 dígitos"
    });

    return;
  }


  // ==================================================
  // SQL DO USUÁRIO
  // ==================================================

  // Primeiro vamos cadastrar os dados básicos
  // na tabela usuarios.
  const sql = `
    INSERT INTO usuarios
    (nome, email, telefone, senha_hash, tipo, status)
    VALUES (?, ?, ?, ?, ?, ?)
  `;


  // ==================================================
  // INÍCIO DA TRANSAÇÃO
  // ==================================================

  // Inicia uma transação no MySQL.
  //
  // A partir daqui, as alterações poderão ser
  // confirmadas com COMMIT ou desfeitas com ROLLBACK.
  connection.beginTransaction((error) => {

    // Verifica se aconteceu algum erro
    // ao iniciar a transação.
    if (error) {

      console.error(
        "Erro ao iniciar transação:",
        error.message
      );

      res.status(500).json({
        mensagem: "Erro ao iniciar cadastro"
      });

      return;
    }


    // ==================================================
    // PRIMEIRO INSERT
    // ==================================================

    // Insere os dados básicos do fornecedor
    // na tabela usuarios.
    connection.query(
      sql,

      // Os valores seguem exatamente a mesma
      // ordem dos "?" presentes na SQL.
      [
        nome,
        email,
        telefone,
        senha,
        "FORNECEDOR",
        "PENDENTE"
      ],

      (error, results) => {

        // Verifica se aconteceu algum erro
        // durante o primeiro INSERT.
        if (error) {

          // Desfaz a transação.
          connection.rollback(() => {

            console.error(
              "Erro ao cadastrar fornecedor:",
              error.message
            );


            // ER_DUP_ENTRY significa que tentamos
            // inserir um valor que deveria ser único,
            // mas ele já existe no banco.
            if (error.code === "ER_DUP_ENTRY") {

              res.status(409).json({
                mensagem: "E-mail já cadastrado"
              });

              return;
            }


            res.status(500).json({
              mensagem: "Erro ao cadastrar fornecedor"
            });

          });

          return;
        }


        console.log(
          "Usuário fornecedor criado com sucesso!"
        );


        // ==================================================
        // SQL DO FORNECEDOR
        // ==================================================

        // Agora vamos inserir os dados específicos
        // do fornecedor na tabela fornecedores.
        const sqlFornecedor = `
          INSERT INTO fornecedores
          (id_usuario, cnpj, categoria_atuacao)
          VALUES (?, ?, ?)
        `;


        // ==================================================
        // SEGUNDO INSERT
        // ==================================================

        // Insere os dados específicos do fornecedor.
        connection.query(
          sqlFornecedor,

          // results.insertId contém o ID gerado
          // pelo primeiro INSERT na tabela usuarios.
          //
          // Esse mesmo ID será utilizado como
          // id_usuario na tabela fornecedores.
          [
            results.insertId,
            cnpj,
            categoria_atuacao
          ],

          (error) => {

            // Verifica se aconteceu algum erro
            // durante o segundo INSERT.
            if (error) {

              // Desfaz também o primeiro INSERT.
              connection.rollback(() => {

                console.error(
                  "Erro ao cadastrar fornecedor:",
                  error.message
                );


                // Se o CNPJ já existir,
                // retornamos HTTP 409.
                if (error.code === "ER_DUP_ENTRY") {

                  res.status(409).json({
                    mensagem: "CNPJ já cadastrado"
                  });

                  return;
                }


                res.status(500).json({
                  mensagem: "Erro ao cadastrar fornecedor"
                });

              });

              return;
            }


            // ==================================================
            // COMMIT
            // ==================================================

            // Os dois INSERTs foram executados com sucesso.
            //
            // Agora confirmamos definitivamente
            // todas as alterações realizadas
            // durante a transação.
            connection.commit((error) => {

              // Verifica se aconteceu algum erro
              // ao confirmar a transação.
              if (error) {

                console.error(
                  "Erro ao confirmar cadastro:",
                  error.message
                );

                // Tenta desfazer a transação.
                connection.rollback(() => {

                  res.status(500).json({
                    mensagem: "Erro ao confirmar cadastro"
                  });

                });

                return;
              }


              // ==================================================
              // RESPOSTA DE SUCESSO
              // ==================================================

              // HTTP 201 = Created.
              //
              // Só chegamos aqui depois que:
              //
              // 1. O usuário foi criado.
              // 2. O fornecedor foi criado.
              // 3. O COMMIT foi realizado.

              res.status(201).json({
                mensagem: "Fornecedor cadastrado com sucesso!",
                id: results.insertId
              });

            });

          }
        );

      }
    );

  });

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
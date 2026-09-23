const express = require("express");
const cors = require("cors");
// Importa a conexão com o banco de dados MySQL
// que configuramos no arquivo db.js.
const connection = require("./db");
// Cria uma aplicação utilizando o Express.
const app = express();

// ======================================================
// DADOS TEMPORÁRIOS DO MODO DEMONSTRAÇÃO
// ======================================================

// O modo demonstração não depende do MySQL.
// Os eventos ficam somente na memória enquanto
// o servidor estiver funcionando.

const usuarioDemonstracao = {
  id: 999999,
  nome: "Organizador Demonstração",
  email: "demo@ticketlab.com",
  tipo: "ORGANIZADOR",
};

// Lista temporária de eventos criados durante a demonstração.
const eventosDemonstracao = [];

const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

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
app.use(cors());
app.use(express.json());

// Middleware responsável por verificar se o usuário possui
// um token JWT válido antes de acessar uma rota protegida.
function autenticarToken(req, res, next) {
  //Pega o cabeçalho Authorization da requisição.
  const authHeader = req.headers["authorization"];

  //Verfica se o cabeçalho foi enviado.
  if (!authHeader) {
    return res.status(401).json({
      mensagem: "Token não fornecido",
    });
  }

  //O formato esperado eh:
  //Authorization: Bearer <token>
  const partes = authHeader.split(" ");

  //Verfica se o formato do cabeçalho está correto.
  if (partes.length !== 2 || partes[0] !== "Bearer") {
    return res.status(401).json({
      mensagem: "Formato de token inválido",
    });
  }
  const token = partes[1];

  // Verifica se o token foi realmente assinado pelo nosso servidor
  // e se ainda não expirou.
  jwt.verify(token, process.env.JWT_SECRET, (error, usuario) => {
    if (error) {
      return res.status(401).json({
        mensagem: "Token inválido ou expirado",
      });
    }

    // Guarda os dados do usuário dentro da requisição.
    // Assim, as próximas etapas da requisição poderão
    // saber quem está tentando acessar a rota.

    req.usuario = usuario;
    // Continua para a próxima etapa.
    next();
  });
}

// Middleware responsável por verificar se o usuário possui
// um dos perfis permitidos para acessar determinada rota.
function autorizarPerfis(...perfisPermitidos) {
  return (req, res, next) => {
    // req.usuario foi preenchido pelo middleware autenticarToken.
    if (!req.usuario) {
      return res.status(401).json({
        mensagem: "Usuário não autenticado",
      });
    }

    // Verifica se o perfil do usuário está entre
    // os perfis autorizados para aquela rota.
    if (!perfisPermitidos.includes(req.usuario.tipo)) {
      return res.status(403).json({
        mensagem: "Acesso negado: perfil não autorizado",
      });
    }
    //Se o perfil tiver permissão, continua para a próxima etapa.
    next();
  };
}

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
app.get(
  "/usuarios",
  autenticarToken,
  autorizarPerfis("ADMINISTRADOR"),
  (req, res) => {
    // Executa uma consulta SQL no banco.
    //
    // SELECT id , nome, email, telefone, tipo, status FROM usuarios significa que queremos buscar
    // essas colunas específicas da tabela usuarios.
    connection.query(
      "SELECT id , nome, email, telefone, tipo, status FROM usuarios",
      (error, results) => {
        // Se acontecer algum erro durante a consulta,
        // entramos neste bloco.
        if (error) {
          // Mostra o erro no terminal para ajudar
          // durante o desenvolvimento.
          console.error("Erro ao buscar usuários", error.message);

          // Retorna HTTP 500.
          //
          // 500 = Internal Server Error
          // Significa que aconteceu um erro interno
          // no servidor.
          res.status(500).json({
            mensagem: "Erro ao buscar usuários",
          });

          // Interrompe a execução da função.
          return;
        }

        // Se não houve erro, enviamos os resultados
        // encontrados no banco como JSON.
        res.json(results);
      }
    );
  }
);

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
app.get(
  "/usuarios/:id",
  autenticarToken,
  autorizarPerfis("ADMINISTRADOR"),
  (req, res) => {
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
      "SELECT id , nome, email, telefone, tipo, status FROM usuarios WHERE id = ?",

      // O mysql2 substitui o primeiro "?" pelo valor de id.
      [id],

      (error, results) => {
        // Verifica se ocorreu algum erro no banco.
        if (error) {
          console.error("Erro ao buscar usuário:", error.message);

          // HTTP 500 = erro interno do servidor.
          res.status(500).json({
            mensagem: "Erro ao buscar usuário",
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
            mensagem: "Usuário não encontrado",
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
  }
);

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
app.patch("/usuarios/:id", autenticarToken, (req, res) => {
  // Pega o ID enviado na URL.
  //
  // Exemplo:
  // PATCH /usuarios/2
  //
  // req.params.id = "2"
  const id = req.params.id;

  // Verifica se o ID informado na URL é um número inteiro positivo.
  if (!Number.isInteger(Number(id)) || Number(id) <= 0) {
    return res.status(400).json({
      mensagem: "ID de usuário inválido",
    });
  }

  // Verifica se o usuário logado é um administrador
  // ou se está tentando alterar o próprio cadastro.
  if (req.usuario.tipo !== "ADMINISTRADOR" && req.usuario.id !== Number(id)) {
    return res.status(403).json({
      mensagem: "Acesso negado: você só pode alterar seu próprio cadastro",
    });
  }

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

  // Copia os dados enviados pelo usuário para um novo objeto.
  // Dessa forma podemos controlar quais campos serão atualizados
  // antes de enviá-los para o banco de dados.
  const dadosAtualizacao = { ...req.body };

  // Define quais campos podem ser alterados pelo PATCH.
  // Campos como id, tipo e status não podem
  // ser alterados diretamente pelo usuário.
  //
  // A senha também não é alterada diretamente.
  // Quando uma nova senha é enviada, ela é transformada
  // em um hash bcrypt antes de ser salva no banco.
  const camposPermitidos = ["nome", "email", "telefone"];
  // Cria um objeto vazio para armazenar somente
  // os campos que podem ser atualizados.
  const dadosPermitidos = {};

  // Percorre os campos permitidos.
  camposPermitidos.forEach((campo) => {
    // Verifica se o campo foi realmente enviado
    // na requisição.
    if (req.body[campo] !== undefined) {
      // Adiciona o campo ao objeto que será
      // enviado para o banco de dados.
      dadosPermitidos[campo] = req.body[campo];
    }
  });

  // Se uma nova senha foi enviada, adiciona o hash
  // ao objeto de atualização.
  if (dadosAtualizacao.senha_hash) {
    dadosPermitidos.senha_hash = dadosAtualizacao.senha_hash;
  }

  // Verifica se pelo menos um campo válido
  // foi enviado para atualização.
  if (Object.keys(dadosPermitidos).length === 0) {
    return res.status(400).json({
      mensagem: "Nenhum campo válido para atualização foi enviado",
    });
  }

  // Valida o formato do e-mail, caso ele esteja sendo alterado.
  if (dadosPermitidos.email) {
    const emailValido = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!emailValido.test(dadosPermitidos.email)) {
      return res.status(400).json({
        mensagem: "E-mail inválido",
      });
    }
  }

  if (dadosAtualizacao.senha !== undefined) {
    // Verifica se a senha enviada é uma string.
    if (typeof dadosAtualizacao.senha !== "string") {
      return res.status(400).json({
        mensagem: "A senha deve ser um texto",
      });
    }
    if (dadosAtualizacao.senha.length < 6) {
      return res.status(400).json({
        mensagem: "A senha deve ter pelo menos 6 caracteres",
      });
    }
    const senhaHash = bcrypt.hashSync(dadosAtualizacao.senha, 10);

    delete dadosAtualizacao.senha;

    dadosAtualizacao.senha_hash = senhaHash;
  }

  // Verifica se o telefone enviado é uma string.
  if (dadosPermitidos.telefone !== undefined) {
    if (typeof dadosPermitidos.telefone !== "string") {
      return res.status(400).json({
        mensagem: "O telefone deve ser um texto",
      });
    }
  }

  if (dadosPermitidos.telefone) {
    const telefoneValido = /^\d{10,11}$/;

    if (!telefoneValido.test(dadosPermitidos.telefone)) {
      return res.status(400).json({
        mensagem: "Telefone inválido.",
      });
    }
  }

  // Verifica se o nome enviado é uma string.
  if (dadosPermitidos.nome !== undefined) {
    if (typeof dadosPermitidos.nome !== "string") {
      return res.status(400).json({
        mensagem: "O nome deve ser um texto",
      });
    }
  }

  if (dadosPermitidos.nome !== undefined) {
    if (dadosPermitidos.nome.trim().length === 0) {
      return res.status(400).json({
        mensagem: "O nome nao pode ser vazio",
      });
    }
  }

  if (dadosPermitidos.nome !== undefined) {
    if (dadosPermitidos.nome.length > 250) {
      return res.status(400).json({
        mensagem: "O nome deve ter no maximo 250 caracteres",
      });
    }
  }

  // Verifica se o e-mail enviado é uma string.
  if (dadosPermitidos.email !== undefined) {
    if (typeof dadosPermitidos.email !== "string") {
      return res.status(400).json({
        mensagem: "O e-mail deve ser um texto",
      });
    }
  }

  // Verifica o tamanho do e-mail, caso ele esteja sendo alterado.
  if (dadosPermitidos.email !== undefined) {
    if (dadosPermitidos.email.length > 250) {
      return res.status(400).json({
        mensagem: "O e-mail deve ter no máximo 250 caracteres",
      });
    }
  }

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
    // dadosPermitidos -> campos que serão atualizados
    //
    // Segundo valor:
    // id -> usuário que será atualizado.
    [dadosPermitidos, id],

    (error, results) => {
      // Verifica se aconteceu algum erro
      // durante o UPDATE.
      if (error) {
        console.error("Erro ao atualizar usuário:", error.message);

        // ER_DUP_ENTRY acontece quando tentamos utilizar
        // um valor UNIQUE que já existe no banco.
        // Neste caso, o exemplo principal é um email duplicado.
        if (error.code === "ER_DUP_ENTRY") {
          return res.status(409).json({
            mensagem: "Email já cadastrado",
          });
        }

        return res.status(500).json({
          mensagem: "Erro ao atualizar usuário",
        });
      }

      // affectedRows informa quantas linhas
      // foram afetadas pela operação.
      //
      // Se for 0, significa que nenhum usuário
      // com aquele ID foi encontrado/alterado.
      if (results.affectedRows === 0) {
        // Verifica se o usuário realmente não existe.
        connection.query(
          "SELECT id FROM usuarios WHERE id = ?",
          [id],
          (error, rows) => {
            if (error) {
              console.error("Erro ao verificar usuário:", error.message);

              return res.status(500).json({
                mensagem: "Erro ao verificar usuário",
              });
            }

            // Se não encontrou o usuário, retornamos 404.
            if (rows.length === 0) {
              return res.status(404).json({
                mensagem: "Usuário não encontrado",
              });
            }

            // O usuário existe, mas os dados enviados
            // já eram iguais aos dados atuais.
            return res.status(200).json({
              mensagem: "Nenhuma alteração realizada",
            });
          }
        );

        return;
      }

      // Se chegou até aqui, o usuário foi atualizado
      // com sucesso.
      res.json({
        mensagem: "Usuário atualizado com sucesso!",
      });
    }
  );
});

app.delete(
  "/usuarios/:id",
  autenticarToken,
  autorizarPerfis("ADMINISTRADOR"),
  (req, res) => {
    const id = req.params.id;

    connection.query(
      "DELETE FROM usuarios WHERE id = ?",
      [id],
      (error, results) => {
        if (error) {
          console.error("Erro ao deletar usuário:", error.message);

          res.status(500).json({
            mensagem: "Erro ao deletar usuário",
          });

          return;
        }

        if (results.affectedRows === 0) {
          res.status(404).json({
            mensagem: "Usuário não encontrado",
          });

          return;
        }

        res.status(200).json({
          mensagem: "Usuário deletado com sucesso!",
        });
      }
    );
  }
);

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
    tipo_pessoa,
    documento,
    data_nascimento,
  } = req.body;

  // Verifica se todos os campos obrigatórios foram enviados.
  if (
    !nome ||
    !email ||
    !senha ||
    !telefone ||
    !tipo_pessoa ||
    !documento ||
    !data_nascimento
  ) {
    return res.status(400).json({
      mensagem: "Todos os campos são obrigatórios",
    });
  }

  // Verifica se o tipo de pessoa é válido.
  //
  // A tabela organizadores permite somente:
  // PF = Pessoa Física
  // PJ = Pessoa Jurídica
  if (tipo_pessoa !== "PF" && tipo_pessoa !== "PJ") {
    return res.status(400).json({
      mensagem: "Tipo de pessoa deve ser 'PF' ou 'PJ'",
    });
  }

  // Gera um hash seguro para a senha.
  //
  // O número 10 representa o custo utilizado
  // pelo bcrypt para gerar o hash.
  //
  // A senha original NÃO será armazenada no banco.
  const senhaHash = bcrypt.hashSync(senha, 10);

  // SQL responsável por inserir um novo usuário.
  //
  // Os "?" são placeholders.
  // Os valores reais serão enviados no array abaixo.
  const sqlUsuario = `
        INSERT INTO usuarios
        (nome, email, telefone, senha_hash, tipo, status)
        VALUES (?, ?, ?, ?, ?, ?)
    `;

  // Inicia uma transação no banco de dados.
  //
  // A partir daqui, as alterações só serão confirmadas
  // definitivamente quando executarmos o COMMIT.
  connection.beginTransaction((error) => {
    if (error) {
      console.error("Erro ao iniciar transação:", error.message);

      return res.status(500).json({
        mensagem: "Erro ao iniciar cadastro",
      });
    }

    // Executa o INSERT do usuário.
    connection.query(
      sqlUsuario,
      [nome, email, telefone, senhaHash, "ORGANIZADOR", "PENDENTE"],
      (error, results) => {
        // Verifica se aconteceu algum erro
        // durante o cadastro do usuário.
        if (error) {
          console.error("Erro ao cadastrar usuário:", error.message);

          // Desfaz qualquer alteração realizada
          // dentro da transação.
          return connection.rollback(() => {
            // ER_DUP_ENTRY = registro duplicado.
            //
            // Nesse caso, normalmente significa
            // que o email já está cadastrado.
            if (error.code === "ER_DUP_ENTRY") {
              return res.status(409).json({
                mensagem: "Email já cadastrado",
              });
            }

            return res.status(500).json({
              mensagem: "Erro ao cadastrar usuário",
            });
          });
        }

        // Guarda o ID gerado pelo AUTO_INCREMENT
        // da tabela usuarios.
        const idUsuario = results.insertId;

        // SQL responsável por criar o registro
        // correspondente na tabela organizadores.
        const sqlOrganizador = `
                    INSERT INTO organizadores
                    (id_usuario, tipo_pessoa, documento, data_nascimento)
                    VALUES (?, ?, ?, ?)
                `;

        // Cria o registro do organizador.
        connection.query(
          sqlOrganizador,
          [idUsuario, tipo_pessoa, documento, data_nascimento],
          (error) => {
            // Verifica se aconteceu algum erro
            // ao cadastrar os dados do organizador.
            if (error) {
              console.error("Erro ao cadastrar organizador:", error.message);

              // Desfaz o INSERT do usuário
              // caso o organizador não consiga
              // ser cadastrado.
              return connection.rollback(() => {
                // ER_DUP_ENTRY pode acontecer
                // caso o documento já exista.
                if (error.code === "ER_DUP_ENTRY") {
                  return res.status(409).json({
                    mensagem: "Documento já cadastrado",
                  });
                }

                return res.status(500).json({
                  mensagem: "Erro ao cadastrar organizador",
                });
              });
            }

            // Confirma definitivamente todas as
            // alterações realizadas na transação.
            connection.commit((error) => {
              if (error) {
                console.error("Erro ao confirmar cadastro:", error.message);

                // Se o COMMIT falhar, desfaz
                // as alterações da transação.
                return connection.rollback(() => {
                  return res.status(500).json({
                    mensagem: "Erro ao confirmar cadastro",
                  });
                });
              }

              // HTTP 201 = Created.
              //
              // Indica que os dois registros
              // foram criados com sucesso.
              return res.status(201).json({
                mensagem: "Usuário cadastrado com sucesso!",
                id: idUsuario,
              });
            });
          }
        );
      }
    );
  });
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
    data_nascimento,
  } = req.body;

  // ==================================================
  // VALIDAÇÃO DOS CAMPOS OBRIGATÓRIOS
  // ==================================================

  // Estes campos são obrigatórios para PF e PJ.
  if (!nome || !email || !senha || !telefone || !tipo_pessoa || !documento) {
    return res.status(400).json({
      mensagem: "Todos os campos são obrigatórios",
    });
  }

  // A data de nascimento é obrigatória somente para PF.
  if (tipo_pessoa === "PF" && !data_nascimento) {
    return res.status(400).json({
      mensagem: "A data de nascimento é obrigatória para Pessoa Física",
    });
  }

  // ==================================================
  // VALIDAÇÃO DO TIPO DE PESSOA
  // ==================================================

  if (tipo_pessoa !== "PF" && tipo_pessoa !== "PJ") {
    return res.status(400).json({
      mensagem: "Tipo de pessoa deve ser 'PF' ou 'PJ'",
    });
  }

  // ==================================================
  // VALIDAÇÃO DA DATA DE NASCIMENTO
  // ==================================================

  // A data só precisa ser validada quando o cadastro for PF.
  if (tipo_pessoa === "PF") {
    const data = new Date(data_nascimento);

    // Verifica se a data é válida.
    if (isNaN(data.getTime())) {
      return res.status(400).json({
        mensagem: "Data de nascimento inválida",
      });
    }

    // A data não pode estar no futuro.
    if (data > new Date()) {
      return res.status(400).json({
        mensagem: "Data de nascimento não pode ser no futuro",
      });
    }
  }

  const senhaHash = bcrypt.hashSync(senha, 10);

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
      console.error("Erro ao iniciar transação:", error.message);

      res.status(500).json({
        mensagem: "Erro ao iniciar cadastro",
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
      [nome, email, telefone, senhaHash, "ORGANIZADOR", "PENDENTE"],

      (error, results) => {
        // Se o primeiro INSERT falhar,
        // desfazemos a transação.
        if (error) {
          connection.rollback(() => {
            console.error("Erro ao cadastrar usuário:", error.message);

            // ER_DUP_ENTRY significa que
            // tentamos inserir um valor que
            // deveria ser único, mas já existe.
            if (error.code === "ER_DUP_ENTRY") {
              res.status(409).json({
                mensagem: "E-mail já cadastrado",
              });

              return;
            }

            res.status(500).json({
              mensagem: "Erro ao cadastrar usuário",
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
          [results.insertId, tipo_pessoa, documento, data_nascimento],

          (error) => {
            // Se o segundo INSERT falhar,
            // desfazemos também o primeiro INSERT.
            if (error) {
              connection.rollback(() => {
                console.error("Erro ao cadastrar organizador:", error.message);

                // Verifica se o erro aconteceu
                // porque o documento já existe.
                if (error.code === "ER_DUP_ENTRY") {
                  res.status(409).json({
                    mensagem: "Documento já cadastrado",
                  });

                  return;
                }

                res.status(500).json({
                  mensagem: "Erro ao cadastrar organizador",
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
                  console.error("Erro ao confirmar cadastro:", error.message);

                  res.status(500).json({
                    mensagem: "Erro ao confirmar cadastro",
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
                id: results.insertId,
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
  const { nome, email, senha, telefone, cnpj, categoria_atuacao } = req.body;

  // ==================================================
  // VALIDAÇÃO DOS CAMPOS OBRIGATÓRIOS
  // ==================================================

  // Verifica se algum dos campos necessários
  // não foi informado pelo usuário.
  if (!nome || !email || !senha || !telefone || !cnpj || !categoria_atuacao) {
    res.status(400).json({
      mensagem: "Todos os campos são obrigatórios",
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
      mensagem: "CNPJ deve ter 14 dígitos",
    });

    return;
  }

  const senhaHash = bcrypt.hashSync(senha, 10);

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
      console.error("Erro ao iniciar transação:", error.message);

      res.status(500).json({
        mensagem: "Erro ao iniciar cadastro",
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
      [nome, email, telefone, senhaHash, "FORNECEDOR", "PENDENTE"],

      (error, results) => {
        // Verifica se aconteceu algum erro
        // durante o primeiro INSERT.
        if (error) {
          // Desfaz a transação.
          connection.rollback(() => {
            console.error("Erro ao cadastrar fornecedor:", error.message);

            // ER_DUP_ENTRY significa que tentamos
            // inserir um valor que deveria ser único,
            // mas ele já existe no banco.
            if (error.code === "ER_DUP_ENTRY") {
              res.status(409).json({
                mensagem: "E-mail já cadastrado",
              });

              return;
            }

            res.status(500).json({
              mensagem: "Erro ao cadastrar fornecedor",
            });
          });

          return;
        }

        console.log("Usuário fornecedor criado com sucesso!");

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
          [results.insertId, cnpj, categoria_atuacao],

          (error) => {
            // Verifica se aconteceu algum erro
            // durante o segundo INSERT.
            if (error) {
              // Desfaz também o primeiro INSERT.
              connection.rollback(() => {
                console.error("Erro ao cadastrar fornecedor:", error.message);

                // Se o CNPJ já existir,
                // retornamos HTTP 409.
                if (error.code === "ER_DUP_ENTRY") {
                  res.status(409).json({
                    mensagem: "CNPJ já cadastrado",
                  });

                  return;
                }

                res.status(500).json({
                  mensagem: "Erro ao cadastrar fornecedor",
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
                console.error("Erro ao confirmar cadastro:", error.message);

                // Tenta desfazer a transação.
                connection.rollback(() => {
                  res.status(500).json({
                    mensagem: "Erro ao confirmar cadastro",
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
                id: results.insertId,
              });
            });
          }
        );
      }
    );
  });
});

//Rota responsavel pelo login de usuários (organizadores e fornecedores).
app.post("/login", (req, res) => {
  //Pega o email e senha enviados no corpo da requisição.
  const { email, senha } = req.body;

  //Verifica se os dois obrigatorios foram enviados.
  if (!email || !senha) {
    return res.status(400).json({
      mensagem: "Email e senha são obrigatórios",
    });
  }
  if (typeof email !== "string" || typeof senha !== "string") {
    return res.status(400).json({
      mensagem: "Email e senha devem ser textos",
    });
  }

  const emailValido = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailValido.test(email)) {
    return res.status(400).json({
      mensagem: "E-mail inválido",
    });
  }

  if (senha.length < 6) {
    return res.status(400).json({
      mensagem: "A senha deve ter no minimo 6 caracteres",
    });
  }

  connection.query(
    "SELECT * FROM usuarios WHERE email = ?",
    [email],
    (error, results) => {
      //Verifica se houve algum erro na consulta.
      if (error) {
        console.error("Erro ao buscar usuário:", error.message);
        return res.status(500).json({
          mensagem: "Erro interno do servidor",
        });
      }
      if (results.length === 0) {
        return res.status(401).json({
          mensagem: "Email ou senha inválidos",
        });
      }
      //Guarda os dados do usuário encontrado.
      const usuario = results[0];
      const senhaCorreta = bcrypt.compareSync(senha, usuario.senha_hash);
      if (!senhaCorreta) {
        return res.status(401).json({
          mensagem: "Email ou senha inválidos",
        });
      }
      //Verifica se o cadastro do usuário foi aprovado.
      //antes de permitir o login.
      if (usuario.status !== "APROVADO") {
        return res.status(403).json({
          mensagem: "Cadastro não aprovado",
        });
      }
      //Se chegou até aqui, o login foi bem-sucedido.
      //E o usuário pode acessar a aplicação.
      //
      //Retornamos somente informações básicas do usuário, sem a senha.
      //identificar o usuario e seu perfil
      //A senha e o senha_hash nunca sao enviados na resposta.
      // Cria um token JWT depois que o usuário foi autenticado.
      // Dentro do token colocamos informações que identificam o usuário
      // e o perfil dele dentro do sistema.
      const token = jwt.sign(
        {
          id: usuario.id,
          tipo: usuario.tipo,
        },
        process.env.JWT_SECRET,
        {
          expiresIn: "2h",
        }
      );
      // Retorna o token para o cliente.
      // A senha e o senha_hash nunca são enviados na resposta.
      return res.status(200).json({
        mensagem: "Login bem-sucedido",
        token: token,
        usuario: {
          id: usuario.id,
          nome: usuario.nome,
          email: usuario.email,
          tipo: usuario.tipo,
        },
      });
    }
  );
});

// ======================================================
// POST /demo-login
// ======================================================
// Cria uma sessão temporária para demonstração.
//
// IMPORTANTE:
// O modo demonstração NÃO depende do MySQL.
// Isso permite que o professor teste o sistema
// mesmo sem configurar o banco na própria máquina.

app.post("/demo-login", (req, res) => {
  const token = jwt.sign(
    {
      id: usuarioDemonstracao.id,
      tipo: usuarioDemonstracao.tipo,
      demo: true,
    },
    process.env.JWT_SECRET,
    {
      expiresIn: "2h",
    }
  );

  return res.status(200).json({
    mensagem: "Modo demonstração iniciado",
    token,
    usuario: usuarioDemonstracao,
  });
});

// ======================================================
// GET /eventos
// ======================================================

// Retorna somente os eventos do organizador autenticado.
app.get(
  "/eventos",
  autenticarToken,
  autorizarPerfis("ORGANIZADOR"),
  (req, res) => {
    // ==================================================
    // MODO DEMONSTRAÇÃO
    // ==================================================
    // Se o token pertence ao usuário de demonstração,
    // retornamos os eventos temporários sem consultar
    // o MySQL.

    if (req.usuario.demo === true) {
      return res.status(200).json(eventosDemonstracao);
    }

    // ==================================================
    // MODO NORMAL
    // ==================================================
    const idOrganizador = req.usuario.id;

    const sql = `
      SELECT
        id,
        nome,
        descricao,
        horario,
        data_evento,
        publico_min,
        publico_max,
        local,
        status
      FROM eventos
      WHERE id_organizador = ?
      ORDER BY data_evento ASC, horario ASC
    `;

    connection.query(sql, [idOrganizador], (error, results) => {
      if (error) {
        console.error("Erro ao buscar eventos:", error.message);

        return res.status(500).json({
          mensagem: "Erro ao buscar eventos",
        });
      }

      return res.status(200).json(results);
    });
  }
);

// ======================================================
// POST /eventos
// ======================================================

// Rota responsável por criar um evento para o
// organizador que está autenticado.
app.post(
  "/eventos",
  autenticarToken,
  autorizarPerfis("ORGANIZADOR"),
  (req, res) => {
    // Recebe os dados enviados pelo frontend.
    const {
      nome,
      descricao,
      horario,
      data_evento,
      publico_min,
      publico_max,
      local,
    } = req.body;

    // ==================================================
    // VALIDAÇÃO DOS CAMPOS
    // ==================================================

    if (
      !nome ||
      !horario ||
      !data_evento ||
      !publico_min ||
      !publico_max ||
      !local
    ) {
      return res.status(400).json({
        mensagem: "Todos os campos obrigatórios devem ser preenchidos",
      });
    }

    // Verifica se o nome é realmente um texto.
    if (typeof nome !== "string") {
      return res.status(400).json({
        mensagem: "O nome do evento deve ser um texto",
      });
    }

    // Verifica se existe uma descrição e garante que é texto.
    if (descricao !== undefined && descricao !== null) {
      if (typeof descricao !== "string") {
        return res.status(400).json({
          mensagem: "A descrição deve ser um texto",
        });
      }
    }

    // Converte os valores de público para número.
    const minimo = Number(publico_min);
    const maximo = Number(publico_max);

    // Verifica se os públicos são números válidos.
    if (
      !Number.isInteger(minimo) ||
      !Number.isInteger(maximo) ||
      minimo <= 0 ||
      maximo <= 0
    ) {
      return res.status(400).json({
        mensagem: "O público deve ser informado com números inteiros positivos",
      });
    }

    // O público mínimo precisa ser menor que o máximo.
    if (minimo >= maximo) {
      return res.status(400).json({
        mensagem: "O público mínimo deve ser menor que o público máximo",
      });
    }

    // ==================================================
    // MODO DEMONSTRAÇÃO
    // ==================================================
    // No modo demonstração não usamos o MySQL.
    // O evento é armazenado temporariamente na memória.

    if (req.usuario.demo === true) {
      const novoEvento = {
        id: Date.now(),
        id_organizador: usuarioDemonstracao.id,
        nome,
        descricao: descricao || null,
        horario,
        data_evento,
        publico_min: minimo,
        publico_max: maximo,
        local,
        status: "PLANEJAMENTO",
      };

      eventosDemonstracao.push(novoEvento);

      return res.status(201).json({
        mensagem: "Evento criado com sucesso!",
        id: novoEvento.id,
      });
    }

    // ==================================================
    // INSERT NO BANCO
    // ==================================================

    const sql = `
      INSERT INTO eventos
      (
        id_organizador,
        nome,
        descricao,
        horario,
        data_evento,
        publico_min,
        publico_max,
        local,
        status
      )
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;

    // O ID vem do JWT.
    // O frontend não escolhe o organizador.
    const idOrganizador = req.usuario.id;

    connection.query(
      sql,
      [
        idOrganizador,
        nome,
        descricao || null,
        horario,
        data_evento,
        minimo,
        maximo,
        local,
        "PLANEJAMENTO",
      ],
      (error, results) => {
        if (error) {
          console.error("Erro ao criar evento:", error.message);

          return res.status(500).json({
            mensagem: "Erro ao criar evento",
          });
        }

        return res.status(201).json({
          mensagem: "Evento criado com sucesso!",
          id: results.insertId,
        });
      }
    );
  }
);

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
  console.log("Servidor rodando na porta 3000");
});

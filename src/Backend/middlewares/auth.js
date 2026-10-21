const jwt = require("jsonwebtoken");

// Middlewares compartilhados pelas rotas do server.js e do módulo do fornecedor.
// Conteúdo movido do server.js sem alterações de lógica nem de comentários.

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

module.exports = { autenticarToken, autorizarPerfis };

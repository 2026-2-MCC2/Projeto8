// ======================================================
// VALIDAÇÕES COMPARTILHADAS
// ======================================================
// Usadas pelo módulo real (MySQL) e pelo modo demonstração (memória),
// para que as duas implementações apliquem exatamente as mesmas regras.

// Mesmas categorias oferecidas no cadastro do fornecedor (CadastroFornecedor.jsx).
const CATEGORIAS = [
  "ALIMENTACAO",
  "DECORACAO",
  "SEGURANCA",
  "ENTRETENIMENTO",
  "ESTRUTURA",
  "FOTOGRAFIA",
  "OUTROS",
];

const STATUS_SERVICO = ["ATIVO", "RASCUNHO"];
const PRECO_MAXIMO = 99999999.99; // limite de DECIMAL(10,2)
const REGEX_EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// ------------------------------------------------------
// Helpers
// ------------------------------------------------------

class ErroValidacao extends Error {
  constructor(mensagem, status = 400) {
    super(mensagem);
    this.status = status;
  }
}

function lerId(valor) {
  const numero = Number(valor);
  return Number.isInteger(numero) && numero > 0 ? numero : null;
}

function exigirId(valor, rotulo = "ID") {
  const id = lerId(valor);
  if (id === null) {
    throw new ErroValidacao(`${rotulo} inválido`);
  }
  return id;
}

function lerTexto(valor, rotulo, { min = 1, max, obrigatorio = true } = {}) {
  if (valor === undefined || valor === null || valor === "") {
    if (obrigatorio) {
      throw new ErroValidacao(`${rotulo} é obrigatório`);
    }
    return null;
  }

  if (typeof valor !== "string") {
    throw new ErroValidacao(`${rotulo} deve ser um texto`);
  }

  const texto = valor.trim();

  if (texto.length < min) {
    throw new ErroValidacao(
      min === 1
        ? `${rotulo} não pode ser vazio`
        : `${rotulo} deve ter pelo menos ${min} caracteres`
    );
  }

  if (max && texto.length > max) {
    throw new ErroValidacao(`${rotulo} deve ter no máximo ${max} caracteres`);
  }

  return texto;
}

function lerInteiroPositivo(valor, rotulo, maximo = 2147483647) {
  const numero = typeof valor === "string" && valor.trim() === "" ? NaN : Number(valor);

  if (!Number.isInteger(numero) || numero <= 0 || numero > maximo) {
    throw new ErroValidacao(`${rotulo} deve ser um número inteiro positivo`);
  }

  return numero;
}

function lerValor(valor, rotulo) {
  const numero = typeof valor === "string" && valor.trim() === "" ? NaN : Number(valor);

  if (!Number.isFinite(numero) || numero <= 0 || numero > PRECO_MAXIMO) {
    throw new ErroValidacao(`${rotulo} deve ser um valor maior que zero`);
  }

  // duas casas decimais, como em DECIMAL(10,2)
  return Math.round(numero * 100) / 100;
}

function lerCategoria(valor, rotulo = "Categoria") {
  const categoria = lerTexto(valor, rotulo, { max: 100 });

  if (!CATEGORIAS.includes(categoria)) {
    throw new ErroValidacao(`${rotulo} inválida`);
  }

  return categoria;
}

function lerTelefone(valor) {
  const telefone = lerTexto(valor, "Telefone", { max: 30 });

  if (!/^\d{10,11}$/.test(telefone)) {
    throw new ErroValidacao("Telefone inválido. Informe DDD + número, somente dígitos");
  }

  return telefone;
}

function lerEmail(valor) {
  const email = lerTexto(valor, "E-mail", { max: 250 });

  if (!REGEX_EMAIL.test(email)) {
    throw new ErroValidacao("E-mail inválido");
  }

  return email;
}

// Valida e normaliza o corpo de um serviço (criação e edição).
function validarServico(body = {}) {
  const nome = lerTexto(body.nome, "Nome do serviço", { max: 200 });
  const descricao = lerTexto(body.descricao, "Descrição", { max: 5000 });
  const categoria = lerCategoria(body.categoria);
  const preco = lerValor(body.preco, "Preço base");
  const publicoMin = lerInteiroPositivo(body.publico_min, "Público mínimo");
  const publicoMax = lerInteiroPositivo(body.publico_max, "Público máximo");

  if (publicoMin >= publicoMax) {
    throw new ErroValidacao("O público mínimo deve ser menor que o público máximo");
  }

  const status = body.status === undefined ? "ATIVO" : body.status;

  if (!STATUS_SERVICO.includes(status)) {
    throw new ErroValidacao("Status do serviço inválido");
  }

  return { nome, descricao, categoria, preco, publicoMin, publicoMax, status };
}

// Valida o corpo de POST /eventos. As mensagens são as mesmas que já
// existiam no server.js; foram acrescentados apenas os limites das colunas
// (nome 100, local 200) e o formato de data/hora, que antes caíam em erro 500.
function validarEvento(body = {}) {
  const { nome, descricao, horario, data_evento, publico_min, publico_max, local } = body;

  if (!nome || !horario || !data_evento || !publico_min || !publico_max || !local) {
    throw new ErroValidacao("Todos os campos obrigatórios devem ser preenchidos");
  }

  if (typeof nome !== "string") {
    throw new ErroValidacao("O nome do evento deve ser um texto");
  }

  if (descricao !== undefined && descricao !== null && typeof descricao !== "string") {
    throw new ErroValidacao("A descrição deve ser um texto");
  }

  if (typeof local !== "string" || typeof horario !== "string" || typeof data_evento !== "string") {
    throw new ErroValidacao("Nome, local, data e horário devem ser textos");
  }

  const minimo = Number(publico_min);
  const maximo = Number(publico_max);

  if (!Number.isInteger(minimo) || !Number.isInteger(maximo) || minimo <= 0 || maximo <= 0) {
    throw new ErroValidacao("O público deve ser informado com números inteiros positivos");
  }

  if (minimo >= maximo) {
    throw new ErroValidacao("O público mínimo deve ser menor que o público máximo");
  }

  if (nome.trim().length === 0 || nome.length > 100) {
    throw new ErroValidacao("O nome do evento deve ter entre 1 e 100 caracteres");
  }

  if (local.trim().length === 0 || local.length > 200) {
    throw new ErroValidacao("O local deve ter entre 1 e 200 caracteres");
  }

  const dataValida = /^\d{4}-\d{2}-\d{2}$/.test(data_evento) &&
    !Number.isNaN(Date.parse(`${data_evento}T00:00:00Z`)) &&
    new Date(`${data_evento}T00:00:00Z`).toISOString().slice(0, 10) === data_evento;

  if (!dataValida) {
    throw new ErroValidacao("Data do evento inválida. Use o formato AAAA-MM-DD");
  }

  if (!/^([01]\d|2[0-3]):[0-5]\d(:[0-5]\d)?$/.test(horario)) {
    throw new ErroValidacao("Horário inválido. Use o formato HH:MM");
  }

  return {
    nome,
    descricao: descricao || null,
    horario: horario.length === 5 ? `${horario}:00` : horario,
    data_evento,
    publico_min: minimo,
    publico_max: maximo,
    local,
  };
}

module.exports = {
  ErroValidacao,
  CATEGORIAS,
  STATUS_SERVICO,
  PRECO_MAXIMO,
  REGEX_EMAIL,
  lerId,
  exigirId,
  lerTexto,
  lerInteiroPositivo,
  lerValor,
  lerCategoria,
  lerTelefone,
  lerEmail,
  validarServico,
  validarEvento,
};

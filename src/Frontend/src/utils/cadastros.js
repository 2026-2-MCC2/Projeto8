// Textos de exibição para os dados de cadastro que vêm da API.

// Mesmas categorias do formulário de cadastro do fornecedor.
const CATEGORIAS = {
  ALIMENTACAO: "Alimentação",
  DECORACAO: "Decoração",
  SEGURANCA: "Segurança",
  ENTRETENIMENTO: "Entretenimento",
  ESTRUTURA: "Estrutura",
  FOTOGRAFIA: "Fotografia",
  OUTROS: "Outros",
};

export function formatarCategoria(categoria) {
  return CATEGORIAS[categoria] || categoria || "";
}

// "12345678000190" -> "12.345.678/0001-90"
export function formatarCnpj(valor) {
  const digitos = String(valor || "").replace(/\D/g, "");

  if (digitos.length !== 14) {
    return valor || "";
  }

  return digitos.replace(
    /^(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})$/,
    "$1.$2.$3/$4-$5"
  );
}
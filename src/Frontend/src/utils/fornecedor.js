// Constantes e formatadores do módulo do fornecedor.

// Mesmos códigos do cadastro de fornecedor e validados no backend.
export const CATEGORIAS = [
  { valor: "ALIMENTACAO", rotulo: "Alimentação" },
  { valor: "DECORACAO", rotulo: "Decoração" },
  { valor: "SEGURANCA", rotulo: "Segurança" },
  { valor: "ENTRETENIMENTO", rotulo: "Entretenimento" },
  { valor: "ESTRUTURA", rotulo: "Estrutura" },
  { valor: "FOTOGRAFIA", rotulo: "Fotografia" },
  { valor: "OUTROS", rotulo: "Outros" },
];

export function rotuloCategoria(valor) {
  return CATEGORIAS.find((c) => c.valor === valor)?.rotulo || valor || "-";
}

export const STATUS_PROPOSTA = {
  ENVIADA: { rotulo: "Enviada", classe: "azul" },
  EM_ANALISE: { rotulo: "Em análise", classe: "laranja" },
  SELECIONADA: { rotulo: "Selecionada", classe: "verde" },
  RECUSADA: { rotulo: "Recusada", classe: "vermelho" },
};

export const STATUS_SERVICO = {
  ATIVO: { rotulo: "Ativo", classe: "verde" },
  RASCUNHO: { rotulo: "Rascunho", classe: "laranja" },
};

const moeda = new Intl.NumberFormat("pt-BR", {
  style: "currency",
  currency: "BRL",
});

export function formatarMoeda(valor) {
  const numero = Number(valor);
  return Number.isFinite(numero) ? moeda.format(numero) : "-";
}

export function formatarNumero(valor) {
  return Number(valor).toLocaleString("pt-BR");
}

export function apenasDigitos(valor) {
  return String(valor || "").replace(/\D/g, "");
}

export function formatarTelefone(valor) {
  const d = apenasDigitos(valor);

  if (d.length === 11) return `(${d.slice(0, 2)}) ${d.slice(2, 7)}-${d.slice(7)}`;
  if (d.length === 10) return `(${d.slice(0, 2)}) ${d.slice(2, 6)}-${d.slice(6)}`;

  return valor || "";
}

export function formatarCnpj(valor) {
  const d = apenasDigitos(valor);

  if (d.length !== 14) return valor || "";

  return `${d.slice(0, 2)}.${d.slice(2, 5)}.${d.slice(5, 8)}/${d.slice(8, 12)}-${d.slice(12)}`;
}

// Aceita "YYYY-MM-DD" ou "YYYY-MM-DD HH:MM:SS".
export function formatarData(texto) {
  const m = String(texto || "").match(/^(\d{4})-(\d{2})-(\d{2})/);

  return m ? `${m[3]}/${m[2]}/${m[1]}` : "-";
}

// Mesma regra usada em "Cálculo do ticket" (CalculoTicket.jsx):
//   ticket = custo / (público x (1 - margem))

export const LIMITES_TICKET = {
  custoMin: 0,
  custoMax: 1000000,
  publicoMin: 50,
  publicoMax: 5000,
  margemMin: 0,
  margemMax: 80,
};

export function limitar(valor, min, max) {
  const numero = Number(valor);

  if (!Number.isFinite(numero)) return min;

  return Math.min(Math.max(numero, min), max);
}

export function calcularTicket({ custo, publico, margem }) {
  const L = LIMITES_TICKET;
  const custoSeguro = limitar(custo, L.custoMin, L.custoMax);
  const pessoas = limitar(publico, L.publicoMin, L.publicoMax);
  const margemSegura = limitar(margem, L.margemMin, L.margemMax);
  const fator = 1 - margemSegura / 100;

  return {
    custo: custoSeguro,
    publico: pessoas,
    margem: margemSegura,
    ticket: fator > 0 ? custoSeguro / (pessoas * fator) : 0,
    custoPorPessoa: custoSeguro / pessoas,
  };
}

const moeda = new Intl.NumberFormat("pt-BR", {
  style: "currency",
  currency: "BRL",
});

export function formatarReais(valor) {
  return moeda.format(Number.isFinite(valor) ? valor : 0);
}

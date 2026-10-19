export function formatarMoeda(valor) {
  return Number(valor || 0).toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
    minimumFractionDigits: 0,
  });
}

export function formatarDataHora(data) {
  if (!data) {
    return "";
  }

  const dataObj = new Date(data);

  if (Number.isNaN(dataObj.getTime())) {
    return "";
  }

  return dataObj.toLocaleString("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function obterIniciais(nome) {
  return String(nome || "")
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((parte) => parte.charAt(0))
    .join("")
    .toUpperCase();
}


export function formatarMoedaCompacta(valor) {
  const numero = Number(valor || 0);

  if (numero >= 1000000) {
    return `R$ ${(numero / 1000000).toLocaleString("pt-BR", {
      maximumFractionDigits: 1,
    })} mi`;
  }

  if (numero >= 1000) {
    return `R$ ${(numero / 1000).toLocaleString("pt-BR", {
      maximumFractionDigits: 1,
    })} mil`;
  }

  return formatarMoeda(numero);
}
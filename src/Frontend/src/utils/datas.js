function extrairData(data) {
  if (!data) {
    return "";
  }

  const texto = String(data);

  // Aceita tanto YYYY-MM-DD quanto o ISO devolvido pelo MySQL/Express.
  const correspondencia = texto.match(/^(\d{4}-\d{2}-\d{2})/);

  return correspondencia?.[1] || "";
}

export function criarDataLocal(data) {
  const dataNormalizada = extrairData(data);

  if (!dataNormalizada) {
    return null;
  }

  const dataObj = new Date(`${dataNormalizada}T00:00:00`);

  return Number.isNaN(dataObj.getTime()) ? null : dataObj;
}

export function formatarDataEvento(data) {
  const dataObj = criarDataLocal(data);

  if (!dataObj) {
    return { dia: "--", mes: "---", ano: "----" };
  }

  return {
    dia: dataObj.toLocaleDateString("pt-BR", { day: "2-digit" }),
    mes: dataObj
      .toLocaleDateString("pt-BR", { month: "short" })
      .replace(".", "")
      .toUpperCase(),
    ano: dataObj.getFullYear(),
  };
}

export function formatarDataCompleta(data, horario) {
  const dataObj = criarDataLocal(data);

  if (!dataObj) {
    return "Data não informada";
  }

  const dataFormatada = dataObj.toLocaleDateString("pt-BR");

  if (!horario) {
    return dataFormatada;
  }

  return `${dataFormatada} às ${String(horario).slice(0, 5)}`;
}

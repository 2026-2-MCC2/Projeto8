// Gera e baixa um arquivo CSV. "linhas" é uma lista de listas.
// Usa ";" como separador e BOM (\uFEFF) para o Excel brasileiro
// abrir os acentos corretamente.
export function baixarCsv(nomeArquivo, linhas) {
  const texto = linhas
    .map((linha) =>
      linha
        .map((celula) => `"${String(celula).replace(/"/g, '""')}"`)
        .join(";")
    )
    .join("\r\n");

  const blob = new Blob(["\uFEFF" + texto], {
    type: "text/csv;charset=utf-8;",
  });

  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");

  link.href = url;
  link.download = nomeArquivo;
  link.click();

  URL.revokeObjectURL(url);
}
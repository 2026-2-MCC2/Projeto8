// Calcula os totais de UM evento: custo atual, % do orçamento
// e quantas cotações já foram aprovadas.
export function calcularResumoEvento(evento) {
  const custoAtual = evento.categorias.reduce(
    (soma, categoria) => soma + categoria.valor_atual,
    0
  );

  const percentualOrcamento =
    evento.orcamento_previsto > 0
      ? Math.round((custoAtual / evento.orcamento_previsto) * 100)
      : 0;

  const totalCotacoes = evento.cotacoes.length;
  const cotacoesAprovadas = evento.cotacoes.filter(
    (cotacao) => cotacao.status === "APROVADO"
  ).length;

  const percentualCotacoes =
    totalCotacoes > 0
      ? Math.round((cotacoesAprovadas / totalCotacoes) * 100)
      : 0;

  return {
    custoAtual,
    percentualOrcamento,
    totalCotacoes,
    cotacoesAprovadas,
    percentualCotacoes,
  };
}
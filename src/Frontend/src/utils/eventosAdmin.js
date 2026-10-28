// Propostas que ainda aguardam decisão (o organizador ainda não escolheu)
export const STATUS_PROPOSTA_PENDENTE = ["ENVIADA", "EM_ANALISE"];

// Calcula os totais de UM evento a partir das propostas dos fornecedores:
// custo atual (soma das propostas selecionadas) e quantas já foram selecionadas.
export function calcularResumoEvento(evento) {
  const selecionadas = evento.propostas.filter(
    (proposta) => proposta.status === "SELECIONADA"
  );

  const custoAtual = selecionadas.reduce(
    (soma, proposta) => soma + proposta.valor,
    0
  );

  // orcamento_previsto é opcional: null = não informado (nunca vira 0)
  const temOrcamento = evento.orcamento_previsto !== null;

  const percentualOrcamento =
    temOrcamento && evento.orcamento_previsto > 0
      ? Math.round((custoAtual / evento.orcamento_previsto) * 100)
      : 0;

  const totalPropostas = evento.propostas.length;
  const propostasSelecionadas = selecionadas.length;

  const percentualPropostas =
    totalPropostas > 0
      ? Math.round((propostasSelecionadas / totalPropostas) * 100)
      : 0;

  return {
    custoAtual,
    temOrcamento,
    percentualOrcamento,
    totalPropostas,
    propostasSelecionadas,
    percentualPropostas,
  };
}
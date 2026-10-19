// Dados de exemplo no FORMATO FINAL da API (snake_case, status em MAIÚSCULAS).
// O "Total de eventos" NÃO fica aqui: ele é a soma dos status, calculada na tela.
export const relatoriosExemplo = {
  totais: {
    propostas_enviadas: 4920,
    volume_planejado: 8400000,
    fornecedores_ativos: 328,
    variacao_eventos: 22.4,
    variacao_propostas: 18.2,
    variacao_volume: 12.8,
    variacao_fornecedores: 8.1,
  },

  eventos_por_status: [
    { status: "PLANEJAMENTO", total: 842 },
    { status: "CONFIRMADO", total: 516 },
    { status: "CONCLUIDO", total: 326 },
    { status: "CANCELADO", total: 48 },
  ],

  categorias_mais_buscadas: [
    { categoria: "Música", percentual: 78 },
    { categoria: "Decoração", percentual: 64 },
    { categoria: "Som e iluminação", percentual: 52 },
    { categoria: "Fotografia", percentual: 38 },
  ],
};
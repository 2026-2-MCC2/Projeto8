
export const eventosExemplo = [
  {
    id: 1,
    nome: "Casamento Ana & Pedro",
    organizador_nome: "Ana Beatriz Souza",
    data_evento: "2026-11-15",
    status: "PLANEJAMENTO",
    orcamento_previsto: 25000,
    categorias: [
      { categoria: "Buffet", valor_previsto: 10000, valor_atual: 9500 },
      { categoria: "Som e Iluminação", valor_previsto: 5000, valor_atual: 4200 },
      { categoria: "Decoração", valor_previsto: 4000, valor_atual: 0 },
      { categoria: "Espaço", valor_previsto: 6000, valor_atual: 0 },
    ],
    cotacoes: [
      { fornecedor_nome: "Buffet Sabor & Arte", categoria: "Buffet", status: "APROVADO", valor: 9500 },
      { fornecedor_nome: "Som & Luz Eventos", categoria: "Som e Iluminação", status: "APROVADO", valor: 4200 },
      { fornecedor_nome: "Decor Prime", categoria: "Decoração", status: "PENDENTE", valor: 3800 },
      { fornecedor_nome: "Espaço Verde Locações", categoria: "Espaço", status: "RECUSADA", valor: 7200 },
    ],
  },
  {
    id: 2,
    nome: "Congresso Tech SP 2026",
    organizador_nome: "Carlos Menezes",
    data_evento: "2026-10-03",
    status: "CONFIRMADO",
    orcamento_previsto: 60000,
    categorias: [
      { categoria: "Espaço", valor_previsto: 25000, valor_atual: 25000 },
      { categoria: "Buffet", valor_previsto: 15000, valor_atual: 14200 },
      { categoria: "Som e Iluminação", valor_previsto: 12000, valor_atual: 11800 },
      { categoria: "Segurança", valor_previsto: 8000, valor_atual: 8000 },
    ],
    cotacoes: [
      { fornecedor_nome: "Espaço Verde Locações", categoria: "Espaço", status: "APROVADO", valor: 25000 },
      { fornecedor_nome: "Buffet Sabor & Arte", categoria: "Buffet", status: "APROVADO", valor: 14200 },
      { fornecedor_nome: "Som & Luz Eventos", categoria: "Som e Iluminação", status: "APROVADO", valor: 11800 },
      { fornecedor_nome: "Vigilância Total", categoria: "Segurança", status: "APROVADO", valor: 8000 },
    ],
  },
  {
    id: 3,
    nome: "Aniversário de 15 anos - Beatriz",
    organizador_nome: "Ana Beatriz Souza",
    data_evento: "2026-09-28",
    status: "CONCLUIDO",
    orcamento_previsto: 18000,
    categorias: [
      { categoria: "Buffet", valor_previsto: 8000, valor_atual: 7900 },
      { categoria: "Decoração", valor_previsto: 5000, valor_atual: 5300 },
      { categoria: "Som e Iluminação", valor_previsto: 5000, valor_atual: 4600 },
    ],
    cotacoes: [
      { fornecedor_nome: "Buffet Sabor & Arte", categoria: "Buffet", status: "APROVADO", valor: 7900 },
      { fornecedor_nome: "Decor Prime", categoria: "Decoração", status: "APROVADO", valor: 5300 },
      { fornecedor_nome: "Som & Luz Eventos", categoria: "Som e Iluminação", status: "APROVADO", valor: 4600 },
    ],
  },
  {
    id: 4,
    nome: "Feira de Startups Vale Tech",
    organizador_nome: "Carlos Menezes",
    data_evento: "2026-12-12",
    status: "CANCELADO",
    orcamento_previsto: 40000,
    categorias: [
      { categoria: "Espaço", valor_previsto: 20000, valor_atual: 0 },
      { categoria: "Buffet", valor_previsto: 12000, valor_atual: 0 },
    ],
    cotacoes: [
        { fornecedor_nome: "Espaço Verde Locações", categoria: "Espaço", status: "CANCELADA", valor: 19500 },
        { fornecedor_nome: "Buffet Sabor & Arte", categoria: "Buffet", status: "CANCELADA", valor: 11800 },
    ],
  },
];
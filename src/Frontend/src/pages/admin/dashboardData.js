function minutosAtras(minutos) {
  return new Date(Date.now() - minutos * 60 * 1000).toISOString();
}

export const dashboardExemplo = {
  // O total de usuários NÃO fica aqui: é organizadores + fornecedores,
  // calculado na tela.
  totais: {
    organizadores: 842,
    fornecedores: 406,
    eventos_ativos: 236,
    variacao_usuarios: 14.8,
    novos_eventos: 22,
  },

  atividades: [
    {
      id: 1,
      tipo: "CADASTRO_PENDENTE",
      titulo: "Novo fornecedor aguardando aprovação",
      descricao: "Lumi Decor",
      criado_em: minutosAtras(12),
    },
    {
      id: 2,
      tipo: "EVENTO_PUBLICADO",
      titulo: "Novo evento publicado",
      descricao: "Festival de Inovação",
      criado_em: minutosAtras(60),
    },
    {
      id: 3,
      tipo: "PROPOSTA_ACEITA",
      titulo: "Proposta aceita",
      descricao: "Festa da Computação",
      criado_em: minutosAtras(3 * 60),
    },
  ],

  saude: {
    eventos_orcamento_completo: 84,
    taxa_resposta_fornecedores: 76,
    cadastros_aprovados: 92,
  },
};
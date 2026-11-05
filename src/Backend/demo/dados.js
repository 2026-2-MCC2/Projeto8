// ======================================================
// DADOS FICTÍCIOS DO MODO DEMONSTRAÇÃO
// ======================================================
// Um "mundo" completo e coerente (usuários, eventos, serviços e propostas),
// no mesmo formato das linhas do MySQL. Cada sessão recebe uma cópia nova.
// As datas são relativas a hoje, para que as oportunidades nunca vençam.

const USUARIO_DEMO = {
  ORGANIZADOR: { id: 999999, nome: "Organizador Demonstração", email: "demo@ticketlab.com", tipo: "ORGANIZADOR" },
  FORNECEDOR: { id: 999998, nome: "Pulse Eventos", email: "demo-fornecedor@ticketlab.com", tipo: "FORNECEDOR" },
  ADMINISTRADOR: { id: 999997, nome: "Administrador Demonstração", email: "demo-admin@ticketlab.com", tipo: "ADMINISTRADOR" },
};

function pad(n) {
  return String(n).padStart(2, "0");
}

function dataEm(dias) {
  const d = new Date();
  d.setDate(d.getDate() + dias);
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

function momento(diasAtras, hora = "10:30:00") {
  return `${dataEm(-diasAtras)} ${hora}`;
}

function criarMundo() {
  const org = (id, nome, email, telefone, status, cidade, tipo_pessoa, documento, diasAtras, extra = {}) => ({
    id, tipo: "ORGANIZADOR", nome, email, telefone, status, cidade, estado: "SP",
    criado_em: momento(diasAtras), data_analise: null, motivo_rejeicao: null, analisado_por_nome: null,
    tipo_pessoa, documento, ...extra,
  });
  const forn = (id, nome, email, telefone, status, cidade, cnpj, categoria, razao, regiao, descricao, diasAtras, extra = {}) => ({
    id, tipo: "FORNECEDOR", nome, email, telefone, status, cidade, estado: "SP",
    criado_em: momento(diasAtras), data_analise: null, motivo_rejeicao: null, analisado_por_nome: null,
    cnpj, categoria_atuacao: categoria, razao_social: razao, regiao_atendimento: regiao,
    descricao, site: null, ...extra,
  });
  const aprovado = (dias) => ({ status: "APROVADO", data_analise: momento(dias, "15:00:00"), analisado_por_nome: "Equipe TicketLab" });

  const usuarios = [
    org(999999, USUARIO_DEMO.ORGANIZADOR.nome, USUARIO_DEMO.ORGANIZADOR.email, "11988880001", "APROVADO", "São Paulo", "PF", "11122233344", 60, aprovado(59)),
    org(101, "Rafael Teixeira", "rafael.teixeira@exemplo.com", "11988880002", "APROVADO", "Campinas", "PF", "22233344455", 45, aprovado(44)),
    org(102, "Studio Pulse Produções", "contato@studiopulse.exemplo.com", "11988880003", "APROVADO", "São Paulo", "PJ", "11222333000144", 30, aprovado(29)),
    org(103, "Carolina Mendes", "carolina.mendes@exemplo.com", "11988880004", "PENDENTE", "Santos", "PF", "33344455566", 2),
    org(104, "Associação Cultural Vila Nova", "diretoria@vilanova.exemplo.com", "11988880005", "PENDENTE", "São Paulo", "PJ", "22333444000155", 1),

    forn(999998, USUARIO_DEMO.FORNECEDOR.nome, USUARIO_DEMO.FORNECEDOR.email, "11977770001", "APROVADO", "São Paulo", "11444555000166", "ENTRETENIMENTO", "Pulse Eventos Ltda", "Grande São Paulo", "DJs, bandas e curadoria musical para eventos de 100 a 5.000 pessoas.", 50, aprovado(49)),
    forn(201, "Lumi Decor", "contato@lumidecor.exemplo.com", "11977770002", "APROVADO", "São Paulo", "22555666000177", "DECORACAO", "Lumi Decor ME", "São Paulo e região", "Cenografia e ambientação.", 40, aprovado(39)),
    forn(202, "SoundWave Produções", "contato@soundwave.exemplo.com", "19977770003", "APROVADO", "Campinas", "33666777000188", "ESTRUTURA", "SoundWave Produções Ltda", "Interior de SP", "Som, luz e palco.", 35, aprovado(34)),
    forn(203, "SafeFest Segurança", "contato@safefest.exemplo.com", "11977770004", "APROVADO", "São Paulo", "44777888000199", "SEGURANCA", "SafeFest Segurança Ltda", "Grande São Paulo", "Equipe treinada e controle de acesso.", 25, aprovado(24)),
    forn(204, "Click Moments", "ola@clickmoments.exemplo.com", "13977770005", "PENDENTE", "Santos", "55888999000100", "FOTOGRAFIA", "Click Moments Fotografia ME", "Baixada Santista", "Cobertura fotográfica de eventos.", 3),
    forn(205, "Sabor & Arte Buffet", "comercial@saborearte.exemplo.com", "11977770006", "PENDENTE", "São Paulo", "66999000000111", "ALIMENTACAO", "Sabor & Arte Buffet Ltda", "São Paulo", "Buffet completo para eventos corporativos e sociais.", 1),
    forn(206, "Estruturas Prime", "contato@estruturasprime.exemplo.com", "11977770007", "REJEITADO", "Guarulhos", "77000111000122", "ESTRUTURA", "Estruturas Prime ME", "Guarulhos", "Tendas e arquibancadas.", 20,
      { data_analise: momento(18, "11:00:00"), analisado_por_nome: "Equipe TicketLab", motivo_rejeicao: "CNPJ divergente do cartão apresentado." }),
  ];

  const ev = (id, id_organizador, nome, descricao, local, dias, horario, min, max, status, orcamento = null) => ({
    id, id_organizador, nome, descricao, local, data_evento: dataEm(dias), horario, publico_min: min,
    publico_max: max, status, orcamento_previsto: orcamento,
  });

  const eventos = [
    ev(1, 999999, "Festival Universitário de Outono", "Festival com música ao vivo e praça de alimentação.", "Arena Cultural, São Paulo", 35, "18:00:00", 800, 1500, "PLANEJAMENTO", 45000),
    ev(2, 999999, "Tech Summit 2026", "Conferência de tecnologia com palestras e workshops.", "Centro de Convenções, São Paulo", 60, "09:00:00", 300, 600, "PLANEJAMENTO"),
    ev(3, 999999, "Casamento Helena e Pedro", "Cerimônia e recepção ao ar livre.", "Chácara Boa Vista, Campinas", 90, "16:00:00", 120, 180, "CONFIRMADO", 60000),
    ev(4, 101, "Feira Gastronômica de Verão", "Feira com food trucks e música.", "Parque Taquaral, Campinas", 20, "11:00:00", 500, 2000, "PLANEJAMENTO", 30000),
    ev(5, 102, "Show de Aniversário da Cidade", "Show aberto ao público na praça central.", "Praça Central, São Paulo", 45, "20:00:00", 2000, 5000, "PLANEJAMENTO", 120000),
    ev(6, 101, "Formatura Engenharia", "Colação de grau e baile de formatura.", "Espaço Jardins, Campinas", -10, "19:30:00", 200, 350, "CONFIRMADO", 80000),
    ev(7, 102, "Workshop de Fotografia", "Evento cancelado por baixa adesão.", "Estúdio Pulse, São Paulo", 15, "14:00:00", 30, 60, "CANCELADO"),
  ];

  const sv = (id, id_fornecedor, nome, descricao, categoria, preco, min, max, status = "ATIVO") => ({
    id, id_fornecedor, nome, descricao, categoria, status, preco, publico_min: min, publico_max: max,
  });

  const servicos = [
    sv(1, 999998, "DJ + curadoria musical", "Set de 5 horas com equipamento próprio e reunião de briefing.", "ENTRETENIMENTO", 3200, 100, 1500),
    sv(2, 999998, "Banda ao vivo (4 integrantes)", "Repertório pop/rock de 3 horas com som próprio.", "ENTRETENIMENTO", 5800, 200, 3000),
    sv(3, 999998, "Pacote Karaokê Premium", "Estrutura de karaokê com telão e mais de 5 mil músicas.", "ENTRETENIMENTO", 1800, 50, 400, "RASCUNHO"),
    sv(4, 201, "Ambientação completa", "Projeto visual personalizado conforme a identidade do evento.", "DECORACAO", 4800, 100, 1500),
    sv(5, 202, "Som e iluminação", "Palco, luz cênica e técnico durante todo o evento.", "ESTRUTURA", 6100, 200, 5000),
    sv(6, 203, "Equipe de segurança", "Seguranças treinados e controle de acesso.", "SEGURANCA", 3500, 100, 5000),
  ];

  const pr = (id, id_evento, id_servico, id_fornecedor, valor, prazo_dias, observacao, status, diasAtras) => ({
    id, id_evento, id_servico, id_fornecedor, valor, prazo_dias, observacao, status,
    criado_em: momento(diasAtras), atualizado_em: momento(diasAtras),
  });

  const propostas = [
    pr(1, 4, 1, 999998, 3000, 7, "Inclui equipamento de backup.", "ENVIADA", 3),
    pr(2, 5, 2, 999998, 6500, 10, "Banda completa com som próprio.", "EM_ANALISE", 5),
    pr(3, 6, 1, 999998, 3200, 7, null, "SELECIONADA", 25),
    pr(4, 1, 4, 201, 4800, 15, "Projeto visual personalizado.", "ENVIADA", 2),
    pr(5, 1, 5, 202, 6100, 10, "Palco, luz e técnico.", "RECUSADA", 4),
    pr(6, 5, 6, 203, 3500, 5, "Equipe de 20 profissionais.", "SELECIONADA", 6),
    pr(7, 4, 6, 203, 2200, 5, null, "ENVIADA", 1),
  ];

  return {
    usuarios, eventos, servicos, propostas,
    proximo: { evento: 1000, servico: 1000, proposta: 1000 },
  };
}

module.exports = { USUARIO_DEMO, criarMundo, dataEm };

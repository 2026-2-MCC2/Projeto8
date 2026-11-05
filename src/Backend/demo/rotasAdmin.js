// Rotas /admin/* do modo demonstração (memória, mesmos contratos do MySQL).
// Aprovar/rejeitar/reabrir altera SOMENTE os dados fictícios da sessão.
const express = require("express");
const { ErroValidacao } = require("../lib/validacao");
const { USUARIO_DEMO, dataEm } = require("./dados");

const router = express.Router();
const STATUS_CADASTRO = ["PENDENTE", "APROVADO", "REJEITADO"];

const mundo = (req) => req.sessao.mundo;
const iso = (v) => (v ? String(v).replace(" ", "T") : null);
const percentual = (parte, total) => (total > 0 ? Math.round((parte / total) * 100) : 0);
const agora = () => {
  const d = new Date();
  const p = (n) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())} ${p(d.getHours())}:${p(d.getMinutes())}:${p(d.getSeconds())}`;
};
const ha30Dias = () => `${dataEm(-30)} 00:00:00`;
const statusDerivado = (e) => (e.status === "CONFIRMADO" && e.data_evento < dataEm(0) ? "CONCLUIDO" : e.status);

function cadastroOut(req, u) {
  const base = {
    id: u.id, tipo: u.tipo, nome: u.nome, email: u.email, telefone: u.telefone, status: u.status,
    cidade: u.cidade, estado: u.estado, criado_em: iso(u.criado_em), data_analise: iso(u.data_analise),
    motivo_rejeicao: u.motivo_rejeicao, analisado_por_nome: u.analisado_por_nome,
  };
  if (u.tipo === "ORGANIZADOR") {
    return {
      ...base, tipo_pessoa: u.tipo_pessoa, documento: u.documento,
      eventos_cadastrados: mundo(req).eventos.filter((e) => e.id_organizador === u.id).length,
    };
  }
  return {
    ...base, cnpj: u.cnpj, categoria_atuacao: u.categoria_atuacao, razao_social: u.razao_social,
    regiao_atendimento: u.regiao_atendimento, descricao: u.descricao, site: u.site,
  };
}

router.get("/cadastros", (req, res) => {
  if (req.query.status && !STATUS_CADASTRO.includes(req.query.status)) throw new ErroValidacao("Status inválido");
  const lista = mundo(req).usuarios
    .filter((u) => !req.query.status || u.status === req.query.status)
    .sort((a, b) => b.criado_em.localeCompare(a.criado_em) || b.id - a.id)
    .map((u) => cadastroOut(req, u));
  res.json(lista);
});

router.patch("/cadastros/:id/status", (req, res) => {
  const id = Number(req.params.id);
  if (!Number.isInteger(id) || id <= 0) throw new ErroValidacao("ID inválido");

  const { status, motivo } = req.body || {};
  if (!STATUS_CADASTRO.includes(status)) throw new ErroValidacao("Status inválido");

  let motivoRejeicao = null;
  if (status === "REJEITADO") {
    motivoRejeicao = typeof motivo === "string" ? motivo.trim() : "";
    if (!motivoRejeicao) throw new ErroValidacao("Informe o motivo da rejeição");
    if (motivoRejeicao.length > 500) throw new ErroValidacao("O motivo deve ter no máximo 500 caracteres");
  }

  const u = mundo(req).usuarios.find((x) => x.id === id);
  if (!u) return res.status(404).json({ mensagem: "Cadastro não encontrado" });

  if (status === "PENDENTE") {
    Object.assign(u, { status, analisado_por_nome: null, data_analise: null, motivo_rejeicao: null });
  } else {
    Object.assign(u, {
      status, analisado_por_nome: USUARIO_DEMO.ADMINISTRADOR.nome, data_analise: agora(), motivo_rejeicao: motivoRejeicao,
    });
  }

  res.json({ mensagem: "Cadastro atualizado com sucesso", cadastro: cadastroOut(req, u) });
});

const TITULO_ATIVIDADE = {
  CADASTRO_PENDENTE: (d) => (d === "FORNECEDOR" ? "Novo fornecedor aguardando aprovação" : "Novo organizador aguardando aprovação"),
  CADASTRO_APROVADO: (d) => (d === "FORNECEDOR" ? "Fornecedor aprovado" : "Organizador aprovado"),
  PROPOSTA_ENVIADA: () => "Nova proposta enviada",
  PROPOSTA_SELECIONADA: () => "Proposta selecionada",
};

router.get("/dashboard", (req, res) => {
  const { usuarios, eventos, propostas } = mundo(req);
  const hoje = dataEm(0);
  const aprovados = usuarios.filter((u) => u.status === "APROVADO");
  const rejeitados = usuarios.filter((u) => u.status === "REJEITADO");
  const ativo = (e) => e.status === "PLANEJAMENTO" || (e.status === "CONFIRMADO" && e.data_evento >= hoje);
  const ativos = eventos.filter(ativo);
  const naoCancelados = eventos.filter((e) => e.status !== "CANCELADO");
  const nomeEvento = (id) => eventos.find((e) => e.id === id)?.nome;

  const atividades = [
    ...usuarios.filter((u) => u.status === "PENDENTE").map((u) => ({ tipo: "CADASTRO_PENDENTE", ref: u.id, descricao: u.nome, detalhe: u.tipo, quando: u.criado_em })),
    ...aprovados.filter((u) => u.data_analise).map((u) => ({ tipo: "CADASTRO_APROVADO", ref: u.id, descricao: u.nome, detalhe: u.tipo, quando: u.data_analise })),
    ...propostas.map((p) => ({ tipo: "PROPOSTA_ENVIADA", ref: p.id, descricao: nomeEvento(p.id_evento), detalhe: null, quando: p.criado_em })),
    ...propostas.filter((p) => p.status === "SELECIONADA").map((p) => ({ tipo: "PROPOSTA_SELECIONADA", ref: p.id, descricao: nomeEvento(p.id_evento), detalhe: null, quando: p.atualizado_em })),
  ].sort((a, b) => b.quando.localeCompare(a.quando)).slice(0, 6);

  const analisados = aprovados.length + rejeitados.length;

  res.json({
    totais: {
      organizadores: aprovados.filter((u) => u.tipo === "ORGANIZADOR").length,
      fornecedores: aprovados.filter((u) => u.tipo === "FORNECEDOR").length,
      eventos_ativos: ativos.length,
      novos_usuarios_30d: aprovados.filter((u) => u.criado_em >= ha30Dias()).length,
      eventos_confirmados: eventos.filter((e) => e.status === "CONFIRMADO" && e.data_evento >= hoje).length,
    },
    atividades: atividades.map((a) => ({
      id: `${a.tipo}-${a.ref}`, tipo: a.tipo, titulo: TITULO_ATIVIDADE[a.tipo](a.detalhe),
      descricao: a.descricao, criado_em: iso(a.quando),
    })),
    saude: {
      eventos_orcamento_completo: percentual(naoCancelados.filter((e) => e.orcamento_previsto != null).length, naoCancelados.length),
      eventos_com_propostas: percentual(ativos.filter((e) => propostas.some((p) => p.id_evento === e.id)).length, ativos.length),
      cadastros_aprovados: percentual(aprovados.length, analisados),
    },
  });
});

router.get("/eventos", (req, res) => {
  const { eventos, propostas, servicos, usuarios } = mundo(req);
  const lista = [...eventos]
    .sort((a, b) => a.data_evento.localeCompare(b.data_evento) || a.id - b.id)
    .map((e) => ({
      id: e.id, nome: e.nome, local: e.local, data_evento: e.data_evento, horario: e.horario,
      publico_min: e.publico_min, publico_max: e.publico_max, orcamento_previsto: e.orcamento_previsto,
      status: statusDerivado(e),
      organizador_nome: usuarios.find((u) => u.id === e.id_organizador)?.nome ?? null,
      propostas: propostas
        .filter((p) => p.id_evento === e.id)
        .sort((a, b) => b.criado_em.localeCompare(a.criado_em) || b.id - a.id)
        .map((p) => {
          const s = servicos.find((x) => x.id === p.id_servico);
          return {
            id: p.id, fornecedor_nome: usuarios.find((u) => u.id === p.id_fornecedor)?.nome,
            servico_nome: s.nome, categoria: s.categoria, valor: p.valor, prazo_dias: p.prazo_dias, status: p.status,
          };
        }),
    }));
  res.json(lista);
});

router.get("/relatorios", (req, res) => {
  const { eventos, propostas, servicos, usuarios } = mundo(req);
  const evento = (id) => eventos.find((e) => e.id === id);
  const selecionadasValidas = propostas.filter((p) => p.status === "SELECIONADA" && evento(p.id_evento).status !== "CANCELADO");
  const fornAprovados = usuarios.filter((u) => u.tipo === "FORNECEDOR" && u.status === "APROVADO");

  const porCategoria = new Map();
  for (const p of propostas) {
    const c = servicos.find((s) => s.id === p.id_servico).categoria;
    porCategoria.set(c, (porCategoria.get(c) || 0) + 1);
  }
  const categorias = [...porCategoria].sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0])).slice(0, 4);

  res.json({
    totais: {
      propostas_enviadas: propostas.length,
      propostas_30d: propostas.filter((p) => p.criado_em >= ha30Dias()).length,
      propostas_selecionadas: selecionadasValidas.length,
      volume_selecionado: selecionadasValidas.reduce((soma, p) => soma + p.valor, 0),
      fornecedores_ativos: fornAprovados.length,
      fornecedores_novos_30d: fornAprovados.filter((u) => u.criado_em >= ha30Dias()).length,
    },
    eventos_por_status: ["PLANEJAMENTO", "CONFIRMADO", "CONCLUIDO", "CANCELADO"].map((status) => ({
      status, total: eventos.filter((e) => statusDerivado(e) === status).length,
    })),
    categorias_mais_procuradas: categorias.map(([categoria, total]) => ({
      categoria, total, percentual: percentual(total, propostas.length),
    })),
  });
});

module.exports = router;

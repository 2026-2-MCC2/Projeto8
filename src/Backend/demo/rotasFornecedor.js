// Rotas /fornecedor/* do modo demonstração (memória, mesmos contratos do MySQL).
const express = require("express");
const {
  ErroValidacao, exigirId, lerTexto, lerInteiroPositivo, lerValor,
  lerCategoria, lerTelefone, lerEmail, validarServico,
} = require("../lib/validacao");
const { dataEm } = require("./dados");

const router = express.Router();

const agora = () => {
  const d = new Date();
  const p = (n) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())} ${p(d.getHours())}:${p(d.getMinutes())}:${p(d.getSeconds())}`;
};

const mundo = (req) => req.sessao.mundo;
const eu = (req) => mundo(req).usuarios.find((u) => u.id === req.sessao.usuarioId);
const aberta = (e) => e.status === "PLANEJAMENTO" && e.data_evento >= dataEm(0);
const nomeOrganizador = (req, e) => mundo(req).usuarios.find((u) => u.id === e.id_organizador)?.nome ?? null;

function perfil(u) {
  return { id: u.id, nome: u.nome, email: u.email, telefone: u.telefone, status: u.status, cnpj: u.cnpj, categoria_atuacao: u.categoria_atuacao };
}

function servicoOut(s) {
  return { id: s.id, nome: s.nome, descricao: s.descricao, categoria: s.categoria, status: s.status, preco: s.preco, publico_min: s.publico_min, publico_max: s.publico_max };
}

function propostaOut(req, p) {
  const e = mundo(req).eventos.find((x) => x.id === p.id_evento);
  const s = mundo(req).servicos.find((x) => x.id === p.id_servico);
  return {
    id: p.id, id_evento: p.id_evento, id_servico: p.id_servico, valor: p.valor, prazo_dias: p.prazo_dias,
    observacao: p.observacao, status: p.status, criado_em: p.criado_em,
    evento_nome: e.nome, data_evento: e.data_evento, evento_local: e.local,
    servico_nome: s.nome, servico_categoria: s.categoria,
  };
}

function eventoOut(req, e) {
  return {
    id: e.id, nome: e.nome, descricao: e.descricao, local: e.local, data_evento: e.data_evento, horario: e.horario,
    publico_min: e.publico_min, publico_max: e.publico_max, status: e.status, organizador_nome: nomeOrganizador(req, e),
  };
}

const meusServicos = (req) => mundo(req).servicos.filter((s) => s.id_fornecedor === req.sessao.usuarioId);
const minhasPropostas = (req) => mundo(req).propostas.filter((p) => p.id_fornecedor === req.sessao.usuarioId);

// ---- Perfil
router.get("/perfil", (req, res) => res.json(perfil(eu(req))));

router.patch("/perfil", (req, res) => {
  const body = req.body || {};
  const u = eu(req);
  const novo = {};

  if (body.nome !== undefined) novo.nome = lerTexto(body.nome, "Nome", { max: 250 });
  if (body.email !== undefined) novo.email = lerEmail(body.email);
  if (body.telefone !== undefined) novo.telefone = lerTelefone(body.telefone);
  if (body.categoria_atuacao !== undefined) novo.categoria_atuacao = lerCategoria(body.categoria_atuacao, "Categoria de atuação");

  if (body.nova_senha !== undefined || body.senha_atual !== undefined) {
    throw new ErroValidacao("A troca de senha não está disponível no modo demonstração", 403);
  }
  if (Object.keys(novo).length === 0) throw new ErroValidacao("Nenhum campo válido para atualização foi enviado");

  if (novo.email && mundo(req).usuarios.some((x) => x.id !== u.id && x.email === novo.email)) {
    return res.status(409).json({ mensagem: "E-mail já cadastrado" });
  }

  Object.assign(u, novo);
  res.json({ mensagem: "Perfil atualizado com sucesso!", perfil: perfil(u) });
});

// ---- Dashboard
router.get("/dashboard", (req, res) => {
  const abertas = mundo(req).eventos.filter(aberta);
  const minhas = minhasPropostas(req);
  const recentes = [...abertas].sort((a, b) => b.id - a.id).slice(0, 3).map((e) => ({
    id: e.id, nome: e.nome, local: e.local, data_evento: e.data_evento, horario: e.horario,
    publico_min: e.publico_min, publico_max: e.publico_max,
  }));
  const u = eu(req);

  res.json({
    fornecedor: { nome: u.nome, categoria_atuacao: u.categoria_atuacao },
    oportunidades_abertas: abertas.length,
    propostas_enviadas: minhas.length,
    propostas_aceitas: minhas.filter((p) => p.status === "SELECIONADA").length,
    servicos_cadastrados: meusServicos(req).length,
    oportunidades_recentes: recentes,
  });
});

// ---- Serviços
router.get("/servicos", (req, res) => {
  res.json([...meusServicos(req)].sort((a, b) => b.id - a.id).map(servicoOut));
});

router.get("/servicos/:id", (req, res) => {
  const id = exigirId(req.params.id);
  const s = meusServicos(req).find((x) => x.id === id);
  if (!s) return res.status(404).json({ mensagem: "Serviço não encontrado" });
  res.json(servicoOut(s));
});

router.post("/servicos", (req, res) => {
  const d = validarServico(req.body);
  const s = {
    id: mundo(req).proximo.servico++, id_fornecedor: req.sessao.usuarioId, nome: d.nome, descricao: d.descricao,
    categoria: d.categoria, status: d.status, preco: d.preco, publico_min: d.publicoMin, publico_max: d.publicoMax,
  };
  mundo(req).servicos.push(s);
  res.status(201).json({ mensagem: "Serviço cadastrado com sucesso!", servico: servicoOut(s) });
});

router.put("/servicos/:id", (req, res) => {
  const id = exigirId(req.params.id);
  const d = validarServico(req.body);
  const s = meusServicos(req).find((x) => x.id === id);
  if (!s) return res.status(404).json({ mensagem: "Serviço não encontrado" });
  Object.assign(s, { nome: d.nome, descricao: d.descricao, categoria: d.categoria, status: d.status, preco: d.preco, publico_min: d.publicoMin, publico_max: d.publicoMax });
  res.json({ mensagem: "Serviço atualizado com sucesso!", servico: servicoOut(s) });
});

router.delete("/servicos/:id", (req, res) => {
  const id = exigirId(req.params.id);
  const s = meusServicos(req).find((x) => x.id === id);
  if (!s) return res.status(404).json({ mensagem: "Serviço não encontrado" });

  if (mundo(req).propostas.some((p) => p.id_servico === id)) {
    return res.status(409).json({
      mensagem: "Este serviço já possui propostas ou está vinculado a eventos e não pode ser excluído. Altere o status para Rascunho para ocultá-lo.",
    });
  }
  mundo(req).servicos = mundo(req).servicos.filter((x) => x.id !== id);
  res.json({ mensagem: "Serviço excluído com sucesso!" });
});

// ---- Oportunidades
router.get("/oportunidades", (req, res) => {
  const busca = typeof req.query.busca === "string" ? req.query.busca.trim().toLowerCase() : "";
  const lista = mundo(req).eventos
    .filter(aberta)
    .filter((e) => !busca || e.nome.toLowerCase().includes(busca) || e.local.toLowerCase().includes(busca))
    .sort((a, b) => (a.data_evento + a.horario).localeCompare(b.data_evento + b.horario))
    .slice(0, 100)
    .map((e) => ({
      ...eventoOut(req, e),
      minhas_propostas: minhasPropostas(req).filter((p) => p.id_evento === e.id).length,
    }));
  res.json(lista);
});

router.get("/oportunidades/:id", (req, res) => {
  const idEvento = exigirId(req.params.id);
  const e = mundo(req).eventos.find((x) => x.id === idEvento);
  const jaPropus = minhasPropostas(req).some((p) => p.id_evento === idEvento);

  if (!e || !(aberta(e) || jaPropus)) return res.status(404).json({ mensagem: "Oportunidade não encontrada" });

  const servicos = meusServicos(req)
    .filter((s) => s.status === "ATIVO")
    .sort((a, b) => a.nome.localeCompare(b.nome, "pt-BR"))
    .map((s) => {
      const p = minhasPropostas(req).find((x) => x.id_servico === s.id && x.id_evento === idEvento);
      return {
        id: s.id, nome: s.nome, categoria: s.categoria,
        id_proposta: p?.id ?? null, status_proposta: p?.status ?? null, valor_proposta: p?.valor ?? null,
        preco_tabela: s.preco,
      };
    });

  res.json({ evento: eventoOut(req, e), aberta: aberta(e), servicos });
});

// ---- Propostas
router.get("/propostas", (req, res) => {
  if (req.query.status && !["ENVIADA", "EM_ANALISE", "SELECIONADA", "RECUSADA"].includes(req.query.status)) {
    throw new ErroValidacao("Status inválido");
  }
  const lista = minhasPropostas(req)
    .filter((p) => !req.query.status || p.status === req.query.status)
    .sort((a, b) => b.criado_em.localeCompare(a.criado_em) || b.id - a.id)
    .map((p) => propostaOut(req, p));
  res.json(lista);
});

router.post("/propostas", (req, res) => {
  const body = req.body || {};
  const idEvento = exigirId(body.id_evento, "Evento");
  const idServico = exigirId(body.id_servico, "Serviço");
  const valor = lerValor(body.valor, "Valor da proposta");
  const prazoDias = lerInteiroPositivo(body.prazo_dias, "Prazo de entrega", 3650);
  const observacao = lerTexto(body.observacao, "Observações", { max: 2000, obrigatorio: false });

  const s = meusServicos(req).find((x) => x.id === idServico && x.status === "ATIVO");
  if (!s) return res.status(404).json({ mensagem: "Serviço não encontrado ou não está ativo" });

  const e = mundo(req).eventos.find((x) => x.id === idEvento);
  if (!e || !aberta(e)) return res.status(409).json({ mensagem: "Este evento não está mais recebendo propostas" });

  if (mundo(req).propostas.some((p) => p.id_evento === idEvento && p.id_servico === idServico)) {
    return res.status(409).json({ mensagem: "Você já enviou uma proposta com este serviço para este evento" });
  }

  const p = {
    id: mundo(req).proximo.proposta++, id_evento: idEvento, id_servico: idServico, id_fornecedor: req.sessao.usuarioId,
    valor, prazo_dias: prazoDias, observacao, status: "ENVIADA", criado_em: agora(), atualizado_em: agora(),
  };
  mundo(req).propostas.push(p);
  res.status(201).json({ mensagem: "Proposta enviada com sucesso!", proposta: propostaOut(req, p) });
});

router.get("/propostas/:id", (req, res) => {
  const p = minhasPropostas(req).find((x) => x.id === exigirId(req.params.id));
  if (!p) return res.status(404).json({ mensagem: "Proposta não encontrada" });
  res.json(propostaOut(req, p));
});

router.delete("/propostas/:id", (req, res) => {
  const p = minhasPropostas(req).find((x) => x.id === exigirId(req.params.id));
  if (!p) return res.status(404).json({ mensagem: "Proposta não encontrada" });
  if (p.status !== "ENVIADA") {
    return res.status(409).json({ mensagem: "Esta proposta já foi analisada pelo organizador e não pode ser retirada" });
  }
  mundo(req).propostas = mundo(req).propostas.filter((x) => x.id !== p.id);
  res.json({ mensagem: "Proposta retirada com sucesso!" });
});

module.exports = router;

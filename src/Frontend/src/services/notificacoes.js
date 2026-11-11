import { apiRequest } from "./api";

const moeda = (valor) =>
  Number(valor).toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

// Monta a lista de notificações de cada perfil a partir de rotas que a API
// já tem (nada novo no back-end). Cada item tem a mesma forma:
// { id, titulo, descricao, quando, destino, icone }
export async function buscarNotificacoes(perfil) {
  if (perfil === "ORGANIZADOR") {
    const propostas = await apiRequest("/organizador/propostas");

    return propostas
      .filter((p) => p.status === "ENVIADA" || p.status === "EM_ANALISE")
      .map((p) => ({
        id: `proposta-${p.id}-${p.status}`,
        titulo: "Nova proposta recebida",
        descricao: `${p.fornecedor_nome} enviou ${moeda(p.valor)} para "${p.evento_nome}"`,
        quando: p.criado_em,
        destino: "/cotacoes",
        icone: "quote",
      }));
  }

  if (perfil === "FORNECEDOR") {
    const propostas = await apiRequest("/fornecedor/propostas");

    return propostas
      .filter((p) => p.status === "SELECIONADA" || p.status === "RECUSADA")
      .map((p) => ({
        id: `proposta-${p.id}-${p.status}`,
        titulo:
          p.status === "SELECIONADA" ? "Proposta selecionada!" : "Proposta recusada",
        descricao: `${p.servico_nome} em "${p.evento_nome}"`,
        quando: p.criado_em,
        destino: "/fornecedor/propostas",
        icone: p.status === "SELECIONADA" ? "check" : "quote",
      }));
  }

  if (perfil === "ADMINISTRADOR") {
    const cadastros = await apiRequest("/admin/cadastros?status=PENDENTE");

    return cadastros.map((c) => ({
      id: `cadastro-${c.id}`,
      titulo:
        c.tipo === "FORNECEDOR"
          ? "Novo fornecedor aguardando aprovação"
          : "Novo organizador aguardando aprovação",
      descricao: c.nome,
      quando: c.criado_em,
      destino: "/admin/aprovacoes",
      icone: "users",
    }));
  }

  return [];
}
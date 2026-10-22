import { apiRequest } from "./api";

// Cliente da API do módulo do fornecedor (rotas /fornecedor/* do backend).
// O token JWT é anexado pelo apiRequest; o id do fornecedor nunca é enviado:
// o backend o obtém do token.

function comCorpo(method, corpo) {
  return { method, body: JSON.stringify(corpo) };
}

export const fornecedorApi = {
  // Perfil
  perfil: () => apiRequest("/fornecedor/perfil"),
  atualizarPerfil: (dados) =>
    apiRequest("/fornecedor/perfil", comCorpo("PATCH", dados)),

  // Dashboard
  dashboard: () => apiRequest("/fornecedor/dashboard"),

  // Serviços
  listarServicos: () => apiRequest("/fornecedor/servicos"),
  buscarServico: (id) => apiRequest(`/fornecedor/servicos/${id}`),
  criarServico: (dados) =>
    apiRequest("/fornecedor/servicos", comCorpo("POST", dados)),
  atualizarServico: (id, dados) =>
    apiRequest(`/fornecedor/servicos/${id}`, comCorpo("PUT", dados)),
  excluirServico: (id) =>
    apiRequest(`/fornecedor/servicos/${id}`, { method: "DELETE" }),

  // Oportunidades
  listarOportunidades: (busca = "") =>
    apiRequest(
      `/fornecedor/oportunidades${busca ? `?busca=${encodeURIComponent(busca)}` : ""}`
    ),
  buscarOportunidade: (id) => apiRequest(`/fornecedor/oportunidades/${id}`),

  // Propostas
  listarPropostas: (status = "") =>
    apiRequest(
      `/fornecedor/propostas${status ? `?status=${encodeURIComponent(status)}` : ""}`
    ),
  enviarProposta: (dados) =>
    apiRequest("/fornecedor/propostas", comCorpo("POST", dados)),
  retirarProposta: (id) =>
    apiRequest(`/fornecedor/propostas/${id}`, { method: "DELETE" }),
};

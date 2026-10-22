import { apiRequest } from "./api";

// Cliente da API do módulo do administrador (rotas /admin/* do backend).
// O token JWT é anexado pelo apiRequest; quem está analisando o cadastro
// nunca é enviado: o backend descobre pelo token.

export const adminApi = {
  // Cadastros (organizadores e fornecedores)
  // status: "PENDENTE" | "APROVADO" | "REJEITADO" (vazio = todos)
  listarCadastros: (status = "") =>
    apiRequest(
      `/admin/cadastros${status ? `?status=${encodeURIComponent(status)}` : ""}`
    ),

  // status: "APROVADO" | "REJEITADO" (exige motivo) | "PENDENTE" (reabrir)
  analisarCadastro: (id, status, motivo = "") =>
    apiRequest(`/admin/cadastros/${id}/status`, {
      method: "PATCH",
      body: JSON.stringify({ status, motivo }),
    }),
};
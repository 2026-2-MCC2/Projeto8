const API_URL = "http://localhost:3000";

// ======================================================
// INICIA MODO DEMONSTRAÇÃO
// ======================================================

async function iniciarModoDemonstracao() {
  const response = await fetch(`${API_URL}/demo-login`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(
      data.mensagem || "Não foi possível iniciar o modo demonstração."
    );
  }

  // Salva o token da demonstração
  sessionStorage.setItem("token", data.token);

  // Salva os dados do usuário
  sessionStorage.setItem("usuario", JSON.stringify(data.usuario));

  // Identifica que a sessão atual é de demonstração
  sessionStorage.setItem("modoDemonstracao", "true");

  return data;
}

// ======================================================
// REQUISIÇÕES PARA A API
// ======================================================

export async function apiRequest(endpoint, options = {}) {
  let token = sessionStorage.getItem("token");

  // ==================================================
  // MODO DEMONSTRAÇÃO
  // ==================================================
  // Se não existe token e estamos acessando uma rota
  // de eventos, iniciamos automaticamente uma sessão
  // temporária para a Entrega 1.

  if (!token && endpoint.startsWith("/eventos")) {
    const demonstracao = await iniciarModoDemonstracao();

    token = demonstracao.token;
  }

  // ==================================================
  // REQUISIÇÃO
  // ==================================================

  const response = await fetch(`${API_URL}${endpoint}`, {
    ...options,

    headers: {
      "Content-Type": "application/json",

      // Só envia Authorization quando existe token
      ...(token && {
        Authorization: `Bearer ${token}`,
      }),

      ...options.headers,
    },
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.mensagem || "Ocorreu um erro na requisição.");
  }

  return data;
}

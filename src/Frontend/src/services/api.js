const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";

// ======================================================
// MODO DEMONSTRAÇÃO
// ======================================================

export async function iniciarModoDemonstracao() {
  const response = await fetch(`${API_URL}/demo-login`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
  });

  const data = await lerResposta(response);

  if (!response.ok) {
    throw new Error(
      data?.mensagem || "Não foi possível iniciar o modo demonstração."
    );
  }

  sessionStorage.setItem("token", data.token);
  sessionStorage.setItem("usuario", JSON.stringify(data.usuario));
  sessionStorage.setItem("modoDemonstracao", "true");

  return data;
}

// ======================================================
// REQUISIÇÕES PARA A API
// ======================================================

async function lerResposta(response) {
  const tipoConteudo = response.headers.get("content-type") || "";
  const texto = await response.text();

  if (!texto) {
    return {};
  }

  if (tipoConteudo.includes("application/json")) {
    try {
      return JSON.parse(texto);
    } catch {
      return { mensagem: "A API retornou uma resposta JSON inválida." };
    }
  }

  return { mensagem: texto };
}

export async function apiRequest(endpoint, options = {}) {
  const token = sessionStorage.getItem("token");

  const response = await fetch(`${API_URL}${endpoint}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(token && {
        Authorization: `Bearer ${token}`,
      }),
      ...options.headers,
    },
  });

  const data = await lerResposta(response);

  if (response.status === 401) {
    sessionStorage.removeItem("token");
    sessionStorage.removeItem("usuario");
    sessionStorage.removeItem("modoDemonstracao");

    throw new Error(data?.mensagem || "Sua sessão expirou. Faça login novamente.");
  }

  if (!response.ok) {
    throw new Error(data?.mensagem || "Ocorreu um erro na requisição.");
  }

  return data;
}

import { limparSessao } from "../utils/sessao";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";

// ======================================================
// MODO DEMONSTRAÇÃO
// ======================================================

export async function iniciarModoDemonstracao(tipo) {
  const response = await fetch(`${API_URL}/demo-login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ tipo }),
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

// Encerra a sessão: apaga os dados locais e, na demonstração, avisa o servidor
// para descartar os dados fictícios da sessão (falha de rede não impede a saída).
export async function encerrarSessao() {
  const token = sessionStorage.getItem("token");
  const demo = sessionStorage.getItem("modoDemonstracao") === "true";

  limparSessao();

  if (demo && token) {
    try {
      await fetch(`${API_URL}/demo-logout`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
      });
    } catch {
      // o servidor descarta a sessão por expiração de qualquer forma
    }
  }
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

  // 401 em rota protegida = sessão expirada/inválida. Em /login o 401 é
  // apenas "e-mail ou senha inválidos" e não encerra nada.
  if (response.status === 401 && endpoint !== "/login") {
    limparSessao();

    if (typeof window !== "undefined" && window.location.pathname !== "/login") {
      window.location.assign("/login?sessao=expirada");
    }

    throw new Error(data?.mensagem || "Sua sessão expirou. Faça login novamente.");
  }

  if (!response.ok) {
    throw new Error(data?.mensagem || "Ocorreu um erro na requisição.");
  }

  return data;
}

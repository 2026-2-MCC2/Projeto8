// Leitura da sessão gravada pelo Login (sessionStorage: token e usuario).

export function obterSessao() {
  try {
    const token = sessionStorage.getItem("token");
    const usuario = JSON.parse(sessionStorage.getItem("usuario") || "null");

    return token && usuario ? { token, usuario } : null;
  } catch {
    return null;
  }
}

// Painel inicial de cada perfil. Perfis sem painel (ex.: ADMINISTRADOR,
// ainda em desenvolvimento) retornam null.
export function rotaPainel(tipo) {
  if (tipo === "ORGANIZADOR") return "/dashboard";
  if (tipo === "FORNECEDOR") return "/fornecedor/dashboard";

  return null;
}

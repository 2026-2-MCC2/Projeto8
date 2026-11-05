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

// Painel inicial de cada perfil.
export function rotaPainel(tipo) {
  if (tipo === "ORGANIZADOR") return "/dashboard";
  if (tipo === "FORNECEDOR") return "/fornecedor/dashboard";
  if (tipo === "ADMINISTRADOR") return "/admin/dashboard";

  return null;
}

export function emModoDemonstracao() {
  try {
    return sessionStorage.getItem("modoDemonstracao") === "true";
  } catch {
    return false;
  }
}

// Apaga a sessão local (normal ou demonstração).
export function limparSessao() {
  try {
    sessionStorage.removeItem("token");
    sessionStorage.removeItem("usuario");
    sessionStorage.removeItem("modoDemonstracao");
  } catch {
    // sessionStorage indisponível: nada a limpar.
  }
}

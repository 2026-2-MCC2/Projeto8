import { Navigate, Outlet, useLocation } from "react-router-dom";

function obterUsuario() {
  try {
    return JSON.parse(sessionStorage.getItem("usuario") || "null");
  } catch {
    return null;
  }
}

// tipo: perfil exigido para acessar o grupo de rotas (padrão: ORGANIZADOR).
export default function RotaPrivada({ tipo = "ORGANIZADOR" }) {
  const location = useLocation();
  const token = sessionStorage.getItem("token");
  const usuario = obterUsuario();

  if (!token || !usuario) {
    return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  }

  if (usuario.tipo !== tipo) {
    return <Navigate to="/login" replace />;
  }

  return <Outlet />;
}

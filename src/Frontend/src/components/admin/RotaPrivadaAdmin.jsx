import { Navigate, Outlet, useLocation } from "react-router-dom";

function obterUsuario() {
  try {
    return JSON.parse(sessionStorage.getItem("usuario") || "null");
  } catch {
    return null;
  }
}

export default function RotaPrivadaAdmin() {
  const location = useLocation();
  const token = sessionStorage.getItem("token");
  const usuario = obterUsuario();

  if (!token || !usuario) {
    return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  }

  if (usuario.tipo !== "ADMINISTRADOR") {
    return <Navigate to="/login" replace />;
  }

  return <Outlet />;
}
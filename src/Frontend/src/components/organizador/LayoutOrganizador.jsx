import { Link, useNavigate } from "react-router-dom";
import { useMemo } from "react";
import Icon from "./Icon";
import "./LayoutOrganizador.css";

function obterUsuario() {
  try {
    const usuario = sessionStorage.getItem("usuario");

    if (!usuario) {
      return null;
    }

    return JSON.parse(usuario);
  } catch {
    return null;
  }
}

function obterIniciais(nome) {
  const partes = String(nome || "Organizador")
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2);

  if (!partes.length) {
    return "OR";
  }

  return partes
    .map((parte) => parte.charAt(0))
    .join("")
    .toUpperCase();
}

export default function LayoutOrganizador({ children, active = "" }) {
  const navigate = useNavigate();

  const usuario = useMemo(() => obterUsuario(), []);

  const nomeUsuario = usuario?.nome?.trim() || "Organizador";

  const iniciais = obterIniciais(nomeUsuario);

  function handleLogout() {
    sessionStorage.removeItem("token");
    sessionStorage.removeItem("usuario");
    navigate("/login", { replace: true });
  }

  const menu = [
    {
      path: "/dashboard",
      label: "Dashboard",
      icon: "dashboard",
      id: "dashboard",
    },
    {
      path: "/meus-eventos",
      label: "Meus eventos",
      icon: "calendar",
      id: "meus-eventos",
    },
    {
      path: "/buscar-servicos",
      label: "Buscar serviços",
      icon: "search",
      id: "buscar-servicos",
    },
    {
      path: "/cotacoes",
      label: "Cotações",
      icon: "quote",
      id: "cotacoes",
      badge: 3,
    },
    {
      path: "/resumo-custos",
      label: "Resumo de custos",
      icon: "chart",
      id: "resumo-custos",
    },
    {
      path: "/calculo-ticket",
      label: "Cálculo do ticket",
      icon: "ticket",
      id: "calculo-ticket",
    },
    {
      path: "/minha-conta",
      label: "Minha conta",
      icon: "settings",
      id: "minha-conta",
    },
  ];

  return (
    <div className="org-layout">
      <aside className="org-sidebar">
        <Link to="/" className="org-logo">
          <span className="org-logo-mark">✦</span>
          <span>TicketLab</span>
        </Link>

        <div className="org-role">
          <span className="org-role-dot" />

          <strong>Organizador</strong>

          <span className="org-role-chevron">⌄</span>
        </div>

        <nav className="org-sidebar-nav" aria-label="Navegação principal">
          {menu.map((item) => {
            const isActive = active === item.id;

            return (
              <Link
                key={item.id}
                to={item.path}
                className={`org-nav-item ${isActive ? "active" : ""}`}
              >
                <Icon name={item.icon} />

                <span>{item.label}</span>

                {item.badge && (
                  <span className="org-nav-badge">{item.badge}</span>
                )}
              </Link>
            );
          })}
        </nav>

        <div className="org-sidebar-footer">
          <div className="org-help">
            <Icon name="help" />

            <div>
              <strong>Precisa de ajuda?</strong>
              <span>Fale com nosso suporte</span>
            </div>
          </div>

          <button type="button" className="org-logout" onClick={handleLogout}>
            <span>↪</span>
            Sair
          </button>
        </div>
      </aside>

      <div className="org-main">
        <header className="org-topbar">
          <div className="org-breadcrumb">
            <span>Workspace</span>
            <span>/</span>
            <strong>Organizador</strong>
          </div>

          <div className="org-topbar-user">
            <button
              type="button"
              className="org-notification"
              aria-label="Notificações (em breve)"
              disabled
              title="Notificações em breve"
            >
              <Icon name="bell" />
              <span />
            </button>

            <div className="org-user">
              <div className="org-avatar">{iniciais}</div>

              <div className="org-user-data">
                <strong>{nomeUsuario}</strong>
                <span>Organizador</span>
              </div>

              <span className="org-user-chevron">⌄</span>
            </div>
          </div>
        </header>

        <div className="org-content">{children}</div>
      </div>
    </div>
  );
}

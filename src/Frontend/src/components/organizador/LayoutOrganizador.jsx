import { Link } from "react-router-dom";
import Icon from "./Icon";
import "./LayoutOrganizador.css";

const navItems = [
  { to: "/dashboard", label: "Dashboard", icon: "dashboard", active: "dashboard" },
  { to: "/meus-eventos", label: "Meus eventos", icon: "calendar", active: "meus-eventos" },
  { to: "/buscar-servicos", label: "Buscar serviços", icon: "search", active: "buscar-servicos" },
  { label: "Cotações", icon: "quote", badge: "3" },
  { label: "Resumo de custos", icon: "chart" },
  { label: "Cálculo do ticket", icon: "ticket" },
  { label: "Minha conta", icon: "settings" },
];

function initials(nome) {
  return (nome || "Organizador")
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((parte) => parte[0])
    .join("")
    .toUpperCase();
}

function NavigationItem({ item, active }) {
  const className = `organizador-nav-link ${item.active === active ? "active" : ""} ${!item.to ? "disabled" : ""}`.trim();
  const content = (
    <>
      <Icon name={item.icon} />
      <span>{item.label}</span>
      {item.badge && <span className="organizador-nav-badge">{item.badge}</span>}
      {!item.to && <small>Em breve</small>}
    </>
  );

  if (!item.to) {
    return <span className={className} aria-disabled="true">{content}</span>;
  }

  return <Link to={item.to} className={className}>{content}</Link>;
}

export default function LayoutOrganizador({ active, children }) {
  const usuario = JSON.parse(sessionStorage.getItem("usuario") || "null");
  const nome = usuario?.nome || "Organizador";

  return (
    <div className="organizador-layout">
      <aside className="organizador-sidebar">
        <Link to="/" className="organizador-logo">
          <span className="organizador-logo-mark">✦</span>
          TicketLab
        </Link>

        <div className="organizador-role">
          <span className="organizador-role-dot" />
          <strong>Organizador</strong>
          <span className="organizador-role-chevron">⌄</span>
        </div>

        <nav className="organizador-nav" aria-label="Navegação principal">
          {navItems.map((item) => (
            <NavigationItem key={item.label} item={item} active={active} />
          ))}
        </nav>

        <div className="organizador-help">
          <Icon name="help" />
          <div>
            <strong>Precisa de ajuda?</strong>
            <span>Fale com nosso suporte</span>
          </div>
        </div>
      </aside>

      <div className="organizador-main">
        <header className="organizador-topbar">
          <div className="organizador-breadcrumb">
            <span>Workspace</span>
            <span>/</span>
            <strong>Organizador</strong>
          </div>

          <div className="organizador-topbar-user">
            <button type="button" className="organizador-notification" aria-label="Notificações">
              <Icon name="bell" />
              <span />
            </button>

            <div className="organizador-user-profile">
              <div className="organizador-user-avatar">{initials(nome)}</div>
              <div className="organizador-user-data">
                <strong>{nome}</strong>
                <span>Organizador</span>
              </div>
              <span className="organizador-user-chevron">⌄</span>
            </div>
          </div>
        </header>

        {children}
      </div>
    </div>
  );
}

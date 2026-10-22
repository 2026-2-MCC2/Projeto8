import LayoutOrganizador from "../organizador/LayoutOrganizador";
import "../../pages/Fornecedor/fornecedor.css";

// Reaproveita o layout (sidebar, topbar, estilos) do Organizador com o
// menu do Fornecedor.
const MENU_FORNECEDOR = [
  { id: "dashboard", path: "/fornecedor/dashboard", label: "Dashboard", icon: "dashboard" },
  { id: "servicos", path: "/fornecedor/servicos", label: "Meus serviços", icon: "cube" },
  { id: "oportunidades", path: "/fornecedor/oportunidades", label: "Oportunidades", icon: "search" },
  { id: "propostas", path: "/fornecedor/propostas", label: "Minhas propostas", icon: "quote" },
  { id: "minha-conta", path: "/fornecedor/minha-conta", label: "Minha conta", icon: "settings" },
];

export default function LayoutFornecedor({ children, active }) {
  return (
    <LayoutOrganizador active={active} perfil="Fornecedor" menu={MENU_FORNECEDOR}>
      <main className="forn-content">{children}</main>
    </LayoutOrganizador>
  );
}

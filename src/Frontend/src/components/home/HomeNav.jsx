import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import Icone from "./Icones";
import { obterSessao, rotaPainel } from "../../utils/sessao";

const LINKS = [
  { href: "#como-funciona", rotulo: "Como funciona" },
  { href: "#simulador", rotulo: "Simulador" },
  { href: "#servicos", rotulo: "Serviços" },
];

export default function HomeNav() {
  const [aberto, setAberto] = useState(false);
  const painel = rotaPainel(obterSessao()?.usuario?.tipo);

  // Esc fecha o menu no mobile.
  useEffect(() => {
    if (!aberto) return;

    const aoTeclar = (evento) => evento.key === "Escape" && setAberto(false);
    window.addEventListener("keydown", aoTeclar);

    return () => window.removeEventListener("keydown", aoTeclar);
  }, [aberto]);

  const fechar = () => setAberto(false);

  return (
    <header className="hm-nav">
      <div className="hm-container hm-nav-inner">
        <Link to="/" className="hm-logo" aria-label="TicketLab - página inicial">
          <span className="hm-logo-marca" aria-hidden="true">✦</span>
          TicketLab
        </Link>

        <button
          type="button"
          className="hm-nav-toggle"
          aria-expanded={aberto}
          aria-controls="hm-menu"
          aria-label={aberto ? "Fechar menu" : "Abrir menu"}
          onClick={() => setAberto((valor) => !valor)}
        >
          <Icone nome={aberto ? "close" : "menu"} tamanho={22} />
        </button>

        <nav
          id="hm-menu"
          className={`hm-nav-menu${aberto ? " aberto" : ""}`}
          aria-label="Navegação principal"
        >
          {LINKS.map((link) => (
            <a key={link.href} href={link.href} onClick={fechar}>
              {link.rotulo}
            </a>
          ))}

          <div className="hm-nav-acoes">
            {painel ? (
              <Link to={painel} className="hm-btn hm-btn-primario hm-btn-sm" onClick={fechar}>
                Ir para o painel <Icone nome="arrow" tamanho={15} />
              </Link>
            ) : (
              <>
                <Link to="/login" className="hm-nav-entrar" onClick={fechar}>
                  Entrar
                </Link>
                <Link to="/cadastro" className="hm-btn hm-btn-primario hm-btn-sm" onClick={fechar}>
                  Começar agora <Icone nome="arrow" tamanho={15} />
                </Link>
              </>
            )}
          </div>
        </nav>
      </div>
    </header>
  );
}

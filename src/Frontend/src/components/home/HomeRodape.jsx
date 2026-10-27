import { Link } from "react-router-dom";

export default function HomeRodape() {
  return (
    <footer className="hm-rodape">
      <div className="hm-container hm-rodape-topo">
        <div>
          <Link to="/" className="hm-logo">
            <span className="hm-logo-marca" aria-hidden="true">✦</span>
            TicketLab
          </Link>
          <p>Planejamento inteligente para eventos universitários.</p>
        </div>

        <nav className="hm-rodape-links" aria-label="Rodapé">
          <div>
            <strong>Plataforma</strong>
            <a href="#como-funciona">Como funciona</a>
            <a href="#simulador">Simulador</a>
            <a href="#servicos">Serviços</a>
          </div>
          <div>
            <strong>Acesso</strong>
            <Link to="/login">Entrar</Link>
            <Link to="/cadastro/organizador">Sou organizador</Link>
            <Link to="/cadastro/fornecedor">Sou fornecedor</Link>
          </div>
        </nav>
      </div>

      <div className="hm-container hm-rodape-base">
        <span>© 2026 TicketLab. Projeto acadêmico — Ciência da Computação.</span>
      </div>
    </footer>
  );
}

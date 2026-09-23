import { Link } from "react-router-dom";
import "./Home.css";

function Home() {
  return (
    <main className="home">
      <section className="home-container">
        <h1>TicketLab</h1>

        <p className="home-subtitle">
          Planejamento inteligente para eventos universitários.
        </p>

        <p className="home-description">
          Organize eventos, fornecedores e custos em um só lugar.
        </p>

        <div className="home-actions">
          <Link to="/login" className="home-button primary">
            Entrar
          </Link>

          <Link to="/cadastro" className="home-button secondary">
            Cadastrar-se
          </Link>
        </div>

        <p className="home-footer">
          Projeto acadêmico — Ciência da Computação
        </p>
      </section>
    </main>
  );
}

export default Home;
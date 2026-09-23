import "./Cadastro.css";
import { Link } from "react-router-dom";
import { useNavigate } from "react-router-dom";

function cadastro() {
  const navigate = useNavigate();
  return (
    <div className="cadastro-container">
      <header className="cabecalho">
        <Link to="/login" className="voltar"> 
         ← Voltar ao login 
        </Link>
        <p className="descricao">Planeje seu evento. Calcule seu ticket </p>
      </header>
      <main className="cadastro-main">
        <article className="cadastro-card">
          <div className="card-conteudo">
            <span className="logo-card">TICKETLAB</span>

            <h2 className="cadastro-title">Escolha seu tipo de cadastro</h2>

            <p className="cadastro-descricao">
              Selecione o perfil que melhor descreve como você usará a
              plataforma.
            </p>
            <div className="opcoes-cadastro">
              <button type="button" className="botao-cadastro" onClick={() => navigate("/cadastro/organizador")}>
                <span className="botao-titulo">Sou Organizador </span>
                <span className="botao-descricao"> Planeje eventos, gerencie custos e calcule o valor do ticket.
                </span>
              </button>

              <button type="button" className="botao-cadastro" onClick={() => navigate("/cadastro/fornecedor")}>
                <span className="botao-titulo">Sou Fornecedor</span>
                <span className="botao-descricao">
                  Cadastre seus serviços, encontre eventos e envie propostas.
                </span>
              </button>
            </div>
            <p className="login">
              Já tem uma conta?
              <Link to="/login"> Fazer login</Link>
            </p>
          </div>
        </article>
      </main>
      <footer className="rodape">
        {" "}
        © 2026 TICKETLAB · Todos os direitos reservados{" "}
      </footer>
    </div>
  );
}

export default cadastro;

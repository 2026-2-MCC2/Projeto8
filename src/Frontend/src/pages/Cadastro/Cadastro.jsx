import "./Cadastro.css";

function cadastro() {
  return (
    <div className="cadastro-container">
      <header className="cabecalho">
        <h1 className="title">TrocaTicket</h1>
        <p className="descricao">Planeje seu evento. Calcule seu ticket </p>
      </header>
      <main className="cadastro-main">
        <article className="cadastro-card">
          <div className="card-conteudo">
            <span className="logo-card">TROCATICKET</span>

            <h2 className="cadastro-title">Escolha seu tipo de cadastro</h2>

            <p className="cadastro-descricao">
              Selecione o perfil que melhor descreve como você usará a
              plataforma.
            </p>
            <div className="opcoes-cadastro">
              <button type="button" className="botao-cadastro">
                <span className="botao-titulo">Sou Organizador </span>
                <span className="botao-descricao"> Planeje eventos, gerencie custos e calcule o valor do ticket.
                </span>
              </button>

              <button type="button" className="botao-cadastro">
                <span className="botao-titulo">Sou Fornecedor</span>
                <span className="botao-descricao">
                  Cadastre seus serviços, encontre eventos e envie propostas.
                </span>
              </button>
            </div>
            <p className="login">
              Já tem uma conta?
              <a href="./login"> Fazer login</a>
            </p>
          </div>
        </article>
      </main>
      <footer className="rodape">
        {" "}
        © 2026 TrocaTicket · Todos os direitos reservados{" "}
      </footer>
    </div>
  );
}

export default cadastro;

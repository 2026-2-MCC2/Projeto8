import "./Login.css";
import { Link } from "react-router-dom";

function Login() {
  return (
    <div className="login-container">
      <header className="cabecalho">
        <h1 className="title">TrocaTicket</h1>

        <p className="descricao">Planeje seu evento. Calcule seu ticket.</p>
      </header>

      <main className="login-main">
        <article className="card-login">
          <div className="card-conteudo">
            <span className="logo-card">TROCATICKET</span>

            <h2 className="login-title">Entrar na sua conta</h2>

            <p className="login-descricao">
              Acesse a plataforma para continuar o planejamento do seu evento.
            </p>

            <form>
              <label htmlFor="email">
                E-mail
                <input id="email" type="email" placeholder="nome@email.com" />
              </label>

              <label htmlFor="senha">
                Senha
                <input
                  id="senha"
                  type="password"
                  placeholder="Digite sua senha"
                />
              </label>

              <div className="opcoes-login">
                <label className="lembrar" htmlFor="lembrar">
                  <input id="lembrar" type="checkbox" />
                  Lembrar de mim
                </label>

                <a href="#">Esqueci minha senha</a>
              </div>

              <button type="submit">Entrar</button>
            </form>

            <p className="cadastro">
              Ainda não possui uma conta?
              <Link to="/cadastro"> Cadastrar-se</Link>
            </p>
          </div>
        </article>
      </main>

      <footer className="rodape">
        © 2026 TrocaTicket · Todos os direitos reservados
      </footer>
    </div>
  );
}

export default Login;

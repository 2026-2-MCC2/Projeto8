import "./Login.css";
import { Link, useNavigate } from "react-router-dom";
import { apiRequest } from "../../services/api";
import { useState } from "react";

function Login() {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [erro, setErro] = useState("");
  const [carregando, setCarregando] = useState(false);

  async function handleSubmit(event) {
    event.preventDefault();

    setErro("");
    setCarregando(true);

    try {
      const data = await apiRequest("/login", {
        method: "POST",
        body: JSON.stringify({
          email,
          senha,
        }),
      });

      sessionStorage.setItem("token", data.token);
      sessionStorage.setItem("usuario", JSON.stringify(data.usuario));

      console.log("Login realizado:", data);

      navigate("/dashboard");
    } catch (error) {
      setErro(error.message);
    } finally {
      setCarregando(false);
    }
  }
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

            <form onSubmit={handleSubmit}>
              <label htmlFor="email">
                E-mail
                <input
                  id="email"
                  type="email"
                  placeholder="nome@email.com"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  required
                />
              </label>

              <label htmlFor="senha">
                Senha
                <input
                  id="senha"
                  type="password"
                  placeholder="Digite sua senha"
                  value={senha}
                  onChange={(event) => setSenha(event.target.value)}
                  required
                />
              </label>

              <div className="opcoes-login">
                <label className="lembrar" htmlFor="lembrar">
                  <input id="lembrar" type="checkbox" />
                  Lembrar de mim
                </label>

                <a href="#">Esqueci minha senha</a>
              </div>

              {erro && <p className="mensagem-erro">{erro}</p>}

              <button type="submit" disabled={carregando}>
                {carregando ? "Entrando..." : "Entrar"}
              </button>
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

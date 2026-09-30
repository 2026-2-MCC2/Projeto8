import "./Login.css";
import { Link, useNavigate } from "react-router-dom";
import { apiRequest, iniciarModoDemonstracao } from "../../services/api";
import { useState } from "react";
import festa from "../../assets/festa.png";

function Login() {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [erro, setErro] = useState("");
  const [carregando, setCarregando] = useState(false);
  const [mostrarSenha, setMostrarSenha] = useState(false);

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

      sessionStorage.removeItem("modoDemonstracao");
      sessionStorage.setItem("token", data.token);
      sessionStorage.setItem("usuario", JSON.stringify(data.usuario));

      if (data.usuario?.tipo === "ORGANIZADOR") {
        navigate("/dashboard");
        return;
      }

      if (data.usuario?.tipo === "FORNECEDOR") {
        setErro("O acesso de Fornecedor ainda está em desenvolvimento.");
        return;
      }

      if (data.usuario?.tipo === "ADMINISTRADOR") {
        setErro("O acesso de Administrador ainda está em desenvolvimento.");
        return;
      }

      setErro("Perfil de usuário não reconhecido.");
    } catch (error) {
      setErro(error.message);
    } finally {
      setCarregando(false);
    }
  }

  async function handleAcessoPerfil(tipo) {
    if (tipo !== "ORGANIZADOR") {
      setErro(
        `O acesso de ${tipo === "FORNECEDOR" ? "Fornecedor" : "Administrador"} ainda está em desenvolvimento.`
      );
      return;
    }

    setErro("");
    setCarregando(true);

    try {
      await iniciarModoDemonstracao();
      navigate("/dashboard");
    } catch (error) {
      setErro(error.message);
    } finally {
      setCarregando(false);
    }
  }

  return (
    <div className="login-page">
      {/* ==================================================
          PAINEL ESQUERDO
      ================================================== */}

      <section
        className="login-visual"
        style={{ backgroundImage: `url(${festa})` }}
      >
        <div className="login-visual-overlay" />

        <header className="login-visual-header">
          <Link to="/" className="login-brand">
            <span className="brand-icon">✦</span>
            TicketLab
          </Link>
        </header>

        <div className="login-visual-content">
          <span className="visual-symbol">✧</span>

          <h1>
            Planejar bem é o primeiro
            <br />
            passo para realizar
            <br />
            melhor.
          </h1>

          <p>
            Tenha controle sobre cada detalhe do seu evento, do primeiro
            orçamento ao ticket estimado.
          </p>
        </div>

        <div className="login-visual-footer">
          <span>TicketLab</span>
          <span>Planejamento que conecta.</span>
        </div>
      </section>

      {/* ==================================================
          ÁREA DIREITA
      ================================================== */}

      <main className="login-content">
        <div className="login-form-container">
          <span className="login-eyebrow">BEM-VINDO DE VOLTA</span>

          <h2 className="login-title">Entre na sua conta</h2>

          <p className="login-description">
            Acesse seu espaço de planejamento.
          </p>

          <form onSubmit={handleSubmit} className="login-form">
            {/* E-mail */}

            <label htmlFor="email">
              E-mail
              <input
                id="email"
                type="email"
                placeholder="voce@exemplo.com"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                required
              />
            </label>

            {/* Senha */}

            <label htmlFor="senha">
              Senha
              <div className="password-wrapper">
                <input
                  id="senha"
                  type={mostrarSenha ? "text" : "password"}
                  placeholder="••••••••"
                  value={senha}
                  onChange={(event) => setSenha(event.target.value)}
                  required
                />

                <button
                  type="button"
                  className="password-toggle"
                  onClick={() => setMostrarSenha(!mostrarSenha)}
                >
                  {mostrarSenha ? "Ocultar" : "Mostrar"}
                </button>
              </div>
            </label>

            {/* Opções */}

            <div className="login-options">
              <span className="remember-option">
                A sessão permanece ativa enquanto esta aba estiver aberta.
              </span>

              <span className="login-recovery-disabled">
                Recuperação de senha em breve
              </span>
            </div>

            {/* Erro */}

            {erro && <p className="login-error">{erro}</p>}

            {/* Botão */}

            <button
              type="submit"
              className="login-submit"
              disabled={carregando}
            >
              <span>{carregando ? "Entrando..." : "Entrar"}</span>

              {!carregando && <span className="button-arrow">→</span>}
            </button>
          </form>

          {/* ==================================================
              ACESSO RÁPIDO
          ================================================== */}

          <div className="demo-divider">
            <span>ou entre para demonstrar</span>
          </div>

          <div className="profile-access-list">
            {/* Organizador */}

            <button
              type="button"
              className="profile-access"
              onClick={() => handleAcessoPerfil("ORGANIZADOR")}
            >
              <span className="profile-icon organizer">
                <svg viewBox="0 0 24 24" aria-hidden="true">
                  <path
                    d="M12 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8Zm-7 8a7 7 0 0 1 14 0"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.8"
                    strokeLinecap="round"
                  />
                </svg>
              </span>

              <span className="profile-info">
                <strong>Organizador</strong>
                <small>Ver planejamento e custos</small>
              </span>

              <span className="profile-arrow">→</span>
            </button>

            {/* Fornecedor */}

            <button
              type="button"
              className="profile-access"
              onClick={() => handleAcessoPerfil("FORNECEDOR")}
            >
              <span className="profile-icon supplier">
                <svg viewBox="0 0 24 24" aria-hidden="true">
                  <path
                    d="M5 9h14v10H5zM8 9V6h8v3M9 13h6"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.8"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </span>

              <span className="profile-info">
                <strong>Fornecedor</strong>
                <small>Ver oportunidades</small>
              </span>

              <span className="profile-arrow">→</span>
            </button>

            {/* Administrador */}

            <button
              type="button"
              className="profile-access"
              onClick={() => handleAcessoPerfil("ADMINISTRADOR")}
            >
              <span className="profile-icon administrator">
                <svg viewBox="0 0 24 24" aria-hidden="true">
                  <path
                    d="M12 3l7 3v5c0 4.5-3 7.8-7 10-4-2.2-7-5.5-7-10V6l7-3Z"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.8"
                    strokeLinejoin="round"
                  />

                  <path
                    d="m9 12 2 2 4-4"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.8"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </span>

              <span className="profile-info">
                <strong>Administrador</strong>
                <small>Ver gestão da plataforma</small>
              </span>

              <span className="profile-arrow">→</span>
            </button>
          </div>

          {/* Cadastro */}

          <p className="register-text">
            Ainda não tem uma conta?
            <Link to="/cadastro">Criar cadastro</Link>
          </p>
        </div>
      </main>
    </div>
  );
}

export default Login;

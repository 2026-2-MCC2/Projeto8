import { useState } from "react";
import "./CadastroOrganizador.css";
import { Link } from "react-router-dom";

function cadastroOrganizador() {
  const [tipoPessoa, setTipoPessoa] = useState("PF");
  const [mostrarSenha, setMostrarSenha] = useState(false);
  return (
    <div className="organizador-container">
      <header className="cabecalho-cadastro">
        <Link to="/cadastro" className="voltar"> ← Voltar ao cadastro</Link>
        <p className="descricao">Planeje seu evento. Calcule seu ticket </p>
      </header>
      <main className="cadastroOrganizador-main">
        <article className="card-organizador">
          <div className="card-organizadorConteudo">
            <span className="logo-card">TROCATICKET</span>

            <h2 className="cadastroOrganizador-title">
              Cria conta de Organizador
            </h2>

            <p className="organizador-descricao">
              Cadastre-se para planejar seus eventos, gerenciar custos e
              calcular o ticket.
            </p>
            <form>
              <label htmlFor="nome">
                Nome completo
                <input
                  id="noe"
                  type="text"
                  placeholder="Digite seu nome completo"
                />
              </label>

              <label htmlFor="email">
                E-mail
                <input id="email" type="email" placeholder="nome@email.com" />
              </label>
              <label htmlFor="telefone">
                Telefone
                <input id="telefone " type="tel" placeholder="(00)00000-0000" />
              </label>
              <div className="tipo-pessoa">
                <label>
                  <input
                    type="radio"
                    name="tipoPessoa"
                    value="PF"
                    checked={tipoPessoa === "PF"}
                    onChange={(e) => setTipoPessoa(e.target.value)}
                  />
                  Pessoa Física (PF)
                </label>

                <label>
                  <input
                    type="radio"
                    name="tipoPessoa"
                    value="PJ"
                    checked={tipoPessoa === "PJ"}
                    onChange={(e) => setTipoPessoa(e.target.value)}
                  />
                  Pessoa Jurídica (PJ)
                </label>
              </div>
              <label htmlFor="documento">
                {tipoPessoa === "PF" ? "CPF" : "CNPJ"}

                <input
                  id="documento"
                  type="text"
                  placeholder={
                    tipoPessoa === "PF"
                      ? "000.000.000-00"
                      : "00.000.000/0000-00"
                  }
                />
              </label>
              {tipoPessoa === "PF" && (
                <label htmlFor="data-nascimento">
                  Data de nascimento
                  <input type="date" id="data-nascimento" />
                </label>
              )}
              <label htmlFor="senha">
                Senha
                <div className="campo-senha">
                  <input
                    id="senha"
                    type={mostrarSenha ? "text" : "password"}
                    placeholder="Digite sua senha"
                  />

                  <button
                    type="button"
                    className="botao-mostrar-senha"
                    onClick={() => setMostrarSenha(!mostrarSenha)}
                  >
                    {mostrarSenha ? "🙈" : "👁️"}
                  </button>
                </div>
                <small>A senha deve ter no mínimo 6 caracteres.</small>
              </label>
              <button type="submit"> Criar conta</button>
              <p className="login">
                Já tem uma conta?
                <Link to="/login"> Fazer login</Link>
              </p>
            </form>
          </div>
        </article>
      </main>
      <footer className="rodape">
        {" "}
        © 2026 TrocaTicket · Todos os direitos reservados
      </footer>
    </div>
  );
}

export default cadastroOrganizador;

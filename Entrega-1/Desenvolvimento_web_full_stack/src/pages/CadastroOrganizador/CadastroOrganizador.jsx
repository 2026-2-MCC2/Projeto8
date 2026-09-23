import { useState } from "react";
import "./CadastroOrganizador.css";
import { Link, useNavigate } from "react-router-dom";
import { apiRequest } from "../../services/api";

function CadastroOrganizador() {
  const navigate = useNavigate();

  const [tipoPessoa, setTipoPessoa] = useState("PF");
  const [mostrarSenha, setMostrarSenha] = useState(false);

  const [nome, setNome] = useState("");
  const [email, setEmail] = useState("");
  const [telefone, setTelefone] = useState("");
  const [documento, setDocumento] = useState("");
  const [dataNascimento, setDataNascimento] = useState("");
  const [senha, setSenha] = useState("");

  const [erro, setErro] = useState("");
  const [sucesso, setSucesso] = useState("");
  const [carregando, setCarregando] = useState(false);

  async function handleSubmit(event) {
    event.preventDefault();
    console.log("CADASTRO ORGANIZADOR FOI EXECUTADO");
    setErro("");
    setSucesso("");
    setCarregando(true);

    try {
      await apiRequest("/organizadores", {
        method: "POST",
        body: JSON.stringify({
          nome,
          email,
          senha,
          telefone,
          tipo_pessoa: tipoPessoa,
          documento,
          data_nascimento: tipoPessoa === "PF" ? dataNascimento : null,
        }),
      });

      setSucesso(
        "Cadastro realizado com sucesso! Aguarde a aprovação do administrador.",
      );

      setTimeout(() => {
        navigate("/login");
      }, 2000);
    } catch (error) {
      setErro(error.message);
    } finally {
      setCarregando(false);
    }
  }
  return (
    <div className="organizador-container">
      <header className="cabecalho-cadastro">
        <Link to="/cadastro" className="voltar">
          {" "}
          ← Voltar ao cadastro
        </Link>
        <p className="descricao">Planeje seu evento. Calcule seu ticket </p>
      </header>
      <main className="cadastroOrganizador-main">
        <article className="card-organizador">
          <div className="card-organizadorConteudo">
            <span className="logo-card">TICKETLAB</span>

            <h2 className="cadastroOrganizador-title">
              Cria conta de Organizador
            </h2>

            <p className="organizador-descricao">
              Cadastre-se para planejar seus eventos, gerenciar custos e
              calcular o ticket.
            </p>
            <form onSubmit={handleSubmit}>
              <label htmlFor="nome">
                Nome completo
                <input
                  id="nome"
                  type="text"
                  placeholder="Digite seu nome completo"
                  value={nome}
                  onChange={(event) => setNome(event.target.value)}
                  required
                />
              </label>

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
              <label htmlFor="telefone">
                Telefone
                <input
                  id="telefone"
                  type="tel"
                  placeholder="(00)00000-0000"
                  value={telefone}
                  onChange={(event) => setTelefone(event.target.value)}
                  required
                />
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
                  value={documento}
                  onChange={(event) => setDocumento(event.target.value)}
                  required
                />
              </label>
              {tipoPessoa === "PF" && (
                <label htmlFor="data-nascimento">
                  Data de nascimento
                  <input
                    type="date"
                    id="data-nascimento"
                    value={dataNascimento}
                    onChange={(event) => setDataNascimento(event.target.value)}
                    required
                  />
                </label>
              )}
              <label htmlFor="senha">
                Senha
                <div className="campo-senha">
                  <input
                    id="senha"
                    type={mostrarSenha ? "text" : "password"}
                    placeholder="Digite sua senha"
                    value={senha}
                    onChange={(event) => setSenha(event.target.value)}
                    minLength={6}
                    required
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
              {erro && <p className="mensagem-erro">{erro}</p>}

              {sucesso && <p className="mensagem-sucesso">{sucesso}</p>}
              <button type="submit" disabled={carregando}>
                {carregando ? "Criando conta..." : "Criar conta"}
              </button>
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
        © 2026 TicketLab · Todos os direitos reservados
      </footer>
    </div>
  );
}

export default CadastroOrganizador;

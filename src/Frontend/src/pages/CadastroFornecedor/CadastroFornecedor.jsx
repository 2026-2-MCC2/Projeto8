import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { apiRequest } from "../../services/api";
import "./CadastroFornecedor.css";

function apenasDigitos(valor) {
  return valor.replace(/\D/g, "");
}

function formatarCnpj(valor) {
  const digitos = apenasDigitos(valor).slice(0, 14);

  return digitos
    .replace(/^(\d{2})(\d)/, "$1.$2")
    .replace(/^(\d{2})\.(\d{3})(\d)/, "$1.$2.$3")
    .replace(/\.(\d{3})(\d)/, ".$1/$2")
    .replace(/(\d{4})(\d)/, "$1-$2");
}

function formatarTelefone(valor) {
  const digitos = apenasDigitos(valor).slice(0, 11);

  if (digitos.length <= 10) {
    return digitos
      .replace(/^(\d{2})(\d)/, "($1) $2")
      .replace(/(\d{4})(\d)/, "$1-$2");
  }

  return digitos
    .replace(/^(\d{2})(\d)/, "($1) $2")
    .replace(/(\d{5})(\d)/, "$1-$2");
}

function CadastroFornecedor() {
  const navigate = useNavigate();

  const [mostrarSenha, setMostrarSenha] = useState(false);
  const [nome, setNome] = useState("");
  const [telefone, setTelefone] = useState("");
  const [email, setEmail] = useState("");
  const [cnpj, setCnpj] = useState("");
  const [categoria, setCategoria] = useState("");
  const [senha, setSenha] = useState("");
  const [erro, setErro] = useState("");
  const [sucesso, setSucesso] = useState("");
  const [carregando, setCarregando] = useState(false);

  async function handleSubmit(event) {
    event.preventDefault();
    setErro("");
    setSucesso("");

    const cnpjNormalizado = apenasDigitos(cnpj);
    const telefoneNormalizado = apenasDigitos(telefone);

    if (cnpjNormalizado.length !== 14) {
      setErro("Informe um CNPJ válido com 14 dígitos.");
      return;
    }

    if (telefoneNormalizado.length < 10 || telefoneNormalizado.length > 11) {
      setErro("Informe um telefone válido com 10 ou 11 dígitos.");
      return;
    }

    if (senha.length < 6) {
      setErro("A senha deve ter no mínimo 6 caracteres.");
      return;
    }

    setCarregando(true);

    try {
      await apiRequest("/fornecedores", {
        method: "POST",
        body: JSON.stringify({
          nome: nome.trim(),
          telefone: telefoneNormalizado,
          email: email.trim(),
          cnpj: cnpjNormalizado,
          categoria_atuacao: categoria,
          senha,
        }),
      });

      setSucesso(
        "Cadastro realizado com sucesso! Aguarde a aprovação do administrador."
      );

      window.setTimeout(() => {
        navigate("/login");
      }, 2000);
    } catch (error) {
      setErro(error.message);
    } finally {
      setCarregando(false);
    }
  }

  return (
    <div className="fornecedor-container">
      <header className="cabecalho-fornecedor">
        <Link to="/cadastro">← Voltar ao cadastro</Link>
        <p className="descricao">Conecte seus serviços a novos eventos.</p>
      </header>

      <main className="cadastroFornecedor-main">
        <article className="card-fornecedor">
          <div className="card-fornecedorConteudo">
            <span className="logo-card">TICKETLAB</span>

            <h2 className="cadastro-fornecedor-title">
              Criar conta de Fornecedor
            </h2>

            <p className="fornecedor-descricao">
              Cadastre sua empresa para divulgar serviços e receber solicitações
              de cotação.
            </p>

            <form onSubmit={handleSubmit}>
              <label htmlFor="nome">
                Nome completo
                <input
                  type="text"
                  id="nome"
                  name="nome"
                  placeholder="Digite seu nome completo"
                  value={nome}
                  onChange={(event) => setNome(event.target.value)}
                  maxLength={100}
                  required
                />
              </label>

              <label htmlFor="telefone">
                Telefone
                <input
                  type="tel"
                  id="telefone"
                  name="telefone"
                  placeholder="(11) 99999-9999"
                  value={telefone}
                  onChange={(event) =>
                    setTelefone(formatarTelefone(event.target.value))
                  }
                  required
                />
              </label>

              <label htmlFor="email">
                E-mail
                <input
                  type="email"
                  id="email"
                  name="email"
                  placeholder="nome@email.com"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  maxLength={120}
                  required
                />
              </label>

              <label htmlFor="cnpj">
                CNPJ
                <input
                  type="text"
                  id="cnpj"
                  name="cnpj"
                  placeholder="00.000.000/0000-00"
                  value={cnpj}
                  onChange={(event) => setCnpj(formatarCnpj(event.target.value))}
                  inputMode="numeric"
                  required
                />
              </label>

              <label htmlFor="categoria">
                Categoria de atuação
                <select
                  value={categoria}
                  id="categoria"
                  name="categoria_atuacao"
                  onChange={(event) => setCategoria(event.target.value)}
                  required
                >
                  <option value="">Selecione sua categoria</option>
                  <option value="ALIMENTACAO">Alimentação</option>
                  <option value="DECORACAO">Decoração</option>
                  <option value="SEGURANCA">Segurança</option>
                  <option value="ENTRETENIMENTO">Entretenimento</option>
                  <option value="ESTRUTURA">Estrutura</option>
                  <option value="FOTOGRAFIA">Fotografia</option>
                  <option value="OUTROS">Outros</option>
                </select>
              </label>

              <label htmlFor="senha">
                Senha
                <div className="campo-senha">
                  <input
                    id="senha"
                    name="senha"
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
                    onClick={() => setMostrarSenha((atual) => !atual)}
                    aria-label={mostrarSenha ? "Ocultar senha" : "Mostrar senha"}
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
        © 2026 TicketLab · Todos os direitos reservados
      </footer>
    </div>
  );
}

export default CadastroFornecedor;

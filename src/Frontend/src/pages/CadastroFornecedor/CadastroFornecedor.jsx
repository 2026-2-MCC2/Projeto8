import "./CadastroFornecedor.css";
import { Link } from "react-router-dom";
import { useState } from "react";

function CadastroFornecedor() {
  const [mostrarSenha, setMostrarSenha] = useState(false);
  const [categoria, setCategoria] = useState("");
  return (
    <div className="fornecedor-container">
      <header className="cabecalho-fornecedor">
        <Link to="/cadastro"> ← Voltar ao cadastro</Link>
        <p className="descricao">Planeje seu evento. Calcule seu ticket </p>
      </header>
      <main className="cadastroFornecedor-main">
        <article className="card-fornecedor">
          <div className="card-fornecedorConteudo">
            <span className="logo-card">TICKETLAB</span>
            <h2 className="cadastro-fornecedor-title">
              Criar conta de Fornecedor
            </h2>
            <p className="fornecedor-descricao">
              Cadastre-se para planejar seus eventos, gerenciar custos e
              calcular o ticket.
            </p>
            <form>
              <label htmlFor="nome">
                Nome completo
                <input
                  type="text"
                  id="nome"
                  placeholder="Digite seu nome completo"
                />
              </label>
              <label htmlFor="telefone">
                Telefone
                <input type="tel" id="telefone" placeholder="(00)00000-0000" />
              </label>
              <label htmlFor="email">
                E-mail
                <input type="email" id="email" placeholder="nome@email.com" />
              </label>
              <label htmlFor="cnpj">
                CNPJ
                <input type="text" id="cnpj" placeholder="Digite seu CNPJ" />
              </label>

              <label htmlFor="categoria">
                Categoria de atuacao
                <select
                  value={categoria}
                  id="categoria"
                  onChange={(e) => setCategoria(e.target.value)}
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
                <small>A senha deve ter no minimo 6 caracteres.</small>
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
        © 2026 TicketLab · Todos os direitos reservados
      </footer>
    </div>
  );
}

export default CadastroFornecedor;

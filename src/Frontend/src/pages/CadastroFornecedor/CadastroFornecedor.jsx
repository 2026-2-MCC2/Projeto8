import "./CadastroFornecedor.css";
import { Link } from "react-router-dom";

function cadastroFornecedor() {
  return (
    <div className="fornecedor-container">
      <header className="cabecalho-fornecedor">
        <Link to="/cadastro"> ← Voltar ao cadastro</Link>
        <p className="descricao">Planeje seu evento. Calcule seu ticket </p>
        <main className="cadastroFornecedor-main"></main>
      </header>
    </div>
  );
}

export default cadastroFornecedor;

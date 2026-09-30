import { Link } from "react-router-dom";

import LayoutOrganizador from "../../../components/organizador/LayoutOrganizador";

import { cotacoes } from "./cotacoesData";

import "./CompararPropostas.css";

function CompararPropostas() {
  const recomendada = cotacoes.find((cotacao) => cotacao.recomendado);

  return (
    <LayoutOrganizador active="cotacoes">
      <main className="comparar-page">
        <header className="comparar-header">
          <div>
            <span className="comparar-label">COMPARAÇÃO</span>

            <h1>Compare propostas</h1>

            <p>
              Coloque lado a lado as melhores opções para decidir com segurança.
            </p>
          </div>

          <Link to="/cotacoes" className="comparar-voltar">
            ‹<span>Voltar para cotações</span>
          </Link>
        </header>

        <section className="comparar-card">
          <div className="comparar-recomendacao">
            <span className="comparar-recomendacao-icone">✧</span>

            <div>
              <strong>Recomendação TrocaTicket</strong>

              <p>
                {recomendada.fornecedor} oferece o melhor equilíbrio entre
                estrutura, prazo e avaliação.
              </p>
            </div>
          </div>

          <div className="comparar-tabela">
            <div className="comparar-tabela-header">
              <span>FORNECEDOR</span>
              <span>SERVIÇO</span>
              <span>VALOR</span>
              <span>PÚBLICO</span>
              <span>OBSERVAÇÕES</span>
              <span></span>
            </div>

            {cotacoes.map((cotacao) => (
              <div
                className={`comparar-linha ${
                  cotacao.recomendado ? "comparar-linha-recomendada" : ""
                }`}
                key={cotacao.id}
              >
                <div className="comparar-fornecedor">
                  <strong>{cotacao.fornecedor}</strong>

                  {cotacao.recomendado && <span>Recomendado</span>}
                </div>

                <span>{cotacao.servico}</span>

                <strong>{cotacao.valorFormatado}</strong>

                <span>{cotacao.publico}</span>

                <span>{cotacao.observacao}</span>

                <button
                  type="button"
                  className={
                    cotacao.recomendado
                      ? "comparar-selecionada"
                      : "comparar-selecionar"
                  }
                >
                  {cotacao.recomendado ? "Selecionada" : "Selecionar"}
                </button>
              </div>
            ))}
          </div>
        </section>
      </main>
    </LayoutOrganizador>
  );
}

export default CompararPropostas;

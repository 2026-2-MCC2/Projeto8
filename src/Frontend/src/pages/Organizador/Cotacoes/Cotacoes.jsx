import { useState } from "react";
import { Link } from "react-router-dom";

import LayoutOrganizador from "../../../components/organizador/LayoutOrganizador";

import CotacaoCard from "./CotacaoCard";
import { cotacoes } from "./cotacoesData";

import "./Cotacoes.css";

function Cotacoes() {
  const [abaAtiva, setAbaAtiva] = useState("Todas");

  const [selecionada, setSelecionada] = useState(3);

  const cotacoesFiltradas = cotacoes.filter((cotacao) => {
    if (abaAtiva === "Todas") {
      return true;
    }

    return cotacao.status === abaAtiva;
  });

  function selecionarCotacao(id) {
    setSelecionada(id);
  }

  return (
    <LayoutOrganizador active="cotacoes">
      <main className="cotacoes-page">
        <header className="cotacoes-header">
          <div>
            <span className="cotacoes-label">COTAÇÕES</span>

            <h1>Propostas recebidas</h1>

            <p>
              Compare as condições e escolha os parceiros ideais para seu
              evento.
            </p>
          </div>

          <Link to="/cotacoes/comparar" className="cotacoes-comparar">
            <span>☷</span>
            Comparar propostas
          </Link>
        </header>

        <nav className="cotacoes-tabs">
          <button
            type="button"
            className={abaAtiva === "Todas" ? "cotacoes-tab-ativa" : ""}
            onClick={() => setAbaAtiva("Todas")}
          >
            Todas · {cotacoes.length}
          </button>

          <button
            type="button"
            className={abaAtiva === "Recebida" ? "cotacoes-tab-ativa" : ""}
            onClick={() => setAbaAtiva("Recebida")}
          >
            Recebidas · 1
          </button>

          <button
            type="button"
            className={abaAtiva === "Em análise" ? "cotacoes-tab-ativa" : ""}
            onClick={() => setAbaAtiva("Em análise")}
          >
            Em análise · 1
          </button>

          <button
            type="button"
            className={abaAtiva === "Selecionada" ? "cotacoes-tab-ativa" : ""}
            onClick={() => setAbaAtiva("Selecionada")}
          >
            Selecionadas · 1
          </button>
        </nav>

        <section className="cotacoes-lista">
          {cotacoesFiltradas.map((cotacao) => (
            <CotacaoCard
              key={cotacao.id}
              cotacao={cotacao}
              selecionada={selecionada === cotacao.id}
              onSelecionar={selecionarCotacao}
            />
          ))}
        </section>
      </main>
    </LayoutOrganizador>
  );
}

export default Cotacoes;

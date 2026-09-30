import { useMemo, useState } from "react";
import LayoutOrganizador from "../../../components/organizador/LayoutOrganizador";
import Icon from "../../../components/organizador/Icon";
import "./ResumoCustos.css";

const EVENTOS = [
  {
    id: 1,
    nome: "Festa da Computação",
    data: "15/10/2026",
    publico: 500,

    custos: {
      servicos: 12550,
      adicionais: 5900,
    },

    distribuicao: {
      servicos: 12550,
      estrutura: 3690,
      outros: 2210,
    },
  },
];

const moeda = new Intl.NumberFormat("pt-BR", {
  style: "currency",
  currency: "BRL",
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

function formatarMoeda(valor) {
  return moeda.format(Number(valor) || 0);
}

function calcularResumo(evento) {
  const servicos = Number(evento.custos?.servicos) || 0;
  const adicionais = Number(evento.custos?.adicionais) || 0;
  const total = servicos + adicionais;

  const publico = Math.max(Number(evento.publico) || 1, 1);

  const distribuicao = Object.entries(evento.distribuicao || {}).map(
    ([categoria, valor]) => {
      const numero = Number(valor) || 0;

      return {
        categoria,
        valor: numero,
        percentual: total > 0 ? (numero / total) * 100 : 0,
      };
    },
  );

  return {
    ...evento,
    servicos,
    adicionais,
    total,
    custoPorPessoa: total / publico,
    distribuicao,
  };
}

function exportarResumo(resumo) {
  const dados = {
    evento: resumo.nome,
    data: resumo.data,
    publico: resumo.publico,
    custos: {
      servicos: resumo.servicos,
      adicionais: resumo.adicionais,
      total: resumo.total,
      porPessoa: Number(resumo.custoPorPessoa.toFixed(2)),
    },
    distribuicao: resumo.distribuicao.map((item) => ({
      categoria: item.categoria,
      valor: item.valor,
      percentual: Number(item.percentual.toFixed(2)),
    })),
  };

  const blob = new Blob([JSON.stringify(dados, null, 2)], {
    type: "application/json;charset=utf-8",
  });

  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");

  link.href = url;
  link.download = "ticketlab-resumo-custos.json";

  link.click();

  URL.revokeObjectURL(url);
}

function nomeCategoria(categoria) {
  const nomes = {
    servicos: "Serviços",
    estrutura: "Estrutura",
    outros: "Outros",
  };

  return nomes[categoria] || categoria;
}

export default function ResumoCustos() {
  const [eventoId, setEventoId] = useState("1");

  const resumo = useMemo(() => {
    const evento = EVENTOS.find((item) => String(item.id) === eventoId);

    return evento ? calcularResumo(evento) : null;
  }, [eventoId]);

  if (!resumo) {
    return (
      <LayoutOrganizador active="resumo-custos">
        <main className="resumo-custos-page">
          <h1>Resumo de custos</h1>
          <p>Nenhum evento encontrado.</p>
        </main>
      </LayoutOrganizador>
    );
  }

  return (
    <LayoutOrganizador active="resumo-custos">
      <main className="resumo-custos-page">
        <header className="resumo-header">
          <div>
            <span className="resumo-eyebrow">RESUMO FINANCEIRO</span>

            <h1>Resumo de custos</h1>

            <p>
              Uma visão consolidada do investimento planejado para seus eventos.
            </p>
          </div>

          <button
            type="button"
            className="resumo-export-button"
            onClick={() => exportarResumo(resumo)}
          >
            Exportar resumo
            <Icon name="download" />
          </button>
        </header>

        <section className="resumo-metrics" aria-label="Resumo financeiro">
          <article className="resumo-metric-card">
            <div className="metric-icon metric-blue">
              <Icon name="cube" />
            </div>

            <div>
              <span>Custo de serviços</span>

              <strong>{formatarMoeda(resumo.servicos)}</strong>

              <small>↗ 6 serviços</small>
            </div>
          </article>

          <article className="resumo-metric-card">
            <div className="metric-icon metric-orange">
              <Icon name="money" />
            </div>

            <div>
              <span>Custos adicionais</span>

              <strong>{formatarMoeda(resumo.adicionais)}</strong>
            </div>
          </article>

          <article className="resumo-metric-card">
            <div className="metric-icon metric-purple">
              <Icon name="wallet" />
            </div>

            <div>
              <span>Custo total</span>

              <strong>{formatarMoeda(resumo.total)}</strong>

              <small>↗ +12,4%</small>
            </div>
          </article>

          <article className="resumo-metric-card">
            <div className="metric-icon metric-green">
              <Icon name="users" />
            </div>

            <div>
              <span>Custo por pessoa</span>

              <strong>{formatarMoeda(resumo.custoPorPessoa)}</strong>
            </div>
          </article>
        </section>

        <section className="resumo-main-grid">
          <article className="distribuicao-card">
            <header className="distribuicao-header">
              <div>
                <h2>Distribuição de custos</h2>

                <p>
                  {resumo.nome} · {resumo.data}
                </p>
              </div>

              <select
                className="evento-select"
                value={eventoId}
                onChange={(event) => setEventoId(event.target.value)}
                aria-label="Selecionar evento"
              >
                {EVENTOS.map((evento) => (
                  <option key={evento.id} value={evento.id}>
                    Este evento
                  </option>
                ))}

                <option value="todos">Todos os eventos</option>
              </select>
            </header>

            <div className="distribuicao-content">
              <div className="donut-area">
                <div
                  className="donut-chart"
                  aria-label={`Total planejado: ${formatarMoeda(resumo.total)}`}
                >
                  <div className="donut-center">
                    <strong>{formatarMoeda(resumo.total)}</strong>

                    <span>total planejado</span>
                  </div>
                </div>
              </div>

              <div className="distribuicao-legend">
                {resumo.distribuicao.map((item) => (
                  <div className="legend-item" key={item.categoria}>
                    <div className="legend-name">
                      <span className={`legend-dot legend-${item.categoria}`} />

                      <strong>{nomeCategoria(item.categoria)}</strong>
                    </div>

                    <strong className="legend-value">
                      {formatarMoeda(item.valor)}
                    </strong>

                    <span className="legend-percent">
                      {Math.round(item.percentual)}%
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </article>

          <aside className="insight-card">
            <div className="insight-icon">
              <Icon name="lightbulb" />
            </div>

            <span className="insight-eyebrow">INSIGHT DO SEU PLANEJAMENTO</span>

            <h2>Você está no caminho certo.</h2>

            <p>
              Seu custo por pessoa está 8% abaixo da média de eventos
              semelhantes.
            </p>

            <div className="insight-progress">
              <div className="progress-track">
                <span />
              </div>

              <span>72% do orçamento organizado</span>
            </div>
          </aside>
        </section>
      </main>
    </LayoutOrganizador>
  );
}

import { useMemo, useState } from "react";
import LayoutAdmin from "../../../components/admin/LayoutAdmin";
import PageHeader from "../../../components/admin/PageHeader";
import StatCard from "../../../components/admin/StatCard";
import Icon from "../../../components/organizador/Icon";
import { formatarMoedaCompacta } from "../../../utils/formatadores";
import { baixarCsv } from "../../../utils/exportarCsv";
import { relatoriosExemplo } from "../relatoriosData";

const ROTULO_STATUS = {
  PLANEJAMENTO: "Planejamento",
  CONFIRMADO: "Confirmados",
  CONCLUIDO: "Concluídos",
  CANCELADO: "Cancelados",
};

function formatarVariacao(valor) {
  return `${Number(valor).toLocaleString("pt-BR")}%`;
}

export default function AdminRelatorios() {
  // Sem setter por enquanto: na integração vira setDados(respostaDaApi)
  const [dados] = useState(relatoriosExemplo);

  // Derivados: calculados a partir dos dados, não guardados à parte
  const totalEventos = useMemo(
    () => dados.eventos_por_status.reduce((soma, item) => soma + item.total, 0),
    [dados]
  );

  const maiorStatus = useMemo(
    () => Math.max(...dados.eventos_por_status.map((item) => item.total), 1),
    [dados]
  );

  function baixarRelatorio() {
    baixarCsv("relatorio-ticketlab.csv", [
      ["Indicador", "Valor"],
      ["Total de eventos", totalEventos],
      ["Propostas enviadas", dados.totais.propostas_enviadas],
      ["Volume planejado (R$)", dados.totais.volume_planejado],
      ["Fornecedores ativos", dados.totais.fornecedores_ativos],
      [],
      ["Eventos por status", "Total"],
      ...dados.eventos_por_status.map((item) => [
        ROTULO_STATUS[item.status],
        item.total,
      ]),
      [],
      ["Categoria mais buscada", "Percentual"],
      ...dados.categorias_mais_buscadas.map((item) => [
        item.categoria,
        `${item.percentual}%`,
      ]),
    ]);
  }

  return (
    <LayoutAdmin active="relatorios">
      <main className="adm-main">
        <PageHeader
          eyebrow="RELATÓRIOS"
          title="Relatórios da plataforma"
          description="Indicadores para entender o ecossistema TicketLab."
          action={
            <button
              type="button"
              className="adm-btn adm-btn-secondary"
              onClick={baixarRelatorio}
            >
              <Icon name="download" size={16} /> Baixar relatório
            </button>
          }
        />

        <section className="adm-stats-grid">
          <StatCard
            label="Total de eventos"
            value={totalEventos.toLocaleString("pt-BR")}
            change={formatarVariacao(dados.totais.variacao_eventos)}
            icon="calendar"
          />
          <StatCard
            label="Propostas enviadas"
            value={dados.totais.propostas_enviadas.toLocaleString("pt-BR")}
            change={formatarVariacao(dados.totais.variacao_propostas)}
            icon="quote"
            tone="orange"
          />
          <StatCard
            label="Volume planejado"
            value={formatarMoedaCompacta(dados.totais.volume_planejado)}
            change={formatarVariacao(dados.totais.variacao_volume)}
            icon="wallet"
            tone="violet"
          />
          <StatCard
            label="Fornecedores ativos"
            value={dados.totais.fornecedores_ativos.toLocaleString("pt-BR")}
            change={formatarVariacao(dados.totais.variacao_fornecedores)}
            icon="briefcase"
            tone="green"
          />
        </section>

        <div className="adm-grid-2">
          <section className="adm-panel adm-panel-padded">
            <div className="adm-panel-heading">
              <div>
                <h2>Eventos por status</h2>
                <p>Distribuição atual</p>
              </div>
            </div>

            <div className="adm-report-bars">
              {dados.eventos_por_status.map((item) => (
                <div className="adm-report-bar" key={item.status}>
                  <strong>{item.total.toLocaleString("pt-BR")}</strong>

                  <div className="adm-report-track">
                    <div
                      className={`adm-report-fill ${item.status.toLowerCase()}`}
                      style={{ height: `${(item.total / maiorStatus) * 100}%` }}
                    />
                  </div>

                  <small>{ROTULO_STATUS[item.status]}</small>
                </div>
              ))}
            </div>
          </section>

          <section className="adm-panel adm-panel-padded">
            <div className="adm-panel-heading">
              <div>
                <h2>Categorias mais buscadas</h2>
                <p>Nos últimos 30 dias</p>
              </div>
            </div>

            {dados.categorias_mais_buscadas.map((item) => (
              <div className="adm-report-row" key={item.categoria}>
                <span>{item.categoria}</span>

                <div className="adm-progress">
                  <div
                    className="adm-progress-fill"
                    style={{ width: `${item.percentual}%` }}
                  />
                </div>

                <strong>{item.percentual}%</strong>
              </div>
            ))}
          </section>
        </div>
      </main>
    </LayoutAdmin>
  );
}
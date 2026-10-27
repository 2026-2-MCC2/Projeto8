import LayoutAdmin from "../../../components/admin/LayoutAdmin";
import PageHeader from "../../../components/admin/PageHeader";
import StatCard from "../../../components/admin/StatCard";
import Icon from "../../../components/organizador/Icon";
import { adminApi } from "../../../services/admin";
import useCarregar from "../../../hooks/useCarregar";
import { formatarMoedaCompacta } from "../../../utils/formatadores";
import { formatarCategoria } from "../../../utils/cadastros";
import { baixarCsv } from "../../../utils/exportarCsv";

const ROTULO_STATUS = {
  PLANEJAMENTO: "Planejamento",
  CONFIRMADO: "Confirmados",
  CONCLUIDO: "Concluídos",
  CANCELADO: "Cancelados",
};

// "+3 nos últimos 30 dias"; sem novidade, não mostra nada
function textoNovos(quantidade) {
  return quantidade > 0
    ? `+${quantidade.toLocaleString("pt-BR")} nos últimos 30 dias`
    : undefined;
}

export default function AdminRelatorios() {
  // "dados" é null até a primeira resposta da API.
  const { dados, carregando, erro, recarregar } = useCarregar(
    () => adminApi.relatorios(),
    []
  );

  const primeiraCarga = carregando && dados === null;

  function baixarRelatorio() {
    const totalEventos = dados.eventos_por_status.reduce(
      (soma, item) => soma + item.total,
      0
    );

    baixarCsv("relatorio-ticketlab.csv", [
      ["Indicador", "Valor"],
      ["Total de eventos", totalEventos],
      ["Propostas enviadas", dados.totais.propostas_enviadas],
      ["Propostas selecionadas", dados.totais.propostas_selecionadas],
      ["Volume contratado (R$)", dados.totais.volume_selecionado],
      ["Fornecedores ativos", dados.totais.fornecedores_ativos],
      [],
      ["Eventos por status", "Total"],
      ...dados.eventos_por_status.map((item) => [
        ROTULO_STATUS[item.status] ?? item.status,
        item.total,
      ]),
      [],
      ["Categoria com mais propostas", "Propostas", "Percentual"],
      ...dados.categorias_mais_procuradas.map((item) => [
        formatarCategoria(item.categoria),
        item.total,
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
              disabled={!dados}
            >
              <Icon name="download" size={16} /> Baixar relatório
            </button>
          }
        />

        {erro && (
          <div className="adm-alert adm-alert-error">
            {erro}{" "}
            <button
              type="button"
              className="adm-text-button"
              onClick={recarregar}
            >
              Tentar novamente
            </button>
          </div>
        )}

        {primeiraCarga && (
          <div className="adm-empty">Carregando relatórios...</div>
        )}

        {dados && <Painel dados={dados} />}
      </main>
    </LayoutAdmin>
  );
}

// Tudo que depende dos dados fica aqui, então só aparece depois que eles chegam.
function Painel({ dados }) {
  const { totais, eventos_por_status, categorias_mais_procuradas } = dados;

  // Derivados: calculados a partir dos dados, não guardados à parte
  const totalEventos = eventos_por_status.reduce(
    (soma, item) => soma + item.total,
    0
  );
  const maiorStatus = Math.max(...eventos_por_status.map((i) => i.total), 1);

  return (
    <>
      <section className="adm-stats-grid">
        <StatCard
          label="Total de eventos"
          value={totalEventos.toLocaleString("pt-BR")}
          icon="calendar"
        />
        <StatCard
          label="Propostas enviadas"
          value={totais.propostas_enviadas.toLocaleString("pt-BR")}
          change={textoNovos(totais.propostas_30d)}
          icon="quote"
          tone="orange"
        />
        <StatCard
          label="Volume contratado"
          value={formatarMoedaCompacta(totais.volume_selecionado)}
          change={`${totais.propostas_selecionadas.toLocaleString("pt-BR")} ${
            totais.propostas_selecionadas === 1
              ? "proposta selecionada"
              : "propostas selecionadas"
          }`}
          icon="wallet"
          tone="violet"
        />
        <StatCard
          label="Fornecedores ativos"
          value={totais.fornecedores_ativos.toLocaleString("pt-BR")}
          change={textoNovos(totais.fornecedores_novos_30d)}
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
            {eventos_por_status.map((item) => (
              <div className="adm-report-bar" key={item.status}>
                <strong>{item.total.toLocaleString("pt-BR")}</strong>

                <div className="adm-report-track">
                  <div
                    className={`adm-report-fill ${item.status.toLowerCase()}`}
                    style={{ height: `${(item.total / maiorStatus) * 100}%` }}
                  />
                </div>

                <small>{ROTULO_STATUS[item.status] ?? item.status}</small>
              </div>
            ))}
          </div>
        </section>

        <section className="adm-panel adm-panel-padded">
          <div className="adm-panel-heading">
            <div>
              <h2>Categorias com mais propostas</h2>
              <p>Fatia de cada categoria no total de propostas</p>
            </div>
          </div>

          {categorias_mais_procuradas.length === 0 ? (
            <div className="adm-empty">Ainda não há propostas.</div>
          ) : (
            categorias_mais_procuradas.map((item) => (
              <div className="adm-report-row" key={item.categoria}>
                <span>{formatarCategoria(item.categoria)}</span>

                <div className="adm-progress">
                  <div
                    className="adm-progress-fill"
                    style={{ width: `${item.percentual}%` }}
                  />
                </div>

                <strong>{item.percentual}%</strong>
              </div>
            ))
          )}
        </section>
      </div>
    </>
  );
}
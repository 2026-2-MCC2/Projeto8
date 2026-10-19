import { useState } from "react";
import { Link } from "react-router-dom";
import LayoutAdmin from "../../../components/admin/LayoutAdmin";
import PageHeader from "../../../components/admin/PageHeader";
import StatCard from "../../../components/admin/StatCard";
import Icon from "../../../components/organizador/Icon";
import { formatarTempoRelativo } from "../../../utils/formatadores";
import { baixarCsv } from "../../../utils/exportarCsv";
import { dashboardExemplo } from "../dashboardData";

// Ícone e cor de cada tipo de atividade
const TIPO_ATIVIDADE = {
  CADASTRO_PENDENTE: { icone: "users", tom: "orange" },
  EVENTO_PUBLICADO: { icone: "calendar", tom: "" },
  PROPOSTA_ACEITA: { icone: "check", tom: "green" },
};

// Cada linha da "Saúde da plataforma": qual campo dos dados e qual texto
const INDICADORES_SAUDE = [
  { chave: "eventos_orcamento_completo", rotulo: "Eventos com orçamento completo" },
  { chave: "taxa_resposta_fornecedores", rotulo: "Taxa de resposta dos fornecedores" },
  { chave: "cadastros_aprovados", rotulo: "Cadastros aprovados" },
];

export default function AdminDashboard() {
  const [dados] = useState(dashboardExemplo);
  const { totais, atividades, saude } = dados;

  // Derivado: não é um número guardado à parte
  const totalUsuarios = totais.organizadores + totais.fornecedores;

  function exportarRelatorio() {
    baixarCsv("visao-geral-ticketlab.csv", [
      ["Indicador", "Valor"],
      ["Usuários cadastrados", totalUsuarios],
      ["Organizadores", totais.organizadores],
      ["Fornecedores", totais.fornecedores],
      ["Eventos ativos", totais.eventos_ativos],
      [],
      ["Saúde da plataforma", "Percentual"],
      ...INDICADORES_SAUDE.map((item) => [item.rotulo, `${saude[item.chave]}%`]),
    ]);
  }

  return (
    <LayoutAdmin active="dashboard">
      <main className="adm-main">
        <PageHeader
          eyebrow="CENTRAL DE GESTÃO"
          title="Visão geral da plataforma"
          description="Acompanhe o crescimento e as movimentações do TicketLab."
          action={
            <button
              type="button"
              className="adm-btn adm-btn-secondary"
              onClick={exportarRelatorio}
            >
              <Icon name="download" size={16} /> Exportar relatório
            </button>
          }
        />

        <section className="adm-stats-grid">
          <StatCard
            label="Usuários cadastrados"
            value={totalUsuarios.toLocaleString("pt-BR")}
            change={`${totais.variacao_usuarios.toLocaleString("pt-BR")}% este mês`}
            icon="users"
          />
          <StatCard
            label="Organizadores"
            value={totais.organizadores.toLocaleString("pt-BR")}
            icon="calendar"
          />
          <StatCard
            label="Fornecedores"
            value={totais.fornecedores.toLocaleString("pt-BR")}
            icon="briefcase"
            tone="orange"
          />
          <StatCard
            label="Eventos ativos"
            value={totais.eventos_ativos.toLocaleString("pt-BR")}
            change={`${totais.novos_eventos} novos`}
            icon="trend"
            tone="green"
          />
        </section>

        <div className="adm-grid-2">
          <section className="adm-panel adm-panel-padded">
            <div className="adm-panel-heading">
              <div>
                <h2>Atividade recente</h2>
                <p>Últimas ações na plataforma.</p>
              </div>

              <Link to="/admin/aprovacoes" className="adm-text-link">
                Ver aprovações <Icon name="arrow" size={15} />
              </Link>
            </div>

            {atividades.length === 0 ? (
              <div className="adm-empty">Nenhuma atividade recente.</div>
            ) : (
              atividades.map((atividade) => {
                const tipo = TIPO_ATIVIDADE[atividade.tipo];

                return (
                  <div className="adm-activity-item" key={atividade.id}>
                    <span className={`adm-activity-icon ${tipo.tom}`}>
                      <Icon name={tipo.icone} size={16} />
                    </span>

                    <div className="adm-activity-text">
                      <strong>{atividade.titulo}</strong>
                      <p>{atividade.descricao}</p>
                    </div>

                    <span className="adm-activity-time">
                      {formatarTempoRelativo(atividade.criado_em)}
                    </span>
                  </div>
                );
              })
            )}
          </section>

          <section className="adm-panel adm-panel-padded">
            <div className="adm-panel-heading">
              <div>
                <h2>Saúde da plataforma</h2>
                <p>Indicadores deste mês.</p>
              </div>
            </div>

            {INDICADORES_SAUDE.map((item) => (
              <div className="adm-finance" key={item.chave}>
                <div className="adm-finance-row">
                  <span>{item.rotulo}</span>
                  <strong>{saude[item.chave]}%</strong>
                </div>

                <div className="adm-progress">
                  <div
                    className="adm-progress-fill"
                    style={{ width: `${saude[item.chave]}%` }}
                  />
                </div>
              </div>
            ))}
          </section>
        </div>
      </main>
    </LayoutAdmin>
  );
}
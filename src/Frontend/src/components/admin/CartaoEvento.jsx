import { useState } from "react";
import Badge from "./Badge";
import { formatarMoeda } from "../../utils/formatadores";
import { formatarDataCompleta } from "../../utils/datas";

const STATUS_EVENTO = {
  PLANEJAMENTO: { rotulo: "Em planejamento", tom: "orange" },
  CONFIRMADO: { rotulo: "Confirmado", tom: "green" },
  CONCLUIDO: { rotulo: "Concluído", tom: "dark" },
  CANCELADO: { rotulo: "Cancelado", tom: "red" },
};

const STATUS_COTACAO = {
  APROVADO: { rotulo: "Aprovado", tom: "green" },
  PENDENTE: { rotulo: "Pendente", tom: "orange" },
  RECUSADA: { rotulo: "Recusada", tom: "red" },
  CANCELADA: { rotulo: "Cancelada", tom: "dark" },
};

export default function CartaoEvento({ evento, resumo }) {
  // Cada cartão guarda sozinho se está aberto 
  const [aberto, setAberto] = useState(false);

  const status = STATUS_EVENTO[evento.status];
  const estourouOrcamento = resumo.custoAtual > evento.orcamento_previsto;

  return (
    <article className="adm-event-card">
      <div className="adm-event-top">
        <div>
          <h2 className="adm-event-name">{evento.nome}</h2>
          <p className="adm-event-meta">Organizador: {evento.organizador_nome}</p>
          <p className="adm-event-meta">
            Data do evento: {formatarDataCompleta(evento.data_evento)}
          </p>
        </div>

        <Badge tone={status.tom}>{status.rotulo}</Badge>
      </div>

      <div className="adm-finance">
        <div className="adm-finance-row">
          <span>Custo atual / Orçamento previsto</span>
          <strong>
            {formatarMoeda(resumo.custoAtual)} /{" "}
            {formatarMoeda(evento.orcamento_previsto)}
          </strong>
        </div>

        <div className="adm-progress">
          <div
            className={`adm-progress-fill ${estourouOrcamento ? "over" : ""}`}
            style={{ width: `${Math.min(resumo.percentualOrcamento, 100)}%` }}
          />
        </div>
      </div>

      <div className="adm-finance">
        <div className="adm-finance-row">
          <span>Cotações aprovadas</span>
          <strong>
            {resumo.cotacoesAprovadas} de {resumo.totalCotacoes} (
            {resumo.percentualCotacoes}%)
          </strong>
        </div>

        <div className="adm-progress">
          <div
            className="adm-progress-fill"
            style={{ width: `${resumo.percentualCotacoes}%` }}
          />
        </div>
      </div>

      <button
        type="button"
        className="adm-event-toggle"
        onClick={() => setAberto((atual) => !atual)}
      >
        {aberto ? "Ocultar detalhes" : "Ver custos e cotações"}
      </button>

      {aberto && (
        <div className="adm-event-details">
          <h3 className="adm-details-title">Custos por categoria</h3>

          <table className="adm-cost-table">
            <thead>
              <tr>
                <th>Categoria</th>
                <th className="num">Previsto</th>
                <th className="num">Atual</th>
              </tr>
            </thead>

            <tbody>
              {evento.categorias.map((cat) => {
                const acima = cat.valor_atual > cat.valor_previsto;

                return (
                  <tr key={cat.categoria} className={acima ? "over" : ""}>
                    <td>
                      {cat.categoria}
                      {acima && (
                        <span className="adm-over-note">⚠ acima do previsto</span>
                      )}
                    </td>
                    <td className="num">{formatarMoeda(cat.valor_previsto)}</td>
                    <td className="num">{formatarMoeda(cat.valor_atual)}</td>
                  </tr>
                );
              })}
            </tbody>

            <tfoot>
              <tr>
                <td>Total</td>
                <td className="num">{formatarMoeda(evento.orcamento_previsto)}</td>
                <td className="num">{formatarMoeda(resumo.custoAtual)}</td>
              </tr>
            </tfoot>
          </table>

          <h3 className="adm-details-title">Cotações por fornecedor</h3>

          {evento.cotacoes.map((cot) => {
            const statusCot = STATUS_COTACAO[cot.status];

            return (
              <div className="adm-quote-item" key={cot.fornecedor_nome + cot.categoria}>
                <div className="adm-quote-info">
                  <strong>{cot.fornecedor_nome}</strong>
                  <span>{cot.categoria}</span>
                </div>

                <span className="adm-quote-value">
                  {cot.valor !== null ? formatarMoeda(cot.valor) : "—"}
                </span>

                <Badge tone={statusCot.tom}>{statusCot.rotulo}</Badge>
              </div>
            );
          })}
        </div>
      )}
    </article>
  );
}
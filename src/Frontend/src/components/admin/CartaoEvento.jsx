import { useState } from "react";
import Badge from "./Badge";
import { formatarMoeda } from "../../utils/formatadores";
import { formatarCategoria } from "../../utils/cadastros";
import { formatarDataCompleta } from "../../utils/datas";

const STATUS_EVENTO = {
  PLANEJAMENTO: { rotulo: "Em planejamento", tom: "orange" },
  CONFIRMADO: { rotulo: "Confirmado", tom: "green" },
  CONCLUIDO: { rotulo: "Concluído", tom: "dark" },
  CANCELADO: { rotulo: "Cancelado", tom: "red" },
};

const STATUS_PROPOSTA = {
  ENVIADA: { rotulo: "Enviada", tom: "blue" },
  EM_ANALISE: { rotulo: "Em análise", tom: "orange" },
  SELECIONADA: { rotulo: "Selecionada", tom: "green" },
  RECUSADA: { rotulo: "Recusada", tom: "red" },
  CANCELADA: { rotulo: "Cancelada", tom: "dark" },
};

export default function CartaoEvento({ evento, resumo }) {
  // Cada cartão guarda sozinho se está aberto
  const [aberto, setAberto] = useState(false);

  const status = STATUS_EVENTO[evento.status];
  const cancelado = evento.status === "CANCELADO";
  const estourouOrcamento =
    resumo.temOrcamento && resumo.custoAtual > evento.orcamento_previsto;

  return (
    <article className="adm-event-card">
      <div className="adm-event-top">
        <div>
          <h2 className="adm-event-name">{evento.nome}</h2>
          <p className="adm-event-meta">Organizador: {evento.organizador_nome}</p>
          <p className="adm-event-meta">
            Data do evento:{" "}
            {formatarDataCompleta(evento.data_evento, evento.horario)}
          </p>
          <p className="adm-event-meta">
            Local: {evento.local} · Público: {evento.publico_min} a{" "}
            {evento.publico_max} pessoas
          </p>
        </div>

        <Badge tone={status.tom}>{status.rotulo}</Badge>
      </div>

      <div className="adm-finance">
        <div className="adm-finance-row">
          <span>
            {resumo.temOrcamento
              ? "Custo atual / Orçamento previsto"
              : "Custo atual (propostas selecionadas)"}
          </span>
          <strong>
            {formatarMoeda(resumo.custoAtual)}
            {resumo.temOrcamento &&
              ` / ${formatarMoeda(evento.orcamento_previsto)}`}
          </strong>
        </div>

        {resumo.temOrcamento ? (
          <div className="adm-progress">
            <div
              className={`adm-progress-fill ${estourouOrcamento ? "over" : ""}`}
              style={{ width: `${Math.min(resumo.percentualOrcamento, 100)}%` }}
            />
          </div>
        ) : (
          <p className="adm-hint">Orçamento previsto não informado.</p>
        )}
      </div>

      <div className="adm-finance">
        <div className="adm-finance-row">
          <span>Propostas selecionadas</span>
          <strong>
            {resumo.propostasSelecionadas} de {resumo.totalPropostas} (
            {resumo.percentualPropostas}%)
          </strong>
        </div>

        <div className="adm-progress">
          <div
            className="adm-progress-fill"
            style={{ width: `${resumo.percentualPropostas}%` }}
          />
        </div>
      </div>

      <button
        type="button"
        className="adm-event-toggle"
        onClick={() => setAberto((atual) => !atual)}
      >
        {aberto ? "Ocultar detalhes" : "Ver propostas"}
      </button>

      {aberto && (
        <div className="adm-event-details">
          <h3 className="adm-details-title">Propostas por fornecedor</h3>

          {evento.propostas.length === 0 && (
            <div className="adm-empty">
              Este evento ainda não recebeu propostas.
            </div>
          )}

          {evento.propostas.map((proposta) => {
            // Evento cancelado: todas as propostas aparecem como canceladas
            const statusProposta =
              STATUS_PROPOSTA[cancelado ? "CANCELADA" : proposta.status];

            return (
              <div className="adm-quote-item" key={proposta.id}>
                <div className="adm-quote-info">
                  <strong>{proposta.fornecedor_nome}</strong>
                  <span>
                    {proposta.servico_nome} ·{" "}
                    {formatarCategoria(proposta.categoria)}
                  </span>
                </div>

                <span className="adm-quote-value">
                  {formatarMoeda(proposta.valor)}
                </span>

                <Badge tone={statusProposta.tom}>{statusProposta.rotulo}</Badge>
              </div>
            );
          })}
        </div>
      )}
    </article>
  );
}
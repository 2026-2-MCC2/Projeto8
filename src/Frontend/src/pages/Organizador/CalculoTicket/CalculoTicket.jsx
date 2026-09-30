import { useMemo, useState } from "react";
import LayoutOrganizador from "../../../components/organizador/LayoutOrganizador";
import Icon from "../../../components/organizador/Icon";
import "./CalculoTicket.css";

const LIMITES = {
  custoMin: 0,
  custoMax: 1000000,
  publicoMin: 50,
  publicoMax: 5000,
  margemMin: 0,
  margemMax: 80,
};

const FORMATA_MOEDA = new Intl.NumberFormat("pt-BR", {
  style: "currency",
  currency: "BRL",
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

function formatarMoeda(valor) {
  return FORMATA_MOEDA.format(Number.isFinite(valor) ? valor : 0);
}

function limitarNumero(valor, min, max) {
  const numero = Number(valor);

  if (!Number.isFinite(numero)) {
    return min;
  }

  return Math.min(Math.max(numero, min), max);
}

export default function CalculoTicket() {
  const [custoTotal, setCustoTotal] = useState(18450);
  const [publico, setPublico] = useState(500);
  const [margem, setMargem] = useState(20);

  const simulacao = useMemo(() => {
    const custo = limitarNumero(custoTotal, LIMITES.custoMin, LIMITES.custoMax);

    const pessoas = limitarNumero(
      publico,
      LIMITES.publicoMin,
      LIMITES.publicoMax,
    );

    const margemSegura = limitarNumero(
      margem,
      LIMITES.margemMin,
      LIMITES.margemMax,
    );

    const fatorMargem = 1 - margemSegura / 100;

    const ticket = fatorMargem > 0 ? custo / (pessoas * fatorMargem) : 0;

    return {
      custo,
      pessoas,
      margem: margemSegura,
      ticket,
    };
  }, [custoTotal, publico, margem]);

  function handleCustoChange(event) {
    const valor = limitarNumero(
      event.target.value,
      LIMITES.custoMin,
      LIMITES.custoMax,
    );

    setCustoTotal(valor);
  }

  function handlePublicoChange(event) {
    const valor = limitarNumero(
      event.target.value,
      LIMITES.publicoMin,
      LIMITES.publicoMax,
    );

    setPublico(valor);
  }

  function handleMargemChange(event) {
    const valor = limitarNumero(
      event.target.value,
      LIMITES.margemMin,
      LIMITES.margemMax,
    );

    setMargem(valor);
  }

  return (
    <LayoutOrganizador active="calculo-ticket">
      <main className="calculo-ticket-page">
        <header className="calculo-ticket-header">
          <span className="calculo-ticket-eyebrow">CÁLCULO DO TICKET</span>

          <h1>Quanto seu ingresso precisa custar?</h1>

          <p>
            Simule diferentes cenários e tome decisões mais seguras para o seu
            evento.
          </p>
        </header>

        <section className="calculo-ticket-grid">
          <article className="simulacao-card">
            <div className="simulacao-title">
              <span className="step-number">01</span>

              <div>
                <h2>Configure sua simulação</h2>

                <p>Altere os valores para explorar cenários.</p>
              </div>
            </div>

            <div className="campo-custo">
              <label htmlFor="custo-total">Custo total</label>

              <input
                id="custo-total"
                type="number"
                min={LIMITES.custoMin}
                max={LIMITES.custoMax}
                step="0.01"
                value={custoTotal}
                onChange={handleCustoChange}
                inputMode="decimal"
              />
            </div>

            <div className="simulacao-divider" />

            <div className="range-field">
              <div className="range-header">
                <label htmlFor="publico">Público esperado</label>

                <strong>
                  {simulacao.pessoas.toLocaleString("pt-BR")} pessoas
                </strong>
              </div>

              <input
                id="publico"
                type="range"
                min={LIMITES.publicoMin}
                max={LIMITES.publicoMax}
                step="10"
                value={simulacao.pessoas}
                onChange={handlePublicoChange}
                style={{
                  "--range-progress": `${
                    ((simulacao.pessoas - LIMITES.publicoMin) /
                      (LIMITES.publicoMax - LIMITES.publicoMin)) *
                    100
                  }%`,
                }}
              />
            </div>

            <div className="range-field">
              <div className="range-header">
                <label htmlFor="margem">Margem desejada</label>

                <strong>{simulacao.margem}%</strong>
              </div>

              <input
                id="margem"
                type="range"
                min={LIMITES.margemMin}
                max={LIMITES.margemMax}
                step="1"
                value={simulacao.margem}
                onChange={handleMargemChange}
                style={{
                  "--range-progress": `${
                    (simulacao.margem / LIMITES.margemMax) * 100
                  }%`,
                }}
              />
            </div>

            <div className="formula-box">
              <div className="formula-icon">
                <Icon name="lightbulb" />
              </div>

              <div>
                <strong>Fórmula aplicada</strong>

                <code>custo ÷ [público × (1 − margem)]</code>
              </div>
            </div>
          </article>

          <aside className="ticket-result-card">
            <span className="ticket-result-eyebrow">
              RESULTADO DA SIMULAÇÃO
            </span>

            <h2>Ticket estimado</h2>

            <strong className="ticket-value">
              {formatarMoeda(simulacao.ticket)}
            </strong>

            <span className="ticket-per-person">por pessoa</span>

            <div className="ticket-result-divider" />

            <div className="ticket-summary">
              <div>
                <span>Custo total</span>
                <strong>{formatarMoeda(simulacao.custo)}</strong>
              </div>

              <div>
                <span>Público esperado</span>
                <strong>{simulacao.pessoas}</strong>
              </div>

              <div>
                <span>Margem desejada</span>
                <strong>{simulacao.margem}%</strong>
              </div>
            </div>

            <div className="ticket-status">
              <span className="ticket-status-icon">✓</span>

              <span>Seu ticket cobre os custos e a margem planejada.</span>
            </div>
          </aside>
        </section>
      </main>
    </LayoutOrganizador>
  );
}

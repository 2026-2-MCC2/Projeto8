import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import Icone from "./Icones";
import {
  LIMITES_TICKET as L,
  calcularTicket,
  formatarReais,
} from "../../utils/ticket";
import { obterSessao } from "../../utils/sessao";

// Calculadora pública: usa a mesma fórmula e os mesmos limites da tela
// "Cálculo do ticket" do organizador. Nada é enviado ou salvo.
export default function HomeSimulador() {
  const [custo, setCusto] = useState("18450");
  const [publico, setPublico] = useState("500");
  const [margem, setMargem] = useState("20");

  const resultado = useMemo(
    () => calcularTicket({ custo, publico, margem }),
    [custo, publico, margem]
  );

  const tipo = obterSessao()?.usuario?.tipo;
  const destino = tipo === "ORGANIZADOR" ? "/calculo-ticket" : "/cadastro/organizador";
  const rotuloDestino =
    tipo === "ORGANIZADOR" ? "Abrir a calculadora completa" : "Criar conta de organizador";

  return (
    <section className="hm-secao hm-secao-clara" id="simulador" aria-labelledby="hm-sim-titulo">
      <div className="hm-container">
        <div className="hm-titulo-secao hm-centro">
          <span className="hm-eyebrow">SIMULADOR</span>
          <h2 id="hm-sim-titulo">Quanto seu ingresso precisa custar?</h2>
          <p>Informe os números do seu evento e veja o impacto de cada decisão no ticket.</p>
        </div>

        <div className="hm-sim">
          <form className="hm-sim-form" onSubmit={(evento) => evento.preventDefault()}>
            <label className="hm-campo">
              <span>Custo total do evento (R$)</span>
              <input
                type="number"
                inputMode="decimal"
                min={L.custoMin}
                max={L.custoMax}
                step="50"
                value={custo}
                onChange={(evento) => setCusto(evento.target.value)}
              />
            </label>

            <div className="hm-campo">
              <label htmlFor="hm-publico" className="hm-campo-linha">
                <span>Público esperado</span>
                <strong>{resultado.publico.toLocaleString("pt-BR")} pessoas</strong>
              </label>
              <input
                id="hm-publico"
                type="range"
                min={L.publicoMin}
                max={L.publicoMax}
                step="10"
                value={resultado.publico}
                onChange={(evento) => setPublico(evento.target.value)}
              />
              <div className="hm-range-dicas" aria-hidden="true">
                <span>{L.publicoMin}</span>
                <span>{L.publicoMax.toLocaleString("pt-BR")}</span>
              </div>
            </div>

            <div className="hm-campo">
              <label htmlFor="hm-margem" className="hm-campo-linha">
                <span>Margem desejada</span>
                <strong>{resultado.margem}%</strong>
              </label>
              <input
                id="hm-margem"
                type="range"
                min={L.margemMin}
                max={L.margemMax}
                step="5"
                value={resultado.margem}
                onChange={(evento) => setMargem(evento.target.value)}
              />
              <div className="hm-range-dicas" aria-hidden="true">
                <span>{L.margemMin}%</span>
                <span>{L.margemMax}%</span>
              </div>
            </div>
          </form>

          <div className="hm-sim-resultado">
            <span className="hm-eyebrow hm-eyebrow-claro">RESULTADO DA SIMULAÇÃO</span>

            <div aria-live="polite" aria-atomic="true">
              <span className="hm-sim-rotulo">Ticket estimado</span>
              <strong className="hm-sim-ticket">{formatarReais(resultado.ticket)}</strong>
              <span className="hm-sim-rotulo">por pessoa</span>
            </div>

            <dl className="hm-sim-detalhes">
              <div>
                <dt>Custo total</dt>
                <dd>{formatarReais(resultado.custo)}</dd>
              </div>
              <div>
                <dt>Custo por pessoa</dt>
                <dd>{formatarReais(resultado.custoPorPessoa)}</dd>
              </div>
            </dl>

            <p className="hm-formula">
              <Icone nome="bulb" tamanho={15} />
              <code>ticket = custo ÷ [público × (1 − margem)]</code>
            </p>

            <Link to={destino} className="hm-btn hm-btn-branco">
              {rotuloDestino} <Icone nome="arrow" tamanho={16} />
            </Link>
            <p className="hm-sim-nota">Simulação ilustrativa: os valores não são salvos.</p>
          </div>
        </div>
      </div>
    </section>
  );
}

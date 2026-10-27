import { Link } from "react-router-dom";
import Icone from "./Icones";
import { calcularTicket, formatarReais } from "../../utils/ticket";
import { obterSessao, rotaPainel } from "../../utils/sessao";

// Valores do cartão ilustrativo (não vêm do banco). O ticket é calculado
// com a mesma fórmula da calculadora para que o exemplo seja coerente.
const EXEMPLO = calcularTicket({ custo: 18450, publico: 500, margem: 20 });
const BARRAS = [46, 68, 54, 83, 62, 92, 74];

export default function HomeHero() {
  const painel = rotaPainel(obterSessao()?.usuario?.tipo);

  return (
    <section className="hm-hero" aria-labelledby="hm-hero-titulo">
      <div className="hm-container hm-hero-grid">
        <div className="hm-hero-texto">
          <span className="hm-selo">
            <Icone nome="sparkles" tamanho={14} /> Planejamento inteligente para eventos
          </span>

          <h1 id="hm-hero-titulo">
            Seu evento começa com <em>clareza.</em>
          </h1>

          <p className="hm-lead">
            Planeje seu evento. Encontre os serviços. Saiba quanto seu ingresso precisa custar.
          </p>
          <p className="hm-sub">
            Organize eventos, encontre fornecedores, compare propostas e tenha uma visão clara dos
            seus custos em um só lugar.
          </p>

          <div className="hm-hero-acoes">
            {painel ? (
              <Link to={painel} className="hm-btn hm-btn-primario">
                Ir para o painel <Icone nome="arrow" tamanho={17} />
              </Link>
            ) : (
              <Link to="/cadastro" className="hm-btn hm-btn-primario">
                Criar minha conta <Icone nome="arrow" tamanho={17} />
              </Link>
            )}
            <a href="#simulador" className="hm-btn hm-btn-secundario">
              <Icone nome="calc" tamanho={17} /> Simular meu ticket
            </a>
          </div>
        </div>

        <figure className="hm-preview" aria-label="Exemplo ilustrativo do painel de um evento">
          <div className="hm-preview-card">
            <div className="hm-preview-topo">
              <div>
                <span className="hm-eyebrow">VISÃO GERAL</span>
                <h3>Festa da Computação</h3>
              </div>
              <span className="hm-preview-tag">Exemplo ilustrativo</span>
            </div>

            <div className="hm-preview-numeros">
              <div>
                <small>Custo total</small>
                <strong>{formatarReais(EXEMPLO.custo)}</strong>
              </div>
              <div>
                <small>Ticket estimado</small>
                <strong>{formatarReais(EXEMPLO.ticket)}</strong>
                <span>margem de {EXEMPLO.margem}%</span>
              </div>
            </div>

            <div className="hm-preview-barras" aria-hidden="true">
              {BARRAS.map((altura, indice) => (
                <i key={indice} style={{ height: `${altura}%` }} />
              ))}
            </div>
          </div>
        </figure>
      </div>
    </section>
  );
}

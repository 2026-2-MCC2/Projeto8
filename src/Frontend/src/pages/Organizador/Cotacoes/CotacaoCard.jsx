import "./CotacaoCard.css";

function CotacaoCard({ cotacao, selecionada, onSelecionar }) {
  return (
    <article
      className={`cotacao-card ${
        selecionada ? "cotacao-card-selecionada" : ""
      }`}
    >
      <div className="cotacao-card-conteudo">
        <div className="cotacao-fornecedor">
          <div className="cotacao-avatar">{cotacao.iniciais}</div>

          <div className="cotacao-fornecedor-info">
            <h2>{cotacao.fornecedor}</h2>

            <p>{cotacao.servico}</p>
          </div>
        </div>

        <div className="cotacao-dados">
          <div>
            <span>Valor da proposta</span>

            <strong>{cotacao.valorFormatado}</strong>
          </div>

          <div>
            <span>Prazo de entrega</span>

            <strong>{cotacao.prazo}</strong>
          </div>

          <span
            className={`cotacao-status cotacao-status-${cotacao.status
              .toLowerCase()
              .replace(" ", "-")}`}
          >
            {cotacao.status}
          </span>
        </div>
      </div>

      <div className="cotacao-observacao">
        <span>□</span>
        {cotacao.observacao}
      </div>

      <div className="cotacao-acoes">
        <button
          type="button"
          className="cotacao-ver-proposta"
          disabled
          title="Detalhe da proposta em breve"
        >
          ◉ Ver proposta
        </button>

        <button
          type="button"
          className={`cotacao-selecionar ${
            selecionada ? "cotacao-selecionar-ativo" : ""
          }`}
          onClick={() => onSelecionar(cotacao.id)}
        >
          {selecionada ? "Selecionada" : "Selecionar"}
        </button>

        <button
          type="button"
          className="cotacao-recusar"
          disabled
          title="Recusa de proposta em breve"
        >
          ⊗ Recusar
        </button>
      </div>
    </article>
  );
}

export default CotacaoCard;

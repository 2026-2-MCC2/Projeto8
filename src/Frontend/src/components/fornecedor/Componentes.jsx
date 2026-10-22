import { Link } from "react-router-dom";
import Icon from "../organizador/Icon";

export function CabecalhoPagina({ eyebrow, titulo, descricao, acao }) {
  return (
    <section className="forn-heading">
      <div>
        <span className="forn-eyebrow">{eyebrow}</span>
        <h1>{titulo}</h1>
        {descricao && <p>{descricao}</p>}
      </div>
      {acao}
    </section>
  );
}

export function BotaoLink({ to, children, icone = "plus", variante = "primario", pequeno = false }) {
  return (
    <Link to={to} className={`forn-btn forn-btn-${variante}${pequeno ? " forn-btn-pequeno" : ""}`}>
      {icone && <Icon name={icone} />}
      {children}
    </Link>
  );
}

export function Badge({ classe, children }) {
  return <span className={`forn-badge ${classe}`}>{children}</span>;
}

export function Aviso({ tipo = "erro", children, onFechar }) {
  if (!children) return null;

  return (
    <div className={`forn-aviso ${tipo}`} role={tipo === "erro" ? "alert" : "status"}>
      <span>{children}</span>
      {onFechar && (
        <button type="button" onClick={onFechar} aria-label="Fechar aviso">
          ×
        </button>
      )}
    </div>
  );
}

export function EstadoCarregando({ texto = "Carregando..." }) {
  return <div className="forn-estado">{texto}</div>;
}

export function EstadoVazio({ icone = "calendar", titulo, texto, acao }) {
  return (
    <div className="forn-vazio">
      <div className="forn-vazio-icone">
        <Icon name={icone} />
      </div>
      <h2>{titulo}</h2>
      {texto && <p>{texto}</p>}
      {acao}
    </div>
  );
}

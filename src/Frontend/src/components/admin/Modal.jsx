import { useEffect } from "react";
import Icon from "../organizador/Icon";

export default function Modal({ eyebrow, title, onFechar, children }) {
  useEffect(() => {
    function aoPressionar(evento) {
      if (evento.key === "Escape") {
        onFechar();
      }
    }

    document.addEventListener("keydown", aoPressionar);

    return () => document.removeEventListener("keydown", aoPressionar);
  }, [onFechar]);

  return (
    <div className="adm-modal-overlay" onClick={onFechar}>
      <div
        className="adm-modal"
        role="dialog"
        aria-modal="true"
        onClick={(evento) => evento.stopPropagation()}
      >
        <div className="adm-modal-header">
          <div>
            {eyebrow && <span className="adm-eyebrow">{eyebrow}</span>}
            <h2>{title}</h2>
          </div>

          <button
            type="button"
            className="adm-modal-close"
            onClick={onFechar}
            aria-label="Fechar"
          >
            <Icon name="x" size={16} />
          </button>
        </div>

        {children}
      </div>
    </div>
  );
}
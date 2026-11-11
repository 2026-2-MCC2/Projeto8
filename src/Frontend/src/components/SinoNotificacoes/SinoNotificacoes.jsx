import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import Icon from "../organizador/Icon";
import { buscarNotificacoes } from "../../services/notificacoes";
import { formatarTempoRelativo } from "../../utils/formatadores";
import "./SinoNotificacoes.css";

// As notificações "vistas" ficam guardadas só neste navegador (sessionStorage),
// separadas por perfil e por usuário.
function chaveVistas(perfil) {
  let idUsuario = "anonimo";

  try {
    idUsuario = JSON.parse(sessionStorage.getItem("usuario"))?.id ?? "anonimo";
  } catch {
    // sem usuário na sessão: usa a chave "anonimo"
  }

  return `ticketlab:notificacoes-vistas:${perfil}:${idUsuario}`;
}

function lerVistas(chave) {
  try {
    return JSON.parse(sessionStorage.getItem(chave)) || [];
  } catch {
    return [];
  }
}

function salvarVistas(chave, ids) {
  try {
    sessionStorage.setItem(chave, JSON.stringify(ids));
  } catch {
    // sem armazenamento: o sininho funciona, só não lembra o que já foi visto
  }
}

export default function SinoNotificacoes({ perfil }) {
  const chave = chaveVistas(perfil);

  const [itens, setItens] = useState([]);
  const [erro, setErro] = useState(false);
  const [aberto, setAberto] = useState(false);
  const [vistas, setVistas] = useState(() => lerVistas(chave));
  const [destacadas, setDestacadas] = useState([]);
  const raiz = useRef(null);

  useEffect(() => {
    let ativo = true;

    buscarNotificacoes(perfil)
      .then((lista) => {
        if (ativo) setItens(lista);
      })
      .catch(() => {
        if (ativo) setErro(true);
      });

    return () => {
      ativo = false;
    };
  }, [perfil]);

  // Fecha o painel ao clicar fora dele ou ao apertar Esc.
  useEffect(() => {
    if (!aberto) return;

    function aoClicarFora(evento) {
      if (raiz.current && !raiz.current.contains(evento.target)) {
        setAberto(false);
      }
    }

    function aoApertarTecla(evento) {
      if (evento.key === "Escape") setAberto(false);
    }

    document.addEventListener("mousedown", aoClicarFora);
    document.addEventListener("keydown", aoApertarTecla);

    return () => {
      document.removeEventListener("mousedown", aoClicarFora);
      document.removeEventListener("keydown", aoApertarTecla);
    };
  }, [aberto]);

  const naoVistas = itens.filter((item) => !vistas.includes(item.id));

  function alternar() {
    if (aberto) {
      setAberto(false);
      return;
    }

    // Ao abrir: guarda quais eram novas (para destacar) e marca tudo como visto.
    setDestacadas(naoVistas.map((item) => item.id));

    const todas = itens.map((item) => item.id);
    setVistas(todas);
    salvarVistas(chave, todas);
    setAberto(true);
  }

  return (
    <div className="sino" ref={raiz}>
      <button
        type="button"
        className="org-notification"
        aria-label={
          naoVistas.length > 0
            ? `Notificações: ${naoVistas.length} novas`
            : "Notificações"
        }
        aria-haspopup="true"
        aria-expanded={aberto}
        onClick={alternar}
      >
        <Icon name="bell" />
        {naoVistas.length > 0 && <span />}
      </button>

      {aberto && (
        <div className="sino-painel" role="dialog" aria-label="Notificações">
          <header className="sino-topo">
            <strong>Notificações</strong>
            {destacadas.length > 0 && <small>{destacadas.length} novas</small>}
          </header>

          {erro ? (
            <p className="sino-vazio">Não foi possível carregar as notificações.</p>
          ) : itens.length === 0 ? (
            <p className="sino-vazio">Você não tem notificações no momento.</p>
          ) : (
            <ul className="sino-lista">
              {itens.slice(0, 8).map((item) => (
                <li key={item.id}>
                  <Link
                    to={item.destino}
                    className={`sino-item ${destacadas.includes(item.id) ? "nova" : ""}`}
                    onClick={() => setAberto(false)}
                  >
                    <span className="sino-icone">
                      <Icon name={item.icone} />
                    </span>

                    <span className="sino-texto">
                      <strong>{item.titulo}</strong>
                      <span>{item.descricao}</span>
                      <small>{formatarTempoRelativo(item.quando)}</small>
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}
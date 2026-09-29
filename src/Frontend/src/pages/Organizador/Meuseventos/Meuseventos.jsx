import "./Meuseventos.css";
import { Link } from "react-router-dom";
import { useEffect, useMemo, useState } from "react";
import { apiRequest } from "../../../services/api";

function Icon({ name }) {
  const icons = {
    dashboard: (
      <>
        <path d="M3 11.5 12 4l9 7.5" />
        <path d="M5.5 10.5V20h13v-9.5" />
        <path d="M9 20v-5h6v5" />
      </>
    ),

    calendar: (
      <>
        <rect x="3" y="5" width="18" height="16" rx="2" />
        <path d="M7 3v4M17 3v4M3 10h18" />
      </>
    ),

    search: (
      <>
        <circle cx="10.5" cy="10.5" r="6.5" />
        <path d="m16 16 5 5" />
      </>
    ),

    quote: (
      <>
        <rect x="4" y="3" width="16" height="18" rx="2" />
        <path d="M8 8h8M8 12h8M8 16h5" />
      </>
    ),

    chart: (
      <>
        <path d="M4 19V5M4 19h17" />
        <path d="m8 15 3-4 3 2 5-7" />
      </>
    ),

    ticket: (
      <>
        <path d="M4 7h16v3a2 2 0 0 0 0 4v3H4v-3a2 2 0 0 0-4v-3a2 2 0 0 0 0-4V7Z" />
        <path d="M12 8.5v7" />
      </>
    ),

    settings: (
      <>
        <circle cx="12" cy="12" r="3" />
        <path d="M19 15.5a1.7 1.7 0 0 0 .4 1.8l.1.1-1.8 1.8-.1-.1a1.7 1.7 0 0 0-1.9-.3 1.7 1.7 0 0 0-1 1.5v.1h-2.6v-.1a1.7 1.7 0 0 0-1-1.5 1.7 1.7 0 0 0-1.9.3l-.1.1-1.8-1.8.1-.1A1.7 1.7 0 0 0 8 15a1.7 1.7 0 0 0-1.5-1H6.4v-2.6h.1A1.7 1.7 0 0 0 8 10a1.7 1.7 0 0 0-.3-1.9l-.1-.1 1.8-1.8.1.1a1.7 1.7 0 0 0 1.9.3 1.7 1.7 0 0 0 1-1.5V5h2.6v.1a1.7 1.7 0 0 0 1 1.5 1.7 1.7 0 0 0 1.9-.3l.1-.1 1.8 1.8-.1.1a1.7 1.7 0 0 0-.3 1.9 1.7 1.7 0 0 0 1.5 1h.1V14h-.1A1.7 1.7 0 0 0 19 15.5Z" />
      </>
    ),

    help: (
      <>
        <circle cx="12" cy="12" r="9" />
        <path d="M9.8 9a2.3 2.3 0 1 1 3.8 1.7c-1 .8-1.6 1.2-1.6 2.6" />
        <path d="M12 16.7h.01" />
      </>
    ),

    bell: (
      <>
        <path d="M18 9a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9" />
        <path d="M10 21h4" />
      </>
    ),

    plus: (
      <>
        <path d="M12 5v14" />
        <path d="M5 12h14" />
      </>
    ),

    arrow: <path d="m9 18 6-6-6-6" />,

    filter: (
      <>
        <path d="M4 5h16" />
        <path d="M7 12h10" />
        <path d="M10 19h4" />
      </>
    ),

    chevron: <path d="m8 10 4 4 4-4" />,
  };

  return (
    <svg
      className="meus-eventos-icon"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      {icons[name]}
    </svg>
  );
}

function Meuseventos() {
  const [eventos, setEventos] = useState([]);
  const [busca, setBusca] = useState("");
  const [filtro, setFiltro] = useState("TODOS");
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState("");

  const usuario = JSON.parse(sessionStorage.getItem("usuario") || "null");

  useEffect(() => {
    async function carregarEventos() {
      try {
        setErro("");

        const dados = await apiRequest("/eventos");

        setEventos(Array.isArray(dados) ? dados : []);
      } catch (error) {
        setErro(error.message);
      } finally {
        setCarregando(false);
      }
    }

    carregarEventos();
  }, []);

  const primeiroNome = usuario?.nome?.trim()?.split(" ")[0] || "Organizador";

  const iniciais = (usuario?.nome || "Organizador")
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((nome) => nome[0])
    .join("")
    .toUpperCase();

  const eventosFiltrados = useMemo(() => {
    return eventos.filter((evento) => {
      const textoBusca = busca.toLowerCase().trim();

      const correspondeBusca =
        !textoBusca ||
        evento.nome?.toLowerCase().includes(textoBusca) ||
        evento.local?.toLowerCase().includes(textoBusca);

      const correspondeFiltro = filtro === "TODOS" || evento.status === filtro;

      return correspondeBusca && correspondeFiltro;
    });
  }, [eventos, busca, filtro]);

  function formatarData(data) {
    if (!data) {
      return {
        dia: "--",
        mes: "---",
      };
    }

    const dataObj = new Date(`${data}T00:00:00`);

    if (Number.isNaN(dataObj.getTime())) {
      return {
        dia: "--",
        mes: "---",
      };
    }

    return {
      dia: dataObj.toLocaleDateString("pt-BR", {
        day: "2-digit",
      }),

      mes: dataObj.toLocaleDateString("pt-BR", {
        month: "2-digit",
      }),
    };
  }

  function formatarDataCompleta(data, horario) {
    if (!data) {
      return "Data não informada";
    }

    const dataObj = new Date(`${data}T00:00:00`);

    if (Number.isNaN(dataObj.getTime())) {
      return "Data não informada";
    }

    const dataFormatada = dataObj.toLocaleDateString("pt-BR");

    if (!horario) {
      return dataFormatada;
    }

    return `${dataFormatada} às ${horario.slice(0, 5)}`;
  }

  function statusLabel(status) {
    const labels = {
      PLANEJAMENTO: "Em planejamento",
      CONFIRMADO: "Confirmado",
      CANCELADO: "Cancelado",
      CONCLUIDO: "Concluído",
      CONCLUÍDO: "Concluído",
    };

    return labels[status] || status || "Sem status";
  }

  function classeStatus(status) {
    return (
      {
        PLANEJAMENTO: "planejamento",
        CONFIRMADO: "confirmado",
        CANCELADO: "cancelado",
        CONCLUIDO: "concluido",
        CONCLUÍDO: "concluido",
      }[status] || "planejamento"
    );
  }

  return (
    <div className="meus-eventos-page">
      {/* =========================
          SIDEBAR
      ========================= */}

      <aside className="meus-eventos-sidebar">
        <Link to="/" className="meus-eventos-logo">
          <span>✦</span>
          TicketLab
        </Link>

        <div className="meus-eventos-role">
          <span className="role-dot" />

          <strong>Organizador</strong>

          <span className="role-chevron">⌄</span>
        </div>

        <nav className="meus-eventos-nav">
          <Link to="/dashboard" className="meus-eventos-nav-link">
            <Icon name="dashboard" />
            Dashboard
          </Link>

          <Link to="/meus-eventos" className="meus-eventos-nav-link active">
            <Icon name="calendar" />
            Meus eventos
          </Link>

          <Link to="/buscar-servicos" className="meus-eventos-nav-link">
            <Icon name="search" />
            Buscar serviços
          </Link>

          <Link to="/cotacoes" className="meus-eventos-nav-link">
            <Icon name="quote" />
            Cotações
            <span className="nav-badge">3</span>
          </Link>

          <Link to="/resumo-custos" className="meus-eventos-nav-link">
            <Icon name="chart" />
            Resumo de custos
          </Link>

          <Link to="/calculo-ticket" className="meus-eventos-nav-link">
            <Icon name="ticket" />
            Cálculo do ticket
          </Link>

          <Link to="/minha-conta" className="meus-eventos-nav-link">
            <Icon name="settings" />
            Minha conta
          </Link>
        </nav>

        <div className="meus-eventos-help">
          <Icon name="help" />

          <div>
            <strong>Precisa de ajuda?</strong>
            <span>Fale com nosso suporte</span>
          </div>
        </div>
      </aside>

      {/* =========================
          CONTEÚDO
      ========================= */}

      <div className="meus-eventos-main">
        {/* TOPBAR */}

        <header className="meus-eventos-topbar">
          <div className="meus-eventos-breadcrumb">
            <span>Workspace</span>
            <span>/</span>
            <strong>Organizador</strong>
          </div>

          <div className="meus-eventos-user">
            <button
              type="button"
              className="notification-button"
              aria-label="Notificações"
            >
              <Icon name="bell" />
              <span />
            </button>

            <div className="user-profile">
              <div className="user-avatar">{iniciais}</div>

              <div className="user-info">
                <strong>{usuario?.nome || primeiroNome}</strong>

                <span>Organizador</span>
              </div>

              <span className="user-chevron">⌄</span>
            </div>
          </div>
        </header>

        {/* CONTEÚDO */}

        <main className="meus-eventos-content">
          <section className="meus-eventos-heading">
            <div>
              <span className="meus-eventos-eyebrow">MEUS EVENTOS</span>

              <h1>Meus eventos</h1>

              <p>
                Gerencie os eventos que você está planejando e acompanhe seus
                custos e cotações.
              </p>
            </div>

            <Link to="/criar-evento" className="criar-evento-button">
              <Icon name="plus" />
              Criar novo evento
            </Link>
          </section>

          {/* BUSCA E FILTRO */}

          <section className="eventos-filtros">
            <div className="busca-eventos">
              <Icon name="search" />

              <input
                type="search"
                placeholder="Buscar evento..."
                value={busca}
                onChange={(event) => setBusca(event.target.value)}
              />
            </div>

            <div className="filtro-eventos">
              <Icon name="filter" />

              <select
                value={filtro}
                onChange={(event) => setFiltro(event.target.value)}
              >
                <option value="TODOS">Todos</option>

                <option value="PLANEJAMENTO">Em planejamento</option>

                <option value="CONFIRMADO">Confirmados</option>

                <option value="CONCLUIDO">Concluídos</option>

                <option value="CANCELADO">Cancelados</option>
              </select>

              <Icon name="chevron" />
            </div>
          </section>

          {/* ESTADOS */}

          {carregando && (
            <div className="eventos-status">Carregando eventos...</div>
          )}

          {erro && <div className="eventos-status erro">{erro}</div>}

          {!carregando && !erro && eventosFiltrados.length === 0 && (
            <div className="eventos-vazio">
              <div className="eventos-vazio-icon">
                <Icon name="calendar" />
              </div>

              <h2>
                {eventos.length === 0
                  ? "Você ainda não possui eventos"
                  : "Nenhum evento encontrado"}
              </h2>

              <p>
                {eventos.length === 0
                  ? "Crie seu primeiro evento para começar o planejamento."
                  : "Tente alterar sua busca ou o filtro selecionado."}
              </p>

              {eventos.length === 0 && (
                <Link to="/criar-evento">Criar novo evento</Link>
              )}
            </div>
          )}

          {/* CARDS */}

          {!carregando && !erro && eventosFiltrados.length > 0 && (
            <section className="eventos-grid">
              {eventosFiltrados.map((evento) => {
                const data = formatarData(evento.data_evento);

                return (
                  <article className="evento-card" key={evento.id}>
                    <div className="evento-card-top">
                      <div className="evento-card-date">
                        <strong>{data.dia}</strong>

                        <span>
                          {data.mes} /{" "}
                          {new Date(
                            `${evento.data_evento}T00:00:00`
                          ).getFullYear()}
                        </span>
                      </div>

                      <span
                        className={`evento-status ${classeStatus(
                          evento.status
                        )}`}
                      >
                        {statusLabel(evento.status)}
                      </span>
                    </div>

                    <div className="evento-card-body">
                      <h2>{evento.nome}</h2>

                      <p>
                        {evento.descricao ||
                          "Evento universitário em planejamento."}
                      </p>
                    </div>

                    <div className="evento-card-footer">
                      <span>
                        <Icon name="calendar" />

                        {formatarDataCompleta(
                          evento.data_evento,
                          evento.horario
                        )}
                      </span>

                      <Link
                        to={`/meus-eventos/${evento.id}`}
                        className="evento-card-arrow"
                        aria-label={`Ver ${evento.nome}`}
                      >
                        <Icon name="arrow" />
                      </Link>
                    </div>
                  </article>
                );
              })}
            </section>
          )}
        </main>
      </div>
    </div>
  );
}

export default Meuseventos;

import "./DashboardOrganizador.css";
import { Link } from "react-router-dom";
import { useEffect, useState } from "react";
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

    download: (
      <>
        <path d="M12 3v12" />
        <path d="m7 10 5 5 5-5" />
        <path d="M5 21h14" />
      </>
    ),

    arrow: <path d="m9 18 6-6-6-6" />,

    plus: (
      <>
        <path d="M12 5v14" />
        <path d="M5 12h14" />
      </>
    ),

    menu: (
      <>
        <circle cx="5" cy="12" r="1" />
        <circle cx="12" cy="12" r="1" />
        <circle cx="19" cy="12" r="1" />
      </>
    ),
  };

  return (
    <svg
      className="dashboard-icon"
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

function DashboardOrganizador() {
  const [eventos, setEventos] = useState([]);
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

  const planejamento = eventos.filter(
    (evento) => evento.status === "PLANEJAMENTO"
  ).length;

  const confirmados = eventos.filter(
    (evento) => evento.status === "CONFIRMADO"
  ).length;

  const concluidos = eventos.filter(
    (evento) => evento.status === "CONCLUIDO" || evento.status === "CONCLUÍDO"
  ).length;

  const primeiroNome = usuario?.nome?.trim()?.split(" ")[0] || "Organizador";

  const iniciais = (usuario?.nome || "Organizador")
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((nome) => nome[0])
    .join("")
    .toUpperCase();

  const dataAtual = new Intl.DateTimeFormat("pt-BR", {
    weekday: "long",
    day: "2-digit",
    month: "long",
    year: "numeric",
  })
    .format(new Date())
    .toUpperCase();

  function eventoData(data) {
    const dataFormatada = new Date(`${data}T00:00:00`);

    if (Number.isNaN(dataFormatada.getTime())) {
      return {
        dia: "--",
        mes: "---",
      };
    }

    return {
      dia: dataFormatada.toLocaleDateString("pt-BR", {
        day: "2-digit",
      }),

      mes: dataFormatada
        .toLocaleDateString("pt-BR", {
          month: "short",
        })
        .replace(".", "")
        .toUpperCase(),
    };
  }

  function statusLabel(status) {
    return (
      {
        PLANEJAMENTO: "Em planejamento",
        CONFIRMADO: "Confirmado",
        CANCELADO: "Cancelado",
        CONCLUIDO: "Concluído",
        CONCLUÍDO: "Concluído",
      }[status] || status
    );
  }

  function exportarDados() {
    const blob = new Blob([JSON.stringify(eventos, null, 2)], {
      type: "application/json",
    });

    const url = URL.createObjectURL(blob);

    const link = document.createElement("a");

    link.href = url;
    link.download = "ticketlab-eventos.json";

    link.click();

    URL.revokeObjectURL(url);
  }

  const atividades = eventos.slice(0, 3);

  return (
    <div className="dashboard-container">
      {/* SIDEBAR */}

      <aside className="sidebar">
        <Link to="/" className="sidebar-logo">
          <span className="sidebar-logo-mark">✦</span>
          TicketLab
        </Link>

        <div className="sidebar-profile">
          <span className="profile-dot" />

          <strong>Organizador</strong>

          <span className="profile-chevron">⌄</span>
        </div>

        <nav className="sidebar-nav" aria-label="Navegação principal">
          <Link to="/dashboard" className="sidebar-link active">
            <Icon name="dashboard" />
            <span>Dashboard</span>
          </Link>

          <Link to="/meus-eventos" className="sidebar-link">
            <Icon name="calendar" />
            <span>Meus eventos</span>
          </Link>

          <Link to="/buscar-servicos" className="sidebar-link">
            <Icon name="search" />
            <span>Buscar serviços</span>
          </Link>

          <Link to="/cotacoes" className="sidebar-link">
            <Icon name="quote" />
            <span>Cotações</span>

            <span className="sidebar-badge">3</span>
          </Link>

          <Link to="/resumo-custos" className="sidebar-link">
            <Icon name="chart" />
            <span>Resumo de custos</span>
          </Link>

          <Link to="/calculo-ticket" className="sidebar-link">
            <Icon name="ticket" />
            <span>Cálculo do ticket</span>
          </Link>

          <Link to="/minha-conta" className="sidebar-link">
            <Icon name="settings" />
            <span>Minha conta</span>
          </Link>
        </nav>

        <div className="sidebar-help">
          <Icon name="help" />

          <div>
            <strong>Precisa de ajuda?</strong>

            <span>Fale com nosso suporte</span>
          </div>
        </div>
      </aside>

      {/* CONTEÚDO */}

      <div className="dashboard-main">
        {/* TOPBAR */}

        <header className="topbar">
          <div className="breadcrumb">
            <span>Workspace</span>
            <span>/</span>
            <strong>Organizador</strong>
          </div>

          <div className="topbar-user">
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

              <div className="user-data">
                <strong>{usuario?.nome || "Organizador"}</strong>

                <span>Organizador</span>
              </div>

              <span className="user-chevron">⌄</span>
            </div>
          </div>
        </header>

        {/* DASHBOARD */}

        <main className="dashboard-content-area">
          {/* CABEÇALHO */}

          <section className="dashboard-heading">
            <div>
              <span className="dashboard-date">{dataAtual}</span>

              <h1>Olá, {primeiroNome}!</h1>

              <p>
                Tenha uma visão geral dos seus eventos e acompanhe seu
                planejamento.
              </p>
            </div>

            <button
              type="button"
              className="export-button"
              onClick={exportarDados}
            >
              <span>Exportar dados</span>
              <Icon name="download" />
            </button>
          </section>

          {/* CARDS */}

          <section className="summary-grid">
            <article className="summary-card">
              <div className="summary-icon blue">
                <Icon name="calendar" />
              </div>

              <div>
                <span>Eventos em planejamento</span>

                <strong>{planejamento}</strong>

                <small>Eventos ativos no planejamento</small>
              </div>
            </article>

            <article className="summary-card">
              <div className="summary-icon green">
                <Icon name="calendar" />
              </div>

              <div>
                <span>Eventos confirmados</span>

                <strong>{confirmados}</strong>

                <small>Eventos já confirmados</small>
              </div>
            </article>

            <article className="summary-card">
              <div className="summary-icon orange">
                <Icon name="chart" />
              </div>

              <div>
                <span>Eventos concluídos</span>

                <strong>{concluidos}</strong>

                <small>Eventos finalizados</small>
              </div>
            </article>

            <article className="summary-card">
              <div className="summary-icon purple">
                <Icon name="ticket" />
              </div>

              <div>
                <span>Custo planejado</span>

                <strong>—</strong>

                <small>Sem custos registrados</small>
              </div>
            </article>
          </section>

          {/* PAINÉIS */}

          <section className="dashboard-panels">
            {/* EVENTOS */}

            <article className="panel events-panel">
              <div className="panel-header">
                <div>
                  <h2>Meus eventos</h2>

                  <p>Acompanhe o andamento dos seus projetos.</p>
                </div>

                <Link to="/meus-eventos" className="panel-link">
                  Ver todos
                  <Icon name="arrow" />
                </Link>
              </div>

              {carregando && (
                <div className="empty-state">Carregando eventos...</div>
              )}

              {erro && <div className="empty-state error">{erro}</div>}

              {!carregando && !erro && eventos.length === 0 && (
                <div className="empty-state">
                  <strong>Você ainda não possui eventos.</strong>

                  <Link to="/criar-evento">Criar primeiro evento</Link>
                </div>
              )}

              {!carregando && !erro && eventos.length > 0 && (
                <div className="events-list">
                  {eventos.slice(0, 4).map((evento) => {
                    const data = eventoData(evento.data_evento);

                    return (
                      <div className="event-row" key={evento.id}>
                        <div className="event-date">
                          <strong>{data.dia}</strong>

                          <span>{data.mes}</span>
                        </div>

                        <div className="event-info">
                          <strong>{evento.nome}</strong>

                          <div>
                            <span>⌖ {evento.local}</span>

                            <span>
                              ♧ {evento.publico_min}–{evento.publico_max}{" "}
                              pessoas
                            </span>
                          </div>
                        </div>

                        <span
                          className={`event-status ${evento.status?.toLowerCase()}`}
                        >
                          {statusLabel(evento.status)}
                        </span>

                        <Icon name="arrow" />
                      </div>
                    );
                  })}
                </div>
              )}
            </article>

            {/* ATIVIDADE */}

            <article className="panel activity-panel">
              <div className="panel-header">
                <div>
                  <h2>Atividade recente</h2>

                  <p>Últimas movimentações.</p>
                </div>

                <button
                  type="button"
                  className="panel-menu"
                  aria-label="Mais opções"
                >
                  <Icon name="menu" />
                </button>
              </div>

              {atividades.length === 0 ? (
                <div className="empty-state">Nenhuma atividade recente.</div>
              ) : (
                <div className="activity-list">
                  {atividades.map((evento) => {
                    const tipo =
                      evento.status === "CONFIRMADO"
                        ? "success"
                        : evento.status === "CANCELADO"
                        ? "warning"
                        : "primary";

                    const titulo =
                      evento.status === "CONFIRMADO"
                        ? "Evento confirmado"
                        : evento.status === "CANCELADO"
                        ? "Evento cancelado"
                        : "Evento em planejamento";

                    return (
                      <div className="activity-row" key={evento.id}>
                        <div className={`activity-icon ${tipo}`}>
                          <Icon
                            name={tipo === "success" ? "calendar" : "quote"}
                          />
                        </div>

                        <div className="activity-info">
                          <strong>{titulo}</strong>

                          <span>{evento.nome}</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </article>
          </section>

          {/* AÇÕES RÁPIDAS */}

          <section className="panel quick-actions-panel">
            <div className="quick-actions-title">AÇÕES RÁPIDAS</div>

            <div className="quick-actions">
              <Link to="/criar-evento" className="quick-action">
                <span className="quick-icon blue">
                  <Icon name="plus" />
                </span>

                <span>
                  <strong>Criar evento</strong>

                  <small>Comece um novo planejamento</small>
                </span>

                <Icon name="arrow" />
              </Link>

              <button type="button" className="quick-action">
                <span className="quick-icon orange">
                  <Icon name="search" />
                </span>

                <span>
                  <strong>Buscar serviços</strong>

                  <small>Encontre seus parceiros</small>
                </span>

                <Icon name="arrow" />
              </button>

              <button type="button" className="quick-action">
                <span className="quick-icon green">
                  <Icon name="quote" />
                </span>

                <span>
                  <strong>Ver cotações</strong>

                  <small>Acompanhe suas propostas</small>
                </span>

                <Icon name="arrow" />
              </button>
            </div>
          </section>
        </main>
      </div>
    </div>
  );
}

export default DashboardOrganizador;

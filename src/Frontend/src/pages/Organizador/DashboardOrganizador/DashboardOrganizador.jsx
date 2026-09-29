import "./DashboardOrganizador.css";
import { Link } from "react-router-dom";
import LayoutOrganizador from "../../../components/organizador/LayoutOrganizador";
import Icon from "../../../components/organizador/Icon";
import { useEffect, useState } from "react";
import { apiRequest } from "../../../services/api";

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
    <LayoutOrganizador active="dashboard">
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
  </LayoutOrganizador>
  );
}

export default DashboardOrganizador;

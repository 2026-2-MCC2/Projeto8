import "./Meuseventos.css";
import { Link } from "react-router-dom";
import LayoutOrganizador from "../../../components/organizador/LayoutOrganizador";
import Icon from "../../../components/organizador/Icon";
import { useEffect, useMemo, useState } from "react";
import { apiRequest } from "../../../services/api";
import { formatarDataEvento, formatarDataCompleta } from "../../../utils/datas";

function Meuseventos() {
  const [eventos, setEventos] = useState([]);
  const [busca, setBusca] = useState("");
  const [filtro, setFiltro] = useState("TODOS");
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState("");

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
    const dataFormatada = formatarDataEvento(data);

    return {
      dia: dataFormatada.dia,
      mes: dataFormatada.mes,
    };
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
    <LayoutOrganizador active="meus-eventos">
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

                      <span
                        className="evento-card-arrow evento-card-arrow-disabled"
                        aria-label="Detalhes do evento em breve"
                        title="Detalhes do evento em breve"
                      >
                        <Icon name="arrow" />
                      </span>
                    </div>
                  </article>
                );
              })}
            </section>
          )}
      </main>
  </LayoutOrganizador>
  );
}

export default Meuseventos;

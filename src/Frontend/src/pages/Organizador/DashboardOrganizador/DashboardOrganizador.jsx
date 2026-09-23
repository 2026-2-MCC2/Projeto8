import "./DashboardOrganizador.css";
import { Link } from "react-router-dom";
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

        setEventos(dados);
      } catch (error) {
        setErro(error.message);
      } finally {
        setCarregando(false);
      }
    }

    carregarEventos();
  }, []);

  const eventosPlanejamento = eventos.filter(
    (evento) => evento.status === "PLANEJAMENTO",
  ).length;

  const eventosConfirmados = eventos.filter(
    (evento) => evento.status === "CONFIRMADO",
  ).length;

  const eventosCancelados = eventos.filter(
    (evento) => evento.status === "CANCELADO",
  ).length;

  return (
    <div className="dashboard-container">
      <aside className="sidebar">
        <h2>TicketLab</h2>
        <nav>
          <Link to="/dashboard">Dashboard</Link>
          <Link to="/meus-eventos">Meus eventos</Link>
          <Link to="/buscar-servicos">Buscar serviços</Link>
          <Link to="/cotacoes">Cotações</Link>
          <Link to="/resumo-custos">Resumo de custos</Link>
          <Link to="/calculo-ticket">Cálculo do ticket</Link>
        </nav>
        <div className="sidebar-bottom">
          <Link to="/minha-conta">Minha conta</Link>
          <Link to="/login">Sair</Link>
        </div>
      </aside>
      <main className="dashboard-OrganizadorContainer">
        <header className="cabecalho">
          <h1 className="title-dashboard">Olá, Organizador!</h1>
          <p className="descricao-dashboard">
            Tenha uma visão geral dos seus eventos e acompanhe seu planejamento.
          </p>
          <h2 className="nome-dashboard">{usuario?.nome || "Organizador"}</h2>
        </header>
        <section className="resumo-cards">
          <article className="resumo-card">
            <span>Eventos em planejamento</span>
            <strong>{eventosPlanejamento}</strong>
          </article>
          <article className="resumo-card">
            <span>Eventos confirmados</span>
            <strong>{eventosConfirmados}</strong>
          </article>
          <article className="resumo-card">
            <span>Eventos cancelados </span>
            <strong>{eventosCancelados}</strong>
          </article>
        </section>
        <section className="dashboard-content">
          <article className="acoes-card">
            <h2>Ações rápidas</h2>
            <Link to="/criar-evento">+ Criar evento</Link>
            <button>Buscar serviços</button>
            <button>Ver cotações</button>
          </article>
          <article className="eventos-card">
            <div className="eventos-header">
              <h2>Meus eventos</h2>
              <Link to="/criar-evento">+ Criar novo evento</Link>
            </div>
            <div className="eventos-main">
              <div className="eventos-colunas">
                <span>Evento</span>
                <span>Data</span>
                <span>Público esperado</span>
                <span>Status</span>
              </div>
              {carregando && <p>Carregando eventos...</p>}

              {erro && <p className="mensagem-erro">{erro}</p>}

              {!carregando && !erro && eventos.length === 0 && (
                <p>Você ainda não possui eventos.</p>
              )}

              {!carregando &&
                !erro &&
                eventos.map((evento) => (
                  <div className="evento" key={evento.id}>
                    <span>{evento.nome}</span>

                    <span>
                      {new Date(evento.data_evento).toLocaleDateString("pt-BR")}
                    </span>

                    <span>
                      {evento.publico_min} – {evento.publico_max}
                    </span>

                    <span>{evento.status}</span>
                  </div>
                ))}
            </div>
          </article>
        </section>
      </main>
    </div>
  );
}
export default DashboardOrganizador;

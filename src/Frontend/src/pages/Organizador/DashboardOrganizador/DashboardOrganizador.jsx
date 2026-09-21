import "./DashboardOrganizador.css";
import { Link } from "react-router-dom";
function DashboardOrganizador() {
  return (
    <div className="dashboard-container">
      <aside className="sidebar">
        <h2>TrocaTicket</h2>
        <nav>
          <Link to="/dashboardorganizador">Dashboard</Link>
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
          <h2 className="nome-dashboard">Brian Walter</h2>
        </header>
        <section className="resumo-cards">
          <article className="resumo-card">
            <span>Eventos em planejamento</span>
            <strong>2</strong>
          </article>
          <article className="resumo-card">
            <span>Eventos confirmados</span>
            <strong>1</strong>
          </article>
          <article className="resumo-card">
            <span>Eventos concluidos </span>
            <strong>1</strong>
          </article>
        </section>
        <section className="dashboard-content">
          <article className="acoes-card">
            <h2>Ações rápidas</h2>
            <button>+ Criar evento</button>
            <button>Buscar serviços</button>
            <button>Ver cotações</button>
          </article>
          <article className="eventos-card">
            <div className="eventos-header">
              <h2>Meus eventos</h2>
              <button>+ Criar novo evento</button>
            </div>
            <div className="eventos-main">
              <div className="eventos-colunas">
                <span>Evento</span>
                <span>Data</span>
                <span>Público esperado</span>
                <span>Status</span>
              </div>
              <div className="evento">
                <span>Festa da Computação</span>
                <span>15/10/2026</span>
                <span>300–500</span>
                <span>Em planejamento</span>
              </div>
              <div className="evento">
                <span>Choppada Universitária</span>
                <span>20/11/2026</span>
                <span>500–800</span>
                <span>Em planejamento</span>
              </div>
            </div>
          </article>
        </section>
      </main>
    </div>
  );
}
export default DashboardOrganizador;

import { Link, useNavigate } from "react-router-dom";
import "./Meuseventos.css";
import { useState } from "react";

function meuseventos() {
  const [status, setStatus] = useState(false);
  return (
    <div className="meuseventos-container">
      <aside className="sidebar-organizador">
        <h2>TrocaTicket</h2>

        <nav>
          <Link to="/dashboard">Dashboard</Link>
          <Link to="/meuseventos">Meus eventos</Link>
          <Link to="/buscar-servicos">Buscar serviços</Link>
          <Link to="/cotacoes">Cotações</Link>
          <Link to="/resumo-custos">Resumo de custos</Link>
          <Link to="/calculo-ticket">Cálculo do ticket</Link>
        </nav>
        <div className="sidebar-bottom">
          <Link to="/minha-conta">Minha conta</Link>
          <Link to="/sair">Sair</Link>
        </div>
      </aside>
      <main className="meuseventosOrganizador-container">
        <header className="cabecalho-meuseventos">
          <h1 className="title-meuseventos">Meus eventos</h1>
          <p className="descricao-meuseventos">
            Gerencie os eventos que você está planejando e acompanhe seus
            respectivos custos e cotações. Criar novo evento
          </p>
          <button type="submit"> + Cria novo evento</button>
        </header>
        <section className="barra-pesquisa">
          <form>
            <label htmlFor="barra-pesquisa">
              <input
                type="text"
                id="barra-pesquisa"
                placeholder="🔎 Pesquisa evento ..."
              />
            </label>
            <label htmlFor="status-eventos">
              <select
                value={status}
                id="status-eventos"
                onChange={(e) => setStatus(e.target.value)}
              >
                <option value="">Todos os eventos</option>
                <option value="Em planejamento">Em planejamento</option>
                <option value="Confirmado">Confirmado</option>
                <option value="Cancelados">Cancelados</option>
              </select>
            </label>
          </form>
        </section>
      </main>
    </div>
  );
}

export default meuseventos;

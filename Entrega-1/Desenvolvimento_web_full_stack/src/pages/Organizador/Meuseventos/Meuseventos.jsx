import { Link } from "react-router-dom";
import "./Meuseventos.css";
import { useState } from "react";

function MeusEventos() {
  const [status, setStatus] = useState("");
  const eventos = [
    {
      nome: "Festa da Computação",
      data: "15/10/2026",
      horario: "22:00",
      local: "São Paulo",
      publico: "300 – 500 pessoas",
      custos: "R$ 0,00",
      servicos: 0,
      status: "Em planejamento",
    },
    {
      nome: "Choppada Universitária",
      data: "20/11/2026",
      horario: "21:00",
      local: "São Paulo",
      publico: "500 – 800 pessoas",
      custos: "R$ 0,00",
      servicos: 0,
      status: "Em planejamento",
    },
  ];
  const eventosFiltrados =
    status === ""
      ? eventos
      : eventos.filter((evento) => evento.status === status);
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
          <div className="cabecalho-meuseventos-texto">
            <h1 className="title-meuseventos">Meus eventos</h1>

            <p className="descricao-meuseventos">
              Gerencie os eventos que você está planejando e acompanhe seus
              respectivos custos e cotações.
            </p>
          </div>

          <button type="button">+ Criar novo evento</button>
        </header>

        <section className="barra-pesquisa">
          <form>
            <label htmlFor="barra-pesquisa">
              <input
                type="text"
                id="barra-pesquisa"
                placeholder="🔎 Pesquisar evento..."
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

        <section className="eventos-listados">
          {eventosFiltrados.length === 0 ? (
            <div className="estado-vazio">
              <div className="estado-vazio-icone">▣</div>

              <h2>Você ainda não possui eventos.</h2>

              <p>Crie seu primeiro evento para começar o planejamento.</p>

              <button type="button">+ Criar novo evento</button>
            </div>
          ) : (
            eventosFiltrados.map((evento) => (
              <article className="meuseventos-card" key={evento.nome}>
                <div className="evento-header">
                  <div className="evento-titulo">
                    <span>{evento.nome}</span>

                    <span className="evento-status">{evento.status}</span>
                  </div>

                  <div className="evento-acoes">
                    <button type="button">Editar</button>

                    <button type="button">Ver detalhes</button>
                  </div>
                </div>

                <div className="evento-dados">
                  <div>
                    <span>Data</span>
                    <strong>{evento.data}</strong>
                  </div>

                  <div>
                    <span>Horário</span>
                    <strong>{evento.horario}</strong>
                  </div>

                  <div>
                    <span>Local</span>
                    <strong>{evento.local}</strong>
                  </div>

                  <div>
                    <span>Público</span>
                    <strong>{evento.publico}</strong>
                  </div>

                  <div>
                    <span>Custos cadastrados</span>
                    <strong>{evento.custos}</strong>
                  </div>

                  <div>
                    <span>Serviços selecionados</span>
                    <strong>{evento.servicos}</strong>
                  </div>
                </div>
              </article>
            ))
          )}
        </section>
      </main>

      <footer className="rodape">
        © 2026 TrocaTicket · Todos os direitos reservados
      </footer>
    </div>
  );
}

export default MeusEventos;

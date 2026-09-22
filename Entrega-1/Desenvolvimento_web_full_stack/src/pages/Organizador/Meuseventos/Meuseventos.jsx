import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

import "./Meuseventos.css";

import { apiRequest } from "../../../services/api";

function MeusEventos() {
  const [eventos, setEventos] = useState([]);
  const [status, setStatus] = useState("");
  const [pesquisa, setPesquisa] = useState("");

  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState("");

  useEffect(() => {
    async function carregarEventos() {
      try {
        setErro("");

        // Busca no backend os eventos do organizador logado.
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

  // Converte o status salvo no banco
  // para o texto que será mostrado na tela.
  function formatarStatus(statusEvento) {
    const statusFormatado = {
      PLANEJAMENTO: "Em planejamento",
      CONFIRMADO: "Confirmado",
      CANCELADO: "Cancelado",
    };

    return statusFormatado[statusEvento] || statusEvento;
  }

  // Formata a data recebida da API.
  function formatarData(data) {
    if (!data) {
      return "-";
    }

    // Pegamos somente a parte da data para evitar
    // problemas de fuso horário.
    const dataParte = String(data).split("T")[0];

    const [ano, mes, dia] = dataParte.split("-");

    if (!ano || !mes || !dia) {
      return "-";
    }

    return `${dia}/${mes}/${ano}`;
  }

  // Filtra os eventos pela pesquisa e pelo status.
  const eventosFiltrados = eventos.filter((evento) => {
    const correspondePesquisa = evento.nome
      .toLowerCase()
      .includes(pesquisa.toLowerCase());

    const correspondeStatus = status === "" || evento.status === status;

    return correspondePesquisa && correspondeStatus;
  });

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
          <Link to="/login">Sair</Link>
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

          <Link to="/criar-evento" className="botao-criar-evento">
            + Criar novo evento
          </Link>
        </header>

        <section className="barra-pesquisa">
          <form onSubmit={(event) => event.preventDefault()}>
            <label htmlFor="barra-pesquisa">
              <input
                type="text"
                id="barra-pesquisa"
                placeholder="🔎 Pesquisar evento..."
                value={pesquisa}
                onChange={(event) => setPesquisa(event.target.value)}
              />
            </label>

            <label htmlFor="status-eventos">
              <select
                id="status-eventos"
                value={status}
                onChange={(event) => setStatus(event.target.value)}
              >
                <option value="">Todos os eventos</option>

                <option value="PLANEJAMENTO">Em planejamento</option>

                <option value="CONFIRMADO">Confirmado</option>

                <option value="CANCELADO">Cancelado</option>
              </select>
            </label>
          </form>
        </section>

        <section className="eventos-listados">
          {/* Estado de carregamento */}
          {carregando && (
            <div className="estado-vazio">
              <h2>Carregando eventos...</h2>
              <p>Aguarde enquanto buscamos seus eventos.</p>
            </div>
          )}

          {/* Estado de erro */}
          {!carregando && erro && (
            <div className="estado-vazio">
              <h2>Não foi possível carregar os eventos.</h2>

              <p>{erro}</p>
            </div>
          )}

          {/* Nenhum evento encontrado */}
          {!carregando && !erro && eventosFiltrados.length === 0 && (
            <div className="estado-vazio">
              <div className="estado-vazio-icone">▣</div>

              <h2>Você ainda não possui eventos.</h2>

              <p>Crie seu primeiro evento para começar o planejamento.</p>

              <Link to="/criar-evento" className="botao-criar-evento">
                + Criar novo evento
              </Link>
            </div>
          )}

          {/* Eventos vindos da API */}
          {!carregando &&
            !erro &&
            eventosFiltrados.map((evento) => (
              <article className="meuseventos-card" key={evento.id}>
                <div className="evento-header">
                  <div className="evento-titulo">
                    <span>{evento.nome}</span>

                    <span className="evento-status">
                      {formatarStatus(evento.status)}
                    </span>
                  </div>

                  <div className="evento-acoes">
                    <button type="button">Editar</button>

                    <button type="button">Ver detalhes</button>
                  </div>
                </div>

                <div className="evento-dados">
                  <div>
                    <span>Data</span>

                    <strong>{formatarData(evento.data_evento)}</strong>
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

                    <strong>
                      {evento.publico_min} – {evento.publico_max} pessoas
                    </strong>
                  </div>
                </div>
              </article>
            ))}
        </section>
      </main>

      <footer className="rodape">
        © 2026 TrocaTicket · Todos os direitos reservados
      </footer>
    </div>
  );
}

export default MeusEventos;

import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

import { apiRequest } from "../../../services/api";

import "./CriarEvento.css";

function CriarEvento() {
  const navigate = useNavigate();

  const [nome, setNome] = useState("");
  const [descricao, setDescricao] = useState("");
  const [dataEvento, setDataEvento] = useState("");
  const [horario, setHorario] = useState("");
  const [local, setLocal] = useState("");
  const [publicoMin, setPublicoMin] = useState("");
  const [publicoMax, setPublicoMax] = useState("");

  const [erro, setErro] = useState("");
  const [sucesso, setSucesso] = useState("");
  const [carregando, setCarregando] = useState(false);

  async function handleSubmit(event) {
    event.preventDefault();

    setErro("");
    setSucesso("");

    // Converte os campos de público para números.
    const minimo = Number(publicoMin);
    const maximo = Number(publicoMax);

    // Valida o público antes de enviar para a API.
    if (minimo <= 0 || maximo <= 0) {
      setErro("Informe públicos maiores que zero.");
      return;
    }

    // O público mínimo precisa ser menor que o máximo.
    if (minimo >= maximo) {
      setErro("O público mínimo deve ser menor que o público máximo.");
      return;
    }

    setCarregando(true);

    try {
      // Envia os dados do evento para o backend.
      await apiRequest("/eventos", {
        method: "POST",
        body: JSON.stringify({
          nome,
          descricao,
          horario,
          data_evento: dataEvento,
          publico_min: minimo,
          publico_max: maximo,
          local,
        }),
      });

      setSucesso("Evento criado com sucesso!");

      // Depois de criar o evento,
      // volta para a tela Meus Eventos.
      setTimeout(() => {
        navigate("/meus-eventos");
      }, 1200);
    } catch (error) {
      setErro(error.message);
    } finally {
      setCarregando(false);
    }
  }

  return (
    <div className="criar-evento-container">
      <header className="cabecalho-criar-evento">
        <Link to="/meus-eventos" className="voltar">
          ← Voltar para meus eventos
        </Link>

        <p className="descricao">
          Planeje seu evento e organize as principais informações.
        </p>
      </header>

      <main className="criar-evento-main">
        <article className="card-criar-evento">
          <div className="card-criar-evento-conteudo">
            <span className="logo-card">TICKETLAB</span>

            <h1>Criar novo evento</h1>

            <p className="descricao-criar-evento">
              Cadastre as informações iniciais do evento para começar seu
              planejamento.
            </p>

            <form onSubmit={handleSubmit}>
              {/* Nome do evento */}
              <label htmlFor="nome">
                Nome do evento
                <input
                  id="nome"
                  type="text"
                  placeholder="Ex.: Festa da Computação"
                  value={nome}
                  onChange={(event) => setNome(event.target.value)}
                  maxLength={100}
                  required
                />
              </label>

              {/* Descrição */}
              <label htmlFor="descricao">
                Descrição
                <textarea
                  id="descricao"
                  placeholder="Descreva brevemente o evento..."
                  value={descricao}
                  onChange={(event) => setDescricao(event.target.value)}
                  rows={4}
                />
              </label>

              {/* Data e horário */}
              <div className="linha-campos">
                <label htmlFor="data-evento">
                  Data do evento
                  <input
                    id="data-evento"
                    type="date"
                    value={dataEvento}
                    onChange={(event) => setDataEvento(event.target.value)}
                    required
                  />
                </label>

                <label htmlFor="horario">
                  Horário
                  <input
                    id="horario"
                    type="time"
                    value={horario}
                    onChange={(event) => setHorario(event.target.value)}
                    required
                  />
                </label>
              </div>

              {/* Local */}
              <label htmlFor="local">
                Local
                <input
                  id="local"
                  type="text"
                  placeholder="Ex.: São Paulo - SP"
                  value={local}
                  onChange={(event) => setLocal(event.target.value)}
                  maxLength={100}
                  required
                />
              </label>

              {/* Público */}
              <div className="linha-campos">
                <label htmlFor="publico-min">
                  Público mínimo
                  <input
                    id="publico-min"
                    type="number"
                    min="1"
                    placeholder="300"
                    value={publicoMin}
                    onChange={(event) => setPublicoMin(event.target.value)}
                    required
                  />
                </label>

                <label htmlFor="publico-max">
                  Público máximo
                  <input
                    id="publico-max"
                    type="number"
                    min="1"
                    placeholder="500"
                    value={publicoMax}
                    onChange={(event) => setPublicoMax(event.target.value)}
                    required
                  />
                </label>
              </div>

              {/* Mensagem de erro */}
              {erro && <p className="mensagem-erro">{erro}</p>}

              {/* Mensagem de sucesso */}
              {sucesso && <p className="mensagem-sucesso">{sucesso}</p>}

              {/* Botões */}
              <div className="acoes-formulario">
                <Link to="/meus-eventos" className="botao-cancelar">
                  Cancelar
                </Link>

                <button type="submit" disabled={carregando}>
                  {carregando ? "Criando evento..." : "Criar evento"}
                </button>
              </div>
            </form>
          </div>
        </article>
      </main>

      <footer className="rodape">
        © 2026 TicketLab · Todos os direitos reservados
      </footer>
    </div>
  );
}

export default CriarEvento;

import { Link, useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import LayoutOrganizador from "../../../components/organizador/LayoutOrganizador";
import Icon from "../../../components/organizador/Icon";
import { apiRequest } from "../../../services/api";
import { formatarDataCompleta } from "../../../utils/datas";
import "./DetalheEvento.css";

const STATUS_EVENTO = {
  PLANEJAMENTO: { texto: "Em planejamento", classe: "planejamento" },
  CONFIRMADO: { texto: "Confirmado", classe: "confirmado" },
  CANCELADO: { texto: "Cancelado", classe: "cancelado" },
  CONCLUIDO: { texto: "Concluído", classe: "concluido" },
};

const STATUS_PROPOSTA = {
  ENVIADA: "Enviada",
  EM_ANALISE: "Em análise",
  SELECIONADA: "Selecionada",
  RECUSADA: "Recusada",
};

const moeda = (valor) =>
  Number(valor).toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

function DetalheEvento() {
  const { id } = useParams();
  const [evento, setEvento] = useState(null);
  const [propostas, setPropostas] = useState([]);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState("");

  useEffect(() => {
    let ativo = true;

    async function carregar() {
      try {
        const [eventos, recebidas] = await Promise.all([
          apiRequest("/eventos"),
          apiRequest(`/organizador/propostas?evento=${id}`),
        ]);
        if (!ativo) return;

        const encontrado = (Array.isArray(eventos) ? eventos : []).find(
          (e) => String(e.id) === String(id)
        );

        if (!encontrado) {
          setErro("Evento não encontrado.");
          return;
        }

        setEvento(encontrado);
        setPropostas(Array.isArray(recebidas) ? recebidas : []);
      } catch (error) {
        if (ativo) setErro(error.message || "Falha ao carregar o evento.");
      } finally {
        if (ativo) setCarregando(false);
      }
    }

    carregar();
    return () => {
      ativo = false;
    };
  }, [id]);

  const ativas = propostas.filter((p) => p.status !== "RECUSADA");
  const menorValor = ativas.length
    ? Math.min(...ativas.map((p) => Number(p.valor)))
    : null;
  const status = STATUS_EVENTO[evento?.status] || STATUS_EVENTO.PLANEJAMENTO;

  return (
    <LayoutOrganizador active="meus-eventos">
      <main className="detalhe-evento-content">
        <Link to="/meus-eventos" className="detalhe-evento-voltar">
          ← Meus eventos
        </Link>

        {carregando && <p className="detalhe-evento-estado">Carregando evento...</p>}

        {!carregando && erro && (
          <section className="detalhe-evento-estado" role="alert">
            <h2>Não foi possível carregar o evento</h2>
            <p>{erro}</p>
          </section>
        )}

        {!carregando && !erro && evento && (
          <>
            <section className="detalhe-evento-topo">
              <div>
                <span className={`detalhe-evento-status ${status.classe}`}>
                  {status.texto}
                </span>
                <h1>{evento.nome}</h1>
                <p>{evento.descricao || "Evento universitário em planejamento."}</p>
              </div>
            </section>

            <section className="detalhe-evento-resumo">
              <div className="detalhe-evento-info">
                <Icon name="calendar" />
                <div>
                  <small>Data e horário</small>
                  <strong>{formatarDataCompleta(evento.data_evento, evento.horario)}</strong>
                </div>
              </div>

              <div className="detalhe-evento-info">
                <Icon name="location" />
                <div>
                  <small>Local</small>
                  <strong>{evento.local || "Não informado"}</strong>
                </div>
              </div>

              <div className="detalhe-evento-info">
                <Icon name="users" />
                <div>
                  <small>Público esperado</small>
                  <strong>
                    {evento.publico_min} a {evento.publico_max} pessoas
                  </strong>
                </div>
              </div>

              <div className="detalhe-evento-info">
                <Icon name="quote" />
                <div>
                  <small>Propostas recebidas</small>
                  <strong>
                    {propostas.length}
                    {menorValor !== null && ` • a partir de ${moeda(menorValor)}`}
                  </strong>
                </div>
              </div>
            </section>

            <section className="detalhe-evento-propostas">
              <div className="detalhe-evento-propostas-topo">
                <h2>Propostas deste evento</h2>
                <Link to="/cotacoes">Ver em Cotações →</Link>
              </div>

              {propostas.length === 0 ? (
                <p className="detalhe-evento-vazio">
                  Este evento ainda não recebeu propostas. Quando os fornecedores
                  enviarem, elas aparecem aqui.
                </p>
              ) : (
                <ul className="detalhe-evento-lista">
                  {propostas.map((proposta) => (
                    <li key={proposta.id}>
                      <div>
                        <strong>{proposta.fornecedor_nome}</strong>
                        <span>{proposta.servico_nome}</span>
                      </div>
                      <div className="detalhe-evento-valor">
                        <strong>{moeda(proposta.valor)}</strong>
                        <span>Prazo: {proposta.prazo_dias} dias</span>
                      </div>
                      <span
                        className={`detalhe-evento-proposta-status ${String(
                          proposta.status
                        ).toLowerCase()}`}
                      >
                        {STATUS_PROPOSTA[proposta.status] || proposta.status}
                      </span>
                    </li>
                  ))}
                </ul>
              )}
            </section>
          </>
        )}
      </main>
    </LayoutOrganizador>
  );
}

export default DetalheEvento;
import LayoutFornecedor from "../../../components/fornecedor/LayoutFornecedor";
import {
  Aviso,
  BotaoLink,
  CabecalhoPagina,
  EstadoCarregando,
  EstadoVazio,
} from "../../../components/fornecedor/Componentes";
import Icon from "../../../components/organizador/Icon";
import { Link } from "react-router-dom";
import useCarregar from "../../../hooks/useCarregar";
import { fornecedorApi } from "../../../services/fornecedor";
import { formatarDataEvento } from "../../../utils/datas";

const CARDS = [
  { campo: "oportunidades_abertas", rotulo: "Oportunidades abertas", icone: "search", tom: "" },
  { campo: "propostas_enviadas", rotulo: "Propostas enviadas", icone: "quote", tom: "laranja" },
  { campo: "propostas_aceitas", rotulo: "Propostas aceitas", icone: "users", tom: "verde" },
  { campo: "servicos_cadastrados", rotulo: "Serviços cadastrados", icone: "cube", tom: "roxo" },
];

export default function DashboardFornecedor() {
  const { dados, carregando, erro } = useCarregar(() => fornecedorApi.dashboard(), []);

  return (
    <LayoutFornecedor active="dashboard">
      <CabecalhoPagina
        eyebrow="VISÃO GERAL"
        titulo={dados ? `Olá, ${dados.fornecedor.nome}!` : "Olá!"}
        descricao="Acompanhe suas oportunidades e propostas em um só lugar."
        acao={<BotaoLink to="/fornecedor/servicos/novo">Cadastrar serviço</BotaoLink>}
      />

      <Aviso>{erro}</Aviso>
      {carregando && <EstadoCarregando />}

      {dados && (
        <>
          <section className="forn-stats">
            {CARDS.map((card) => (
              <div className="forn-stat" key={card.campo}>
                <div className={`forn-stat-icone ${card.tom}`}>
                  <Icon name={card.icone} />
                </div>
                <div>
                  <small>{card.rotulo}</small>
                  <strong>{dados[card.campo]}</strong>
                </div>
              </div>
            ))}
          </section>

          <section className="forn-painel">
            <div className="forn-painel-topo">
              <div>
                <h2>Oportunidades recentes</h2>
                <p>Eventos abertos para receber propostas.</p>
              </div>
              <Link to="/fornecedor/oportunidades" className="forn-link">
                Ver todas
              </Link>
            </div>

            {dados.oportunidades_recentes.length === 0 ? (
              <div className="forn-lista">
                <EstadoVazio
                  titulo="Nenhuma oportunidade aberta"
                  texto="Quando organizadores criarem eventos em planejamento, eles aparecerão aqui."
                />
              </div>
            ) : (
              <div className="forn-lista">
                {dados.oportunidades_recentes.map((evento) => {
                  const data = formatarDataEvento(evento.data_evento);

                  return (
                    <Link
                      key={evento.id}
                      to={`/fornecedor/oportunidades/${evento.id}`}
                      className="forn-linha"
                    >
                      <div className="forn-linha-data">
                        <strong>{data.dia}</strong>
                        <span>{data.mes}</span>
                      </div>
                      <div className="forn-linha-info">
                        <strong>{evento.nome}</strong>
                        <span>
                          {evento.local} · {evento.publico_min}–{evento.publico_max} pessoas
                        </span>
                      </div>
                      <Icon name="arrow" />
                    </Link>
                  );
                })}
              </div>
            )}
          </section>
        </>
      )}
    </LayoutFornecedor>
  );
}

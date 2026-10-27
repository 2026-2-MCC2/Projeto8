import { useMemo, useState } from "react";
import LayoutAdmin from "../../../components/admin/LayoutAdmin";
import PageHeader from "../../../components/admin/PageHeader";
import StatCard from "../../../components/admin/StatCard";
import CartaoEvento from "../../../components/admin/CartaoEvento";
import Icon from "../../../components/organizador/Icon";
import { adminApi } from "../../../services/admin";
import useCarregar from "../../../hooks/useCarregar";
import { formatarMoeda } from "../../../utils/formatadores";
import {
  STATUS_PROPOSTA_PENDENTE,
  calcularResumoEvento,
} from "../../../utils/eventosAdmin";

const ABAS = [
  { valor: "TODOS", rotulo: "Todos" },
  { valor: "PLANEJAMENTO", rotulo: "Em planejamento" },
  { valor: "CONFIRMADO", rotulo: "Confirmados" },
  { valor: "CONCLUIDO", rotulo: "Concluídos" },
  { valor: "CANCELADO", rotulo: "Cancelados" },
];

export default function AdminEventos() {
  // "dados" é null até a primeira resposta da API.
  const { dados, carregando, erro, recarregar } = useCarregar(
    () => adminApi.listarEventos(),
    []
  );

  const eventos = useMemo(() => dados ?? [], [dados]);
  const primeiraCarga = carregando && dados === null;

  const [aba, setAba] = useState("TODOS");
  const [busca, setBusca] = useState("");
  const [ordem, setOrdem] = useState("data");

  // Resumo de cada evento, calculado uma vez (Map: id -> resumo)
  const resumos = useMemo(
    () => new Map(eventos.map((ev) => [ev.id, calcularResumoEvento(ev)])),
    [eventos]
  );

  // Cartões de cima: sempre consideram TODOS os eventos, não só os filtrados.
  // Evento cancelado não conta como custo nem como proposta pendente.
  const kpis = useMemo(() => {
    const vigentes = eventos.filter((ev) => ev.status !== "CANCELADO");

    const ativos = eventos.filter(
      (ev) => ev.status === "PLANEJAMENTO" || ev.status === "CONFIRMADO"
    ).length;

    // Só entra no orçamento quem informou (null não vira zero)
    const comOrcamento = vigentes.filter((ev) => ev.orcamento_previsto !== null);

    const orcamentoTotal = comOrcamento.reduce(
      (soma, ev) => soma + ev.orcamento_previsto,
      0
    );

    // Para comparar com o orçamento, usa só o custo de quem tem orçamento
    const custoComOrcamento = comOrcamento.reduce(
      (soma, ev) => soma + resumos.get(ev.id).custoAtual,
      0
    );

    const custoTotal = vigentes.reduce(
      (soma, ev) => soma + resumos.get(ev.id).custoAtual,
      0
    );

    const totalPropostas = vigentes.reduce(
      (soma, ev) => soma + ev.propostas.length,
      0
    );

    const propostasPendentes = vigentes.reduce(
      (soma, ev) =>
        soma +
        ev.propostas.filter((p) => STATUS_PROPOSTA_PENDENTE.includes(p.status))
          .length,
      0
    );

    return {
      ativos,
      temOrcamento: comOrcamento.length > 0,
      orcamentoTotal,
      custoTotal,
      estourou: custoComOrcamento > orcamentoTotal,
      totalPropostas,
      propostasPendentes,
    };
  }, [eventos, resumos]);

  // Contagem de cada aba (o número entre parênteses)
  const contagem = useMemo(() => {
    const total = { TODOS: eventos.length };
    for (const ev of eventos) {
      total[ev.status] = (total[ev.status] || 0) + 1;
    }
    return total;
  }, [eventos]);

  // 1) filtra por aba  2) filtra pela busca  3) ordena
  const filtrados = useMemo(() => {
    const termo = busca.trim().toLowerCase();

    return eventos
      .filter((ev) => aba === "TODOS" || ev.status === aba)
      .filter(
        (ev) =>
          !termo ||
          ev.nome.toLowerCase().includes(termo) ||
          ev.organizador_nome.toLowerCase().includes(termo)
      )
      .sort((a, b) =>
        ordem === "cadastro"
          ? b.id - a.id // id maior = cadastrado depois
          : a.data_evento.localeCompare(b.data_evento) // ISO ordena como texto
      );
  }, [eventos, aba, busca, ordem]);

  return (
    <LayoutAdmin active="eventos">
      <main className="adm-main">
        <PageHeader
          eyebrow="EVENTOS"
          title="Eventos da plataforma"
          description="Acompanhe o status, o custo e o andamento das propostas de cada evento."
        />

        {erro && (
          <div className="adm-alert adm-alert-error">
            {erro}{" "}
            <button
              type="button"
              className="adm-text-button"
              onClick={recarregar}
            >
              Tentar novamente
            </button>
          </div>
        )}

        {primeiraCarga && <div className="adm-empty">Carregando eventos...</div>}

        {dados && (
          <>
            <div className="adm-stats-grid">
              <StatCard
                label="Eventos ativos"
                value={String(kpis.ativos)}
                icon="calendar"
              />
              <StatCard
                label="Orçamento total"
                value={kpis.temOrcamento ? formatarMoeda(kpis.orcamentoTotal) : "—"}
                icon="wallet"
                tone="violet"
              />
              <StatCard
                label="Custo atual"
                value={formatarMoeda(kpis.custoTotal)}
                icon="money"
                tone={kpis.estourou ? "orange" : "green"}
              />
              <StatCard
                label="Propostas pendentes"
                value={`${kpis.propostasPendentes} de ${kpis.totalPropostas}`}
                icon="clock"
                tone={kpis.propostasPendentes > 0 ? "orange" : "green"}
              />
            </div>

            <div className="adm-tabs">
              {ABAS.map((a) => (
                <button
                  key={a.valor}
                  type="button"
                  className={`adm-tab ${aba === a.valor ? "active" : ""}`}
                  onClick={() => setAba(a.valor)}
                >
                  {a.rotulo} ({contagem[a.valor] || 0})
                </button>
              ))}
            </div>

            <div className="adm-toolbar">
              <div className="adm-search">
                <Icon name="search" size={16} />

                <input
                  type="search"
                  placeholder="Buscar por evento ou organizador..."
                  value={busca}
                  onChange={(evento) => setBusca(evento.target.value)}
                />
              </div>

              <div className="adm-select">
                <Icon name="filter" size={15} />

                <select
                  value={ordem}
                  onChange={(evento) => setOrdem(evento.target.value)}
                >
                  <option value="data">Data mais próxima</option>
                  <option value="cadastro">Cadastro mais recente</option>
                </select>
              </div>
            </div>

            {filtrados.length === 0 ? (
              <div className="adm-empty">
                {busca.trim()
                  ? `Nenhum evento encontrado para "${busca.trim()}".`
                  : "Nenhum evento nessa categoria."}
              </div>
            ) : (
              <div className="adm-event-list">
                {filtrados.map((ev) => (
                  <CartaoEvento
                    key={ev.id}
                    evento={ev}
                    resumo={resumos.get(ev.id)}
                  />
                ))}
              </div>
            )}
          </>
        )}
      </main>
    </LayoutAdmin>
  );
}
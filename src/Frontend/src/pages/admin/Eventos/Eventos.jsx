import { useMemo, useState } from "react";
import LayoutAdmin from "../../../components/admin/LayoutAdmin";
import PageHeader from "../../../components/admin/PageHeader";
import StatCard from "../../../components/admin/StatCard";
import CartaoEvento from "../../../components/admin/CartaoEvento";
import Icon from "../../../components/organizador/Icon";
import { formatarMoeda } from "../../../utils/formatadores";
import { calcularResumoEvento } from "../../../utils/eventosAdmin";
import { eventosExemplo } from "../eventosData";

const ABAS = [
  { valor: "TODOS", rotulo: "Todos" },
  { valor: "PLANEJAMENTO", rotulo: "Em planejamento" },
  { valor: "CONFIRMADO", rotulo: "Confirmados" },
  { valor: "CONCLUIDO", rotulo: "Concluídos" },
  { valor: "CANCELADO", rotulo: "Cancelados" },
];

export default function AdminEventos() {
  
  const [eventos] = useState(eventosExemplo);
  const [aba, setAba] = useState("TODOS");
  const [busca, setBusca] = useState("");
  const [ordem, setOrdem] = useState("data");

  // Resumo de cada evento, calculado uma vez (Map: id -> resumo)
  const resumos = useMemo(
    () => new Map(eventos.map((ev) => [ev.id, calcularResumoEvento(ev)])),
    [eventos]
  );

  // Cartões de cima: sempre consideram TODOS os eventos, não só os filtrados
  const kpis = useMemo(() => {
    const ativos = eventos.filter(
      (ev) => ev.status === "PLANEJAMENTO" || ev.status === "CONFIRMADO"
    ).length;

    const orcamentoTotal = eventos.reduce(
      (soma, ev) => soma + ev.orcamento_previsto,
      0
    );

    const custoTotal = eventos.reduce(
      (soma, ev) => soma + resumos.get(ev.id).custoAtual,
      0
    );

    const totalCotacoes = eventos.reduce(
      (soma, ev) => soma + ev.cotacoes.length,
      0
    );

    const cotacoesPendentes = eventos.reduce(
      (soma, ev) =>
        soma + ev.cotacoes.filter((c) => c.status === "PENDENTE").length,
      0
    );

    return { ativos, orcamentoTotal, custoTotal, totalCotacoes, cotacoesPendentes };
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

  const estourouGeral = kpis.custoTotal > kpis.orcamentoTotal;

  return (
    <LayoutAdmin active="eventos">
      <main className="adm-main">
        <PageHeader
          eyebrow="EVENTOS"
          title="Eventos da plataforma"
          description="Acompanhe o status, o orçamento e o andamento das cotações de cada evento."
        />

        <div className="adm-stats-grid">
          <StatCard
            label="Eventos ativos"
            value={String(kpis.ativos)}
            icon="calendar"
          />
          <StatCard
            label="Orçamento total"
            value={formatarMoeda(kpis.orcamentoTotal)}
            icon="wallet"
            tone="violet"
          />
          <StatCard
            label="Custo atual"
            value={formatarMoeda(kpis.custoTotal)}
            icon="money"
            tone={estourouGeral ? "orange" : "green"}
          />
          <StatCard
            label="Cotações pendentes"
            value={`${kpis.cotacoesPendentes} de ${kpis.totalCotacoes}`}
            icon="clock"
            tone={kpis.cotacoesPendentes > 0 ? "orange" : "green"}
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
              <CartaoEvento key={ev.id} evento={ev} resumo={resumos.get(ev.id)} />
            ))}
          </div>
        )}
      </main>
    </LayoutAdmin>
  );
}
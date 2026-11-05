import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import LayoutOrganizador from "../../../components/organizador/LayoutOrganizador";
import { apiRequest } from "../../../services/api";
import "./Cotacoes.css";

const statusLabel = {
  ENVIADA: "Recebida",
  EM_ANALISE: "Em análise",
  SELECIONADA: "Selecionada",
  RECUSADA: "Recusada",
};

const moeda = (valor) => Number(valor || 0).toLocaleString("pt-BR", {
  style: "currency",
  currency: "BRL",
});

const iniciais = (nome = "") => nome.trim().split(/\s+/).slice(0, 2)
  .map((parte) => parte[0] || "").join("").toUpperCase();

function Cotacoes() {
  const [abaAtiva, setAbaAtiva] = useState("Todas");
  const [propostas, setPropostas] = useState([]);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState("");

  async function carregarPropostas() {
    setCarregando(true);
    setErro("");
    try {
      const dados = await apiRequest("/organizador/propostas");
      setPropostas(Array.isArray(dados) ? dados : []);
    } catch (error) {
      setErro(error.message || "Não foi possível carregar as propostas.");
    } finally {
      setCarregando(false);
    }
  }

  useEffect(() => {
    carregarPropostas();
  }, []);

  const contagens = useMemo(() => ({
    Todas: propostas.length,
    ENVIADA: propostas.filter((p) => p.status === "ENVIADA").length,
    EM_ANALISE: propostas.filter((p) => p.status === "EM_ANALISE").length,
    SELECIONADA: propostas.filter((p) => p.status === "SELECIONADA").length,
  }), [propostas]);

  const filtradas = useMemo(() => {
    if (abaAtiva === "Todas") return propostas;
    return propostas.filter((p) => p.status === abaAtiva);
  }, [propostas, abaAtiva]);

  return (
    <LayoutOrganizador active="cotacoes">
      <main className="cotacoes-page">
        <header className="cotacoes-header">
          <div>
            <span className="cotacoes-label">COTAÇÕES</span>
            <h1>Propostas recebidas</h1>
            <p>Propostas enviadas pelos fornecedores para os seus eventos.</p>
          </div>
          <Link to="/cotacoes/comparar" className="cotacoes-comparar">
            <span>☷</span> Comparar propostas
          </Link>
        </header>

        <nav className="cotacoes-tabs" aria-label="Filtrar propostas">
          <button type="button" className={abaAtiva === "Todas" ? "cotacoes-tab-ativa" : ""}
            onClick={() => setAbaAtiva("Todas")}>Todas · {contagens.Todas}</button>
          <button type="button" className={abaAtiva === "ENVIADA" ? "cotacoes-tab-ativa" : ""}
            onClick={() => setAbaAtiva("ENVIADA")}>Recebidas · {contagens.ENVIADA}</button>
          <button type="button" className={abaAtiva === "EM_ANALISE" ? "cotacoes-tab-ativa" : ""}
            onClick={() => setAbaAtiva("EM_ANALISE")}>Em análise · {contagens.EM_ANALISE}</button>
          <button type="button" className={abaAtiva === "SELECIONADA" ? "cotacoes-tab-ativa" : ""}
            onClick={() => setAbaAtiva("SELECIONADA")}>Selecionadas · {contagens.SELECIONADA}</button>
        </nav>

        {erro && <section role="alert" className="cotacoes-estado">
          <p>{erro}</p>
          <button type="button" onClick={carregarPropostas}>Tentar novamente</button>
        </section>}

        {!erro && carregando && <p role="status" className="cotacoes-estado">Carregando propostas do banco de dados...</p>}

        {!erro && !carregando && filtradas.length === 0 && (
          <section className="cotacoes-estado">
            <h2>Nenhuma proposta encontrada</h2>
            <p>Quando um fornecedor enviar uma proposta para um dos seus eventos, ela aparecerá aqui.</p>
          </section>
        )}

        {!erro && !carregando && filtradas.length > 0 && (
          <section className="cotacoes-lista">
            {filtradas.map((p) => {
              const label = statusLabel[p.status] || p.status;
              const cssStatus = label.toLowerCase().replaceAll(" ", "-");
              return (
                <article className="cotacao-card" key={p.id}>
                  <div className="cotacao-card-conteudo">
                    <div className="cotacao-fornecedor">
                      <div className="cotacao-avatar">{iniciais(p.fornecedor_nome)}</div>
                      <div className="cotacao-fornecedor-info">
                        <h2>{p.fornecedor_nome}</h2>
                        <p>{p.servico_nome} · {p.servico_categoria}</p>
                      </div>
                    </div>
                    <div className="cotacao-dados">
                      <div><span>Valor da proposta</span><strong>{moeda(p.valor)}</strong></div>
                      <div><span>Prazo de entrega</span><strong>{p.prazo_dias} dias</strong></div>
                      <span className={`cotacao-status cotacao-status-${cssStatus}`}>{label}</span>
                    </div>
                  </div>
                  <div className="cotacao-observacao">
                    <span>Evento: {p.evento_nome}</span>
                    {p.observacao || "Fornecedor não adicionou observações."}
                  </div>
                  <div className="cotacao-acoes">
                    <span>Proposta #{p.id} · {p.criado_em ? new Date(p.criado_em).toLocaleDateString("pt-BR") : "Data não informada"}</span>
                  </div>
                </article>
              );
            })}
          </section>
        )}
      </main>
    </LayoutOrganizador>
  );
}

export default Cotacoes;

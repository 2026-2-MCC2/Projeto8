import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import LayoutOrganizador from "../../../components/organizador/LayoutOrganizador";
import Icon from "../../../components/organizador/Icon";
import { apiRequest } from "../../../services/api";
import "./BuscarServicos.css";

const categorias = [
  ["Todas", "Todas"], ["ALIMENTACAO", "Alimentação"], ["DECORACAO", "Decoração"],
  ["SEGURANCA", "Segurança"], ["ENTRETENIMENTO", "Entretenimento"],
  ["ESTRUTURA", "Estrutura"], ["FOTOGRAFIA", "Fotografia"], ["OUTROS", "Outros"],
];

const moeda = (v) => v == null ? "Preço sob consulta" :
  Number(v).toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

const iniciais = (nome = "") => nome.trim().split(/\s+/).slice(0, 2)
  .map((p) => p[0] || "").join("").toUpperCase();

function BuscarServicos() {
  const [busca, setBusca] = useState("");
  const [categoria, setCategoria] = useState("Todas");
  const [servicos, setServicos] = useState([]);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState("");

  useEffect(() => {
    let ativo = true;
    apiRequest("/catalogo/servicos")
      .then((dados) => { if (ativo) setServicos(Array.isArray(dados) ? dados : []); })
      .catch((e) => { if (ativo) setErro(e.message || "Falha ao carregar serviços."); })
      .finally(() => { if (ativo) setCarregando(false); });
    return () => { ativo = false; };
  }, []);

  const filtrados = useMemo(() => {
    const termo = busca.trim().toLocaleLowerCase("pt-BR");
    return servicos.filter((s) => {
      const texto = [s.fornecedor_nome, s.servico_nome, s.servico_descricao,
        s.fornecedor_descricao, s.categoria, s.cidade, s.estado]
        .filter(Boolean).join(" ").toLocaleLowerCase("pt-BR");
      return (!termo || texto.includes(termo)) &&
        (categoria === "Todas" || s.categoria === categoria);
    });
  }, [servicos, busca, categoria]);

  return (
    <LayoutOrganizador active="buscar-servicos">
      <main className="buscar-servicos-page">
        <section className="buscar-servicos-header">
          <h1>Encontre seus parceiros</h1>
          <p>Serviços ativos cadastrados por fornecedores aprovados no TicketLab.</p>
        </section>
        <section className="buscar-servicos-filtros">
          <div className="buscar-servicos-search">
            <Icon name="search" size={18} />
            <input type="search" value={busca} onChange={(e) => setBusca(e.target.value)}
              placeholder="Buscar fornecedor ou serviço..." aria-label="Buscar fornecedor ou serviço" />
            {busca && <button type="button" className="buscar-servicos-limpar"
              onClick={() => setBusca("")} aria-label="Limpar busca">×</button>}
          </div>
          <div className="buscar-servicos-select">
            <Icon name="filter" size={18} />
            <select value={categoria} onChange={(e) => setCategoria(e.target.value)} aria-label="Filtrar categoria">
              {categorias.map(([value, label]) => <option key={value} value={value}>{label}</option>)}
            </select>
          </div>
        </section>

        {erro ? <section className="buscar-servicos-vazio" role="alert">
          <h2>Não foi possível carregar o catálogo</h2><p>{erro}</p>
          <button type="button" onClick={() => window.location.reload()}>Tentar novamente</button>
        </section> : <>
          <div className="buscar-servicos-info">
            {carregando ? "Carregando serviços do banco de dados..." : `${filtrados.length} serviço(s) encontrado(s)`}
          </div>
          {carregando ? <p role="status">Consultando o catálogo...</p> : filtrados.length ? (
            <section className="servicos-grid">
              {filtrados.map((s) => {
                const categoriaLabel = categorias.find(([v]) => v === s.categoria)?.[1] || s.categoria;
                const local = [s.cidade, s.estado].filter(Boolean).join(" - ");
                return <article className="servico-card" key={s.id}>
                  <div className="servico-card-topo"><div className="servico-iniciais">{iniciais(s.fornecedor_nome)}</div></div>
                  <span className="servico-categoria">{categoriaLabel}</span>
                  <h2>{s.servico_nome}</h2>
                  <p className="servico-descricao">{s.servico_descricao || s.fornecedor_descricao || "Sem descrição informada."}</p>
                  <div className="servico-meta"><span>{s.fornecedor_nome}</span>
                    {local && <><span className="servico-meta-separador">•</span><span><Icon name="location" size={14} />{local}</span></>}
                  </div>
                  <div className="servico-divisor" />
                  <div className="servico-preco"><span>Faixa de investimento cadastrada</span>
                    <strong>{s.preco_min == null ? "Preço sob consulta" : `${moeda(s.preco_min)} — ${moeda(s.preco_max)}`}</strong>
                  </div>
                  <Link to={`/buscar-servicos/${s.id}`} className="servico-botao">Ver serviço <span>→</span></Link>
                </article>;
              })}
            </section>
          ) : <section className="buscar-servicos-vazio">
            <div className="buscar-servicos-vazio-icon"><Icon name="search" size={26} /></div>
            <h2>Nenhum serviço disponível</h2>
            <p>Não há serviços ativos de fornecedores aprovados com esses filtros.</p>
            <button type="button" onClick={() => { setBusca(""); setCategoria("Todas"); }}>Limpar filtros</button>
          </section>}
        </>}
      </main>
    </LayoutOrganizador>
  );
}
export default BuscarServicos;

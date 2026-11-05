import { Link, useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import LayoutOrganizador from "../../../components/organizador/LayoutOrganizador";
import { apiRequest } from "../../../services/api";
import "./DetalheServicos.css";

const categorias = { ALIMENTACAO: "Alimentação", DECORACAO: "Decoração",
  SEGURANCA: "Segurança", ENTRETENIMENTO: "Entretenimento",
  ESTRUTURA: "Estrutura", FOTOGRAFIA: "Fotografia", OUTROS: "Outros" };
const moeda = (v) => v == null ? "Preço sob consulta" :
  Number(v).toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

function DetalheServico() {
  const { id } = useParams();
  const [servico, setServico] = useState(null);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState("");

  useEffect(() => {
    let ativo = true;
    apiRequest(`/catalogo/servicos/${id}`)
      .then((dados) => { if (ativo) setServico(dados); })
      .catch((e) => { if (ativo) setErro(e.message || "Falha ao carregar serviço."); })
      .finally(() => { if (ativo) setCarregando(false); });
    return () => { ativo = false; };
  }, [id]);

  return <LayoutOrganizador active="buscar-servicos">
    <main className="detalhe-servico-page">
      <Link to="/buscar-servicos" className="detalhe-voltar">← Buscar serviços</Link>
      {carregando ? <p role="status">Carregando serviço...</p> : erro ? (
        <section className="detalhe-servico-not-found"><h1>Não foi possível carregar o serviço</h1>
          <p>{erro}</p><Link to="/buscar-servicos">Voltar ao catálogo</Link></section>
      ) : servico && <section className="detalhe-servico-card">
        <div className="detalhe-servico-capa">
          <div className="detalhe-servico-iniciais">{(servico.fornecedor_nome || "F").split(/\s+/).slice(0, 2).map(p => p[0]).join("").toUpperCase()}</div>
          <span className="detalhe-servico-categoria">{categorias[servico.categoria] || servico.categoria}</span>
        </div>
        <div className="detalhe-servico-conteudo">
          <div className="detalhe-servico-principal">
            <span className="detalhe-verificado">FORNECEDOR APROVADO</span>
            <h1>{servico.servico_nome}</h1>
            <div className="detalhe-avaliacao">{servico.fornecedor_nome} • {[servico.cidade, servico.estado].filter(Boolean).join(" - ")}</div>
            <p className="detalhe-descricao">{servico.servico_descricao || servico.fornecedor_descricao || "Sem descrição informada."}</p>
            <div className="detalhe-estatisticas">
              <div className="detalhe-stat"><span className="detalhe-stat-icon">👥</span><div>
                <span>Faixa de público</span><strong>{servico.publico_min == null ? "Não informada" : `${servico.publico_min} a ${servico.publico_max} pessoas`}</strong>
              </div></div>
              <div className="detalhe-stat"><span className="detalhe-stat-icon">◉</span><div>
                <span>Investimento cadastrado</span><strong>{servico.preco_min == null ? "Preço sob consulta" : `${moeda(servico.preco_min)} — ${moeda(servico.preco_max)}`}</strong>
              </div></div>
              <div className="detalhe-stat"><span className="detalhe-stat-icon">⌖</span><div>
                <span>Região de atendimento</span><strong>{servico.regiao_atendimento || [servico.cidade, servico.estado].filter(Boolean).join(" - ") || "Não informada"}</strong>
              </div></div>
            </div>
            {servico.site && <p><a href={servico.site} target="_blank" rel="noreferrer">Site do fornecedor</a></p>}
          </div>
          <aside className="detalhe-proximo-passo">
            <span className="detalhe-proximo-label">COMO RECEBER PROPOSTAS</span>
            <h2>Publique seu evento</h2>
            <p>No fluxo atual, fornecedores aprovados encontram eventos em planejamento e enviam propostas pela área de Oportunidades. As propostas ficam vinculadas ao evento.</p>
            <Link to="/meus-eventos" className="detalhe-botao-secundario">Voltar aos meus eventos →</Link>
          </aside>
        </div>
      </section>}
    </main>
  </LayoutOrganizador>;
}
export default DetalheServico;

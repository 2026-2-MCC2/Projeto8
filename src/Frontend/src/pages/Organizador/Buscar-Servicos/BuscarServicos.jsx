import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import LayoutOrganizador from "../../../components/organizador/LayoutOrganizador";
import Icon from "../../../components/organizador/Icon";
import "./BuscarServicos.css";

const servicos = [
  {
    id: 1,
    iniciais: "PE",
    nome: "Pulse Eventos",
    categoria: "Música",
    descricao: "DJ, curadoria musical e experiência completa para sua pista.",
    avaliacao: "4,9",
    cidade: "São Paulo",
    precoMin: 2500,
    precoMax: 5000,
  },
  {
    id: 2,
    iniciais: "LD",
    nome: "Lumi Decor",
    categoria: "Decoração",
    descricao: "Cenografia autoral, ambientação e design floral para eventos.",
    avaliacao: "4,8",
    cidade: "São Paulo",
    precoMin: 3000,
    precoMax: 12000,
  },
  {
    id: 3,
    iniciais: "SP",
    nome: "SoundWave Produções",
    categoria: "Som e iluminação",
    descricao:
      "Estrutura de som, luz e palco com equipe técnica especializada.",
    avaliacao: "4,9",
    cidade: "Campinas",
    precoMin: 4000,
    precoMax: 18000,
  },
  {
    id: 4,
    iniciais: "SS",
    nome: "SafeFest Segurança",
    categoria: "Segurança",
    descricao:
      "Equipe treinada, planejamento operacional e controle de acesso.",
    avaliacao: "4,7",
    cidade: "São Paulo",
    precoMin: 2000,
    precoMax: 8000,
  },
  {
    id: 5,
    iniciais: "CM",
    nome: "Click Moments",
    categoria: "Fotografia",
    descricao: "Fotos espontâneas e cobertura visual com entrega rápida.",
    avaliacao: "4,9",
    cidade: "Santos",
    precoMin: 1500,
    precoMax: 4500,
  },
];

const categorias = [
  "Todas",
  "Música",
  "Decoração",
  "Som e iluminação",
  "Segurança",
  "Fotografia",
];

function formatarPreco(valor) {
  return valor.toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
    maximumFractionDigits: 0,
  });
}

function BuscarServicos() {
  const [busca, setBusca] = useState("");
  const [categoria, setCategoria] = useState("Todas");

  const servicosFiltrados = useMemo(() => {
    const termo = busca.trim().toLowerCase();

    return servicos.filter((servico) => {
      const correspondeBusca =
        !termo ||
        servico.nome.toLowerCase().includes(termo) ||
        servico.categoria.toLowerCase().includes(termo) ||
        servico.descricao.toLowerCase().includes(termo);

      const correspondeCategoria =
        categoria === "Todas" || servico.categoria === categoria;

      return correspondeBusca && correspondeCategoria;
    });
  }, [busca, categoria]);

  return (
    <LayoutOrganizador active="buscar-servicos">
      <main className="buscar-servicos-page">
        <section className="buscar-servicos-header">
          <h1>Encontre seus parceiros</h1>

          <p>
            Conecte seu evento a fornecedores avaliados e prontos para
            colaborar.
          </p>
        </section>

        <section className="buscar-servicos-filtros">
          <div className="buscar-servicos-search">
            <Icon name="search" size={18} />

            <input
              type="search"
              value={busca}
              onChange={(event) => setBusca(event.target.value)}
              placeholder="Buscar fornecedor ou serviço..."
              aria-label="Buscar fornecedor ou serviço"
            />

            {busca && (
              <button
                type="button"
                className="buscar-servicos-limpar"
                onClick={() => setBusca("")}
                aria-label="Limpar busca"
              >
                ×
              </button>
            )}
          </div>

          <div className="buscar-servicos-select">
            <Icon name="filter" size={18} />

            <select
              value={categoria}
              onChange={(event) => setCategoria(event.target.value)}
              aria-label="Filtrar por categoria"
            >
              {categorias.map((item) => (
                <option key={item} value={item}>
                  {item}
                </option>
              ))}
            </select>
          </div>
        </section>

        <div className="buscar-servicos-info">
          {servicosFiltrados.length}{" "}
          {servicosFiltrados.length === 1
            ? "fornecedor encontrado"
            : "fornecedores encontrados"}
        </div>

        {servicosFiltrados.length > 0 ? (
          <section className="servicos-grid">
            {servicosFiltrados.map((servico) => (
              <article className="servico-card" key={servico.id}>
                <div className="servico-card-topo">
                  <div className="servico-iniciais">{servico.iniciais}</div>


                </div>

                <span className="servico-categoria">{servico.categoria}</span>

                <h2>{servico.nome}</h2>

                <p className="servico-descricao">{servico.descricao}</p>

                <div className="servico-meta">
                  <span>
                    <strong>★</strong> {servico.avaliacao}
                  </span>

                  <span className="servico-meta-separador">•</span>

                  <span>
                    <Icon name="location" size={14} />
                    {servico.cidade}
                  </span>
                </div>

                <div className="servico-divisor" />

                <div className="servico-preco">
                  <span>Faixa de investimento</span>

                  <strong>
                    {formatarPreco(servico.precoMin)} —{" "}
                    {formatarPreco(servico.precoMax)}
                  </strong>
                </div>

                <Link
                  to={`/buscar-servicos/${servico.id}`}
                  className="servico-botao"
                >
                  Ver serviço
                  <span>→</span>
                </Link>
              </article>
            ))}
          </section>
        ) : (
          <section className="buscar-servicos-vazio">
            <div className="buscar-servicos-vazio-icon">
              <Icon name="search" size={26} />
            </div>

            <h2>Nenhum fornecedor encontrado</h2>

            <p>Tente buscar por outro fornecedor, serviço ou categoria.</p>

            <button
              type="button"
              onClick={() => {
                setBusca("");
                setCategoria("Todas");
              }}
            >
              Limpar filtros
            </button>
          </section>
        )}
      </main>
    </LayoutOrganizador>
  );
}

export default BuscarServicos;

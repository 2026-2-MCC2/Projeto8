import { Link, useParams } from "react-router-dom";
import { useState } from "react";

import LayoutOrganizador from "../../../components/organizador/LayoutOrganizador";

import "./DetalheServicos.css";

const servicos = [
  {
    id: 1,
    iniciais: "PE",
    nome: "Pulse Eventos",
    categoria: "Música",
    descricao: "DJ, curadoria musical e experiência completa para sua pista.",
    avaliacao: "4,9",
    cidade: "São Paulo",
    publico: "Até 1.500 pessoas",
    preco: "R$ 2.500 — R$ 5.000",
    resposta: "Até 2 horas",
  },
  {
    id: 2,
    iniciais: "LD",
    nome: "Lumi Decor",
    categoria: "Decoração",
    descricao: "Cenografia autoral, ambientação e design floral para eventos.",
    avaliacao: "4,8",
    cidade: "São Paulo",
    publico: "Até 1.000 pessoas",
    preco: "R$ 3.000 — R$ 12.000",
    resposta: "Até 4 horas",
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
    publico: "Até 2.000 pessoas",
    preco: "R$ 4.000 — R$ 18.000",
    resposta: "Até 3 horas",
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
    publico: "Até 2.000 pessoas",
    preco: "R$ 2.000 — R$ 8.000",
    resposta: "Até 5 horas",
  },
  {
    id: 5,
    iniciais: "CM",
    nome: "Click Moments",
    categoria: "Fotografia",
    descricao: "Fotos espontâneas e cobertura visual com entrega rápida.",
    avaliacao: "4,9",
    cidade: "Santos",
    publico: "Até 1.000 pessoas",
    preco: "R$ 1.500 — R$ 4.500",
    resposta: "Até 6 horas",
  },
];

function DetalheServico() {
  const { id } = useParams();

  const [cotacaoEnviada, setCotacaoEnviada] = useState(false);

  const servico = servicos.find((item) => item.id === Number(id));

  function solicitarCotacao() {
    setCotacaoEnviada(true);

    setTimeout(() => {
      setCotacaoEnviada(false);
    }, 5000);
  }

  if (!servico) {
    return (
      <LayoutOrganizador active="buscar-servicos">
        <main className="detalhe-servico-page">
          <Link to="/buscar-servicos" className="detalhe-voltar">
            ← Buscar serviços
          </Link>

          <section className="detalhe-servico-not-found">
            <h1>Serviço não encontrado</h1>

            <p>O fornecedor que você tentou acessar não está disponível.</p>

            <Link to="/buscar-servicos">Voltar para serviços</Link>
          </section>
        </main>
      </LayoutOrganizador>
    );
  }

  return (
    <LayoutOrganizador active="buscar-servicos">
      <main className="detalhe-servico-page">
        {cotacaoEnviada && (
          <div className="cotacao-sucesso">
            <span className="cotacao-sucesso-icone">✓</span>

            <span>
              Solicitação enviada! O fornecedor receberá os detalhes do seu
              evento.
            </span>
          </div>
        )}

        <Link to="/buscar-servicos" className="detalhe-voltar">
          ← Buscar serviços
        </Link>

        <section className="detalhe-servico-card">
          {/* CABEÇALHO DO SERVIÇO */}
          <div className="detalhe-servico-capa">
            <div className="detalhe-servico-iniciais">{servico.iniciais}</div>

            <span className="detalhe-servico-categoria">
              {servico.categoria}
            </span>
          </div>

          <div className="detalhe-servico-conteudo">
            {/* INFORMAÇÕES PRINCIPAIS */}
            <div className="detalhe-servico-principal">
              <span className="detalhe-verificado">FORNECEDOR VERIFICADO</span>

              <h1>{servico.nome}</h1>

              <div className="detalhe-avaliacao">
                <span>★</span>
                {servico.avaliacao}
                <span>•</span>
                {servico.cidade}
              </div>

              <p className="detalhe-descricao">
                {servico.descricao} Nossa equipe trabalha para criar uma entrega
                consistente, transparente e alinhada ao objetivo do seu evento.
              </p>

              {/* INFORMAÇÕES */}
              <div className="detalhe-estatisticas">
                <div className="detalhe-stat">
                  <span className="detalhe-stat-icon">👥</span>

                  <div>
                    <span>Faixa de público</span>
                    <strong>{servico.publico}</strong>
                  </div>
                </div>

                <div className="detalhe-stat">
                  <span className="detalhe-stat-icon">◉</span>

                  <div>
                    <span>Investimento</span>
                    <strong>{servico.preco}</strong>
                  </div>
                </div>

                <div className="detalhe-stat">
                  <span className="detalhe-stat-icon">◷</span>

                  <div>
                    <span>Resposta média</span>
                    <strong>{servico.resposta}</strong>
                  </div>
                </div>
              </div>

              {/* BOTÃO PRINCIPAL */}
              <button
                type="button"
                className="detalhe-botao-principal"
                onClick={solicitarCotacao}
              >
                Solicitar cotação
                <span>↗</span>
              </button>
            </div>

            {/* LADO DIREITO */}
            <aside className="detalhe-proximo-passo">
              <span className="detalhe-proximo-label">PRÓXIMO PASSO</span>

              <h2>Gostou deste serviço?</h2>

              <p>
                Solicite uma cotação e compare esta proposta com outras opções
                para o seu evento.
              </p>

              <button
                type="button"
                className="detalhe-botao-secundario"
                onClick={solicitarCotacao}
              >
                Solicitar cotação
                <span>→</span>
              </button>
            </aside>
          </div>
        </section>
      </main>
    </LayoutOrganizador>
  );
}

export default DetalheServico;

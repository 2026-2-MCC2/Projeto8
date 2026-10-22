import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import LayoutFornecedor from "../../../components/fornecedor/LayoutFornecedor";
import {
  Aviso,
  Badge,
  CabecalhoPagina,
  EstadoCarregando,
  EstadoVazio,
} from "../../../components/fornecedor/Componentes";
import Icon from "../../../components/organizador/Icon";
import useCarregar from "../../../hooks/useCarregar";
import { fornecedorApi } from "../../../services/fornecedor";
import { formatarDataCompleta } from "../../../utils/datas";

export default function Oportunidades() {
  const [busca, setBusca] = useState("");
  const [buscaAplicada, setBuscaAplicada] = useState("");

  // Espera o usuário parar de digitar antes de consultar a API.
  useEffect(() => {
    const temporizador = setTimeout(() => setBuscaAplicada(busca.trim()), 300);
    return () => clearTimeout(temporizador);
  }, [busca]);

  const { dados, carregando, erro } = useCarregar(
    () => fornecedorApi.listarOportunidades(buscaAplicada),
    [buscaAplicada]
  );

  const oportunidades = Array.isArray(dados) ? dados : [];

  return (
    <LayoutFornecedor active="oportunidades">
      <CabecalhoPagina
        eyebrow="OPORTUNIDADES"
        titulo="Encontre novos eventos"
        descricao="Eventos em planejamento que ainda estão recebendo propostas."
      />

      <section className="forn-filtros">
        <div className="forn-busca">
          <Icon name="search" />
          <input
            type="search"
            placeholder="Buscar por evento ou local..."
            value={busca}
            onChange={(event) => setBusca(event.target.value)}
          />
        </div>
      </section>

      <Aviso>{erro}</Aviso>
      {carregando && <EstadoCarregando texto="Carregando oportunidades..." />}

      {!carregando && !erro && oportunidades.length === 0 && (
        <EstadoVazio
          icone="search"
          titulo={buscaAplicada ? "Nenhuma oportunidade encontrada" : "Nenhuma oportunidade aberta"}
          texto={
            buscaAplicada
              ? "Tente buscar por outro nome ou local."
              : "Quando organizadores criarem eventos em planejamento, eles aparecerão aqui."
          }
        />
      )}

      {!carregando && oportunidades.length > 0 && (
        <section className="forn-grid">
          {oportunidades.map((evento) => (
            <article className="forn-card" key={evento.id}>
              <div className="forn-card-topo">
                <span>Organizador: {evento.organizador_nome}</span>
                {evento.minhas_propostas > 0 && <Badge classe="verde">Proposta enviada</Badge>}
              </div>

              <h3>{evento.nome}</h3>

              <div className="forn-card-meta">
                <span>
                  <Icon name="calendar" />
                  {formatarDataCompleta(evento.data_evento, evento.horario)}
                </span>
                <span>
                  <Icon name="location" />
                  {evento.local}
                </span>
                <span>
                  <Icon name="users" />
                  {evento.publico_min}–{evento.publico_max} pessoas
                </span>
              </div>

              <div className="forn-card-rodape">
                <span>{evento.descricao ? evento.descricao.slice(0, 70) : "Sem descrição"}</span>
                <Link
                  to={`/fornecedor/oportunidades/${evento.id}`}
                  className="forn-btn forn-btn-secundario forn-btn-pequeno"
                >
                  Ver oportunidade
                </Link>
              </div>
            </article>
          ))}
        </section>
      )}
    </LayoutFornecedor>
  );
}

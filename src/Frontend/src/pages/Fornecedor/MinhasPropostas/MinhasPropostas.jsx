import { useState } from "react";
import LayoutFornecedor from "../../../components/fornecedor/LayoutFornecedor";
import {
  Aviso,
  Badge,
  BotaoLink,
  CabecalhoPagina,
  EstadoCarregando,
  EstadoVazio,
} from "../../../components/fornecedor/Componentes";
import Icon from "../../../components/organizador/Icon";
import useCarregar from "../../../hooks/useCarregar";
import { fornecedorApi } from "../../../services/fornecedor";
import { formatarDataCompleta } from "../../../utils/datas";
import { STATUS_PROPOSTA, formatarData, formatarMoeda } from "../../../utils/fornecedor";

export default function MinhasPropostas() {
  const [filtro, setFiltro] = useState("");
  const { dados, carregando, erro, recarregar } = useCarregar(
    () => fornecedorApi.listarPropostas(filtro),
    [filtro]
  );

  const [sucesso, setSucesso] = useState("");
  const [erroAcao, setErroAcao] = useState("");
  const [retirando, setRetirando] = useState(null);

  async function retirar(proposta) {
    if (!window.confirm(`Retirar a proposta para "${proposta.evento_nome}"?`)) return;

    setRetirando(proposta.id);
    setErroAcao("");
    setSucesso("");

    try {
      const resposta = await fornecedorApi.retirarProposta(proposta.id);
      setSucesso(resposta.mensagem);
      await recarregar();
    } catch (error) {
      setErroAcao(error.message);
      await recarregar();
    } finally {
      setRetirando(null);
    }
  }

  const propostas = Array.isArray(dados) ? dados : [];

  return (
    <LayoutFornecedor active="propostas">
      <CabecalhoPagina
        eyebrow="MINHAS PROPOSTAS"
        titulo="Minhas propostas"
        descricao="Acompanhe o andamento das propostas que você enviou."
      />

      <section className="forn-filtros">
        <div className="forn-select">
          <Icon name="filter" />
          <select value={filtro} onChange={(event) => setFiltro(event.target.value)}>
            <option value="">Todos os status</option>
            {Object.entries(STATUS_PROPOSTA).map(([valor, { rotulo }]) => (
              <option key={valor} value={valor}>{rotulo}</option>
            ))}
          </select>
        </div>
      </section>

      <Aviso tipo="sucesso" onFechar={() => setSucesso("")}>{sucesso}</Aviso>
      <Aviso onFechar={() => setErroAcao("")}>{erroAcao}</Aviso>
      <Aviso>{erro}</Aviso>
      {carregando && !dados && <EstadoCarregando texto="Carregando propostas..." />}

      {!carregando && !erro && propostas.length === 0 && (
        <EstadoVazio
          icone="quote"
          titulo={filtro ? "Nenhuma proposta com este status" : "Você ainda não enviou propostas"}
          texto={filtro ? "Escolha outro status para ver mais propostas." : "Encontre um evento e envie sua primeira proposta."}
          acao={
            !filtro && (
              <BotaoLink to="/fornecedor/oportunidades" icone="search">
                Ver oportunidades
              </BotaoLink>
            )
          }
        />
      )}

      {propostas.length > 0 && (
        <section className="forn-painel">
          <div className="forn-tabela-wrap">
            <table className="forn-tabela">
              <thead>
                <tr>
                  <th>Evento</th>
                  <th>Serviço</th>
                  <th>Valor</th>
                  <th>Prazo</th>
                  <th>Enviada em</th>
                  <th>Status</th>
                  <th />
                </tr>
              </thead>
              <tbody>
                {propostas.map((proposta) => {
                  const status = STATUS_PROPOSTA[proposta.status] || { rotulo: proposta.status, classe: "cinza" };

                  return (
                    <tr key={proposta.id}>
                      <td>
                        <strong>{proposta.evento_nome}</strong>
                        <small>{formatarDataCompleta(proposta.data_evento)} · {proposta.evento_local}</small>
                      </td>
                      <td>{proposta.servico_nome}</td>
                      <td><strong>{formatarMoeda(proposta.valor)}</strong></td>
                      <td>{proposta.prazo_dias} {proposta.prazo_dias === 1 ? "dia" : "dias"}</td>
                      <td>{formatarData(proposta.criado_em)}</td>
                      <td><Badge classe={status.classe}>{status.rotulo}</Badge></td>
                      <td>
                        <div className="forn-acoes">
                          {proposta.status === "ENVIADA" && (
                            <button
                              type="button"
                              className="forn-btn forn-btn-perigo forn-btn-pequeno"
                              disabled={retirando === proposta.id}
                              onClick={() => retirar(proposta)}
                            >
                              {retirando === proposta.id ? "Retirando..." : "Retirar"}
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </section>
      )}
    </LayoutFornecedor>
  );
}

import { useState } from "react";
import { useLocation } from "react-router-dom";
import LayoutFornecedor from "../../../components/fornecedor/LayoutFornecedor";
import {
  Aviso,
  Badge,
  BotaoLink,
  CabecalhoPagina,
  EstadoCarregando,
  EstadoVazio,
} from "../../../components/fornecedor/Componentes";
import useCarregar from "../../../hooks/useCarregar";
import { fornecedorApi } from "../../../services/fornecedor";
import {
  STATUS_SERVICO,
  formatarMoeda,
  formatarNumero,
  rotuloCategoria,
} from "../../../utils/fornecedor";

export default function MeusServicos() {
  const location = useLocation();
  const { dados, carregando, erro, recarregar } = useCarregar(
    () => fornecedorApi.listarServicos(),
    []
  );

  // Mensagem enviada pelo formulário depois de salvar (via navigate state).
  const [sucesso, setSucesso] = useState(location.state?.mensagem || "");
  const [erroAcao, setErroAcao] = useState("");
  const [excluindo, setExcluindo] = useState(null);

  async function excluir(servico) {
    if (!window.confirm(`Excluir o serviço "${servico.nome}"?`)) return;

    setExcluindo(servico.id);
    setErroAcao("");
    setSucesso("");

    try {
      const resposta = await fornecedorApi.excluirServico(servico.id);
      setSucesso(resposta.mensagem);
      await recarregar();
    } catch (error) {
      setErroAcao(error.message);
    } finally {
      setExcluindo(null);
    }
  }

  const servicos = Array.isArray(dados) ? dados : [];

  return (
    <LayoutFornecedor active="servicos">
      <CabecalhoPagina
        eyebrow="MEUS SERVIÇOS"
        titulo="Meus serviços"
        descricao="Apresente seu trabalho e encontre oportunidades alinhadas ao seu perfil."
        acao={<BotaoLink to="/fornecedor/servicos/novo">Novo serviço</BotaoLink>}
      />

      <Aviso tipo="sucesso" onFechar={() => setSucesso("")}>{sucesso}</Aviso>
      <Aviso onFechar={() => setErroAcao("")}>{erroAcao}</Aviso>
      <Aviso>{erro}</Aviso>
      {carregando && <EstadoCarregando texto="Carregando serviços..." />}

      {!carregando && !erro && servicos.length === 0 && (
        <EstadoVazio
          icone="cube"
          titulo="Você ainda não cadastrou serviços"
          texto="Cadastre seu primeiro serviço para poder enviar propostas aos organizadores."
          acao={<BotaoLink to="/fornecedor/servicos/novo">Cadastrar serviço</BotaoLink>}
        />
      )}

      {servicos.length > 0 && (
        <section className="forn-painel">
          <div className="forn-painel-topo">
            <div>
              <h2>Serviços cadastrados</h2>
              <p>{servicos.length} {servicos.length === 1 ? "serviço" : "serviços"} no seu perfil</p>
            </div>
          </div>

          <div className="forn-tabela-wrap">
            <table className="forn-tabela">
              <thead>
                <tr>
                  <th>Serviço</th>
                  <th>Categoria</th>
                  <th>Preço base</th>
                  <th>Público</th>
                  <th>Status</th>
                  <th />
                </tr>
              </thead>
              <tbody>
                {servicos.map((servico) => {
                  const status = STATUS_SERVICO[servico.status] || { rotulo: servico.status, classe: "cinza" };

                  return (
                    <tr key={servico.id}>
                      <td><strong>{servico.nome}</strong></td>
                      <td>{rotuloCategoria(servico.categoria)}</td>
                      <td><strong>{formatarMoeda(servico.preco)}</strong></td>
                      <td>
                        {servico.publico_min != null
                          ? `${formatarNumero(servico.publico_min)}–${formatarNumero(servico.publico_max)}`
                          : "-"}
                      </td>
                      <td><Badge classe={status.classe}>{status.rotulo}</Badge></td>
                      <td>
                        <div className="forn-acoes">
                          <BotaoLink
                            to={`/fornecedor/servicos/${servico.id}/editar`}
                            icone={null}
                            variante="secundario"
                            pequeno
                          >
                            Editar
                          </BotaoLink>
                          <button
                            type="button"
                            className="forn-btn forn-btn-perigo forn-btn-pequeno"
                            disabled={excluindo === servico.id}
                            onClick={() => excluir(servico)}
                          >
                            {excluindo === servico.id ? "Excluindo..." : "Excluir"}
                          </button>
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

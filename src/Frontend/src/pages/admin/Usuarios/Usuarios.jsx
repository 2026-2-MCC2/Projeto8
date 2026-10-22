import { useMemo, useState } from "react";
import LayoutAdmin from "../../../components/admin/LayoutAdmin";
import PageHeader from "../../../components/admin/PageHeader";
import Badge from "../../../components/admin/Badge";
import ModalDetalhesCadastro from "../../../components/admin/ModalDetalhesCadastro";
import Icon from "../../../components/organizador/Icon";
import { formatarDataCompleta } from "../../../utils/datas";
import { obterIniciais } from "../../../utils/formatadores";
import { adminApi } from "../../../services/admin";
import useCarregar from "../../../hooks/useCarregar";

const ABAS = [
  { valor: "TODOS", rotulo: "Todos" },
  { valor: "APROVADO", rotulo: "Aprovados" },
  { valor: "REJEITADO", rotulo: "Rejeitados" },
];

const COR_STATUS = { APROVADO: "green", REJEITADO: "red" };
const ROTULO_STATUS = { APROVADO: "Aprovado", REJEITADO: "Rejeitado" };

export default function AdminUsuarios() {
  // Busca todos os cadastros na API. "dados" é null até a primeira resposta.
  const { dados, carregando, erro, recarregar } = useCarregar(
    () => adminApi.listarCadastros(),
    []
  );

  const [aba, setAba] = useState("TODOS");
  const [busca, setBusca] = useState("");
  const [tipo, setTipo] = useState("TODOS");
  const [detalhes, setDetalhes] = useState(null);
  const [feedback, setFeedback] = useState("");
  const [erroAcao, setErroAcao] = useState("");
  const [salvando, setSalvando] = useState(null); // id do cadastro em andamento

  const primeiraCarga = carregando && dados === null;

  // Esta página só mostra quem já foi analisado (PENDENTE fica em Aprovações)
  const analisados = useMemo(
    () => (dados ?? []).filter((c) => c.status !== "PENDENTE"),
    [dados]
  );

  // Contadores das abas, calculados a partir da lista
  const contagem = {
    TODOS: analisados.length,
    APROVADO: analisados.filter((c) => c.status === "APROVADO").length,
    REJEITADO: analisados.filter((c) => c.status === "REJEITADO").length,
  };

  const filtrados = useMemo(() => {
    const termo = busca.trim().toLowerCase();

    return analisados.filter((c) => {
      const passaAba = aba === "TODOS" || c.status === aba;
      const passaTipo = tipo === "TODOS" || c.tipo === tipo;
      const passaBusca =
        !termo ||
        c.nome.toLowerCase().includes(termo) ||
        c.email.toLowerCase().includes(termo);

      return passaAba && passaTipo && passaBusca;
    });
  }, [analisados, aba, tipo, busca]);

  // Pede à API para voltar o cadastro para PENDENTE e recarrega a lista:
  // ele deixa de aparecer aqui e volta para Aprovações.
  async function reabrirAnalise(cadastro) {
    setSalvando(cadastro.id);
    setFeedback("");
    setErroAcao("");

    try {
      await adminApi.analisarCadastro(cadastro.id, "PENDENTE");
      await recarregar();
      setFeedback(
        `A análise de ${cadastro.nome} foi reaberta e voltou para Aprovações.`
      );
    } catch (error) {
      setErroAcao(error.message);
    } finally {
      setSalvando(null);
    }
  }

  return (
    <LayoutAdmin active="usuarios">
      <main className="adm-main">
        <PageHeader
          eyebrow="USUÁRIOS"
          title="Usuários"
          description="Consulte organizadores e fornecedores que já tiveram o cadastro analisado."
        />

        {feedback && (
          <div className="adm-alert adm-alert-success">{feedback}</div>
        )}

        {(erro || erroAcao) && (
          <div className="adm-alert adm-alert-error">
            {erroAcao || erro}{" "}
            {erro && !erroAcao && (
              <button
                type="button"
                className="adm-text-button"
                onClick={recarregar}
              >
                Tentar novamente
              </button>
            )}
          </div>
        )}

        <div className="adm-tabs">
          {ABAS.map((a) => (
            <button
              key={a.valor}
              type="button"
              className={`adm-tab ${aba === a.valor ? "active" : ""}`}
              onClick={() => setAba(a.valor)}
            >
              {a.rotulo} ({contagem[a.valor]})
            </button>
          ))}
        </div>

        <div className="adm-toolbar">
          <div className="adm-search">
            <Icon name="search" size={16} />

            <input
              type="search"
              placeholder="Buscar por nome ou e-mail..."
              value={busca}
              onChange={(evento) => setBusca(evento.target.value)}
            />
          </div>

          <div className="adm-select">
            <Icon name="filter" size={15} />

            <select
              value={tipo}
              onChange={(evento) => setTipo(evento.target.value)}
            >
              <option value="TODOS">Todos os tipos</option>
              <option value="ORGANIZADOR">Organizadores</option>
              <option value="FORNECEDOR">Fornecedores</option>
            </select>
          </div>
        </div>

        <div className="adm-panel adm-table-panel">
          <div className="adm-table-scroll">
            <table className="adm-table">
              <thead>
                <tr>
                  <th>Nome</th>
                  <th>E-mail</th>
                  <th>Tipo</th>
                  <th>Status</th>
                  <th>Cadastro</th>
                  <th>Ações</th>
                </tr>
              </thead>

              <tbody>
                {primeiraCarga && (
                  <tr>
                    <td colSpan={6}>Carregando usuários...</td>
                  </tr>
                )}

                {!primeiraCarga && !erro && filtrados.length === 0 && (
                  <tr>
                    <td colSpan={6}>Nenhum usuário encontrado.</td>
                  </tr>
                )}

                {filtrados.map((c) => (
                  <tr key={c.id}>
                    <td>
                      <div className="adm-table-name">
                        <span className="adm-mini-avatar">
                          {obterIniciais(c.nome)}
                        </span>
                        <strong>{c.nome}</strong>
                      </div>
                    </td>

                    <td>{c.email}</td>

                    <td>
                      <Badge tone={c.tipo === "FORNECEDOR" ? "orange" : "blue"}>
                        {c.tipo === "FORNECEDOR" ? "Fornecedor" : "Organizador"}
                      </Badge>
                    </td>

                    <td>
                      <Badge tone={COR_STATUS[c.status]}>
                        {ROTULO_STATUS[c.status]}
                      </Badge>
                    </td>

                    <td>{formatarDataCompleta(c.criado_em)}</td>

                    <td>
                      <div className="adm-row-actions">
                        <button
                          type="button"
                          className="adm-text-button"
                          onClick={() => setDetalhes(c)}
                        >
                          Ver detalhes
                        </button>

                        <button
                          type="button"
                          className="adm-btn adm-btn-secondary adm-btn-small"
                          onClick={() => reabrirAnalise(c)}
                          disabled={salvando !== null}
                        >
                          Reabrir análise
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {detalhes && (
          <ModalDetalhesCadastro
            cadastro={detalhes}
            onFechar={() => setDetalhes(null)}
          />
        )}
      </main>
    </LayoutAdmin>
  );
}
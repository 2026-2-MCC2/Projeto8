import { useMemo, useState } from "react";
import LayoutAdmin from "../../../components/admin/LayoutAdmin";
import PageHeader from "../../../components/admin/PageHeader";
import Badge from "../../../components/admin/Badge";
import ModalDetalhesCadastro from "../../../components/admin/ModalDetalhesCadastro";
import ModalRejeicao from "../../../components/admin/ModalRejeicao";
import Icon from "../../../components/organizador/Icon";
import { formatarDataCompleta } from "../../../utils/datas";
import { obterIniciais } from "../../../utils/formatadores";
import { cadastrosExemplo } from "../cadastrosData";

export default function AdminAprovacoes() {
  const [cadastros, setCadastros] = useState(cadastrosExemplo);
  const [busca, setBusca] = useState("");
  const [tipo, setTipo] = useState("TODOS");
  const [detalhes, setDetalhes] = useState(null);
  const [rejeitando, setRejeitando] = useState(null);
  const [feedback, setFeedback] = useState("");

  const totalPendentes = cadastros.filter(
    (c) => c.status === "PENDENTE"
  ).length;

  const pendentes = useMemo(() => {
    const texto = busca.trim().toLowerCase();

    return cadastros.filter((c) => {
      const correspondeStatus = c.status === "PENDENTE";
      const correspondeTipo = tipo === "TODOS" || c.tipo === tipo;
      const correspondeBusca =
        !texto ||
        c.nome.toLowerCase().includes(texto) ||
        c.email.toLowerCase().includes(texto);

      return correspondeStatus && correspondeTipo && correspondeBusca;
    });
  }, [cadastros, busca, tipo]);

  function atualizarStatus(id, novoStatus, motivo = "") {
    setCadastros((lista) =>
      lista.map((c) =>
        c.id !== id
          ? c
          : {
              ...c,
              status: novoStatus,
              analisado_por_nome: "Administrador",
              data_analise: new Date().toISOString(),
              motivo_rejeicao: novoStatus === "REJEITADO" ? motivo : null,
            }
      )
    );
  }

  function aprovar(cadastro) {
    atualizarStatus(cadastro.id, "APROVADO");
    setFeedback(`${cadastro.nome} foi aprovado com sucesso.`);
  }

  function confirmarRejeicao(id, motivo) {
    const cadastro = cadastros.find((c) => c.id === id);

    atualizarStatus(id, "REJEITADO", motivo);
    setRejeitando(null);
    setFeedback(`${cadastro.nome} foi rejeitado.`);
  }

  return (
    <LayoutAdmin active="aprovacoes">
      <main className="adm-main">
        <PageHeader
          eyebrow="APROVAÇÕES"
          title="Aprovar cadastros"
          description="Revise novos perfis antes que eles entrem na plataforma."
        />

        <div className="adm-banner">
          <Icon name="clock" size={18} />

          <div>
            <strong>
              {totalPendentes}{" "}
              {totalPendentes === 1
                ? "cadastro aguardando revisão"
                : "cadastros aguardando revisão"}
            </strong>
            <p>Uma análise cuidadosa mantém a comunidade confiável.</p>
          </div>
        </div>

        {feedback && (
          <div className="adm-alert adm-alert-success">
            <Icon name="check" size={16} /> {feedback}
          </div>
        )}

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
                  <th>Data</th>
                  <th>Ações</th>
                </tr>
              </thead>

              <tbody>
                {pendentes.length === 0 && (
                  <tr>
                    <td colSpan="5">
                      {totalPendentes === 0
                        ? "Nenhum cadastro aguardando revisão."
                        : "Nenhum cadastro encontrado para os filtros escolhidos."}
                    </td>
                  </tr>
                )}

                {pendentes.map((c) => (
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
                          className="adm-btn adm-btn-primary adm-btn-small"
                          onClick={() => aprovar(c)}
                        >
                          <Icon name="check" size={14} /> Aprovar
                        </button>

                        <button
                          type="button"
                          className="adm-text-button danger"
                          onClick={() => setRejeitando(c)}
                        >
                          <Icon name="x" size={14} /> Rejeitar
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

        {rejeitando && (
          <ModalRejeicao
            cadastro={rejeitando}
            onConfirmar={confirmarRejeicao}
            onCancelar={() => setRejeitando(null)}
          />
        )}
      </main>
    </LayoutAdmin>
  );
}
import Modal from "./Modal";
import { formatarDataCompleta } from "../../utils/datas";
import { formatarDataHora } from "../../utils/formatadores";

function Campo({ rotulo, valor, completo = false }) {
  return (
    <div className={completo ? "adm-detail-full" : ""}>
      <span>{rotulo}</span>
      <strong>{valor || "Não informado"}</strong>
    </div>
  );
}

export default function ModalDetalhesCadastro({ cadastro, onFechar }) {
  const fornecedor = cadastro.tipo === "FORNECEDOR";

  const localizacao = cadastro.cidade
    ? `${cadastro.cidade} - ${cadastro.estado || ""}`
    : "";

  return (
    <Modal
      eyebrow={fornecedor ? "FORNECEDOR" : "ORGANIZADOR"}
      title={cadastro.nome}
      onFechar={onFechar}
    >
      {fornecedor ? (
        <div className="adm-detail-grid">
          <Campo rotulo="Razão social" valor={cadastro.razao_social} />
          <Campo rotulo="Nome fantasia" valor={cadastro.nome} />
          <Campo rotulo="CNPJ" valor={cadastro.cnpj} />
          <Campo rotulo="Categoria" valor={cadastro.categoria_atuacao} />
          <Campo rotulo="E-mail" valor={cadastro.email} />
          <Campo rotulo="Telefone" valor={cadastro.telefone} />
          <Campo rotulo="Localização" valor={localizacao} />
          <Campo
            rotulo="Área de atendimento"
            valor={cadastro.regiao_atendimento}
          />
          <Campo rotulo="Descrição" valor={cadastro.descricao} completo />
          <Campo rotulo="Site / Portfólio" valor={cadastro.site} completo />
        </div>
      ) : (
        <div className="adm-detail-grid">
          <Campo rotulo="Nome completo" valor={cadastro.nome} />
          <Campo rotulo="E-mail" valor={cadastro.email} />
          <Campo rotulo="Telefone" valor={cadastro.telefone} />
          <Campo rotulo="Localização" valor={localizacao} />
          <Campo
            rotulo="Eventos cadastrados"
            valor={String(cadastro.eventos_cadastrados ?? 0)}
          />
          <Campo
            rotulo="Data do cadastro"
            valor={formatarDataCompleta(cadastro.criado_em)}
          />
        </div>
      )}

      {cadastro.analisado_por_nome && (
        <div className="adm-history">
          <strong>Última análise</strong>
          <p>Analisado por: {cadastro.analisado_por_nome}</p>
          <p>Data: {formatarDataHora(cadastro.data_analise)}</p>
          {cadastro.motivo_rejeicao && (
            <p>Motivo da rejeição: {cadastro.motivo_rejeicao}</p>
          )}
        </div>
      )}
    </Modal>
  );
}
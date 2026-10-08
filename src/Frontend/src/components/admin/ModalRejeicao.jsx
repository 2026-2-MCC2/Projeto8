import { useState } from "react";
import Modal from "./Modal";

const MOTIVOS = [
  "Documentação incompleta",
  "Dados inválidos",
  "Informações insuficientes",
  "Cadastro em desacordo com as regras",
  "Outro",
];

export default function ModalRejeicao({ cadastro, onConfirmar, onCancelar }) {
  const [motivo, setMotivo] = useState("");
  const [observacao, setObservacao] = useState("");
  const [erro, setErro] = useState("");

  function handleConfirmar() {
    if (!motivo) {
      setErro("Selecione um motivo para a rejeição.");
      return;
    }

    const texto = observacao.trim()
      ? `${motivo} — ${observacao.trim()}`
      : motivo;

    onConfirmar(cadastro.id, texto);
  }

  return (
    <Modal
      eyebrow="REJEIÇÃO DE CADASTRO"
      title={cadastro.nome}
      onFechar={onCancelar}
    >
      <p className="adm-modal-text">
        Informe o motivo pelo qual este cadastro está sendo rejeitado.
      </p>

      {erro && <div className="adm-alert adm-alert-error">{erro}</div>}

      <label className="adm-field">
        Motivo
        <select
          value={motivo}
          onChange={(evento) => {
            setMotivo(evento.target.value);
            setErro("");
          }}
        >
          <option value="">Selecione um motivo</option>
          {MOTIVOS.map((item) => (
            <option key={item} value={item}>
              {item}
            </option>
          ))}
        </select>
      </label>

      <label className="adm-field">
        Observação
        <textarea
          rows="4"
          placeholder="Escreva uma observação adicional..."
          value={observacao}
          onChange={(evento) => setObservacao(evento.target.value)}
        />
      </label>

      <div className="adm-modal-actions">
        <button
          type="button"
          className="adm-btn adm-btn-secondary adm-btn-small"
          onClick={onCancelar}
        >
          Cancelar
        </button>

        <button
          type="button"
          className="adm-btn adm-btn-danger adm-btn-small"
          onClick={handleConfirmar}
        >
          Confirmar rejeição
        </button>
      </div>
    </Modal>
  );
}
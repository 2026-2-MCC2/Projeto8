import { useState } from "react";
import { apiRequest } from "../../services/api";
import { emModoDemonstracao } from "../../utils/sessao";
import "./AlterarSenha.css";

const CAMPOS_VAZIOS = { senha_atual: "", nova_senha: "", confirmar: "" };

// Cartão "Alterar senha". Usado em Minha conta do Organizador e do
// Administrador (o Fornecedor tem o dele). Fala com PATCH /conta/senha.
export default function AlterarSenha() {
  const [campos, setCampos] = useState(CAMPOS_VAZIOS);
  const [salvando, setSalvando] = useState(false);
  const [erro, setErro] = useState("");
  const [mensagem, setMensagem] = useState("");

  function alterar(evento) {
    const { name, value } = evento.target;
    setCampos((atual) => ({ ...atual, [name]: value }));
  }

  async function enviar(evento) {
    evento.preventDefault();
    setErro("");
    setMensagem("");

    if (emModoDemonstracao()) {
      setErro("A troca de senha não está disponível no modo demonstração.");
      return;
    }

    if (!campos.senha_atual) {
      setErro("Informe a senha atual.");
      return;
    }

    if (campos.nova_senha.length < 6) {
      setErro("A nova senha deve ter pelo menos 6 caracteres.");
      return;
    }

    if (campos.nova_senha !== campos.confirmar) {
      setErro("A confirmação não confere com a nova senha.");
      return;
    }

    if (campos.nova_senha === campos.senha_atual) {
      setErro("A nova senha deve ser diferente da atual.");
      return;
    }

    setSalvando(true);

    try {
      const resposta = await apiRequest("/conta/senha", {
        method: "PATCH",
        body: JSON.stringify({
          senha_atual: campos.senha_atual,
          nova_senha: campos.nova_senha,
        }),
      });

      setCampos(CAMPOS_VAZIOS);
      setMensagem(resposta?.mensagem || "Senha alterada com sucesso!");
    } catch (error) {
      setErro(error.message);
    } finally {
      setSalvando(false);
    }
  }

  return (
    <div className="senha">
      <h2>Alterar senha</h2>
      <p className="senha-descricao">
        Para sua segurança, informe a senha atual antes de definir a nova.
      </p>

      <form className="senha-form" onSubmit={enviar} noValidate>
        <label className="senha-campo">
          Senha atual
          <input
            name="senha_atual"
            type="password"
            autoComplete="current-password"
            value={campos.senha_atual}
            onChange={alterar}
          />
        </label>

        <div className="senha-linha">
          <label className="senha-campo">
            Nova senha
            <input
              name="nova_senha"
              type="password"
              autoComplete="new-password"
              value={campos.nova_senha}
              onChange={alterar}
            />
            <small>Mínimo de 6 caracteres.</small>
          </label>

          <label className="senha-campo">
            Confirmar nova senha
            <input
              name="confirmar"
              type="password"
              autoComplete="new-password"
              value={campos.confirmar}
              onChange={alterar}
            />
          </label>
        </div>

        {erro && <div className="senha-alerta erro" role="alert">{erro}</div>}
        {mensagem && <div className="senha-alerta sucesso" role="status">{mensagem}</div>}

        <div>
          <button type="submit" className="senha-botao" disabled={salvando}>
            {salvando ? "Alterando..." : "Alterar senha"}
          </button>
        </div>
      </form>
    </div>
  );
}
import { useMemo, useState } from "react";
import LayoutOrganizador from "../../../components/organizador/LayoutOrganizador";
import { apiRequest } from "../../../services/api";
import "./MinhaConta.css";

function obterUsuario() {
  try {
    const dados = sessionStorage.getItem("usuario");

    if (!dados) {
      return null;
    }

    const usuario = JSON.parse(dados);

    if (!usuario?.id) {
      return null;
    }

    return usuario;
  } catch {
    return null;
  }
}

function obterIniciais(nome) {
  const partes = String(nome || "Organizador")
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2);

  return (partes.map((parte) => parte[0]).join("") || "OR").toUpperCase();
}

function formatarTelefone(valor) {
  const digitos = String(valor || "").replace(/\D/g, "").slice(0, 11);

  if (digitos.length <= 10) {
    return digitos
      .replace(/^(\d{2})(\d)/, "($1) $2")
      .replace(/(\d{4})(\d)/, "$1-$2");
  }

  return digitos
    .replace(/^(\d{2})(\d)/, "($1) $2")
    .replace(/(\d{5})(\d)/, "$1-$2");
}

function apenasDigitos(valor) {
  return String(valor || "").replace(/\D/g, "");
}

export default function MinhaConta() {
  const usuarioInicial = useMemo(() => obterUsuario(), []);

  const [nome, setNome] = useState(usuarioInicial?.nome || "");
  const [telefone, setTelefone] = useState(
    formatarTelefone(usuarioInicial?.telefone || "")
  );
  const [email, setEmail] = useState(usuarioInicial?.email || "");

  const [propostas, setPropostas] = useState(true);
  const [oportunidades, setOportunidades] = useState(true);
  const [resumoSemanal, setResumoSemanal] = useState(false);

  const [salvando, setSalvando] = useState(false);
  const [mensagem, setMensagem] = useState("");
  const [erro, setErro] = useState("");

  const iniciais = obterIniciais(nome);
  const modoDemonstracao = sessionStorage.getItem("modoDemonstracao") === "true";

  async function handleSubmit(event) {
    event.preventDefault();
    setErro("");
    setMensagem("");

    const nomeNormalizado = nome.trim();
    const emailNormalizado = email.trim();
    const telefoneNormalizado = apenasDigitos(telefone);

    if (!nomeNormalizado || !emailNormalizado) {
      setErro("Nome e e-mail são obrigatórios.");
      return;
    }

    if (
      telefoneNormalizado &&
      (telefoneNormalizado.length < 10 || telefoneNormalizado.length > 11)
    ) {
      setErro("Informe um telefone válido com 10 ou 11 dígitos.");
      return;
    }

    const dadosAtualizados = {
      ...usuarioInicial,
      nome: nomeNormalizado,
      telefone: telefoneNormalizado,
      email: emailNormalizado,
    };

    setSalvando(true);

    try {
      if (modoDemonstracao) {
        sessionStorage.setItem("usuario", JSON.stringify(dadosAtualizados));
        setMensagem("Alterações salvas apenas nesta demonstração.");
      } else {
        const resposta = await apiRequest(`/usuarios/${usuarioInicial.id}`, {
          method: "PATCH",
          body: JSON.stringify({
            nome: nomeNormalizado,
            email: emailNormalizado,
            telefone: telefoneNormalizado,
          }),
        });

        const usuarioResposta = resposta?.usuario || resposta?.dados || {};
        const usuarioPersistido = {
          ...usuarioInicial,
          ...usuarioResposta,
          nome: usuarioResposta.nome || nomeNormalizado,
          email: usuarioResposta.email || emailNormalizado,
          telefone: usuarioResposta.telefone ?? telefoneNormalizado,
        };

        sessionStorage.setItem("usuario", JSON.stringify(usuarioPersistido));
        setMensagem("Alterações salvas com sucesso.");
      }
    } catch (error) {
      setErro(error.message);
    } finally {
      setSalvando(false);

      window.setTimeout(() => {
        setMensagem("");
      }, 3000);
    }
  }

  return (
    <LayoutOrganizador active="minha-conta">
      <main className="minha-conta-page">
        <header className="minha-conta-header">
          <span>MINHA CONTA</span>

          <h1>Configurações da conta</h1>

          <p>Mantenha seus dados e preferências atualizados.</p>
        </header>

        <section className="conta-grid">
          <article className="perfil-card">
            <div className="perfil-top">
              <div className="perfil-identidade">
                <div className="perfil-avatar">{iniciais}</div>

                <div>
                  <h2>{nome || "Organizador"}</h2>

                  <p>Dados do perfil do organizador</p>
                </div>
              </div>

              <button
                type="button"
                className="alterar-foto-button"
                disabled
                title="Upload de foto ainda não está disponível"
              >
                Alterar foto
              </button>
            </div>

            <div className="perfil-divider" />

            <form className="perfil-form" onSubmit={handleSubmit}>
              <div className="form-row">
                <div className="form-field">
                  <label htmlFor="nome">Nome</label>

                  <input
                    id="nome"
                    type="text"
                    value={nome}
                    onChange={(event) =>
                      setNome(event.target.value.slice(0, 100))
                    }
                    maxLength={100}
                    autoComplete="name"
                    required
                  />
                </div>

                <div className="form-field">
                  <label htmlFor="telefone">Telefone</label>

                  <input
                    id="telefone"
                    type="tel"
                    value={telefone}
                    onChange={(event) =>
                      setTelefone(formatarTelefone(event.target.value))
                    }
                    maxLength={16}
                    autoComplete="tel"
                  />
                </div>
              </div>

              <div className="form-field">
                <label htmlFor="email">Email</label>

                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(event) =>
                    setEmail(event.target.value.slice(0, 120))
                  }
                  maxLength={120}
                  autoComplete="email"
                  required
                />
              </div>

              {erro && <p className="conta-mensagem conta-mensagem-erro">{erro}</p>}
              {mensagem && (
                <p className="conta-mensagem conta-mensagem-sucesso">{mensagem}</p>
              )}

              <div className="form-actions">
                <button type="submit" className="salvar-button" disabled={salvando}>
                  {salvando ? "Salvando..." : "Salvar alterações"}
                </button>
              </div>
            </form>
          </article>

          <article className="preferencias-card">
            <header>
              <h2>Preferências</h2>

              <p>Escolha como quer receber novidades.</p>
            </header>

            <div className="preferencias-list">
              <Preferencia
                titulo="Atualizações de propostas"
                descricao="Receba alertas quando algo mudar."
                ativo={propostas}
                onChange={setPropostas}
              />

              <Preferencia
                titulo="Novas oportunidades"
                descricao="Descubra eventos que combinam com você."
                ativo={oportunidades}
                onChange={setOportunidades}
              />

              <Preferencia
                titulo="Resumo semanal"
                descricao="Uma visão rápida do seu planejamento."
                ativo={resumoSemanal}
                onChange={setResumoSemanal}
              />
            </div>

            <p className="preferencias-observacao">
              As preferências ficam locais nesta entrega e ainda não são
              persistidas pela API.
            </p>
          </article>
        </section>
      </main>
    </LayoutOrganizador>
  );
}

function Preferencia({ titulo, descricao, ativo, onChange }) {
  return (
    <label className="preferencia">
      <span className="preferencia-texto">
        <strong>{titulo}</strong>
        <small>{descricao}</small>
      </span>

      <input
        type="checkbox"
        checked={ativo}
        onChange={(event) => onChange(event.target.checked)}
      />

      <span className="switch" aria-hidden="true">
        <span />
      </span>
    </label>
  );
}

import { useMemo, useState } from "react";
import LayoutAdmin from "../../../components/admin/LayoutAdmin";
import PageHeader from "../../../components/admin/PageHeader";
import { apiRequest } from "../../../services/api";
import {
  apenasDigitos,
  formatarTelefone,
  obterIniciais,
} from "../../../utils/formatadores";

function obterUsuario() {
  try {
    const dados = sessionStorage.getItem("usuario");

    if (!dados) {
      return null;
    }

    const usuario = JSON.parse(dados);

    return usuario?.id ? usuario : null;
  } catch {
    return null;
  }
}

// Texto de cada interruptor. A "chave" liga o texto ao valor no estado.
const PREFERENCIAS = [
  {
    chave: "cadastros",
    titulo: "Novos cadastros",
    descricao: "Receba alertas quando houver cadastros para aprovar.",
  },
  {
    chave: "atividade",
    titulo: "Atividade da plataforma",
    descricao: "Acompanhe eventos publicados e propostas aceitas.",
  },
  {
    chave: "resumo",
    titulo: "Resumo semanal",
    descricao: "Uma visão rápida da plataforma.",
  },
];

export default function AdminMinhaConta() {
  const usuarioInicial = useMemo(() => obterUsuario(), []);

  const [nome, setNome] = useState(usuarioInicial?.nome || "");
  const [telefone, setTelefone] = useState(
    formatarTelefone(usuarioInicial?.telefone || "")
  );
  const [email, setEmail] = useState(usuarioInicial?.email || "");

  // Os 3 interruptores ficam juntos em UM objeto
  const [preferencias, setPreferencias] = useState({
    cadastros: true,
    atividade: true,
    resumo: false,
  });

  const [salvando, setSalvando] = useState(false);
  const [mensagem, setMensagem] = useState("");
  const [erro, setErro] = useState("");

  const iniciais = obterIniciais(nome) || "AD";
  const modoDemonstracao =
    sessionStorage.getItem("modoDemonstracao") === "true";

  function alterarPreferencia(chave, valor) {
    // Atualização imutável: copia o objeto e troca só uma chave
    setPreferencias((atual) => ({ ...atual, [chave]: valor }));
  }

  async function handleSubmit(evento) {
    evento.preventDefault();
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

    // O telefone só vai no corpo se estiver preenchido. Assim, salvar com o
    // campo vazio NÃO apaga o telefone que já está no banco.
    const corpo = { nome: nomeNormalizado, email: emailNormalizado };

    if (telefoneNormalizado) {
      corpo.telefone = telefoneNormalizado;
    }

    setSalvando(true);

    try {
      if (!modoDemonstracao) {
        await apiRequest(`/usuarios/${usuarioInicial.id}`, {
          method: "PATCH",
          body: JSON.stringify(corpo),
        });
      }

      // Guarda o novo nome/e-mail na sessão (o menu lateral mostra
      // o nome novo na próxima vez que a página carregar)
      sessionStorage.setItem(
        "usuario",
        JSON.stringify({ ...usuarioInicial, ...corpo })
      );

      setMensagem(
        modoDemonstracao
          ? "Alterações salvas apenas nesta demonstração."
          : "Alterações salvas com sucesso."
      );
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
    <LayoutAdmin active="minha-conta">
      <main className="adm-main">
        <PageHeader
          eyebrow="MINHA CONTA"
          title="Configurações da conta"
          description="Mantenha seus dados e preferências atualizados."
        />

        <div className="adm-account-grid">
          <section className="adm-panel adm-panel-padded">
            <div className="adm-profile-top">
              <div className="adm-profile-id">
                <div className="adm-avatar">{iniciais}</div>

                <div>
                  <h2>{nome || "Administrador"}</h2>
                  <p>Administrador da plataforma</p>
                </div>
              </div>

              <button
                type="button"
                className="adm-btn adm-btn-secondary adm-btn-small"
                disabled
                title="Upload de foto ainda não está disponível"
              >
                Alterar foto
              </button>
            </div>

            <form className="adm-form" onSubmit={handleSubmit}>
              <div className="adm-form-row">
                <div className="adm-form-field">
                  <label htmlFor="conta-nome">Nome</label>

                  <input
                    id="conta-nome"
                    type="text"
                    value={nome}
                    onChange={(evento) =>
                      setNome(evento.target.value.slice(0, 100))
                    }
                    maxLength={100}
                    autoComplete="name"
                    required
                  />
                </div>

                <div className="adm-form-field">
                  <label htmlFor="conta-telefone">Telefone</label>

                  <input
                    id="conta-telefone"
                    type="tel"
                    value={telefone}
                    onChange={(evento) =>
                      setTelefone(formatarTelefone(evento.target.value))
                    }
                    maxLength={16}
                    autoComplete="tel"
                  />

                  <small className="adm-hint">
                    Deixe em branco para manter o telefone atual.
                  </small>
                </div>
              </div>

              <div className="adm-form-field">
                <label htmlFor="conta-email">E-mail</label>

                <input
                  id="conta-email"
                  type="email"
                  value={email}
                  onChange={(evento) =>
                    setEmail(evento.target.value.slice(0, 120))
                  }
                  maxLength={120}
                  autoComplete="email"
                  required
                />
              </div>

              {erro && <div className="adm-alert adm-alert-error">{erro}</div>}
              {mensagem && (
                <div className="adm-alert adm-alert-success">{mensagem}</div>
              )}

              <div className="adm-form-actions">
                <button
                  type="submit"
                  className="adm-btn adm-btn-primary"
                  disabled={salvando}
                >
                  {salvando ? "Salvando..." : "Salvar alterações"}
                </button>
              </div>
            </form>
          </section>

          <section className="adm-panel adm-panel-padded">
            <div className="adm-panel-heading">
              <div>
                <h2>Preferências</h2>
                <p>Escolha como quer receber novidades.</p>
              </div>
            </div>

            <div className="adm-pref-list">
              {PREFERENCIAS.map((item) => (
                <label className="adm-pref" key={item.chave}>
                  <span className="adm-pref-text">
                    <strong>{item.titulo}</strong>
                    <small>{item.descricao}</small>
                  </span>

                  <input
                    type="checkbox"
                    checked={preferencias[item.chave]}
                    onChange={(evento) =>
                      alterarPreferencia(item.chave, evento.target.checked)
                    }
                  />

                  <span className="adm-switch" aria-hidden="true">
                    <span />
                  </span>
                </label>
              ))}
            </div>

            <p className="adm-pref-note">
              As preferências ficam locais nesta entrega e ainda não são
              salvas pela API.
            </p>
          </section>
        </div>
      </main>
    </LayoutAdmin>
  );
}
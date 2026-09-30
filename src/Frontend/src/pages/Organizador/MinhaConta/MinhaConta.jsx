import { useMemo, useState } from "react";
import LayoutOrganizador from "../../../components/organizador/LayoutOrganizador";
import "./MinhaConta.css";

const USUARIO_PADRAO = {
  nome: "Brian Costa",
  telefone: "(11) 99999-0000",
  email: "brian@trocaticket.com",
};

function obterUsuario() {
  try {
    const dados = sessionStorage.getItem("usuario");

    if (!dados) {
      return USUARIO_PADRAO;
    }

    const usuario = JSON.parse(dados);

    return {
      nome: usuario?.nome || USUARIO_PADRAO.nome,
      telefone: usuario?.telefone || USUARIO_PADRAO.telefone,
      email: usuario?.email || USUARIO_PADRAO.email,
    };
  } catch {
    return USUARIO_PADRAO;
  }
}

function obterIniciais(nome) {
  const partes = String(nome).trim().split(/\s+/).filter(Boolean).slice(0, 2);

  return (partes.map((parte) => parte[0]).join("") || "BC").toUpperCase();
}

export default function MinhaConta() {
  const usuarioInicial = useMemo(() => obterUsuario(), []);

  const [nome, setNome] = useState(usuarioInicial.nome);
  const [telefone, setTelefone] = useState(usuarioInicial.telefone);
  const [email, setEmail] = useState(usuarioInicial.email);

  const [propostas, setPropostas] = useState(true);
  const [oportunidades, setOportunidades] = useState(true);
  const [resumoSemanal, setResumoSemanal] = useState(false);

  const [salvo, setSalvo] = useState(false);

  const iniciais = obterIniciais(nome);

  function handleSubmit(event) {
    event.preventDefault();

    const dadosAtualizados = {
      ...usuarioInicial,
      nome: nome.trim(),
      telefone: telefone.trim(),
      email: email.trim(),
    };

    sessionStorage.setItem("usuario", JSON.stringify(dadosAtualizados));

    setSalvo(true);

    window.setTimeout(() => {
      setSalvo(false);
    }, 3000);
  }

  function handleFoto() {
    // A interface já está preparada para a futura integração
    // de upload de foto. Não enviamos arquivos sem API definida.
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

                  <p>Organizador desde agosto de 2026</p>
                </div>
              </div>

              <button
                type="button"
                className="alterar-foto-button"
                onClick={handleFoto}
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
                      setTelefone(event.target.value.slice(0, 20))
                    }
                    maxLength={20}
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

              <div className="form-actions">
                <button type="submit" className="salvar-button">
                  Salvar alterações
                  {salvo && <span aria-label="Alterações salvas">✓</span>}
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

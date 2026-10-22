import { useEffect, useState } from "react";
import LayoutFornecedor from "../../../components/fornecedor/LayoutFornecedor";
import {
  Aviso,
  CabecalhoPagina,
  EstadoCarregando,
} from "../../../components/fornecedor/Componentes";
import { fornecedorApi } from "../../../services/fornecedor";
import {
  CATEGORIAS,
  apenasDigitos,
  formatarCnpj,
  formatarTelefone,
} from "../../../utils/fornecedor";

const SENHA_VAZIA = { senha_atual: "", nova_senha: "", confirmar: "" };

function iniciais(nome) {
  return String(nome || "F")
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((parte) => parte.charAt(0))
    .join("")
    .toUpperCase();
}

// Mantém o nome exibido no topo do layout em sincronia com o perfil salvo.
function atualizarUsuarioNaSessao(perfil) {
  try {
    const atual = JSON.parse(sessionStorage.getItem("usuario") || "null");

    if (atual) {
      sessionStorage.setItem(
        "usuario",
        JSON.stringify({ ...atual, nome: perfil.nome, email: perfil.email })
      );
    }
  } catch {
    // sessionStorage indisponível: o layout apenas continua com o nome anterior.
  }
}

export default function MinhaContaFornecedor() {
  const [perfil, setPerfil] = useState(null);
  const [form, setForm] = useState(null);
  const [senha, setSenha] = useState(SENHA_VAZIA);
  const [carregando, setCarregando] = useState(true);
  const [salvando, setSalvando] = useState(false);
  const [salvandoSenha, setSalvandoSenha] = useState(false);
  const [erro, setErro] = useState("");
  const [erroSenha, setErroSenha] = useState("");
  const [sucesso, setSucesso] = useState("");
  const [sucessoSenha, setSucessoSenha] = useState("");

  function aplicarPerfil(dados) {
    setPerfil(dados);
    setForm({
      nome: dados.nome,
      email: dados.email,
      telefone: formatarTelefone(dados.telefone),
      categoria_atuacao: dados.categoria_atuacao,
    });
  }

  useEffect(() => {
    let cancelado = false;

    fornecedorApi
      .perfil()
      .then((dados) => !cancelado && aplicarPerfil(dados))
      .catch((error) => !cancelado && setErro(error.message))
      .finally(() => !cancelado && setCarregando(false));

    return () => {
      cancelado = true;
    };
  }, []);

  function alterar(event) {
    const { name, value } = event.target;
    setForm((atual) => ({ ...atual, [name]: value }));
  }

  async function salvarPerfil(event) {
    event.preventDefault();
    setErro("");
    setSucesso("");

    const telefone = apenasDigitos(form.telefone);

    if (!form.nome.trim()) return setErro("Informe seu nome.");
    if (telefone.length < 10 || telefone.length > 11) {
      return setErro("Informe um telefone válido com DDD (10 ou 11 dígitos).");
    }

    setSalvando(true);

    try {
      const resposta = await fornecedorApi.atualizarPerfil({
        nome: form.nome.trim(),
        email: form.email.trim(),
        telefone,
        categoria_atuacao: form.categoria_atuacao,
      });

      aplicarPerfil(resposta.perfil);
      atualizarUsuarioNaSessao(resposta.perfil);
      setSucesso(resposta.mensagem);
    } catch (error) {
      setErro(error.message);
    } finally {
      setSalvando(false);
    }
  }

  async function salvarSenha(event) {
    event.preventDefault();
    setErroSenha("");
    setSucessoSenha("");

    if (senha.nova_senha.length < 6) {
      return setErroSenha("A nova senha deve ter pelo menos 6 caracteres.");
    }

    if (senha.nova_senha !== senha.confirmar) {
      return setErroSenha("A confirmação não confere com a nova senha.");
    }

    setSalvandoSenha(true);

    try {
      const resposta = await fornecedorApi.atualizarPerfil({
        senha_atual: senha.senha_atual,
        nova_senha: senha.nova_senha,
      });

      setSenha(SENHA_VAZIA);
      setSucessoSenha(resposta.mensagem === "Perfil atualizado com sucesso!" ? "Senha alterada com sucesso!" : resposta.mensagem);
    } catch (error) {
      setErroSenha(error.message);
    } finally {
      setSalvandoSenha(false);
    }
  }

  return (
    <LayoutFornecedor active="minha-conta">
      <CabecalhoPagina
        eyebrow="MINHA CONTA"
        titulo="Configurações da conta"
        descricao="Mantenha seus dados de fornecedor atualizados."
      />

      {carregando && <EstadoCarregando />}
      {!carregando && !form && <Aviso>{erro}</Aviso>}

      {form && (
        <div className="forn-duas-colunas">
          <form className="forn-painel forn-form" onSubmit={salvarPerfil} noValidate>
            <div className="forn-conta-topo">
              <span className="forn-conta-avatar">{iniciais(perfil.nome)}</span>
              <div>
                <h2>{perfil.nome}</h2>
                <p>CNPJ {formatarCnpj(perfil.cnpj)}</p>
              </div>
            </div>

            <Aviso tipo="sucesso" onFechar={() => setSucesso("")}>{sucesso}</Aviso>
            <Aviso onFechar={() => setErro("")}>{erro}</Aviso>

            <div className="forn-campos">
              <div className="forn-campos dois">
                <label className="forn-campo">
                  Nome
                  <input name="nome" value={form.nome} onChange={alterar} maxLength={250} />
                </label>

                <label className="forn-campo">
                  Telefone
                  <input name="telefone" value={form.telefone} onChange={alterar} placeholder="(11) 99999-0000" />
                </label>
              </div>

              <label className="forn-campo">
                E-mail
                <input name="email" type="email" value={form.email} onChange={alterar} maxLength={250} />
              </label>

              <div className="forn-campos dois">
                <label className="forn-campo">
                  CNPJ
                  <input value={formatarCnpj(perfil.cnpj)} readOnly />
                  <small>O CNPJ não pode ser alterado.</small>
                </label>

                <label className="forn-campo">
                  Categoria de atuação
                  <select name="categoria_atuacao" value={form.categoria_atuacao} onChange={alterar}>
                    {CATEGORIAS.map((categoria) => (
                      <option key={categoria.valor} value={categoria.valor}>
                        {categoria.rotulo}
                      </option>
                    ))}
                    {!CATEGORIAS.some((c) => c.valor === form.categoria_atuacao) && (
                      <option value={form.categoria_atuacao}>{form.categoria_atuacao}</option>
                    )}
                  </select>
                </label>
              </div>
            </div>

            <div className="forn-form-acoes">
              <button type="submit" className="forn-btn forn-btn-primario" disabled={salvando}>
                {salvando ? "Salvando..." : "Salvar alterações"}
              </button>
            </div>
          </form>

          <form className="forn-painel forn-form" onSubmit={salvarSenha} noValidate>
            <h2 className="forn-titulo-form">Alterar senha</h2>

            <Aviso tipo="sucesso" onFechar={() => setSucessoSenha("")}>{sucessoSenha}</Aviso>
            <Aviso onFechar={() => setErroSenha("")}>{erroSenha}</Aviso>

            <div className="forn-campos">
              <label className="forn-campo">
                Senha atual
                <input
                  type="password"
                  autoComplete="current-password"
                  value={senha.senha_atual}
                  onChange={(e) => setSenha({ ...senha, senha_atual: e.target.value })}
                />
              </label>

              <label className="forn-campo">
                Nova senha
                <input
                  type="password"
                  autoComplete="new-password"
                  value={senha.nova_senha}
                  onChange={(e) => setSenha({ ...senha, nova_senha: e.target.value })}
                />
                <small>Mínimo de 6 caracteres.</small>
              </label>

              <label className="forn-campo">
                Confirmar nova senha
                <input
                  type="password"
                  autoComplete="new-password"
                  value={senha.confirmar}
                  onChange={(e) => setSenha({ ...senha, confirmar: e.target.value })}
                />
              </label>
            </div>

            <div className="forn-form-acoes">
              <button type="submit" className="forn-btn forn-btn-secundario" disabled={salvandoSenha}>
                {salvandoSenha ? "Alterando..." : "Alterar senha"}
              </button>
            </div>
          </form>
        </div>
      )}
    </LayoutFornecedor>
  );
}

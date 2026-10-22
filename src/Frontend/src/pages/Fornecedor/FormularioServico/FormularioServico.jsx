import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import LayoutFornecedor from "../../../components/fornecedor/LayoutFornecedor";
import {
  Aviso,
  CabecalhoPagina,
  EstadoCarregando,
} from "../../../components/fornecedor/Componentes";
import { fornecedorApi } from "../../../services/fornecedor";
import { CATEGORIAS } from "../../../utils/fornecedor";

const FORMULARIO_VAZIO = {
  nome: "",
  categoria: "",
  descricao: "",
  preco: "",
  publico_min: "",
  publico_max: "",
  status: "ATIVO",
};

// Mesmas regras do backend (routes/fornecedor.js). O servidor continua sendo
// a validação definitiva; aqui só evitamos uma ida à API com dados óbvios.
function validar(form) {
  if (!form.nome.trim()) return "Informe o nome do serviço.";
  if (!form.categoria) return "Selecione uma categoria.";
  if (!form.descricao.trim()) return "Descreva o que está incluso no serviço.";

  const preco = Number(form.preco);
  const min = Number(form.publico_min);
  const max = Number(form.publico_max);

  if (!form.preco || !Number.isFinite(preco) || preco <= 0) {
    return "Informe um preço base maior que zero.";
  }

  if (!Number.isInteger(min) || min <= 0 || !Number.isInteger(max) || max <= 0) {
    return "O público mínimo e o máximo devem ser números inteiros positivos.";
  }

  if (min >= max) return "O público mínimo deve ser menor que o público máximo.";

  return "";
}

// Serve para "Novo serviço" (/servicos/novo) e "Editar serviço" (/servicos/:id/editar).
export default function FormularioServico() {
  const { id } = useParams();
  const editando = Boolean(id);
  const navigate = useNavigate();

  const [form, setForm] = useState(FORMULARIO_VAZIO);
  const [carregando, setCarregando] = useState(editando);
  const [salvando, setSalvando] = useState(false);
  const [erro, setErro] = useState("");

  useEffect(() => {
    if (!editando) return;

    let cancelado = false;

    fornecedorApi
      .buscarServico(id)
      .then((servico) => {
        if (cancelado) return;

        setForm({
          nome: servico.nome,
          categoria: servico.categoria,
          descricao: servico.descricao,
          preco: String(servico.preco ?? ""),
          publico_min: String(servico.publico_min ?? ""),
          publico_max: String(servico.publico_max ?? ""),
          status: servico.status,
        });
      })
      .catch((error) => !cancelado && setErro(error.message))
      .finally(() => !cancelado && setCarregando(false));

    return () => {
      cancelado = true;
    };
  }, [id, editando]);

  function alterar(event) {
    const { name, value } = event.target;
    setForm((atual) => ({ ...atual, [name]: value }));
  }

  async function enviar(event) {
    event.preventDefault();
    setErro("");

    const mensagemErro = validar(form);

    if (mensagemErro) {
      setErro(mensagemErro);
      return;
    }

    const corpo = {
      nome: form.nome.trim(),
      categoria: form.categoria,
      descricao: form.descricao.trim(),
      preco: Number(form.preco),
      publico_min: Number(form.publico_min),
      publico_max: Number(form.publico_max),
      status: form.status,
    };

    setSalvando(true);

    try {
      const resposta = editando
        ? await fornecedorApi.atualizarServico(id, corpo)
        : await fornecedorApi.criarServico(corpo);

      navigate("/fornecedor/servicos", { state: { mensagem: resposta.mensagem } });
    } catch (error) {
      setErro(error.message);
      setSalvando(false);
    }
  }

  return (
    <LayoutFornecedor active="servicos">
      <CabecalhoPagina
        eyebrow={editando ? "EDITAR SERVIÇO" : "NOVO SERVIÇO"}
        titulo={editando ? "Editar serviço" : "Cadastrar serviço"}
        descricao="Mostre aos organizadores como você pode tornar os eventos melhores."
      />

      {carregando ? (
        <EstadoCarregando />
      ) : (
        <form className="forn-painel forn-form" onSubmit={enviar} noValidate>
          <Aviso>{erro}</Aviso>

          <div className="forn-campos">
            <div className="forn-campos dois">
              <label className="forn-campo">
                Nome do serviço
                <input
                  name="nome"
                  value={form.nome}
                  onChange={alterar}
                  maxLength={200}
                  placeholder="Ex.: DJ para eventos universitários"
                />
              </label>

              <label className="forn-campo">
                Categoria
                <select name="categoria" value={form.categoria} onChange={alterar}>
                  <option value="">Selecione uma categoria</option>
                  {CATEGORIAS.map((categoria) => (
                    <option key={categoria.valor} value={categoria.valor}>
                      {categoria.rotulo}
                    </option>
                  ))}
                </select>
              </label>
            </div>

            <label className="forn-campo">
              Descrição
              <textarea
                name="descricao"
                value={form.descricao}
                onChange={alterar}
                maxLength={5000}
                placeholder="Descreva o que está incluso na sua entrega..."
              />
            </label>

            <div className="forn-campos tres">
              <label className="forn-campo">
                Preço base (R$)
                <input
                  name="preco"
                  type="number"
                  min="0"
                  step="0.01"
                  value={form.preco}
                  onChange={alterar}
                  placeholder="2800"
                />
              </label>

              <label className="forn-campo">
                Público mínimo
                <input
                  name="publico_min"
                  type="number"
                  min="1"
                  step="1"
                  value={form.publico_min}
                  onChange={alterar}
                  placeholder="100"
                />
              </label>

              <label className="forn-campo">
                Público máximo
                <input
                  name="publico_max"
                  type="number"
                  min="1"
                  step="1"
                  value={form.publico_max}
                  onChange={alterar}
                  placeholder="1500"
                />
              </label>
            </div>

            <label className="forn-campo">
              Status
              <select name="status" value={form.status} onChange={alterar}>
                <option value="ATIVO">Ativo - disponível para propostas</option>
                <option value="RASCUNHO">Rascunho - oculto, não pode enviar propostas</option>
              </select>
            </label>
          </div>

          <div className="forn-form-acoes">
            <Link to="/fornecedor/servicos" className="forn-btn forn-btn-secundario">
              Cancelar
            </Link>
            <button type="submit" className="forn-btn forn-btn-primario" disabled={salvando}>
              {salvando ? "Salvando..." : editando ? "Salvar alterações" : "Publicar serviço"}
            </button>
          </div>
        </form>
      )}
    </LayoutFornecedor>
  );
}

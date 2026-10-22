import { useState } from "react";
import { Link, useParams } from "react-router-dom";
import LayoutFornecedor from "../../../components/fornecedor/LayoutFornecedor";
import {
  Aviso,
  Badge,
  BotaoLink,
  CabecalhoPagina,
  EstadoCarregando,
} from "../../../components/fornecedor/Componentes";
import useCarregar from "../../../hooks/useCarregar";
import { fornecedorApi } from "../../../services/fornecedor";
import { formatarDataCompleta } from "../../../utils/datas";
import { STATUS_PROPOSTA, formatarMoeda } from "../../../utils/fornecedor";

const FORMULARIO_VAZIO = { id_servico: "", valor: "", prazo_dias: "", observacao: "" };

export default function DetalheOportunidade() {
  const { id } = useParams();

  const { dados, carregando, erro, recarregar } = useCarregar(
    () => fornecedorApi.buscarOportunidade(id),
    [id]
  );

  const [form, setForm] = useState(FORMULARIO_VAZIO);
  const [enviando, setEnviando] = useState(false);
  const [erroEnvio, setErroEnvio] = useState("");
  const [sucesso, setSucesso] = useState("");

  const evento = dados?.evento;
  const servicos = dados?.servicos || [];
  const disponiveis = servicos.filter((servico) => !servico.id_proposta);
  const jaEnviadas = servicos.filter((servico) => servico.id_proposta);

  function escolherServico(event) {
    const idServico = event.target.value;
    const servico = disponiveis.find((item) => String(item.id) === idServico);

    // Sugere o preço de tabela do serviço para o público deste evento.
    setForm((atual) => ({
      ...atual,
      id_servico: idServico,
      valor: servico?.preco_tabela != null ? String(servico.preco_tabela) : atual.valor,
    }));
  }

  function alterar(event) {
    const { name, value } = event.target;
    setForm((atual) => ({ ...atual, [name]: value }));
  }

  async function enviar(event) {
    event.preventDefault();
    setErroEnvio("");
    setSucesso("");

    const valor = Number(form.valor);
    const prazo = Number(form.prazo_dias);

    if (!form.id_servico) return setErroEnvio("Selecione o serviço que será oferecido.");
    if (!form.valor || !Number.isFinite(valor) || valor <= 0) {
      return setErroEnvio("Informe um valor maior que zero.");
    }
    if (!Number.isInteger(prazo) || prazo <= 0) {
      return setErroEnvio("Informe o prazo de entrega em dias (número inteiro).");
    }

    setEnviando(true);

    try {
      const resposta = await fornecedorApi.enviarProposta({
        id_evento: Number(id),
        id_servico: Number(form.id_servico),
        valor,
        prazo_dias: prazo,
        observacao: form.observacao.trim() || undefined,
      });

      setSucesso(resposta.mensagem);
      setForm(FORMULARIO_VAZIO);
      await recarregar();
    } catch (error) {
      setErroEnvio(error.message);
    } finally {
      setEnviando(false);
    }
  }

  return (
    <LayoutFornecedor active="oportunidades">
      <Link to="/fornecedor/oportunidades" className="forn-voltar">
        ← Oportunidades
      </Link>

      <Aviso>{erro}</Aviso>
      {carregando && !dados && <EstadoCarregando />}

      {evento && (
        <>
          <CabecalhoPagina
            eyebrow="DETALHE DA OPORTUNIDADE"
            titulo={evento.nome}
            descricao={`${formatarDataCompleta(evento.data_evento, evento.horario)} · ${evento.local}`}
            acao={
              <Badge classe={dados.aberta ? "azul" : "cinza"}>
                {dados.aberta ? "Oportunidade aberta" : "Encerrada para propostas"}
              </Badge>
            }
          />

          <div className="forn-duas-colunas">
            <section className="forn-painel forn-bloco">
              <h2>Sobre o evento</h2>
              <p>{evento.descricao || "O organizador não adicionou uma descrição."}</p>

              <div className="forn-info-grid">
                <div>
                  <small>Organizador</small>
                  <strong>{evento.organizador_nome}</strong>
                </div>
                <div>
                  <small>Data e horário</small>
                  <strong>{formatarDataCompleta(evento.data_evento, evento.horario)}</strong>
                </div>
                <div>
                  <small>Local</small>
                  <strong>{evento.local}</strong>
                </div>
                <div>
                  <small>Público estimado</small>
                  <strong>{evento.publico_min}–{evento.publico_max} pessoas</strong>
                </div>
              </div>

              {jaEnviadas.length > 0 && (
                <div className="forn-propostas-evento">
                  <h3>Suas propostas neste evento</h3>
                  {jaEnviadas.map((servico) => {
                    const status = STATUS_PROPOSTA[servico.status_proposta] || {
                      rotulo: servico.status_proposta,
                      classe: "cinza",
                    };

                    return (
                      <div key={servico.id_proposta}>
                        <span>
                          <strong>{servico.nome}</strong> · {formatarMoeda(servico.valor_proposta)}
                        </span>
                        <Badge classe={status.classe}>{status.rotulo}</Badge>
                      </div>
                    );
                  })}
                </div>
              )}
            </section>

            <section className="forn-painel forn-bloco">
              <h2>Enviar proposta</h2>

              {!dados.aberta ? (
                <p>Este evento não está mais recebendo propostas.</p>
              ) : servicos.length === 0 ? (
                <>
                  <p>
                    Para enviar uma proposta você precisa ter pelo menos um serviço ativo
                    cadastrado.
                  </p>
                  <BotaoLink to="/fornecedor/servicos/novo">Cadastrar serviço</BotaoLink>
                </>
              ) : disponiveis.length === 0 ? (
                <p>Você já enviou propostas com todos os seus serviços ativos para este evento.</p>
              ) : (
                <form onSubmit={enviar} noValidate>
                  <p>O organizador receberá sua proposta e poderá compará-la com as demais.</p>

                  <Aviso tipo="sucesso" onFechar={() => setSucesso("")}>{sucesso}</Aviso>
                  <Aviso onFechar={() => setErroEnvio("")}>{erroEnvio}</Aviso>

                  <div className="forn-campos">
                    <label className="forn-campo">
                      Serviço oferecido
                      <select name="id_servico" value={form.id_servico} onChange={escolherServico}>
                        <option value="">Selecione um serviço</option>
                        {disponiveis.map((servico) => (
                          <option key={servico.id} value={servico.id}>
                            {servico.nome}
                          </option>
                        ))}
                      </select>
                    </label>

                    <div className="forn-campos dois">
                      <label className="forn-campo">
                        Valor (R$)
                        <input
                          name="valor"
                          type="number"
                          min="0"
                          step="0.01"
                          value={form.valor}
                          onChange={alterar}
                        />
                      </label>

                      <label className="forn-campo">
                        Prazo (dias)
                        <input
                          name="prazo_dias"
                          type="number"
                          min="1"
                          step="1"
                          value={form.prazo_dias}
                          onChange={alterar}
                        />
                      </label>
                    </div>

                    <label className="forn-campo">
                      Observações
                      <textarea
                        name="observacao"
                        value={form.observacao}
                        onChange={alterar}
                        maxLength={2000}
                        placeholder="O que está incluso, condições, equipamentos..."
                      />
                    </label>

                    <button
                      type="submit"
                      className="forn-btn forn-btn-primario forn-btn-total"
                      disabled={enviando}
                    >
                      {enviando ? "Enviando..." : "Enviar proposta"}
                    </button>
                  </div>
                </form>
              )}

              {dados.aberta && jaEnviadas.length > 0 && disponiveis.length === 0 && sucesso && (
                <Aviso tipo="sucesso" onFechar={() => setSucesso("")}>{sucesso}</Aviso>
              )}
            </section>
          </div>
        </>
      )}
    </LayoutFornecedor>
  );
}

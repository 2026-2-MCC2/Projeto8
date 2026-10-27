import { Link } from "react-router-dom";
import Icone from "./Icones";
import { obterSessao, rotaPainel } from "../../utils/sessao";

const PASSOS = [
  { n: "01", icone: "target", titulo: "Crie seu evento", texto: "Defina data, local, público e informações principais." },
  { n: "02", icone: "search", titulo: "Encontre e compare serviços", texto: "Encontre fornecedores e organize as propostas recebidas para o seu evento." },
  { n: "03", icone: "ticket", titulo: "Calcule seu ticket", texto: "Tenha uma estimativa dos custos e do valor necessário do ingresso." },
];

// Mesmas categorias do cadastro de fornecedor.
const CATEGORIAS = [
  { icone: "utensils", titulo: "Alimentação", texto: "Buffets, bebidas e quem cuida do cardápio do seu evento." },
  { icone: "palette", titulo: "Decoração", texto: "Cenografia que transforma espaços em experiências." },
  { icone: "shield", titulo: "Segurança", texto: "Tranquilidade para você e seus convidados." },
  { icone: "sparkles", titulo: "Entretenimento", texto: "DJs, bandas e atrações que dão o tom." },
  { icone: "cube", titulo: "Estrutura", texto: "Palco, som, iluminação e tudo para o evento acontecer." },
  { icone: "camera", titulo: "Fotografia", texto: "Registre os momentos que importam." },
];

const FLUXO = ["Evento", "Serviços", "Custos", "Propostas", "Consolidação", "Ticket estimado"];

export function ComoFunciona() {
  return (
    <section className="hm-secao" id="como-funciona" aria-labelledby="hm-como-titulo">
      <div className="hm-container">
        <div className="hm-titulo-secao">
          <span className="hm-eyebrow">SIMPLES POR DESIGN</span>
          <h2 id="hm-como-titulo">Do planejamento ao seu evento</h2>
          <p>Uma jornada clara para transformar ideias em decisões seguras.</p>
        </div>

        <ol className="hm-passos">
          {PASSOS.map((passo) => (
            <li className="hm-passo" key={passo.n}>
              <span className="hm-passo-n">{passo.n}</span>
              <span className="hm-icone-caixa">
                <Icone nome={passo.icone} tamanho={21} />
              </span>
              <h3>{passo.titulo}</h3>
              <p>{passo.texto}</p>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}

export function Categorias() {
  return (
    <section className="hm-secao hm-secao-clara" id="servicos" aria-labelledby="hm-serv-titulo">
      <div className="hm-container">
        <div className="hm-titulo-secao hm-centro">
          <span className="hm-eyebrow">FORNECEDORES</span>
          <h2 id="hm-serv-titulo">Tudo o que seu evento precisa</h2>
          <p>Fornecedores de diferentes categorias enviam propostas para o seu evento.</p>
        </div>

        <ul className="hm-categorias">
          {CATEGORIAS.map((categoria) => (
            <li className="hm-categoria" key={categoria.titulo}>
              <span className="hm-icone-caixa">
                <Icone nome={categoria.icone} tamanho={21} />
              </span>
              <h3>{categoria.titulo}</h3>
              <p>{categoria.texto}</p>
            </li>
          ))}
        </ul>

        <p className="hm-fornecedor-cta">
          Trabalha com eventos? <Link to="/cadastro/fornecedor">Cadastre-se como fornecedor</Link>{" "}
          e envie propostas.
        </p>
      </div>
    </section>
  );
}

export function AntesDepois() {
  return (
    <section className="hm-secao" id="sobre" aria-labelledby="hm-antes-titulo">
      <div className="hm-container hm-antes">
        <div className="hm-antes-painel">
          <span className="hm-eyebrow hm-eyebrow-claro">ANTES DO TICKETLAB</span>
          <h2 id="hm-antes-titulo">
            Menos abas.
            <br />
            <em>Mais clareza.</em>
          </h2>
          <p>
            Planilhas, mensagens, anotações e cálculos espalhados deixam qualquer evento mais
            difícil do que precisa ser.
          </p>
          <ul className="hm-caos">
            <li><Icone nome="sheet" tamanho={16} /> Planilhas desconectadas</li>
            <li><Icone nome="message" tamanho={16} /> Mensagens perdidas</li>
            <li><Icone nome="calc" tamanho={16} /> Cálculos separados</li>
          </ul>
        </div>

        <div className="hm-depois-painel">
          <span className="hm-eyebrow hm-eyebrow-claro">FLUXO DO TICKETLAB</span>
          <h3>Do evento ao ticket estimado</h3>
          <ol className="hm-fluxo">
            {FLUXO.map((etapa, indice) => (
              <li key={etapa}>
                <span>{String(indice + 1).padStart(2, "0")}</span>
                <strong>{etapa}</strong>
              </li>
            ))}
          </ol>
        </div>
      </div>
    </section>
  );
}

export function ChamadaFinal() {
  const painel = rotaPainel(obterSessao()?.usuario?.tipo);

  return (
    <section className="hm-final" aria-labelledby="hm-final-titulo">
      <div className="hm-container hm-final-inner">
        <h2 id="hm-final-titulo">Seu próximo evento começa aqui.</h2>
        <p>Planeje, organize e tome decisões com mais clareza.</p>
        <Link to={painel || "/cadastro"} className="hm-btn hm-btn-branco">
          {painel ? "Ir para o painel" : "Criar minha conta"} <Icone nome="arrow" tamanho={16} />
        </Link>
      </div>
    </section>
  );
}

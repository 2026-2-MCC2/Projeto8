import HomeNav from "../../components/home/HomeNav";
import HomeHero from "../../components/home/HomeHero";
import HomeSimulador from "../../components/home/HomeSimulador";
import {
  AntesDepois,
  Categorias,
  ChamadaFinal,
  ComoFunciona,
} from "../../components/home/HomeSecoes";
import HomeRodape from "../../components/home/HomeRodape";
import "./Home.css";

function Home() {
  return (
    <div className="hm">
      <a href="#hm-conteudo" className="hm-pular">
        Pular para o conteúdo
      </a>

      <HomeNav />

      <main id="hm-conteudo">
        <HomeHero />
        <HomeSimulador />
        <ComoFunciona />
        <Categorias />
        <AntesDepois />
        <ChamadaFinal />
      </main>

      <HomeRodape />
    </div>
  );
}

export default Home;

import { BrowserRouter, Routes, Route } from "react-router-dom";
import Login from "./pages/Login/Login";
import Cadastro from "./pages/Cadastro/Cadastro";
import CadastroOrganizador from "./pages/CadastroOrganizador/CadastroOrganizador";
import CadastroFornecedor from "./pages/CadastroFornecedor/CadastroFornecedor";
import Meuseventos from "./pages/Organizador/Meuseventos/Meuseventos";
import DashboardOrganizador from "./pages/Organizador/DashboardOrganizador/DashboardOrganizador";
import CriarEvento from "./pages/Organizador/CriarEvento/CriarEvento";
import Home from "./pages/Home/Home";
import BuscarServicos from "./pages/Organizador/Buscar-Servicos/BuscarServicos";
import DetalheServico from "./pages/Organizador/Buscar-Servicos/DetalheServicos";
import Cotacoes from "./pages/Organizador/Cotacoes/Cotacoes";
import CompararPropostas from "./pages/Organizador/Cotacoes/CompararPropostas";
import ResumoCustos from "./pages/Organizador/ResumoCustos/ResumoCustos";
import CalculoTicket from "./pages/Organizador/CalculoTicket/CalculoTicket";
import MinhaConta from "./pages/Organizador/MinhaConta/MinhaConta";
import RotaPrivada from "./components/organizador/RotaPrivada";
import DashboardFornecedor from "./pages/Fornecedor/DashboardFornecedor/DashboardFornecedor";
import MeusServicos from "./pages/Fornecedor/MeusServicos/MeusServicos";
import FormularioServico from "./pages/Fornecedor/FormularioServico/FormularioServico";
import Oportunidades from "./pages/Fornecedor/Oportunidades/Oportunidades";
import DetalheOportunidade from "./pages/Fornecedor/DetalheOportunidade/DetalheOportunidade";
import MinhasPropostas from "./pages/Fornecedor/MinhasPropostas/MinhasPropostas";
import MinhaContaFornecedor from "./pages/Fornecedor/MinhaContaFornecedor/MinhaContaFornecedor";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/cadastro" element={<Cadastro />} />
        <Route path="/cadastro/organizador" element={<CadastroOrganizador />} />
        <Route path="/cadastro/fornecedor" element={<CadastroFornecedor />} />

        <Route element={<RotaPrivada />}>
          <Route path="/calculo-ticket" element={<CalculoTicket />} />
          <Route path="/minha-conta" element={<MinhaConta />} />
          <Route path="/resumo-custos" element={<ResumoCustos />} />
          <Route path="/cotacoes" element={<Cotacoes />} />
          <Route path="/cotacoes/comparar" element={<CompararPropostas />} />
          <Route path="/buscar-servicos/:id" element={<DetalheServico />} />
          <Route path="/buscar-servicos" element={<BuscarServicos />} />
          <Route path="/criar-evento" element={<CriarEvento />} />
          <Route path="/dashboard" element={<DashboardOrganizador />} />
          <Route path="/meus-eventos" element={<Meuseventos />} />
        </Route>

        <Route element={<RotaPrivada tipo="FORNECEDOR" />}>
          <Route path="/fornecedor/dashboard" element={<DashboardFornecedor />} />
          <Route path="/fornecedor/servicos" element={<MeusServicos />} />
          <Route path="/fornecedor/servicos/novo" element={<FormularioServico />} />
          <Route path="/fornecedor/servicos/:id/editar" element={<FormularioServico />} />
          <Route path="/fornecedor/oportunidades" element={<Oportunidades />} />
          <Route path="/fornecedor/oportunidades/:id" element={<DetalheOportunidade />} />
          <Route path="/fornecedor/propostas" element={<MinhasPropostas />} />
          <Route path="/fornecedor/minha-conta" element={<MinhaContaFornecedor />} />
        </Route>

        <Route path="*" element={<h1>Página não encontrada</h1>} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;

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

function App() {
  return (
    <BrowserRouter>
      <Routes>
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

        <Route path="/cadastro/fornecedor" element={<CadastroFornecedor />} />

        <Route path="/cadastro/organizador" element={<CadastroOrganizador />} />

        <Route path="/cadastro" element={<Cadastro />} />

        <Route path="/" element={<Home />} />

        <Route path="/login" element={<Login />} />

        <Route path="*" element={<h1>Página não encontrada</h1>} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;

import { BrowserRouter, Routes, Route } from "react-router-dom";
import Login from "./pages/Login/Login";
import Cadastro from "./pages/Cadastro/Cadastro";
import CadastroOrganizador from "./pages/CadastroOrganizador/CadastroOrganizador";
import CadastroFornecedor from "./pages/CadastroFornecedor/CadastroFornecedor";
import Meuseventos from "./pages/Organizador/Meuseventos/Meuseventos";
import DashboardOrganizador from "./pages/Organizador/DashboardOrganizador/DashboardOrganizador";
import CriarEvento from "./pages/Organizador/CriarEvento/CriarEvento";
import Home from "./pages/Home/Home";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/criar-evento" element={<CriarEvento />} />

        <Route path="/dashboard" element={<DashboardOrganizador />} />

        <Route path="/meus-eventos" element={<Meuseventos />} />

        <Route path="/cadastro/fornecedor" element={<CadastroFornecedor />} />

        <Route path="/cadastro/organizador" element={<CadastroOrganizador />} />

        <Route path="/cadastro" element={<Cadastro />} />

        <Route path="/" element={<Home/>} />

        <Route path="/login" element={<Login />} />

        <Route path="*" element={<h1>Página não encontrada</h1>} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;

import { BrowserRouter, Routes, Route } from "react-router-dom";
import Login from "./pages/Login/Login";
import Cadastro from "./pages/Cadastro/Cadastro";
import CadastroOrganizador from "./pages/CadastroOrganizador/CadastroOrganizador";
import CadastroFornecedor from "./pages/CadastroFornecedor/CadastroFornecedor";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/cadastro/fornecedor" element={<CadastroFornecedor />} />

        <Route path="/cadastro/organizador" element={<CadastroOrganizador />} />

        <Route path="/cadastro" element={<Cadastro />} />
        {/* 
          Rota inicial do sistema.
          Por enquanto, estamos apenas preparando a estrutura.
        */}
        <Route path="/" element={<h1>TrocaTicket</h1>} />

        {/* 
          Rota que será nossa tela de Login.
          A tela ainda será criada no próximo passo.
        */}
        <Route path="/login" element={<Login />} />

        {/* 
          Se o usuário acessar uma URL que não existe,
          mostramos uma mensagem de página não encontrada.
        */}
        <Route path="*" element={<h1>Página não encontrada</h1>} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;

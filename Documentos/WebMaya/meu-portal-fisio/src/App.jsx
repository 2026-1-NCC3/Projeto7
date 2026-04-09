import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import LoginAdmin from "./pages/LoginAdmin/LoginAdmin";
import Dashboard from "./pages/Dashboard/Dashboard"
// import Prontuarios from "./pages/Prontuarios/Prontuarios";
// import Agenda from "./pages/Agenda/Agenda";
// import Pacientes from "./pages/Pacientes/Pacientes";
// import Configuracoes from "./pages/Configuracoes/Configuracoes";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Navigate to="/login" />} />
        <Route path="/login" element={<LoginAdmin />} />
        <Route path="/dashboard" element={<Dashboard />} />
        {/* <Route path="/agenda" element={<Agenda />} /> */}
        {/* <Route path="/pacientes" element={<Pacientes />} /> */}
        {/* <Route path="/configuracoes" element={<Configuracoes />} /> */}
      </Routes>
    </BrowserRouter>
  );
}
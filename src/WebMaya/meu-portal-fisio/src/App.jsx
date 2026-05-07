import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import RotaProtegida from './components/RotaProtegida';
import LayoutAplicacao from './components/LayoutAplicacao';
import LoginAdmin from './pages/LoginAdmin/LoginAdmin';
import Dashboard from './pages/Dashboard/Dashboard';
import Pacientes from './pages/Pacientes/Pacientes';
import Prontuarios from './pages/Prontuarios/Prontuarios';
import Agenda from './pages/Agenda/Agenda';
import Exercicios from './pages/Exercicios/Exercicios';
import Documentos from './pages/Documentos/Documentos';
import Configuracoes from './pages/Configuracoes/Configuracoes';
import './App.css';

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<LoginAdmin />} />
          <Route
            path="/"
            element={(
              <RotaProtegida>
                <LayoutAplicacao />
              </RotaProtegida>
            )}
          >
            <Route index element={<Navigate to="/inicio" replace />} />
            <Route path="inicio" element={<Dashboard />} />
            <Route path="pacientes" element={<Pacientes />} />
            <Route path="prontuarios" element={<Prontuarios />} />
            <Route path="agenda" element={<Agenda />} />
            <Route path="exercicios" element={<Exercicios />} />
            <Route path="documentos" element={<Documentos />} />
            <Route path="configuracoes" element={<Configuracoes />} />
          </Route>
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import AppShell from './components/AppShell';
import LoginAdmin from './pages/LoginAdmin/LoginAdmin';
import Dashboard from './pages/Dashboard/Dashboard';
import PatientsPage from './pages/Patients/PatientsPage';
import RecordsPage from './pages/Records/RecordsPage';
import SchedulePage from './pages/Schedule/SchedulePage';
import ExercisesPage from './pages/Exercises/ExercisesPage';
import DocumentsPage from './pages/Documents/DocumentsPage';
import SettingsPage from './pages/Settings/SettingsPage';

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<LoginAdmin />} />
          <Route
            path="/"
            element={(
              <ProtectedRoute>
                <AppShell />
              </ProtectedRoute>
            )}
          >
            <Route index element={<Navigate to="/inicio" replace />} />
            <Route path="inicio" element={<Dashboard />} />
            <Route path="pacientes" element={<PatientsPage />} />
            <Route path="prontuarios" element={<RecordsPage />} />
            <Route path="agenda" element={<SchedulePage />} />
            <Route path="exercicios" element={<ExercisesPage />} />
            <Route path="documentos" element={<DocumentsPage />} />
            <Route path="configuracoes" element={<SettingsPage />} />
          </Route>
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

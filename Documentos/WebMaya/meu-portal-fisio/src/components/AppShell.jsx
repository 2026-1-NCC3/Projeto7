import { useMemo, useState } from 'react';
import { NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom';
import {
  FiActivity,
  FiCalendar,
  FiFileText,
  FiFolder,
  FiGrid,
  FiLogOut,
  FiMenu,
  FiSettings,
  FiUsers,
  FiX,
} from 'react-icons/fi';
import { useAuth } from '../context/AuthContext';
import mylogo from '../assets/mylogo.png';
import './LayoutAplicacao.css';

const navigation = [
  { to: '/inicio', label: 'Início', icon: FiGrid },
  { to: '/prontuarios', label: 'Prontuários', icon: FiFileText },
  { to: '/agenda', label: 'Agenda', icon: FiCalendar },
  { to: '/pacientes', label: 'Pacientes', icon: FiUsers },
  { to: '/exercicios', label: 'Exercícios', icon: FiActivity },
  { to: '/documentos', label: 'Documentos', icon: FiFolder },
  { to: '/configuracoes', label: 'Configurações', icon: FiSettings },
];

function SidebarContent({ onNavigate }) {
  const { logout } = useAuth();
  const navigate = useNavigate();

  return (
    <div className="sidebar-card">
      <div className="brand-block">
        <img src={mylogo} alt="MY" className="sidebar-brand-logo" />
      </div>

      <nav className="sidebar-nav" aria-label="Navegação principal">
        {navigation.map(({ to, label, icon: Icon }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
            onClick={onNavigate}
          >
            <span className="nav-icon"><Icon /></span>
            <span>{label}</span>
          </NavLink>
        ))}
      </nav>

      <div className="sidebar-footer">
        <button
          className="btn-secondary sidebar-logout"
          onClick={() => {
            logout();
            navigate('/login', { replace: true });
          }}
        >
          <FiLogOut style={{ marginRight: 8 }} />
          Sair
        </button>
      </div>
    </div>
  );
}

export default function AppShell() {
  const [menuOpen, setMenuOpen] = useState(false);
  const location = useLocation();

  const pageCopy = useMemo(() => {
    const map = {
      '/inicio': { title: 'Início', subtitle: 'Resumo da rotina clínica de hoje.' },
      '/prontuarios': { title: 'Prontuários', subtitle: 'Avaliações, evolução e exportação em PDF.' },
      '/agenda': { title: 'Agenda', subtitle: 'Atendimentos organizados por data.' },
      '/pacientes': { title: 'Pacientes', subtitle: 'Cadastros e informações principais.' },
      '/exercicios': { title: 'Exercícios', subtitle: 'Orientações terapêuticas salvas.' },
      '/documentos': { title: 'Documentos', subtitle: 'Arquivos vinculados aos pacientes.' },
      '/configuracoes': { title: 'Configurações', subtitle: 'Dados profissionais e preferências.' },
    };

    return map[location.pathname] || map['/inicio'];
  }, [location.pathname]);

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <SidebarContent />
      </aside>

      {menuOpen && (
        <div className="menu-drawer" onClick={() => setMenuOpen(false)}>
          <div className="menu-panel" onClick={(event) => event.stopPropagation()}>
            <div className="drawer-head">
              <strong>Menu</strong>
              <button className="icon-btn" onClick={() => setMenuOpen(false)} aria-label="Fechar menu">
                <FiX />
              </button>
            </div>
            <SidebarContent onNavigate={() => setMenuOpen(false)} />
          </div>
        </div>
      )}

      <main className="main-area">
        <div className="main-card">
          <header className="topbar">
            <div>
              <h1>{pageCopy.title}</h1>
              <div className="topbar-copy">{pageCopy.subtitle}</div>
            </div>

            <div className="topbar-actions">
              <button className="icon-btn mobile-menu" onClick={() => setMenuOpen(true)} aria-label="Abrir menu">
                <FiMenu />
              </button>
            </div>
          </header>

          <Outlet />
        </div>
      </main>
    </div>
  );
}

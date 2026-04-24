import { useMemo, useState } from 'react';
import { NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom';
import {
  FiActivity,
  FiBell,
  FiCalendar,
  FiFileText,
  FiFolder,
  FiGrid,
  FiLogOut,
  FiMenu,
  FiMessageSquare,
  FiSettings,
  FiUser,
  FiUsers,
  FiX,
} from 'react-icons/fi';
import { useAuth } from '../context/AuthContext';

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
  const { admin, logout } = useAuth();
  const navigate = useNavigate();

  return (
    <div className="sidebar-card">
      <div className="brand-block">
        <div className="brand-mark">MY</div>
        <div>
          <div className="brand-title">Maya Yamamoto</div>
          <div className="muted">Gestão clínica em RPG</div>
        </div>
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
        <div className="sidebar-admin">
          <div className="avatar">{admin?.name?.slice(0, 2).toUpperCase() || 'MY'}</div>
          <div>
            <div className="list-title">{admin?.name || 'Maya Yamamoto'}</div>
            <div className="subtle">{admin?.profession || 'Fisioterapeuta'}</div>
          </div>
        </div>

        <button
          className="btn-secondary"
          onClick={() => {
            logout();
            navigate('/login');
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
  const { admin } = useAuth();
  const location = useLocation();

  const pageCopy = useMemo(() => {
    const map = {
      '/inicio': { chip: 'Visão geral', title: 'Controle clínico simples e elegante.', subtitle: 'Tudo o que Maya precisa, sem excesso visual.' },
      '/prontuarios': { chip: 'Ficha clínica', title: 'Prontuários fiéis ao modelo real.', subtitle: 'Campos organizados por identificação, avaliação, exame clínico e plano terapêutico.' },
      '/agenda': { chip: 'Rotina diária', title: 'Agenda clara para o atendimento.', subtitle: 'Visualize horários, status e observações do dia.' },
      '/pacientes': { chip: 'Cadastros', title: 'Pacientes com acesso rápido.', subtitle: 'Dados essenciais, histórico resumido e acesso ao prontuário.' },
      '/exercicios': { chip: 'Biblioteca', title: 'Exercícios bem descritos.', subtitle: 'Oriente com clareza e mantenha o acervo organizado.' },
      '/documentos': { chip: 'Arquivos', title: 'Documentos vinculados ao paciente.', subtitle: 'Exames, prescrições e anexos centralizados.' },
      '/configuracoes': { chip: 'Preferências', title: 'Perfil profissional e sistema.', subtitle: 'Ajustes simples com foco em produtividade.' },
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
              <div className="chip">{pageCopy.chip}</div>
              <h1>{pageCopy.title}</h1>
              <div className="topbar-copy">{pageCopy.subtitle}</div>
            </div>

            <div className="topbar-actions">
              <button className="icon-btn mobile-menu" onClick={() => setMenuOpen(true)} aria-label="Abrir menu">
                <FiMenu />
              </button>
              <button className="icon-btn" aria-label="Notificações"><FiBell /></button>
              <button className="icon-btn" aria-label="Mensagens"><FiMessageSquare /></button>
              <div className="topbar-user">
                <div className="avatar avatar-sm"><FiUser /></div>
                <div className="topbar-user-text">
                  <strong>{admin?.name || 'Maya Yamamoto'}</strong>
                  <span>{admin?.profession || 'Fisioterapeuta RPG'}</span>
                </div>
              </div>
            </div>
          </header>

          <Outlet />
        </div>
      </main>
    </div>
  );
}

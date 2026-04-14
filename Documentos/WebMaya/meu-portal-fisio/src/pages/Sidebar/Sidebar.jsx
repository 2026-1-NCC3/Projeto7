import { useNavigate } from "react-router-dom";
import logosemfundo from "../../assets/logosemfundo.png";

import {
  FiFileText,
  FiCalendar,
  FiUsers,
  FiFolder,
  FiSettings,
  FiLogOut,
  FiChevronRight,
  FiActivity,
} from "react-icons/fi";

const menuItems = [
  { icon: FiFileText,  label: "Prontuários",   path: "/prontuarios" },
  { icon: FiCalendar,  label: "Agenda",        path: "/agenda" },
  { icon: FiUsers,     label: "Pacientes",     path: "/pacientes" },
  { icon: FiActivity,  label: "Exercícios",    path: "/exercicios" },
  { icon: FiFolder,    label: "Documentos",    path: "/documentos" },
  { icon: FiSettings,  label: "Configurações", path: "/configuracoes" },
];

function Sidebar({ activePath, setActivePath }) {
  const navigate = useNavigate();

  const handleNav = (path) => {
    setActivePath(path);
    navigate(path);
  };

  return (
    <aside className="dash-sidebar">
      
      {/* Logo */}
      <div className="sidebar-brand">
        <img src={logosemfundo} alt="logo" className="sidebar-logo" />
      </div>

      {/* Menu */}
      <nav className="sidebar-nav">
        <p className="nav-section-label">Menu</p>

        {menuItems.map(({ icon: Icon, label, path }) => (
          <button
            key={path}
            className={`nav-item ${activePath === path ? "nav-item--active" : ""}`}
            onClick={() => handleNav(path)}
          >
            <span className="nav-icon-wrap">
              <Icon />
            </span>

            <span className="nav-label">{label}</span>

            {activePath === path && (
              <FiChevronRight className="nav-chevron" />
            )}
          </button>
        ))}
      </nav>

      {/* Sair */}
      <button
        className="nav-item nav-sair"
        onClick={() => navigate("/login")}
      >
        <span className="nav-icon-wrap">
          <FiLogOut />
        </span>
        <span className="nav-label">Sair</span>
      </button>
    </aside>
  );
}

export default Sidebar;
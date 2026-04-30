import { useNavigate } from "react-router-dom";
import mylogo from "../../assets/mylogo.png";
import "./BarraLateral.css";

import {
  FiActivity,
  FiCalendar,
  FiChevronRight,
  FiFileText,
  FiFolder,
  FiLogOut,
  FiSettings,
  FiUsers,
} from "react-icons/fi";

const menuItems = [
  { icon: FiFileText, label: "Prontuários", path: "/prontuarios" },
  { icon: FiCalendar, label: "Agenda", path: "/agenda" },
  { icon: FiUsers, label: "Pacientes", path: "/pacientes" },
  { icon: FiActivity, label: "Exercícios", path: "/exercicios" },
  { icon: FiFolder, label: "Documentos", path: "/documentos" },
  { icon: FiSettings, label: "Configurações", path: "/configuracoes" },
];

function Sidebar({ activePath, setActivePath }) {
  const navigate = useNavigate();

  const handleNav = (path) => {
    setActivePath(path);
    navigate(path);
  };

  return (
    <aside className="barra-lateral">
      <div className="barra-lateral-marca">
        <img src={mylogo} alt="MY" className="barra-lateral-logo" />
      </div>

      <nav className="barra-lateral-menu">
        <p className="barra-lateral-secao">Menu</p>

        {menuItems.map(({ icon: Icon, label, path }) => (
          <button
            key={path}
            className={`barra-lateral-item ${activePath === path ? "barra-lateral-item-ativo" : ""}`}
            onClick={() => handleNav(path)}
          >
            <span className="barra-lateral-icone">
              <Icon />
            </span>

            <span className="barra-lateral-texto">{label}</span>

            {activePath === path && (
              <FiChevronRight className="barra-lateral-seta" />
            )}
          </button>
        ))}
      </nav>

      <button
        className="barra-lateral-item barra-lateral-sair"
        onClick={() => navigate("/login")}
      >
        <span className="barra-lateral-icone">
          <FiLogOut />
        </span>
        <span className="barra-lateral-texto">Sair</span>
      </button>
    </aside>
  );
}

export default Sidebar;

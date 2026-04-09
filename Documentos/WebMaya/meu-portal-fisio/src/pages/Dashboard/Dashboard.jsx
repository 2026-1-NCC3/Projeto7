import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Calendar from "react-calendar";
import "react-calendar/dist/Calendar.css";
import "./Dashboard.css";
import logosemfundo from "../../assets/logosemfundo.png";
import {
  FiFileText,
  FiCalendar,
  FiUsers,
  FiFolder,
  FiSettings,
  FiLogOut,
  FiMenu,
  FiBell,
  FiMessageSquare,
  FiChevronLeft,
  FiChevronRight,
  FiPlus,
  FiActivity,
  FiHeart,
  FiUser,
} from "react-icons/fi";

const menuItems = [
  { icon: FiFileText,  label: "Prontuários",  path: "/prontuarios" },
  { icon: FiCalendar,  label: "Agenda",        path: "/agenda" },
  { icon: FiUsers,     label: "Pacientes",     path: "/pacientes" },
  { icon: FiActivity,  label: "Exercícios",    path: "/exercicios" },
  { icon: FiFolder,    label: "Documentos",    path: "/documentos" },
  { icon: FiSettings,  label: "Configurações", path: "/configuracoes" },
];

const statsCards = [
  { icon: FiFileText,  label: "Prontuários",         value: "18" },
  { icon: FiCalendar,  label: "Consultas Hoje",      value: "4",  badge: 1 },
  { icon: FiUsers,     label: "Novos Pacientes",     value: "2" },
  { icon: FiActivity,  label: "Plano de Exercícios", value: "7",  badge: 1 },
  { icon: FiFolder,    label: "Documentos",          value: "5" },
];

const consultas = [
  { hora: "10:00", nome: "João Silva",  tipo: "Fisioterapia – Reabilitação" },
  { hora: "14:00", nome: "Ana Paula",   tipo: "RPG" },
  { hora: "16:00", nome: "Carlos Lima", tipo: "Pilates Clínico" },
];

const atividades = [
  { icon: FiActivity, nome: "Exercícios de alongamento",  sub: "João Silva",  hora: "09:00" },
  { icon: FiHeart,    nome: "Sessão de fortalecimento",   sub: "Ana Paula",   hora: "11:00" },
  { icon: FiFileText, nome: "RPG – Postura e equilíbrio", sub: "Carlos Lima", hora: "15:00" },
];

function MiniCalendar({ date, setDate }) {
    const ano = date.getFullYear();
    const mes = date.getMonth();
  
    const nomeMes = new Date(ano, mes).toLocaleString("pt-BR", { month: "long", year: "numeric" });
  
    const primeiroDia = new Date(ano, mes, 1).getDay();
    const totalDias = new Date(ano, mes + 1, 0).getDate();
  
    const celulas = [];
    for (let i = 0; i < primeiroDia; i++) celulas.push(null);
    for (let d = 1; d <= totalDias; d++) celulas.push(d);
  
    const hoje = new Date();
    const ehHoje = (d) =>
      d === hoje.getDate() && mes === hoje.getMonth() && ano === hoje.getFullYear();
  
    const ehSelecionado = (d) =>
      d === date.getDate() && mes === date.getMonth() && ano === date.getFullYear();
  
    return (
      <div className="mini-cal">
        <div className="cal-nav">
          <button onClick={() => setDate(new Date(ano, mes - 1, 1))}>
            <FiChevronLeft />
          </button>
          <span style={{ textTransform: "capitalize" }}>{nomeMes}</span>
          <button onClick={() => setDate(new Date(ano, mes + 1, 1))}>
            <FiChevronRight />
          </button>
        </div>
        <table className="cal-table">
          <thead>
            <tr>{["D","S","T","Q","Q","S","S"].map((d, i) => <th key={i}>{d}</th>)}</tr>
          </thead>
          <tbody>
            {Array.from({ length: Math.ceil(celulas.length / 7) }, (_, s) => (
              <tr key={s}>
                {celulas.slice(s * 7, s * 7 + 7).map((d, i) => (
                  <td
                    key={i}
                    className={ehHoje(d) ? "cal-today" : ehSelecionado(d) ? "cal-selected" : ""}
                    onClick={() => d && setDate(new Date(ano, mes, d))}
                  >
                    {d || ""}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  }

export default function Dashboard() {
  const navigate = useNavigate();
  const [date, setDate] = useState(new Date());

  return (
    <div className="dash-layout">
      <aside className="dash-sidebar">
        <div className="sidebar-profile">
          <div className="profile-avatar"><FiUser /></div>
          <img src={logosemfundo} alt="logo" className="sidebar-logo" />
        </div>

        <nav className="sidebar-nav">
          {menuItems.map((item) => {
            const Icon = item.icon;
            return (
              <button key={item.path} className="nav-item" onClick={() => navigate(item.path)}>
                <span className="nav-icon"><Icon /></span>
                {item.label}
              </button>
            );
          })}
        </nav>

        <button className="nav-item nav-sair" onClick={() => navigate("/login")}>
          <span className="nav-icon"><FiLogOut /></span>
          Sair
        </button>
      </aside>

      <div className="dash-main">
        <header className="dash-header">
          <button className="header-menu-btn"><FiMenu /></button>
          <div className="header-actions">
            <button className="header-action-btn">
              <FiBell />
              <span className="badge-notif">1</span>
              Notificações
            </button>
            <span className="header-divider" />
            <button className="header-action-btn">
              <FiMessageSquare /> Mensagens
            </button>
            <span className="header-divider" />
            <button className="header-action-btn" onClick={() => navigate("/login")}>
              <FiLogOut /> Sair
            </button>
            <div className="header-user">
              <div className="header-avatar-circle">MY</div>
              Maya Yamamoto ▾
            </div>
          </div>
        </header>

        <div className="dash-content">
          <div className="welcome-banner">
            <div className="welcome-text">
              <h1>Olá, Maya!</h1>
              <p className="welcome-sub">Bom te ver por aqui.</p>
              <p className="welcome-desc">Que bom te ver de novo! Vamos ao trabalho?</p>
            </div>
            <div className="welcome-illustration"><FiHeart /></div>
          </div>

          <div className="stats-row">
            {statsCards.map((card) => {
              const Icon = card.icon;
              return (
                <div className="stat-card" key={card.label}>
                  {card.badge && <span className="stat-badge">{card.badge}</span>}
                  <div className="stat-icon-box"><Icon /></div>
                  <div className="stat-info">
                    <span className="stat-label">{card.label}</span>
                    <span className="stat-value">{card.value}</span>
                  </div>
                  <span className="stat-link">{card.label} ›</span>
                </div>
              );
            })}
          </div>

          <div className="dash-bottom-grid">
            <div className="card consultas-card">
              <div className="card-header">
                <h3>Próximas Consultas</h3>
                <div className="card-header-actions">
                  <button><FiChevronLeft /></button>
                  <button><FiPlus /></button>
                  <button><FiChevronRight /></button>
                </div>
              </div>

              <div className="consultas-body">
                <div className="mini-cal">
                  <Calendar onChange={setDate} value={date} locale="pt-BR" />
                </div>

                <div className="consulta-list">
                  <p className="consulta-date">Hoje, 08 de abril</p>
                  {consultas.map((c, i) => (
                    <div className="consulta-item" key={i}>
                      <span className="consulta-hora">{c.hora}</span>
                      <div>
                        <strong>{c.nome}</strong>
                        <p>{c.tipo}</p>
                      </div>
                    </div>
                  ))}
                  <button className="btn-ver-agenda" onClick={() => navigate("/agenda")}>
                    Ver Agenda
                  </button>
                </div>
              </div>
            </div>

            <div className="card atividades-card">
              <div className="card-header">
                <h3>Atividades Recomendadas</h3>
                <div className="card-header-actions">
                  <button><FiChevronLeft /></button>
                  <button><FiChevronRight /></button>
                </div>
              </div>
              <div className="atividades-list">
                {atividades.map((a, i) => {
                  const Icon = a.icon;
                  return (
                    <div className="atividade-item" key={i}>
                      <div className="ativ-icon-box"><Icon /></div>
                      <div className="ativ-info">
                        <strong>{a.nome}</strong>
                        <p>{a.sub}</p>
                      </div>
                      <span className="ativ-hora">{a.hora}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}   
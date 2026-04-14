import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Calendar from "react-calendar";
import "react-calendar/dist/Calendar.css";
import "./Dashboard.css";
import Sidebar from "./pages/Sidebar/Sidebar";

import {
  FiCalendar,
  FiMenu,
  FiBell,
  FiMessageSquare,
  FiChevronRight,
  FiPlus,
  FiActivity,
  FiHeart,
  FiClock,
  FiTrendingUp,
  FiCheck,
  FiUsers
} from "react-icons/fi";

/* MOCK DATA */

const stats = [
  { id: 1, label: "Pacientes hoje", value: "8", icon: FiUsers, color: "stat-teal" },
  { id: 2, label: "Sessões feitas", value: "5", icon: FiCheck, color: "stat-green" },
  { id: 3, label: "Próxima em", value: "40m", icon: FiClock, color: "stat-amber" },
  { id: 4, label: "Taxa de retorno", value: "92%", icon: FiTrendingUp, color: "stat-rose" },
];

const consultas = [
  { id: 1, hora: "10:00", nome: "João Silva", tipo: "Fisioterapia", status: "confirmado" },
  { id: 2, hora: "14:00", nome: "Ana Paula", tipo: "RPG", status: "pendente" },
  { id: 3, hora: "16:30", nome: "Carlos Melo", tipo: "Pilates", status: "confirmado" },
];

const atividades = [
  { id: 1, nome: "Alongamento lombar", paciente: "João Silva", hora: "09:00", icon: FiActivity },
  { id: 2, nome: "Fortalecimento glúteo", paciente: "Ana Paula", hora: "11:00", icon: FiHeart },
  { id: 3, nome: "Mobilidade cervical", paciente: "Carlos Melo", hora: "15:00", icon: FiActivity },
];

export default function Dashboard() {
  const navigate = useNavigate();

  const [date, setDate] = useState(new Date());
  const [sidebarOpen, setSidebar] = useState(false);
  const [activePath, setActivePath] = useState("/");

  return (
    <div className={`dash-layout ${sidebarOpen ? "sidebar-expanded" : ""}`}>

      {/* SIDEBAR */}
      <Sidebar
        activePath={activePath}
        setActivePath={setActivePath}
      />

      {/* MAIN */}
      <div className="dash-main">

        {/* HEADER */}
        <header className="dash-header">
          <button
            className="header-menu-btn"
            onClick={() => setSidebar(!sidebarOpen)}
          >
            <FiMenu />
          </button>

          <div className="header-actions">
            <button className="header-action-btn">
              <FiBell />
              <span className="badge-notif">1</span>
            </button>

            <button className="header-action-btn">
              <FiMessageSquare />
            </button>

            <div className="header-user">
              <div className="header-avatar">MY</div>
            </div>
          </div>
        </header>

        {/* CONTENT */}
        <div className="dash-content">

          {/* WELCOME */}
          <section className="welcome-banner">
            <div className="welcome-text">
              <h1 className="welcome-title">Olá, Maya 👋</h1>
              <p className="welcome-sub">
                {date.toLocaleDateString("pt-BR", {
                  day: "numeric",
                  month: "long",
                  year: "numeric",
                })}
              </p>
            </div>

            <div className="welcome-badge">
              <FiHeart />
              <span>8 pacientes hoje</span>
            </div>
          </section>

          {/* STATS */}
          <section className="stats-row">
            {stats.map((s) => {
              const Icon = s.icon;
              return (
                <div key={s.id} className={`stat-card ${s.color}`}>
                  <div className="stat-icon">
                    <Icon />
                  </div>
                  <div className="stat-body">
                    <span className="stat-value">{s.value}</span>
                    <span className="stat-label">{s.label}</span>
                  </div>
                </div>
              );
            })}
          </section>

          {/* GRID */}
          <section className="dash-grid">

            {/* CONSULTAS */}
            <div className="card card--consultas">
              <div className="card-header">
                <div className="card-header-left">
                  <FiCalendar className="card-header-icon" />
                  <h3>Agenda do dia</h3>
                </div>

                <button className="btn-add">
                  <FiPlus />
                </button>
              </div>

              <div className="calendar-box">
                <Calendar
                  value={date}
                  onChange={setDate}
                  locale="pt-BR"
                />
              </div>

              <ul className="consult-list">
                {consultas.map((c) => (
                  <li key={c.id} className="consult-item">
                    <div className="consult-time">{c.hora}</div>

                    <div className="consult-info">
                      <strong className="consult-name">{c.nome}</strong>
                      <span className="consult-type">{c.tipo}</span>
                    </div>

                    <span className={`consult-badge consult-badge--${c.status}`}>
                      {c.status}
                    </span>
                  </li>
                ))}
              </ul>
            </div>

            {/* ATIVIDADES */}
            <div className="card card--atividades">
              <div className="card-header">
                <div className="card-header-left">
                  <FiActivity className="card-header-icon" />
                  <h3>Atividades</h3>
                </div>

                <span className="card-count">{atividades.length} hoje</span>
              </div>

              <ul className="activity-list">
                {atividades.map((a) => {
                  const Icon = a.icon;
                  return (
                    <li key={a.id} className="activity-item">
                      <div className="activity-icon-wrap">
                        <Icon />
                      </div>

                      <div className="activity-info">
                        <strong className="activity-name">{a.nome}</strong>
                        <span className="activity-patient">{a.paciente}</span>
                      </div>

                      <span className="activity-time">{a.hora}</span>
                    </li>
                  );
                })}
              </ul>

              <button
                className="btn-ver-mais"
                onClick={() => navigate("/exercicios")}
              >
                Ver todos <FiChevronRight />
              </button>
            </div>

          </section>
        </div>
      </div>
    </div>
  );
}
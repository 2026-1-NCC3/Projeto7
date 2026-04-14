import { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./Prontuarios.css";
import logosemfundo from "../../assets/logosemfundo.png";

import {
  FiFileText, FiCalendar, FiUsers, FiFolder, FiSettings,
  FiLogOut, FiMenu, FiBell, FiMessageSquare, FiChevronRight,
  FiActivity, FiSearch, FiPlus, FiFilter, FiEye, FiEdit2,
  FiUser, FiClock, FiTrendingUp, FiCheck, FiX, FiChevronDown,
} from "react-icons/fi";

/* ── CONFIG ── */
const menuItems = [
  { icon: FiFileText,  label: "Prontuários",  path: "/prontuarios" },
  { icon: FiCalendar,  label: "Agenda",        path: "/agenda" },
  { icon: FiUsers,     label: "Pacientes",     path: "/pacientes" },
  { icon: FiActivity,  label: "Exercícios",    path: "/exercicios" },
  { icon: FiFolder,    label: "Documentos",    path: "/documentos" },
  { icon: FiSettings,  label: "Configurações", path: "/configuracoes" },
];

/* ── MOCK DATA ── */
// TODO: GET /api/prontuarios
const prontuariosMock = [
  {
    id: 1, nome: "João Silva",        initials: "JS",
    cid: "M54.5 – Lombalgia",        diagnostico: "Hérnia de disco L4-L5",
    plano: "Fisioterapia convencional", sessoes: 12, totalSessoes: 20,
    ultima: "10/04/2025", proxima: "14/04/2025",
    status: "ativo", evolucao: "melhora",
  },
  {
    id: 2, nome: "Ana Paula",         initials: "AP",
    cid: "M47.2 – Cervicoartrose",   diagnostico: "Cervicalgia com irradiação",
    plano: "RPG",                     sessoes: 5,  totalSessoes: 10,
    ultima: "09/04/2025", proxima: "16/04/2025",
    status: "ativo", evolucao: "estavel",
  },
  {
    id: 3, nome: "Carlos Melo",       initials: "CM",
    cid: "M62.5 – Atrofia muscular",  diagnostico: "Pós-op joelho direito",
    plano: "Pilates clínico",         sessoes: 20, totalSessoes: 20,
    ultima: "07/04/2025", proxima: "—",
    status: "alta", evolucao: "alta",
  },
  {
    id: 4, nome: "Beatriz Souza",     initials: "BS",
    cid: "G54.2 – Radiculopatia",    diagnostico: "Síndrome do túnel do carpo",
    plano: "Fisioterapia + US",       sessoes: 3,  totalSessoes: 15,
    ultima: "08/04/2025", proxima: "15/04/2025",
    status: "ativo", evolucao: "melhora",
  },
  {
    id: 5, nome: "Ricardo Lima",      initials: "RL",
    cid: "M75.1 – Sínd. do manguito", diagnostico: "Ruptura parcial manguito rotador",
    plano: "Cinesioterapia",          sessoes: 8,  totalSessoes: 24,
    ultima: "11/04/2025", proxima: "14/04/2025",
    status: "ativo", evolucao: "estavel",
  },
  {
    id: 6, nome: "Fernanda Costa",    initials: "FC",
    cid: "M79.3 – Paniculite",       diagnostico: "Fibromialgia",
    plano: "Hidroterapia",            sessoes: 0,  totalSessoes: 16,
    ultima: "—", proxima: "15/04/2025",
    status: "pendente", evolucao: "—",
  },
];

const statsMock = [
  { id: 1, label: "Total de prontuários", value: "48",  icon: FiFileText,    color: "stat-teal"  },
  { id: 2, label: "Pacientes ativos",     value: "31",  icon: FiUsers,       color: "stat-green" },
  { id: 3, label: "Com alta este mês",    value: "4",   icon: FiCheck,       color: "stat-amber" },
  { id: 4, label: "Pendentes de revisão", value: "3",   icon: FiClock,       color: "stat-rose"  },
];

const statusLabel = { ativo: "Ativo", alta: "Alta", pendente: "Pendente" };
const evolLabel   = { melhora: "Melhora", estavel: "Estável", alta: "Alta", "—": "—" };

/* ── COMPONENT ── */
export default function Prontuarios() {
  const navigate     = useNavigate();
  const [sidebarOpen, setSidebar]   = useState(false);
  const [activePath]                = useState("/prontuarios");
  const [search, setSearch]         = useState("");
  const [filterStatus, setFilter]   = useState("todos");
  const [selected, setSelected]     = useState(null);
  const [filterOpen, setFilterOpen] = useState(false);

  const filtered = prontuariosMock.filter((p) => {
    const matchSearch = p.nome.toLowerCase().includes(search.toLowerCase()) ||
                        p.cid.toLowerCase().includes(search.toLowerCase()) ||
                        p.diagnostico.toLowerCase().includes(search.toLowerCase());
    const matchStatus = filterStatus === "todos" || p.status === filterStatus;
    return matchSearch && matchStatus;
  });

  return (
    <div className={`dash-layout ${sidebarOpen ? "sidebar-expanded" : ""}`}>

      {/* ── SIDEBAR ── */}
      <aside className="dash-sidebar">
        <div className="sidebar-brand">
          <img src={logosemfundo} alt="logo" className="sidebar-logo" />
        </div>

        <div className="sidebar-profile">
          <div className="profile-avatar">MY</div>
          <div className="profile-info">
            <span className="profile-name">Maya Yamamoto</span>
            <span className="profile-role">Fisioterapeuta</span>
          </div>
        </div>

        <nav className="sidebar-nav">
          <p className="nav-section-label">Menu</p>
          {menuItems.map(({ icon: Icon, label, path }) => (
            <button
              key={path}
              className={`nav-item ${activePath === path ? "nav-item--active" : ""}`}
              onClick={() => navigate(path)}
            >
              <span className="nav-icon-wrap"><Icon /></span>
              <span className="nav-label">{label}</span>
              {activePath === path && <FiChevronRight className="nav-chevron" />}
            </button>
          ))}
        </nav>

        <button className="nav-item nav-sair" onClick={() => navigate("/login")}>
          <span className="nav-icon-wrap"><FiLogOut /></span>
          <span className="nav-label">Sair</span>
        </button>
      </aside>

      {/* ── MAIN ── */}
      <div className="dash-main">

        {/* HEADER */}
        <header className="dash-header">
          <button
            className="header-menu-btn"
            onClick={() => setSidebar(!sidebarOpen)}
            aria-label="Toggle menu"
          >
            <FiMenu />
          </button>

          <div className="header-title" />

          <div className="header-actions">
            <button className="header-action-btn" aria-label="Notificações">
              <FiBell />
              <span className="badge-notif" />
            </button>
            <button className="header-action-btn" aria-label="Mensagens">
              <FiMessageSquare />
            </button>
            <div className="header-user">
              <div className="header-avatar">MY</div>
            </div>
          </div>
        </header>

        {/* CONTENT */}
        <div className="dash-content">

          {/* PAGE TITLE */}
          <section className="pront-hero">
            <div>
              <h1 className="pront-title">Prontuários</h1>
              <p className="pront-sub">Gerencie os registros clínicos dos seus pacientes</p>
            </div>
            <button className="btn-novo" onClick={() => {}}>
              <FiPlus /> Novo prontuário
            </button>
          </section>

          {/* STATS */}
          <section className="stats-row">
            {statsMock.map((s) => {
              const Icon = s.icon;
              return (
                <div key={s.id} className={`stat-card ${s.color}`}>
                  <div className="stat-icon"><Icon /></div>
                  <div className="stat-body">
                    <span className="stat-value">{s.value}</span>
                    <span className="stat-label">{s.label}</span>
                  </div>
                </div>
              );
            })}
          </section>

          {/* TOOLBAR */}
          <div className="pront-toolbar">
            <div className="search-wrap">
              <FiSearch className="search-icon" />
              <input
                className="search-input"
                placeholder="Buscar por paciente, CID ou diagnóstico…"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
              {search && (
                <button className="search-clear" onClick={() => setSearch("")}>
                  <FiX />
                </button>
              )}
            </div>

            <div className="filter-wrap">
              <button
                className={`btn-filter ${filterOpen ? "btn-filter--open" : ""}`}
                onClick={() => setFilterOpen(!filterOpen)}
              >
                <FiFilter /> Filtrar
                <FiChevronDown className="filter-chevron" />
              </button>
              {filterOpen && (
                <div className="filter-dropdown">
                  {["todos", "ativo", "alta", "pendente"].map((f) => (
                    <button
                      key={f}
                      className={`filter-opt ${filterStatus === f ? "filter-opt--active" : ""}`}
                      onClick={() => { setFilter(f); setFilterOpen(false); }}
                    >
                      {f === "todos" ? "Todos" : statusLabel[f]}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* TABLE + DETAIL */}
          <div className={`pront-grid ${selected ? "pront-grid--split" : ""}`}>

            {/* LIST */}
            <div className="card pront-list-card">
              <div className="pront-list-header">
                <span>Paciente</span>
                <span>CID / Diagnóstico</span>
                <span>Sessões</span>
                <span>Última consulta</span>
                <span>Status</span>
                <span />
              </div>

              {filtered.length === 0 ? (
                <div className="pront-empty">
                  <FiFileText />
                  <p>Nenhum prontuário encontrado</p>
                </div>
              ) : (
                <ul className="pront-list">
                  {filtered.map((p) => (
                    <li
                      key={p.id}
                      className={`pront-row ${selected?.id === p.id ? "pront-row--active" : ""}`}
                      onClick={() => setSelected(selected?.id === p.id ? null : p)}
                    >
                      {/* Paciente */}
                      <div className="pront-patient">
                        <div className="pront-avatar">{p.initials}</div>
                        <div>
                          <strong className="pront-name">{p.nome}</strong>
                          <span className="pront-plan">{p.plano}</span>
                        </div>
                      </div>

                      {/* CID */}
                      <div className="pront-cid">
                        <span className="pront-cid-code">{p.cid.split("–")[0].trim()}</span>
                        <span className="pront-diag">{p.diagnostico}</span>
                      </div>

                      {/* Sessões */}
                      <div className="pront-sessoes">
                        <div className="sessoes-bar">
                          <div
                            className="sessoes-fill"
                            style={{ width: `${Math.min((p.sessoes / p.totalSessoes) * 100, 100)}%` }}
                          />
                        </div>
                        <span className="sessoes-label">{p.sessoes}/{p.totalSessoes}</span>
                      </div>

                      {/* Última */}
                      <span className="pront-date">{p.ultima}</span>

                      {/* Status */}
                      <span className={`pront-badge pront-badge--${p.status}`}>
                        {statusLabel[p.status]}
                      </span>

                      {/* Ações */}
                      <div className="pront-actions" onClick={(e) => e.stopPropagation()}>
                        <button className="pront-action-btn" title="Visualizar" onClick={() => setSelected(p)}>
                          <FiEye />
                        </button>
                        <button className="pront-action-btn" title="Editar">
                          <FiEdit2 />
                        </button>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            {/* DETAIL PANEL */}
            {selected && (
              <div className="card pront-detail">
                <div className="detail-header">
                  <div className="detail-avatar">{selected.initials}</div>
                  <div className="detail-title-wrap">
                    <h2 className="detail-name">{selected.nome}</h2>
                    <span className={`pront-badge pront-badge--${selected.status}`}>
                      {statusLabel[selected.status]}
                    </span>
                  </div>
                  <button className="detail-close" onClick={() => setSelected(null)}>
                    <FiX />
                  </button>
                </div>

                <div className="detail-section">
                  <p className="detail-label">Diagnóstico</p>
                  <p className="detail-value">{selected.diagnostico}</p>
                </div>

                <div className="detail-section">
                  <p className="detail-label">CID</p>
                  <p className="detail-value">{selected.cid}</p>
                </div>

                <div className="detail-section">
                  <p className="detail-label">Plano terapêutico</p>
                  <p className="detail-value">{selected.plano}</p>
                </div>

                <div className="detail-section">
                  <p className="detail-label">Evolução clínica</p>
                  <span className={`evol-badge evol-badge--${selected.evolucao.replace("—", "neutro")}`}>
                    {evolLabel[selected.evolucao]}
                  </span>
                </div>

                <div className="detail-section">
                  <p className="detail-label">Progresso das sessões</p>
                  <div className="detail-progress">
                    <div className="sessoes-bar sessoes-bar--lg">
                      <div
                        className="sessoes-fill"
                        style={{ width: `${Math.min((selected.sessoes / selected.totalSessoes) * 100, 100)}%` }}
                      />
                    </div>
                    <span className="detail-progress-label">
                      {selected.sessoes} de {selected.totalSessoes} sessões
                    </span>
                  </div>
                </div>

                <div className="detail-dates">
                  <div className="detail-date-item">
                    <p className="detail-label">Última consulta</p>
                    <p className="detail-value">{selected.ultima}</p>
                  </div>
                  <div className="detail-date-item">
                    <p className="detail-label">Próxima consulta</p>
                    <p className="detail-value">{selected.proxima}</p>
                  </div>
                </div>

                <div className="detail-btns">
                  <button className="btn-detail-primary">
                    <FiEdit2 /> Editar prontuário
                  </button>
                  <button className="btn-detail-secondary" onClick={() => navigate("/agenda")}>
                    <FiCalendar /> Ver na agenda
                  </button>
                </div>
              </div>
            )}
          </div>

        </div>
      </div>
    </div>
  );
}

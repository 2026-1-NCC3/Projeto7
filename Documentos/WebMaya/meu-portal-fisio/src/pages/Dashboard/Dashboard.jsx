import { useEffect, useState } from 'react';
import Calendar from 'react-calendar';
import 'react-calendar/dist/Calendar.css';
import { FiCalendar, FiCheckCircle, FiClock, FiUsers } from 'react-icons/fi';
import { apiRequest } from '../../lib/api';

const statusLabels = {
  scheduled: 'Agendado',
  confirmed: 'Confirmado',
  pending: 'Pendente',
};

function formatDate(date) {
  return new Intl.DateTimeFormat('pt-BR').format(new Date(date));
}

export default function Dashboard() {
  const [summary, setSummary] = useState(null);
  const [appointments, setAppointments] = useState([]);
  const [selectedDate, setSelectedDate] = useState(new Date());

  useEffect(() => {
    async function loadSummary() {
      setSummary(await apiRequest('/dashboard/summary'));
    }

    loadSummary();
  }, []);

  useEffect(() => {
    async function loadAppointments() {
      const date = selectedDate.toISOString().slice(0, 10);
      setAppointments(await apiRequest(`/appointments?date=${date}`));
    }

    loadAppointments();
  }, [selectedDate]);

  const stats = [
    { label: 'Total de pacientes', value: summary?.totalPatients ?? 0, icon: FiUsers },
    { label: 'Atendimentos de hoje', value: summary?.todaysAppointments ?? 0, icon: FiCalendar },
    { label: 'Tarefas pendentes', value: summary?.pendingTasks ?? 0, icon: FiClock },
  ];

  return (
    <div className="app-page">
      <section className="card hero-card">
        <div className="section-head">
          <div>
            <div className="chip">Início</div>
            <h2 className="hero-title">{summary?.greeting || 'Olá, Maya! Que bom ver você por aqui.'}</h2>
            <p className="subtle">Resumo rápido da rotina clínica, com foco no que importa hoje.</p>
          </div>
        </div>

        <div className="stats-grid">
          {stats.map(({ label, value, icon: Icon }) => (
            <article className="stat-card" key={label}>
              <div className="stat-icon"><Icon /></div>
              <div>
                <div className="stat-value">{value}</div>
                <div className="subtle">{label}</div>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="dashboard-grid">
        <article className="card calendar-card">
          <div className="section-head">
            <div>
              <h3>Calendário</h3>
              <div className="subtle">Selecione um dia para ver a agenda.</div>
            </div>
          </div>
          <Calendar locale="pt-BR" value={selectedDate} onChange={setSelectedDate} />
        </article>

        <article className="card">
          <div className="section-head">
            <div>
              <h3>Próximos atendimentos</h3>
              <div className="subtle">Dados sincronizados pela API.</div>
            </div>
          </div>

          <div className="list">
            {(summary?.nextAppointments || []).map((appointment) => (
              <div className="appointment-item" key={appointment.id}>
                <div>
                  <div className="list-title">{appointment.patientName}</div>
                  <div className="subtle">{formatDate(appointment.date)} às {appointment.time}</div>
                </div>
                <span className={`status-pill ${appointment.status}`}>{statusLabels[appointment.status] || appointment.status}</span>
              </div>
            ))}
          </div>
        </article>
      </section>

      <section className="panel-grid">
        <article className="card">
          <div className="section-head">
            <div>
              <h3>Agenda do dia selecionado</h3>
              <div className="subtle">{new Intl.DateTimeFormat('pt-BR', { dateStyle: 'full' }).format(selectedDate)}</div>
            </div>
          </div>

          <div className="list">
            {appointments.length === 0 ? (
              <div className="empty-state">Nenhum atendimento marcado para esta data.</div>
            ) : appointments.map((appointment) => (
              <div className="appointment-item" key={appointment.id}>
                <div>
                  <div className="list-title">{appointment.patientName}</div>
                  <div className="subtle">{appointment.time}</div>
                  {appointment.notes && <div className="subtle">{appointment.notes}</div>}
                </div>
                <span className={`status-pill ${appointment.status}`}>{statusLabels[appointment.status] || appointment.status}</span>
              </div>
            ))}
          </div>
        </article>

        <article className="card">
          <div className="section-head">
            <div>
              <h3>Resumo operacional</h3>
              <div className="subtle">Atalhos mentais para uma rotina mais fluida.</div>
            </div>
          </div>

          <div className="list">
            <div className="list-item">
              <div className="list-title">Prontuários completos</div>
              <div className="subtle">A ficha segue o modelo real de avaliação fisioterapêutica.</div>
            </div>
            <div className="list-item">
              <div className="list-title">Exportação clínica</div>
              <div className="subtle">Gere PDF com aparência de documento profissional.</div>
            </div>
            <div className="list-item">
              <div className="list-title">Sidebar estável</div>
              <div className="subtle">Navegação fixa no desktop e menu responsivo no tablet e mobile.</div>
            </div>
            <div className="list-item">
              <div className="chip"><FiCheckCircle /> Fluxo mais simples e intuitivo.</div>
            </div>
          </div>
        </article>
      </section>
    </div>
  );
}

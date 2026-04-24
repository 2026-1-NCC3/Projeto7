import { useEffect, useState } from 'react';
import Calendar from 'react-calendar';
import 'react-calendar/dist/Calendar.css';
import { apiRequest } from '../../lib/api';

const emptyForm = {
  patient_id: '',
  date: '',
  time: '',
  notes: '',
  status: 'scheduled',
};

const statusLabels = {
  scheduled: 'Agendado',
  confirmed: 'Confirmado',
  pending: 'Pendente',
};

export default function SchedulePage() {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [appointments, setAppointments] = useState([]);
  const [patients, setPatients] = useState([]);
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState(null);

  const isoDate = selectedDate.toISOString().slice(0, 10);

  async function loadData(date = isoDate) {
    const [appointmentsData, patientsData] = await Promise.all([
      apiRequest(`/appointments?date=${date}`),
      apiRequest('/patients'),
    ]);
    setAppointments(appointmentsData);
    setPatients(patientsData);
  }

  useEffect(() => {
    loadData();
  }, [isoDate]);

  useEffect(() => {
    setForm((current) => ({ ...current, date: isoDate }));
  }, [isoDate]);

  async function handleSubmit(event) {
    event.preventDefault();
    const body = JSON.stringify(form);

    if (editingId) {
      await apiRequest(`/appointments/${editingId}`, { method: 'PUT', body });
    } else {
      await apiRequest('/appointments', { method: 'POST', body });
    }

    setForm({ ...emptyForm, date: isoDate });
    setEditingId(null);
    loadData(form.date || isoDate);
  }

  async function handleDelete(id) {
    if (!window.confirm('Deseja excluir este atendimento?')) return;
    await apiRequest(`/appointments/${id}`, { method: 'DELETE' });
    loadData();
  }

  return (
    <div className="app-page">
      <section className="split-layout">
        <article className="card calendar-card">
          <div className="section-head">
            <div>
              <h2>Agenda</h2>
              <div className="subtle">Calendário interativo com visual diário dos atendimentos.</div>
            </div>
          </div>
          <Calendar value={selectedDate} onChange={setSelectedDate} locale="pt-BR" />
        </article>

        <article className="card">
          <div className="section-head">
            <div>
              <h2>{editingId ? 'Editar atendimento' : 'Criar atendimento'}</h2>
              <div className="subtle">Paciente, data, horário e observações em um só lugar.</div>
            </div>
          </div>

          <form className="field-grid" onSubmit={handleSubmit}>
            <div className="field">
              <label>Paciente</label>
              <select value={form.patient_id} onChange={(event) => setForm({ ...form, patient_id: event.target.value })} required>
                <option value="">Selecione um paciente</option>
                {patients.map((patient) => (
                  <option key={patient.id} value={patient.id}>{patient.name}</option>
                ))}
              </select>
            </div>
            <div className="field-grid two">
              <div className="field">
                <label>Data</label>
                <input type="date" value={form.date} onChange={(event) => setForm({ ...form, date: event.target.value })} required />
              </div>
              <div className="field">
                <label>Horário</label>
                <input type="time" value={form.time} onChange={(event) => setForm({ ...form, time: event.target.value })} required />
              </div>
            </div>
            <div className="field">
              <label>Status</label>
              <select value={form.status} onChange={(event) => setForm({ ...form, status: event.target.value })}>
                <option value="scheduled">Agendado</option>
                <option value="confirmed">Confirmado</option>
                <option value="pending">Pendente</option>
              </select>
            </div>
            <div className="field">
              <label>Observações</label>
              <textarea value={form.notes} onChange={(event) => setForm({ ...form, notes: event.target.value })} />
            </div>
            <div className="button-row">
              <button className="btn" type="submit">{editingId ? 'Salvar alterações' : 'Criar atendimento'}</button>
              <button className="btn-secondary" type="button" onClick={() => { setEditingId(null); setForm({ ...emptyForm, date: isoDate }); }}>
                Cancelar
              </button>
            </div>
          </form>
        </article>
      </section>

      <section className="card">
        <div className="section-head">
          <div>
            <h2>Atendimentos do dia</h2>
            <div className="subtle">{new Intl.DateTimeFormat('pt-BR', { dateStyle: 'full' }).format(selectedDate)}</div>
          </div>
        </div>

        <div className="list">
          {appointments.length === 0 ? (
            <div className="empty-state">Nenhum atendimento para esta data.</div>
          ) : appointments.map((appointment) => (
            <div className="appointment-item" key={appointment.id}>
              <div>
                <div className="list-title">{appointment.patientName}</div>
                <div className="subtle">{appointment.time}</div>
                <div className="subtle">{appointment.notes || 'Sem observações.'}</div>
              </div>
              <div className="button-row">
                <span className={`status-pill ${appointment.status}`}>{statusLabels[appointment.status] || appointment.status}</span>
                <button
                  className="btn-secondary"
                  onClick={() => {
                    setEditingId(appointment.id);
                    setForm({
                      patient_id: String(appointment.patient_id),
                      date: appointment.date,
                      time: appointment.time,
                      notes: appointment.notes || '',
                      status: appointment.status,
                    });
                  }}
                >
                  Editar
                </button>
                <button className="btn-danger" onClick={() => handleDelete(appointment.id)}>Excluir</button>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}

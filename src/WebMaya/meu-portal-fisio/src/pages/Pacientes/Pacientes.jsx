import { useEffect, useState } from 'react';
import { FiEye, FiPlus, FiTrash2 } from 'react-icons/fi';
import { apiRequest } from '../../lib/api';
import './Pacientes.css';

const emptyForm = {
  name: '',
  birth_date: '',
  phone: '',
  email: '',
  main_condition: '',
  notes: '',
};

function getAge(birthDate) {
  if (!birthDate) return '-';
  const today = new Date();
  const birth = new Date(birthDate);
  let age = today.getFullYear() - birth.getFullYear();
  if (today.getMonth() < birth.getMonth() || (today.getMonth() === birth.getMonth() && today.getDate() < birth.getDate())) {
    age -= 1;
  }
  return age;
}

export default function Pacientes() {
  const [patients, setPatients] = useState([]);
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState(null);
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [showForm, setShowForm] = useState(false);

  async function loadPatients() {
    setPatients(await apiRequest('/patients'));
  }

  useEffect(() => {
    loadPatients();
  }, []);

  function openCreateForm() {
    setForm(emptyForm);
    setEditingId(null);
    setShowForm(true);
  }

  function openEditForm(patient) {
    setEditingId(patient.id);
    setForm(patient);
    setShowForm(true);
  }

  function closeForm() {
    setForm(emptyForm);
    setEditingId(null);
    setShowForm(false);
  }

  async function handleSubmit(event) {
    event.preventDefault();

    if (editingId) {
      await apiRequest(`/patients/${editingId}`, { method: 'PUT', body: JSON.stringify(form) });
    } else {
      await apiRequest('/patients', { method: 'POST', body: JSON.stringify(form) });
    }

    closeForm();
    loadPatients();
  }

  async function handleDelete(id) {
    if (!window.confirm('Deseja excluir este paciente e os dados relacionados?')) return;
    await apiRequest(`/patients/${id}`, { method: 'DELETE' });
    if (selectedPatient?.id === id) setSelectedPatient(null);
    loadPatients();
  }

  return (
    <div className="patients-page app-page">
      <section className="patients-list-layout">
        <article className="card">
          <div className="section-head">
            <div>
              <h2>Pacientes</h2>
              <div className="subtle">Cadastros simples com acesso rápido aos dados principais!</div>
            </div>
            <button className="btn" type="button" onClick={openCreateForm}>
              <FiPlus style={{ marginRight: 8 }} />
              Novo paciente
            </button>
          </div>

          <table className="data-table">
            <thead>
              <tr>
                <th>Nome</th>
                <th>Idade</th>
                <th>Diagnóstico</th>
                <th>Prontuário</th>
                <th />
              </tr>
            </thead>
            <tbody>
              {patients.map((patient) => (
                <tr key={patient.id}>
                  <td>{patient.name}</td>
                  <td>{getAge(patient.birth_date)}</td>
                  <td>{patient.main_condition || '-'}</td>
                  <td>
                    <button className="btn-ghost" onClick={() => setSelectedPatient(patient)}>
                      <FiEye style={{ marginRight: 6 }} />
                      Visualizar
                    </button>
                  </td>
                  <td>
                    <div className="button-row">
                      <button className="btn-secondary" onClick={() => openEditForm(patient)}>
                        Editar
                      </button>
                      <button className="btn-danger" onClick={() => handleDelete(patient.id)}>
                        <FiTrash2 />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </article>
      </section>

      {showForm && (
        <div className="patients-form-overlay" onClick={closeForm}>
          <article
            className="card patients-form-card"
            role="dialog"
            aria-modal="true"
            aria-labelledby="patients-form-title"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="section-head">
              <div>
                <h2 id="patients-form-title">{editingId ? 'Editar paciente' : 'Criar paciente'}</h2>
                <div className="subtle">Preencha as informações essenciais.</div>
              </div>
            </div>

            <form className="field-grid" onSubmit={handleSubmit}>
              <div className="field">
                <label>Nome</label>
                <input value={form.name} onChange={(event) => setForm({ ...form, name: event.target.value })} required />
              </div>
              <div className="field">
                <label>Data de nascimento</label>
                <input type="date" value={form.birth_date} onChange={(event) => setForm({ ...form, birth_date: event.target.value })} required />
              </div>
              <div className="field-grid two">
                <div className="field">
                  <label>Telefone</label>
                  <input value={form.phone} onChange={(event) => setForm({ ...form, phone: event.target.value })} />
                </div>
                <div className="field">
                  <label>E-mail</label>
                  <input type="email" value={form.email} onChange={(event) => setForm({ ...form, email: event.target.value })} />
                </div>
              </div>
              <div className="field">
                <label>Diagnóstico / condição principal</label>
                <input value={form.main_condition} onChange={(event) => setForm({ ...form, main_condition: event.target.value })} />
              </div>
              <div className="field">
                <label>Observações</label>
                <textarea value={form.notes} onChange={(event) => setForm({ ...form, notes: event.target.value })} />
              </div>
              <div className="button-row">
                <button className="btn" type="submit">{editingId ? 'Salvar alteracoes' : 'Criar paciente'}</button>
                <button className="btn-secondary" type="button" onClick={closeForm}>
                  Cancelar
                </button>
              </div>
            </form>
          </article>
        </div>
      )}

      {selectedPatient && (
        <section className="card">
          <div className="section-head">
            <div>
              <h2>{selectedPatient.name}</h2>
              <div className="subtle">Idade {getAge(selectedPatient.birth_date)} - {selectedPatient.email || 'Sem e-mail cadastrado'}</div>
            </div>
          </div>

          <div className="field-grid two">
            <div className="list-item">
              <div className="list-title">Telefone</div>
              <div className="subtle">{selectedPatient.phone || '-'}</div>
            </div>
            <div className="list-item">
              <div className="list-title">Condicao principal</div>
              <div className="subtle">{selectedPatient.main_condition || '-'}</div>
            </div>
            <div className="list-item" style={{ gridColumn: '1 / -1' }}>
              <div className="list-title">Observacoes</div>
              <div className="subtle">{selectedPatient.notes || 'Nenhuma observacao registrada.'}</div>
            </div>
          </div>
        </section>
      )}
    </div>
  );
}

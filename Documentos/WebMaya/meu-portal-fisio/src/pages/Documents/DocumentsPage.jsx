import { useEffect, useState } from 'react';
import { apiRequest } from '../../lib/api';

export default function DocumentsPage() {
  const [documents, setDocuments] = useState([]);
  const [patients, setPatients] = useState([]);
  const [form, setForm] = useState({
    patient_id: '',
    title: '',
    notes: '',
    file: null,
  });

  async function loadData() {
    const [documentsData, patientsData] = await Promise.all([
      apiRequest('/documents'),
      apiRequest('/patients'),
    ]);
    setDocuments(documentsData);
    setPatients(patientsData);
  }

  useEffect(() => {
    loadData();
  }, []);

  async function handleSubmit(event) {
    event.preventDefault();
    const body = new FormData();
    body.append('patient_id', form.patient_id);
    body.append('title', form.title);
    body.append('notes', form.notes);
    body.append('file', form.file);
    await apiRequest('/documents', { method: 'POST', body });
    setForm({ patient_id: '', title: '', notes: '', file: null });
    loadData();
  }

  async function handleDelete(id) {
    if (!window.confirm('Deseja excluir este documento?')) return;
    await apiRequest(`/documents/${id}`, { method: 'DELETE' });
    loadData();
  }

  return (
    <div className="app-page">
      <section className="split-layout">
        <article className="card">
          <div className="section-head">
            <div>
              <h2>Documentos</h2>
              <div className="subtle">Anexos vinculados ao paciente com acesso simples.</div>
            </div>
          </div>

          <div className="list">
            {documents.length === 0 ? (
              <div className="empty-state">Nenhum documento enviado.</div>
            ) : documents.map((document) => (
              <article className="document-item" key={document.id}>
                <div className="document-head">
                  <div>
                    <div className="list-title">{document.title}</div>
                    <div className="subtle">{document.patientName}</div>
                    <div className="subtle">{document.file_name}</div>
                  </div>
                  <div className="button-row">
                    <a className="btn-secondary documents-link" href={document.file_url} target="_blank" rel="noreferrer">
                      Visualizar
                    </a>
                    <button className="btn-danger" onClick={() => handleDelete(document.id)}>Excluir</button>
                  </div>
                </div>
                <div className="subtle">{document.notes || 'Sem observações.'}</div>
              </article>
            ))}
          </div>
        </article>

        <article className="card">
          <div className="section-head">
            <div>
              <h2>Enviar documento</h2>
              <div className="subtle">Exames, prescrições e arquivos complementares.</div>
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
            <div className="field">
              <label>Título</label>
              <input value={form.title} onChange={(event) => setForm({ ...form, title: event.target.value })} required />
            </div>
            <div className="field">
              <label>Observações</label>
              <textarea value={form.notes} onChange={(event) => setForm({ ...form, notes: event.target.value })} />
            </div>
            <div className="field">
              <label>Arquivo</label>
              <input type="file" onChange={(event) => setForm({ ...form, file: event.target.files?.[0] || null })} required />
            </div>
            <button className="btn" type="submit">Enviar arquivo</button>
          </form>
        </article>
      </section>
    </div>
  );
}

import { useEffect, useState } from 'react';
import { apiRequest } from '../../lib/api';

const emptyForm = {
  name: '',
  description: '',
  instructions: '',
};

export default function ExercisesPage() {
  const [exercises, setExercises] = useState([]);
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState(null);

  async function loadExercises() {
    setExercises(await apiRequest('/exercises'));
  }

  useEffect(() => {
    loadExercises();
  }, []);

  async function handleSubmit(event) {
    event.preventDefault();
    const body = JSON.stringify(form);

    if (editingId) {
      await apiRequest(`/exercises/${editingId}`, { method: 'PUT', body });
    } else {
      await apiRequest('/exercises', { method: 'POST', body });
    }

    setForm(emptyForm);
    setEditingId(null);
    loadExercises();
  }

  async function handleDelete(id) {
    if (!window.confirm('Deseja excluir este exercício?')) return;
    await apiRequest(`/exercises/${id}`, { method: 'DELETE' });
    loadExercises();
  }

  return (
    <div className="app-page">
      <section className="split-layout">
        <article className="card">
          <div className="section-head">
            <div>
              <h2>Exercícios</h2>
              <div className="subtle">Biblioteca simples para orientações terapêuticas.</div>
            </div>
          </div>

          <div className="list">
            {exercises.map((exercise) => (
              <article className="exercise-item" key={exercise.id}>
                <div className="record-meta">
                  <div className="list-title">{exercise.name}</div>
                  <div className="button-row">
                    <button
                      className="btn-secondary"
                      onClick={() => {
                        setEditingId(exercise.id);
                        setForm({
                          name: exercise.name,
                          description: exercise.description,
                          instructions: exercise.instructions,
                        });
                      }}
                    >
                      Editar
                    </button>
                    <button className="btn-danger" onClick={() => handleDelete(exercise.id)}>Excluir</button>
                  </div>
                </div>
                <div className="subtle">{exercise.description}</div>
                <div className="list-item">
                  <div className="list-title">Instruções</div>
                  <div className="subtle">{exercise.instructions}</div>
                </div>
              </article>
            ))}
          </div>
        </article>

        <article className="card">
          <div className="section-head">
            <div>
              <h2>{editingId ? 'Editar exercício' : 'Criar exercício'}</h2>
              <div className="subtle">Padronização simples para descrições e orientações.</div>
            </div>
          </div>

          <form className="field-grid" onSubmit={handleSubmit}>
            <div className="field">
              <label>Nome</label>
              <input value={form.name} onChange={(event) => setForm({ ...form, name: event.target.value })} required />
            </div>
            <div className="field">
              <label>Descrição</label>
              <textarea value={form.description} onChange={(event) => setForm({ ...form, description: event.target.value })} required />
            </div>
            <div className="field">
              <label>Instruções</label>
              <textarea value={form.instructions} onChange={(event) => setForm({ ...form, instructions: event.target.value })} required />
            </div>
            <div className="button-row">
              <button className="btn" type="submit">{editingId ? 'Salvar alterações' : 'Criar exercício'}</button>
              <button className="btn-secondary" type="button" onClick={() => { setEditingId(null); setForm(emptyForm); }}>
                Limpar
              </button>
            </div>
          </form>
        </article>
      </section>
    </div>
  );
}

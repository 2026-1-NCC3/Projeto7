import { useEffect, useState } from 'react';
import { apiRequest } from '../../lib/api';
import { useAuth } from '../../context/AuthContext';

export default function SettingsPage() {
  const [settings, setSettings] = useState(null);
  const { updateAdmin } = useAuth();

  useEffect(() => {
    async function loadSettings() {
      setSettings(await apiRequest('/settings'));
    }

    loadSettings();
  }, []);

  if (!settings) {
    return <div className="card">Carregando configurações...</div>;
  }

  async function handleSubmit(event) {
    event.preventDefault();
    const updated = await apiRequest('/settings', {
      method: 'PUT',
      body: JSON.stringify(settings),
    });
    setSettings(updated);
    updateAdmin(updated);
  }

  return (
    <div className="app-page">
      <section className="split-layout">
        <article className="card">
          <div className="section-head">
            <div>
              <h2>Perfil profissional</h2>
              <div className="subtle">Informações da administradora e assinatura profissional.</div>
            </div>
          </div>

          <form className="field-grid" onSubmit={handleSubmit}>
            <div className="field">
              <label>Nome</label>
              <input value={settings.name || ''} onChange={(event) => setSettings({ ...settings, name: event.target.value })} />
            </div>
            <div className="field">
              <label>Profissão</label>
              <input value={settings.profession || ''} onChange={(event) => setSettings({ ...settings, profession: event.target.value })} />
            </div>
            <div className="field-grid two">
              <div className="field">
                <label>E-mail</label>
                <input value={settings.email || ''} onChange={(event) => setSettings({ ...settings, email: event.target.value })} />
              </div>
              <div className="field">
                <label>Telefone</label>
                <input value={settings.phone || ''} onChange={(event) => setSettings({ ...settings, phone: event.target.value })} />
              </div>
            </div>
            <div className="button-row">
              <button className="btn" type="submit">Salvar configurações</button>
            </div>
          </form>
        </article>

        <article className="card">
          <div className="section-head">
            <div>
              <h2>Preferências do sistema</h2>
              <div className="subtle">Ajustes visuais e operacionais do portal.</div>
            </div>
          </div>

          <div className="field-grid">
            <div className="toggle">
              <div>
                <div className="list-title">Notificações</div>
                <div className="subtle">Ativar lembretes e alertas internos.</div>
              </div>
              <button
                type="button"
                className={`switch ${settings.notifications_enabled ? 'on' : ''}`}
                onClick={() => setSettings({ ...settings, notifications_enabled: !settings.notifications_enabled })}
                aria-label="Alternar notificações"
              />
            </div>

            <div className="field">
              <label>Visualização padrão da agenda</label>
              <select value={settings.calendar_view || 'week'} onChange={(event) => setSettings({ ...settings, calendar_view: event.target.value })}>
                <option value="day">Dia</option>
                <option value="week">Semana</option>
                <option value="month">Mês</option>
              </select>
            </div>

            <div className="field">
              <label>Cor de destaque</label>
              <input value={settings.accent_color || '#71d9d1'} onChange={(event) => setSettings({ ...settings, accent_color: event.target.value })} />
            </div>
          </div>
        </article>
      </section>
    </div>
  );
}

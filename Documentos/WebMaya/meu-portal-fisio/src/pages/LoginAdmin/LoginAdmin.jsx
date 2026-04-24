import { useState } from 'react';
import { Navigate, useLocation, useNavigate } from 'react-router-dom';
import { FiLock, FiShield, FiSmartphone } from 'react-icons/fi';
import { useAuth } from '../../context/AuthContext';

export default function LoginAdmin() {
  const [username, setUsername] = useState('maya');
  const [password, setPassword] = useState('maya123');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const { login, token } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  if (token) {
    return <Navigate to="/inicio" replace />;
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setSubmitting(true);
    setError('');

    try {
      await login(username, password);
      navigate(location.state?.from?.pathname || '/inicio', { replace: true });
    } catch (submitError) {
      setError(submitError.message);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="auth-shell">
      <div className="auth-card">
        <section className="auth-brand">
          <div>
            <span className="auth-pill">Maya Yamamoto</span>
            <h1>Menos ruído, mais clareza clínica.</h1>
            <p>
              Sistema administrativo e clínico para gestão de pacientes em RPG,
              com dados seguros, API reutilizável e visual limpo.
            </p>
          </div>

          <div className="auth-features">
            <div className="auth-feature">
              <FiShield />
              <strong style={{ display: 'block', margin: '0.4rem 0' }}>Acesso protegido</strong>
              <span className="subtle">Somente a administradora entra no sistema, sem cadastro público.</span>
            </div>
            <div className="auth-feature">
              <FiLock />
              <strong style={{ display: 'block', margin: '0.4rem 0' }}>Prontuários persistentes</strong>
              <span className="subtle">Pacientes, prontuários, agenda, exercícios e documentos ficam no banco.</span>
            </div>
            <div className="auth-feature">
              <FiSmartphone />
              <strong style={{ display: 'block', margin: '0.4rem 0' }}>Pronto para mobile</strong>
              <span className="subtle">Os dados são retornados em JSON para integração com app futuro.</span>
            </div>
          </div>
        </section>

        <section className="auth-form-panel">
          <form className="auth-form" onSubmit={handleSubmit}>
            <div>
              <h2>Login administrativo</h2>
              <p className="muted">Acesse o sistema com as credenciais da profissional.</p>
            </div>

            {error && <div className="error-box">{error}</div>}

            <div className="field">
              <label htmlFor="username">Usuário</label>
              <input id="username" value={username} onChange={(event) => setUsername(event.target.value)} />
            </div>

            <div className="field">
              <label htmlFor="password">Senha</label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
              />
            </div>

            <button className="btn" type="submit" disabled={submitting}>
              {submitting ? 'Entrando...' : 'Acessar portal'}
            </button>

            <div className="subtle">Credenciais padrão: maya / maya123</div>
          </form>
        </section>
      </div>
    </div>
  );
}

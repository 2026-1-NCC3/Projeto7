import { useState } from 'react';
import { Navigate, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import mylogo from '../../assets/mylogo.png';
import './LoginAdmin.css';

export default function LoginAdmin() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
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
    <div className="login-wrapper">
      <div className="login-container">

        {/* Logo */}
        <div className="logo-area">
          <div className="logo-line-group">
            <span className="logo-line" />
            <img src={mylogo} alt="my" className="logo-img" />
            <span className="logo-line" />
          </div>
          <span className="logo-subtitle">Portal Admin</span>
        </div>

        {/* Formulário */}
        <form className="login-form" onSubmit={handleSubmit}>
          {error && <div className="login-error-box">{error}</div>}

          <div className="field-group">
            <label htmlFor="username">Usuário:</label>
            <input
              id="username"
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              autoComplete="username"
            />
          </div>

          <div className="field-group">
            <label htmlFor="password">Senha:</label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="current-password"
            />
          </div>

          <button className="btn-login" type="submit" disabled={submitting}>
            {submitting ? 'Entrando...' : 'Acessar o Portal'}
          </button>
        </form>

      </div>
    </div>
  );
}

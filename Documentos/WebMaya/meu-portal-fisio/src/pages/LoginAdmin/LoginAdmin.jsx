import { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./LoginAdmin.css";
import myLogo from "../../assets/mylogo.png";

export default function LoginAdmin() {
  const [usuario, setUsuario] = useState("");
  const [senha, setSenha] = useState("");
  const navigate = useNavigate();

  const handleLogin = (e) => {
    e.preventDefault();
    if (usuario && senha) {
      navigate("/dashboard"); // ← era "./Dashboard/dashboard"
    }
  };

  return (
    <div className="login-wrapper">
      <div className="login-container">
        <div className="logo-area">
          <div className="logo-line-group">
            <span className="logo-line" />
            <img src={myLogo} alt="my" className="logo-img" />
            <span className="logo-line" />
          </div>
          <p className="logo-subtitle">Portal Admin</p>
        </div>

        <form className="login-form" onSubmit={handleLogin}>
          <div className="field-group">
            <label htmlFor="usuario">Usuário:</label>
            <input
              id="usuario"
              type="text"
              value={usuario}
              onChange={(e) => setUsuario(e.target.value)}
              autoComplete="username"
            />
          </div>

          <div className="field-group">
            <label htmlFor="senha">Senha:</label>
            <input
              id="senha"
              type="password"
              value={senha}
              onChange={(e) => setSenha(e.target.value)}
              autoComplete="current-password"
            />
          </div>

          <button type="submit" className="btn-login">
            Acessar o Portal
          </button>
        </form>
      </div>
    </div>
  );
}
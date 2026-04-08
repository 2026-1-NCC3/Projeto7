import React from "react";
import "./loginadmin.css";
import logo from "./assets/mylogo.png";
import { useNavigate } from "react-router-dom";

export default function LoginAdmin() {
  const navigate = useNavigate(); // 👈 faltava isso

  const handleLogin = () => {
    navigate("/prontuarios"); // 👈 redireciona
  };

  return (
    <div className="container">
      <div className="card">
        <div className="logo-container">
          <div className="line"></div>
          <img src={logo} alt="Logo MY" className="logo-img" />
          <div className="line"></div>
        </div>

        <p className="subtitle">Portal Administrador</p>

        <div className="form">
          <label>Usuário</label>
          <input type="text" />

          <label>Senha</label>
          <input type="password" />

          <button onClick={handleLogin}>
            Acessar o Portal
          </button>
        </div>
      </div>
    </div>
  );
}
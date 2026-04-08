import React from "react";
import "./prontuarios.css";
import logo from "./assets/mylogo.png";

export default function Prontuarios() {
  return (
    <div className="container">
      <div className="card prontuario-card">
        
        {/* HEADER */}
        <div className="logo-container">
          <div className="line"></div>
          <img src={logo} alt="Logo" className="logo-img" />
          <div className="line"></div>
        </div>

        <h2 className="title">Informações Prontuário</h2>

        {/* FORM */}
        <div className="form-grid">

          <input placeholder="Nome Completo" />
          <input placeholder="Telefone" />

          <input className="full" placeholder="Endereço" />

          <input placeholder="E-mail" />
          <input placeholder="CPF" />

          <textarea
            className="full"
            placeholder="Dores/datas e acontecimentos (linha do tempo)"
          />

          <input placeholder="Data do primeiro contato" />
          <input placeholder="Profissão" />

          <input placeholder="Convênio" />
          <input placeholder="Horário" />

          <textarea
            className="full"
            placeholder="Como chegou ao consultório (Instagram, indicação...)"
          />

          <input placeholder="Valor por sessão" />

          <textarea
            className="full"
            placeholder="Lista de Remédios"
          />

          <textarea
            className="full"
            placeholder="Queixa Principal (ex: dor na lombar)"
          />

          <textarea
            className="full"
            placeholder="Exames"
          />

          <textarea
            className="full"
            placeholder="Avaliação Física"
          />

          {/* MAPA DO CORPO */}
          <div className="body-map">
            <p>Mapa do Corpo Humano:</p>
            <div className="body-placeholder">
              (Área para desenhar ou futura integração)
            </div>
          </div>

        </div>

        <button className="save-btn">Salvar Prontuário</button>

      </div>
    </div>
  );
}
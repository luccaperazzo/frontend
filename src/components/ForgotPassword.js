import React, { useState } from "react";
import Layout from "./Layout";
import "./ForgotPassword.css"; // Usá el CSS abajo

const ForgotPassword = () => {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("");
    setError("");

    try {
      const response = await fetch("http://localhost:3001/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const data = await response.json();
      if (!response.ok) {
        setError(data.error || data.message || "Error al enviar el email.");
        return;
      }
      setMessage("¡Listo! Revisá tu email para continuar.");
      setEmail("");
    } catch {
      setError("Error de red o del servidor.");
    }
  };

  return (
    <Layout>
      <div className="forgot-root">
        <form className="forgot-form" onSubmit={handleSubmit}>
          <h2 className="forgot-title">Recuperar contraseña</h2>
          <div className="forgot-group">
            <label htmlFor="email">Email</label>
            <input
              className="forgot-input"
              id="email"
              type="email"
              autoComplete="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              required
            />
          </div>
          <button className="forgot-btn" type="submit">Enviar link</button>
          {message && <p className="forgot-success">{message}</p>}
          {error && <p className="forgot-error">{error}</p>}
        </form>
      </div>
    </Layout>
  );
};

export default ForgotPassword;

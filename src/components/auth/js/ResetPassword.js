import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import Layout from "../../layout/js/Layout";
import "../css/ResetPassword.css"; // Podés usar el mismo CSS que Forgot, cambiando las clases

const ResetPassword = () => {
  const navigate = useNavigate();
  const params = new URLSearchParams(window.location.search);
  const token = params.get('token'); //Se obtiene de la URL el TOKEN, para usarse como BODY para el POST
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (password !== confirmPassword) {
      setError("Las contraseñas no coinciden");
      return;
    }

    // Validar fortaleza de la contraseña (igual que backend)
    const passwordRegex = /^(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).{8,}$/;
    if (!passwordRegex.test(password)) {
      setError("La contraseña debe tener al menos 8 caracteres, una letra mayúscula, un número y un carácter especial.");
      return;
    }

    try {
      const response = await fetch("http://localhost:3001/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, password, confirmPassword })
      });
      const data = await response.json();
      if (!response.ok) {
        setError(data.error || data.message || "Token inválido o expirado.");
        return;
      }      setSuccess("¡Contraseña actualizada! Redirigiendo al login...");
      setPassword("");
      setConfirmPassword("");
      
      // Redireccionar al login después de 2 segundos
      setTimeout(() => {
        navigate("/login");
      }, 2000);
    } catch {
      setError("Error de red o del servidor.");
    }
  };

  if (!token) {
    return (
      <Layout>
        <div className="forgot-root">
          <div className="forgot-form">
            <h2 className="forgot-title">Error</h2>
            <p className="forgot-error">Token inválido o faltante.</p>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="forgot-root">
        <form className="forgot-form" onSubmit={handleSubmit}>
          <h2 className="forgot-title">Cambiar contraseña</h2>
          <div className="forgot-group">
            <label>Nueva contraseña</label>
            <input
              className="forgot-input"
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              required
            />
          </div>
          <div className="forgot-group">
            <label>Confirmar contraseña</label>
            <input
              className="forgot-input"
              type="password"
              value={confirmPassword}
              onChange={e => setConfirmPassword(e.target.value)}
              required
            />
          </div>
          <button className="forgot-btn" type="submit">Restablecer contraseña</button>
          {success && <p className="forgot-success">{success}</p>}
          {error && <p className="forgot-error">{error}</p>}
        </form>
      </div>
    </Layout>
  );
};

export default ResetPassword;

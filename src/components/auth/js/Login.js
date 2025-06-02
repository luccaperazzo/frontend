"use client"

import { useState } from "react"
import { useNavigate } from "react-router-dom"
import "../css/Login-CSS.css"
import Layout from "../../layout/js/Layout"

const Login = () => {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError("") // (si tenés manejo de error)
    try {
      const response = await fetch("http://localhost:3001/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      })
      const data = await response.json()
      console.log("RESPUESTA LOGIN:", data) // 👈 Debug

      if (!response.ok) {
        setError(data.error || "Login fallido")
        return
      }

      // 👇 GUARDADO EN localStorage 👇
      localStorage.setItem("token", data.token)
      localStorage.setItem("role", data.role)

      
      if (data.user && data.user._id) {
        localStorage.setItem("user", JSON.stringify(data.user));
        localStorage.setItem("userId", data.user._id);
      }

      // 👇 REDIRECCIÓN AUTOMÁTICA SEGÚN EL ROLE 👇
      if (data.role === "entrenador") {
        navigate("/login-success")
      } else if (data.role === "cliente") {
        navigate("/login-success")
      } 
    } catch (err) {
      setError("Error de red o del servidor")
    }
  }

  return (
    <Layout>
      <div className="login-root">
        <form className="login-form" onSubmit={handleSubmit}>
          <h2 className="login-title">Iniciar sesión</h2>
          <div className="login-group">
            <label htmlFor="email">Email</label>
            <input
              className="login-input"
              id="email"
              type="email"
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div className="login-group">
            <label htmlFor="password">Contraseña</label>
            <input
              className="login-input"
              id="password"
              type="password"
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          <button className="login-btn" type="submit">
            Iniciar sesión
          </button>
          {error && <p className="login-error">{error}</p>}
          <div className="login-footer">
            <span>¿Olvidaste tu contraseña?</span>
            <a href="/forgot-password">Recupérala aquí</a>
          </div>
        </form>
      </div>
    </Layout>
  )
}

export default Login

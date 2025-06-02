"use client"
import { useNavigate } from "react-router-dom"
// Eliminar esta línea: import "./Layout.css"
import { useEffect, useState } from "react"

export default function Layout({ children }) {
  const navigate = useNavigate()

  const [userData, setUserData] = useState(null)

  const handleLogout = () => {
    localStorage.removeItem("token")
    localStorage.removeItem("role")
    navigate("/login")
  }

  useEffect(() => {
    const token = localStorage.getItem("token")
    if (token) {
      fetch("http://localhost:3001/api/me", {
        headers: { Authorization: `Bearer ${token}` },
      })
        .then((response) => response.json())
        .then((data) => {
          setUserData(data)
        })
        .catch((error) => {
          console.error("Error al cargar datos del usuario:", error)
        })
    }
  }, [])

  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        background: "#fff",
      }}
    >
      <header
        style={{
          width: "100%",
          maxWidth: 1400,
          margin: "0 auto",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "0px 28px",
          height: "80px",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
          <button
            style={{
              background: "none",
              border: "none",
              padding: 0,
              margin: 0,
              cursor: "pointer",
              outline: "none",
            }}
            onClick={() => navigate("/")}
            aria-label="Ir a la página principal"
          >
            <span
              style={{
                fontWeight: 900,
                fontSize: "2.5rem",
                color: "#222",
                letterSpacing: "2px",
              }}
            >
              F
            </span>
          </button>
          {userData && (
            <span
              style={{
                fontSize: "1.1rem",
                fontWeight: 600,
                color: "#007bff",
              }}
            >
              {userData.nombre} {userData.apellido}
            </span>
          )}
        </div>
        <nav style={{ display: "flex", alignItems: "center", gap: 28 }}>
          <button
            style={{
              background: "none",
              border: "none",
              color: "#222",
              fontSize: 16,
              fontWeight: 500,
              cursor: "pointer",
            }}
            onClick={() => navigate("/service/trainers")}
          >
            Entrenadores
          </button>
          <button
            style={{
              background: "none",
              border: "none",
              color: "#222",
              fontSize: 16,
              fontWeight: 500,
              cursor: "pointer",
            }}
            onClick={() => navigate("/sobre-nosotros")}
          >
            Sobre Nosotros
          </button>
          <button
            style={{
              background: "none",
              border: "none",
              color: "#222",
              fontSize: 16,
              fontWeight: 500,
              cursor: "pointer",
            }}
            onClick={() => navigate("/mi-espacio")}
          >
            Mi Espacio
          </button>
          <button
            onClick={handleLogout}
            style={{
              background: "#f7f7f7",
              color: "#222",
              fontWeight: 600,
              border: "1.5px solid #ddd",
              borderRadius: 6,
              padding: "8px 18px",
              fontSize: 15,
              cursor: "pointer",
              transition: "all .15s",
            }}
          >
            Cerrar sesión
          </button>
        </nav>
      </header>
      <div style={{ flex: 1 }}>{children}</div>
      <footer
        style={{
          borderTop: "1px solid #f2f2f2",
          padding: "18px 0 16px",
          width: "100%",
          maxWidth: 1100,
          margin: "0 auto",
          display: "flex",
          alignItems: "center",
          gap: 8,
        }}
      >
        <div style={{ display: "flex", alignItems: "center" }}>
          <span
            style={{
              fontWeight: 900,
              fontSize: "2.5rem",
              color: "#222",
              letterSpacing: "2px",
              marginLeft: 7,
            }}
          >
            F
          </span>
        </div>
        <span
          style={{
            color: "#888",
            fontSize: 14,
          }}
        >
          © FitConnect {new Date().getFullYear()}
        </span>
      </footer>
    </div>
  )
}

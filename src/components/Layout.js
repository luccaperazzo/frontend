import React, { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";

const Header = () => {
  const navigate = useNavigate();
  const location = useLocation();

  // Estado local para token y rol
  const [token, setToken] = useState(localStorage.getItem("token"));
  const [role, setRole] = useState(localStorage.getItem("role"));

  // Efecto para actualizar el estado cuando cambia la sesión
  useEffect(() => {
    const syncAuth = () => {
      setToken(localStorage.getItem("token"));
      setRole(localStorage.getItem("role"));
    };
    window.addEventListener("storage", syncAuth);
    syncAuth();
    return () => window.removeEventListener("storage", syncAuth);
  }, [location]);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("role");
    setToken(null);
    setRole(null);
    navigate("/login");
  };

  return (
    <header style={{
      width: "100%",
      maxWidth: 1400,
      margin: "0 auto",
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
      padding: "0px 28px 0 28px"
    }}>
      <div style={{ display: "flex", alignItems: "center" }}>
        <button
          style={{
            background: "none",
            border: "none",
            padding: 0,
            margin: 0,
            cursor: "pointer",
            outline: "none"
          }}
          onClick={() => navigate('/')}
          aria-label="Ir a la página principal"
        >
          <span style={{
            fontWeight: 900,
            fontSize: "2.5rem",
            color: "#222",
            letterSpacing: "2px",
            marginRight: 28
          }}>
            F
          </span>
        </button>
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
            textDecoration: "none"
          }}
          onClick={() => navigate('/service/trainers')}
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
            textDecoration: "none"
          }}
          onClick={() => navigate('/sobre-nosotros')}
        >
          Sobre Nosotros
        </button>

        {/* 👇 Solo si NO está logueado 👇 */}
        {!token && (
          <>
            <button
              onClick={() => navigate('/login')}
              style={{
                background: "#fff",
                color: "#111",
                fontWeight: 600,
                border: "1px solid #ddd",
                borderRadius: 6,
                padding: "8px 18px",
                fontSize: 15,
                marginLeft: 18,
                cursor: "pointer",
                marginRight: 2,
                transition: "all .15s"
              }}>
              Log In
            </button>
            <button
              onClick={() => navigate('/register')}
              style={{
                background: "#222",
                color: "#fff",
                fontWeight: 600,
                border: "none",
                borderRadius: 6,
                padding: "8px 18px",
                fontSize: 15,
                cursor: "pointer",
                transition: "all .15s"
              }}>
              Registrarse
            </button>
          </>
        )}

        {/* 👇 Si está logueado, mostrar logout 👇 */}
        {token && (
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
              transition: "all .15s"
            }}>
            Cerrar sesión
          </button>
        )}
      </nav>
    </header>
  );
};

const Footer = () => (
  <footer style={{
    borderTop: "1px solid #f2f2f2",
    padding: "18px 0 16px 0",
    width: "100%",
    maxWidth: 1100,
    margin: "0 auto",
    display: "flex",
    alignItems: "center",
    gap: 8
  }}>
    <div style={{ display: "flex", alignItems: "center" }}>
      <span style={{
        fontWeight: 900,
        fontSize: "2.5rem",
        color: "#222",
        letterSpacing: "2px",
        marginLeft: 7
      }}>F</span>
    </div>
    <span style={{
      color: "#888",
      fontSize: 14
    }}>© FitConnect {new Date().getFullYear()}</span>
  </footer>
);

const Layout = ({ children }) => (
  <div style={{
    minHeight: "100vh",
    display: "flex",
    flexDirection: "column",
    background: "#fff"
  }}>
    <Header />
    <div style={{ flex: 1 }}>
      {children}
    </div>
    <Footer />
  </div>
);

export default Layout;

import React, { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";

const Header = () => {
  const navigate = useNavigate();
  const location = useLocation();

  // Estado local para token y rol
  const [token, setToken] = useState(localStorage.getItem("token"));
  const [role, setRole] = useState(localStorage.getItem("role"));
  // Nuevo: Estado para nombre y apellido
  const [userName, setUserName] = useState("");
  const [userRole, setUserRole] = useState("");

  // Efecto para actualizar el estado cuando cambia la sesión
  useEffect(() => {
    const syncAuth = () => {
      setToken(localStorage.getItem("token"));
      setRole(localStorage.getItem("role"));
      // Leer nombre y apellido del usuario desde localStorage
      const userStr = localStorage.getItem("user");
      if (userStr) {
        try {
          const user = JSON.parse(userStr);
          setUserName(`${user.nombre || ""} ${user.apellido || ""}`.trim());
          setUserRole(user.role === "entrenador" ? "Entrenador" : user.role === "cliente" ? "Cliente" : "");
        } catch {
          setUserName("");
          setUserRole("");
        }
      } else {
        setUserName("");
        setUserRole("");
      }
    };
    window.addEventListener("storage", syncAuth);
    syncAuth();
    return () => window.removeEventListener("storage", syncAuth);
  }, [location]);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("role");
    localStorage.removeItem("user");
    localStorage.removeItem("userId");
    setToken(null);
    setRole(null);
    setUserName("");
    setUserRole("");
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
      padding: "0px 28px"
    }}>
      <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
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
        {/* Mostrar nombre y rol si está logueado */}
        {token && userName && (
          <span style={{
            fontSize: "1.13rem",
            fontWeight: 600,
            color: "#222",
            marginLeft: 8,
            fontFamily: "'Segoe UI', 'Roboto', 'Arial', sans-serif",
            display: "flex",
            alignItems: "center"
          }}>
            <span style={{
              color: "#888",
              fontWeight: 500,
              marginRight: 8,
              fontSize: "1rem"
            }}>
              Logueado como:
            </span>
            <span style={{
              color: "#007bff",
              fontWeight: 700,
              letterSpacing: "0.2px"
            }}>
              {userName}
            </span>
            <span style={{
              display: "inline-block",
              width: 6,
              height: 6,
              borderRadius: "50%",
              background: "#e0e0e0",
              margin: "0 10px"
            }} />
            <span style={{
              fontSize: "1rem",
              fontWeight: 500,
              color: "#666",
              background: "#f2f6fa",
              borderRadius: 5,
              padding: "2px 10px"
            }}>
              {userRole}
            </span>
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
            cursor: "pointer"
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
            cursor: "pointer"
          }}
          onClick={() => navigate('/sobre-nosotros')}
        >
          Sobre Nosotros
        </button>

        {/* 👇 Solo si está logueado como cliente 👇 */}
        {token && role === "cliente" && (
          <button
            style={{
              background: "none",
              border: "none",
              color: "#222",
              fontSize: 16,
              fontWeight: 500,
              cursor: "pointer"
            }}
            onClick={() => navigate('/mi-espacio')}
          >
            Mi Espacio
          </button>
        )}

        {/* 👇 Solo si está logueado como entrenador 👇 */}
        {token && role === "entrenador" && (
          <button
            style={{
              background: "none",
              border: "none",
              color: "#222",
              fontSize: 16,
              fontWeight: 500,
              cursor: "pointer"
            }}
            onClick={() => navigate('/entrenador/mi-espacio')}
          >
            Mi Espacio
          </button>
        )}

        {/* 👇 Si NO está logueado 👇 */}
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
                cursor: "pointer",
                transition: "all .15s"
              }}
            >
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
              }}
            >
              Registrarse
            </button>
          </>
        )}

        {/* 👇 Si está logueado 👇 */}
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
            }}
          >
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
    padding: "18px 0 16px",
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
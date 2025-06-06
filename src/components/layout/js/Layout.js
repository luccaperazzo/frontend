import React, { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import "../css/Layout.css"; // Asegúrate de importar el CSS

// --- Añadir función para decodificar el JWT y chequear expiración ---
function isTokenExpired(token) {
  if (!token) return true;
  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    if (!payload.exp) return false;
    // exp está en segundos desde epoch
    return Date.now() >= payload.exp * 1000;
  } catch {
    return true;
  }
}

/**
 * Componente Header
 * Muestra la cabecera de la aplicación, incluyendo:
 * - Logo y navegación principal.
 * - Información del usuario logueado (nombre, apellido y rol).
 * - Botones de navegación condicionales según el estado de autenticación y rol.
 * - Botón para cerrar sesión.
 */
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
    /**
     * Sincroniza el estado de autenticación y usuario con localStorage.
     * Se ejecuta al montar el componente y cuando cambia la ubicación (ruta).
     * También escucha cambios en el almacenamiento local (por ejemplo, logout en otra pestaña).
     */
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

  // --- Chequear expiración del token y forzar logout si está vencido ---
  useEffect(() => {
    if (token && isTokenExpired(token)) {
      // Limpiar localStorage y forzar logout
      localStorage.removeItem("token");
      localStorage.removeItem("role");
      localStorage.removeItem("user");
      localStorage.removeItem("userId");
      setToken(null);
      setRole(null);
      setUserName("");
      setUserRole("");
      navigate("/login");
    }
  }, [token, navigate, location]);

  /**
   * Cierra la sesión del usuario.
   * Elimina los datos de autenticación del localStorage y redirige al login.
   */
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
    <header className="main-header">
      <div className="main-header-left" style={{ display: "flex", alignItems: "center", gap: 20 }}>
        <button
          className="main-logo-btn"
          onClick={() => navigate('/')}
          aria-label="Ir a la página principal"
        >
          <span className="main-logo-text">F</span>
        </button>
        {/* Mostrar nombre y rol si está logueado */}
        {token && userName && (
          <span className="main-user-info">
            <span className="main-user-label">Logueado como:</span>
            <span className="main-user-name">{userName}</span>
            <span className="main-user-dot" />
            <span className="main-user-role">{userRole}</span>
          </span>
        )}
      </div>
      <nav className="main-nav">
        <button className="main-nav-btn" onClick={() => navigate('/sobre-nosotros')}>Sobre Nosotros</button>
        <button className="main-nav-btn" onClick={() => navigate('/service/trainers')}>Entrenadores</button>
        {/* 👇 Solo si está logueado como cliente 👇 */}
        {token && role === "cliente" && (
          <button className="main-nav-btn" onClick={() => navigate('/mi-espacio')}>Mi Espacio</button>
        )}
        {/* 👇 Solo si está logueado como entrenador 👇 */}
        {token && role === "entrenador" && (
          <button className="main-nav-btn" onClick={() => navigate('/entrenador/mi-espacio')}>Mi Espacio</button>
        )}
        {/* 👇 Si NO está logueado 👇 */}
        {!token && (
          <>
            <button className="main-login-btn" onClick={() => navigate('/login')}>Log In</button>
            <button className="main-register-btn" onClick={() => navigate('/register')}>Registrarse</button>
          </>
        )}
        {/* 👇 Si está logueado 👇 */}
        {token && (
          <button className="main-logout-btn" onClick={handleLogout}>Cerrar sesión</button>
        )}
      </nav>
    </header>
  );
};

/**
 * Componente Footer
 * Muestra el pie de página de la aplicación con el logo y el copyright.
 */
const Footer = () => (
  <footer className="main-footer">
    <div style={{ display: "flex", alignItems: "center" }}>
      <span className="main-logo-text" style={{ marginLeft: 7 }}>F</span>
    </div>
    <span style={{ color: "#888", fontSize: 14 }}>
      © FitConnect {new Date().getFullYear()}
    </span>
  </footer>
);

/**
 * Componente Layout
 * Estructura principal de la aplicación.
 * Incluye Header, el contenido principal (children) y Footer.
 */
const Layout = ({ children }) => (
  <div style={{
    minHeight: "100vh",
    display: "flex",
    flexDirection: "column",
    background: "#fff"
  }}>
    <Header />
    <div style={{ flex: 1, width: "100%", boxSizing: "border-box", padding: "0 4px" }}>
      {children}
    </div>
    <Footer />
  </div>
);

export default Layout;
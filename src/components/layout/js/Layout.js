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
  // Nuevo: Estado para nombre, rol y avatar
  const [userName, setUserName] = useState("");
  const [userRole, setUserRole] = useState("");
  const [avatarUrl, setAvatarUrl] = useState(null);

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
      // Leer nombre, apellido y avatarUrl del usuario desde localStorage
      const userStr = localStorage.getItem("user");
      if (userStr) {
        try {
          const user = JSON.parse(userStr);
          setUserName(`${user.nombre || ""} ${user.apellido || ""}`.trim());
          setUserRole(user.role === "entrenador" ? "Entrenador" : user.role === "cliente" ? "Cliente" : "");
          setAvatarUrl(user.avatarUrl || null);
        } catch {
          setUserName("");
          setUserRole("");
          setAvatarUrl(null);
        }
      } else {
        setUserName("");
        setUserRole("");
        setAvatarUrl(null);
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
      setAvatarUrl(null);
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
    setAvatarUrl(null);
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
        {/* Mostrar nombre, avatar y rol si está logueado */}
        {token && userName && (
          <span
            className="main-user-info"
            style={{
              display: "flex",
              alignItems: "center",
              gap: 4,
              fontSize: 13,
              minHeight: 32,
              padding: "2px 0"
            }}
          >
            {/* Mini avatar solo si es entrenador y tiene avatarUrl */}
            {role === "entrenador" && (
              console.log("Avatar URL:", avatarUrl),
              avatarUrl ? (
                <img
                  src={avatarUrl.startsWith("/uploads") ? `http://localhost:3001${avatarUrl}` : avatarUrl}
                  alt="Avatar"
                  style={{
                    width: 28,
                    height: 28,
                    borderRadius: "50%",
                    objectFit: "cover",
                    border: "1.5px solid #f6c948",
                    marginRight: 4
                  }}
                />
              ) : (
                // Mostrar iniciales si no hay avatar
                <span
                  style={{
                    width: 28,
                    height: 28,
                    borderRadius: "50%",
                    background: "#f6c948",
                    color: "#fff",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontWeight: 700,
                    fontSize: 13,
                    marginRight: 4,
                    border: "1.5px solid #f6c948"
                  }}
                >
                  {userName
                    .split(" ")
                    .map(n => n[0])
                    .join("")
                    .toUpperCase()
                    .slice(0, 2)}
                </span>
              )
            )}
            <span className="main-user-label" style={{ fontSize: 12 }}>Logueado como:</span>
            <span className="main-user-name" style={{ fontWeight: 600, fontSize: 14 }}>{userName}</span>
            <span className="main-user-dot" style={{ width: 7, height: 7, margin: "0 3px" }} />
            <span className="main-user-role" style={{ fontSize: 12 }}>{userRole}</span>
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
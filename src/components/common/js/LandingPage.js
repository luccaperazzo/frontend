import React, { useEffect, useState } from "react";
import Layout from "../../layout/js/Layout";
import "../css/LandingPage.css"; // Asegúrate de tener este CSS para estilos
import { useNavigate } from "react-router-dom";

/**
 * Página principal (LandingPage)
 * 
 * Muestra:
 * - Título y subtítulo de la plataforma.
 * - Botones principales para buscar entrenadores o registrarse como entrenador.
 * - Imagen ilustrativa.
 * - Sección de entrenadores destacados (top trainers).
 */
const LandingPage = () => {
  const navigate = useNavigate();
  const [trainers, setTrainers] = useState([]);
  const user = JSON.parse(localStorage.getItem("user")); // O usa tu contexto de auth

  /**
   * Efecto para cargar los entrenadores destacados al montar el componente.
   * Llama a la API /api/trainers/top-trainers.
   */
  useEffect(() => {
    fetch("http://localhost:3001/api/trainers/top-trainers")
      .then(res => res.json())
      .then(setTrainers)
      .catch(() => setTrainers([]));
  }, []);

  return (
    <Layout>
      {/* Sección principal: título, subtítulo, botones y foto */}
      <main className="landing-main">
        <h1 className="landing-title">
          FITCONNECT
        </h1>
        <p className="landing-subtitle">
          Encuentra Tu Entrenador Perfecto
        </p>
        {/* Botones principales de acción */}
        <div className="landing-buttons">
          <button
            style={{
              background: "#FF6B00",
              border: "none",
              padding: "10px 20px",
              color: "white",
              fontSize: 16,
              fontWeight: "bold",
              cursor: "pointer",
              borderRadius: "5px",
            }}
            onClick={() => navigate('/service/trainers')}
          >
            Ver Entrenadores
          </button>
        {(!user || user.role !== "entrenador") && (
          <button
            style={{
              background: "#FF6B00",
              border: "none",
              padding: "10px 20px",
              color: "white",
              fontSize: 16,
              fontWeight: "bold",
              cursor: "pointer",
              borderRadius: "5px",
            }}
            onClick={() => navigate('/register')}
          >
            Conviérte en Entrenador
          </button>
        )}
        </div>
        {/* Imagen ilustrativa */}
        <div className="landing-image-container">
          <img
            src="https://www.sportforster.de/out/ecsresponsive/img/laufschuh-ratgeber-neu-5.jpg"
            alt="Entrenamiento"
            className="landing-image"
          />
        </div>
      </main>

      {/* Sección de entrenadores destacados */}
      <section className="landing-trainers">
        <h3 className="landing-trainers-title">Entrenadores Destacados</h3>
        <div className="landing-trainers-cards">
          {/* Si no hay entrenadores destacados */}
          {trainers.length === 0 && (
            <div className="no-trainers">No hay entrenadores destacados aún.</div>
          )}
          {/* Renderiza cada entrenador destacado */}
          {trainers.map((t, i) => (
            <div className="trainer-card" key={i}>
              {/* Avatar circular (foto o iniciales) */}
              {t.avatarUrl ? (
                <img
                  src={
                    t.avatarUrl.startsWith('http')
                      ? t.avatarUrl
                      : `http://localhost:3001${t.avatarUrl}`
                  }
                  alt={t.nombre}
                  className="trainer-avatar-landing"
                />
              ) : (
                <div
                  className="trainer-avatar-landing"
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    background: "#f6c94822",
                    color: "#222",
                    fontWeight: 700,
                    fontSize: 28,
                    letterSpacing: 1,
                  }}
                > {/* si no existe el nombre o apellido, se usan las iniciales */}
                  {(t.nombre?.charAt(0) || "") + (t.apellido?.charAt(0) || "")}
                </div>
              )}
              {/* Rating promedio en estrellas */}
              <div className="trainer-rating">
                {Array.from({ length: 5 }).map((_, j) => (
                  <span key={j}>
                    {(t.avgRating ?? 0) >= j + 1 ? "★" : "☆"}
                  </span>
                ))}
                <span style={{ fontSize: 15, color: "#555", marginLeft: 6 }}>
                  {typeof t.avgRating === "number" ? t.avgRating.toFixed(1) : ""}
                </span>
              </div>
              {/* Nombre y apellido */}
              <div className="trainer-name">
                {t.nombre} {t.apellido}
              </div>
              {/* Presentación breve */}
              <div className="trainer-presentacion">
                {t.presentacion}
              </div>
              {/* Zona de trabajo */}
              <div className="trainer-zona">
                {t.zona}
              </div>
              {/* Idiomas */}
              <div className="trainer-idiomas">
                {Array.isArray(t.idiomas) ? t.idiomas.join(" / ") : t.idiomas}
              </div>
            </div>          ))}
        </div>
      </section>      {/* Easter Eggs: Botones discretos de desarrollo */}
      {/* Botón de Poblar Datos */}
      <div
        style={{
          position: 'fixed',
          bottom: '20px',
          right: '60px',
          width: '24px',
          height: '24px',
          cursor: 'pointer',
          opacity: 0.4,
          transition: 'all 0.4s ease',
          zIndex: 1000,
          fontSize: '20px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          userSelect: 'none'
        }}
        onMouseEnter={(e) => {
          e.target.style.opacity = '1';
          e.target.style.transform = 'scale(1.3)';
          e.target.innerHTML = '🌿';
          e.target.title = '🌱 Dev Garden - Click to seed database';
        }}
        onMouseLeave={(e) => {
          e.target.style.opacity = '0.4';
          e.target.style.transform = 'scale(1)';
          e.target.innerHTML = '🌱';
        }}
        onClick={async () => {
          if (window.confirm('🌱 ¿Plantar datos de prueba en la base de datos?')) {
            try {
              const res = await fetch('http://localhost:3001/api/dev/seed', { method: 'POST' });
              const data = await res.json();
              alert('🌿 ' + (data.message || 'Jardín plantado exitosamente'));
              window.location.reload();
            } catch (err) {
              alert('🥀 Error al plantar: ' + err.message);
            }
          }
        }}
      >
        🌱
      </div>

      {/* Botón de Limpiar Base de Datos */}
      <div
        style={{
          position: 'fixed',
          bottom: '20px',
          right: '20px',
          width: '24px',
          height: '24px',
          cursor: 'pointer',
          opacity: 0.4,
          transition: 'all 0.4s ease',
          zIndex: 1000,
          fontSize: '20px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          userSelect: 'none'
        }}
        onMouseEnter={(e) => {
          e.target.style.opacity = '1';
          e.target.style.transform = 'scale(1.3)';
          e.target.innerHTML = '🔥';
          e.target.title = '🗑️ Dev Cleaner - Click to clear database';
        }}
        onMouseLeave={(e) => {
          e.target.style.opacity = '0.4';
          e.target.style.transform = 'scale(1)';
          e.target.innerHTML = '🗑️';
        }}
        onClick={async () => {
          if (window.confirm('🗑️ ¿ELIMINAR TODOS LOS DATOS de la base de datos?\n\n⚠️ Esta acción NO se puede deshacer')) {
            if (window.confirm('🚨 ¿Estás COMPLETAMENTE SEGURO?\n\nEsto borrará:\n- Todos los usuarios\n- Todos los entrenadores\n- Todos los servicios\n- Todas las reservas\n- Todos los ratings')) {
              try {
                const res = await fetch('http://localhost:3001/api/dev/clear', { method: 'DELETE' });
                const data = await res.json();
                alert('🧹 ' + (data.message || 'Base de datos limpiada exitosamente'));
                window.location.reload();
              } catch (err) {
                alert('💥 Error al limpiar: ' + err.message);
              }
            }
          }
        }}
      >
        🗑️
      </div>
    </Layout>
  );
};

export default LandingPage;

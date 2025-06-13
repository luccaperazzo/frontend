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
                >
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
            </div>
          ))}
        </div>
      </section>
    </Layout>
  );
};

export default LandingPage;

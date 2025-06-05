import React, { useEffect, useState } from "react";
import Layout from "../../layout/js/Layout";
import "../css/LandingPage.css"; // Asegúrate de tener este CSS para estilos
import { useNavigate } from "react-router-dom";

const LandingPage = () => {
  const navigate = useNavigate();
  const [trainers, setTrainers] = useState([]);

  useEffect(() => {
    fetch("http://localhost:3001/api/trainers/top-trainers")
      .then(res => res.json())
      .then(setTrainers)
      .catch(() => setTrainers([]));
  }, []);

  return (
    <Layout>
      <main className="landing-main">
        <h1 className="landing-title">
          FITCONNECT
        </h1>
        <p className="landing-subtitle">
          Encuentra Tu Entrenador Perfecto
        </p>
        <div className="landing-buttons">
              <button
                style={{
                background: "#FF6B00", // o el color exacto del botón derecho
                border: "none",
                padding: "10px 20px",
                color: "white",
                fontSize: 16,
                fontWeight: "bold", // más grueso que el 500 actual
                cursor: "pointer",
                borderRadius: "5px", // agregar bordes redondeados
                }}
                onClick={() => navigate('/service/trainers')}
              >
                Ver Entrenadores
              </button>  
              <button
                style={{
                background: "#FF6B00", // o el color exacto del botón derecho
                border: "none",
                padding: "10px 20px",
                color: "white",
                fontSize: 16,
                fontWeight: "bold", // más grueso que el 500 actual
                cursor: "pointer",
                borderRadius: "5px", // agregar bordes redondeados
                }}
                  onClick={() => navigate('/register')}
              >
                Conviérte en Entrenador
              </button>  
              
        </div>
        <div className="landing-image-container">
          <img
            src="https://www.sportforster.de/out/ecsresponsive/img/laufschuh-ratgeber-neu-5.jpg"
            alt="Entrenamiento"
            className="landing-image"
          />
        </div>
      </main>

      {/* Entrenadores destacados */}
      <section className="landing-trainers">
        <h3 className="landing-trainers-title">Entrenadores Destacados</h3>
        <div className="landing-trainers-cards">
          {trainers.length === 0 && (
            <div className="no-trainers">No hay entrenadores destacados aún.</div>
          )}
          {trainers.map((t, i) => (
            <div className="trainer-card" key={i}>
              {/* Avatar circular */}
              {t.foto ? (
                <img
                  src={t.foto}
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
              <div className="trainer-name">
                {t.nombre} {t.apellido}
              </div>
              <div className="trainer-presentacion">
                {t.presentacion}
              </div>
              <div className="trainer-zona">
                {t.zona}
              </div>
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

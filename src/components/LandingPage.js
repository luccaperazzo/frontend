import React, { useEffect, useState } from "react";
import Layout from "./Layout";
import "./LandingPage.css";
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
          <button className="landing-btn">Encuentra tu entrenador</button>
          <button className="landing-btn secondary">Conviértete en entrenador</button>
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
              <div className="trainer-rating">
                {Array.from({ length: 5 }).map((_, j) => (
                  <span key={j}>
                    {(t.avgRating ?? 0) >= j + 1 ? "★" : "☆"}
                  </span>
                ))}
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

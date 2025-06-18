import React, { useEffect, useState } from "react";
import axios from "axios";
import Layout from "../../../layout/js/Layout";
import "../css/MiEspacioEntrenadorMetrics.css";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import "dayjs/locale/es";
dayjs.extend(relativeTime);
dayjs.locale("es");

export default function MiEspacioMetrics() {
  const [metrics, setMetrics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [activeTab, setActiveTab] = useState("reseñas");
  const [serviceMetrics, setServiceMetrics] = useState([]);
  const [loadingServices, setLoadingServices] = useState(false);
  const [errorServices, setErrorServices] = useState("");
  const [reviews, setReviews] = useState([]);
  const [loadingReviews, setLoadingReviews] = useState(false);
  const [errorReviews, setErrorReviews] = useState("");
  const [replyingReview, setReplyingReview] = useState(null);
  const [replyText, setReplyText] = useState("");
  const [replyLoading, setReplyLoading] = useState(false);  const [replyError, setReplyError] = useState("");
  const [trainerData, setTrainerData] = useState(null);
  let trainerId = localStorage.getItem("userId");
    if (!trainerId) {
  const user = JSON.parse(localStorage.getItem("user") || "{}");
  trainerId = user._id;
}

useEffect(() => {
    if (!trainerId) {
      setError("No se encontró el ID del entrenador. Por favor, inicia sesión nuevamente.");
      setLoading(false);
      return;
    }
    setLoading(true);
    setError("");
    
    // Fetch trainer data and metrics in parallel
    Promise.all([
      axios.get(`http://localhost:3001/api/trainers/${trainerId}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` }
      }),
      axios.get(`http://localhost:3001/api/trainers/${trainerId}/stats`, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` }
      })
    ])
      .then(([trainerRes, statsRes]) => {
        setTrainerData(trainerRes.data);
        setMetrics({
          promedio: statsRes.data.avgRating,
          total: statsRes.data.totalRatings,
          distribucion: statsRes.data.ratingCounts
        });
      })
      .catch(() => setError("No se pudieron cargar las métricas."))
      .finally(() => setLoading(false));
  }, [trainerId]);

useEffect(() => {
  if (activeTab !== "servicios") return;
  if (!trainerId) return;

  setLoadingServices(true);
  setErrorServices("");
  axios
    .get(`http://localhost:3001/api/trainers/${trainerId}/service-metrics`, {
      headers: { Authorization: `Bearer ${localStorage.getItem("token")}` }
    })
    .then(res => setServiceMetrics(res.data))
    .catch(() => setErrorServices("No se pudieron cargar las métricas de servicios."))
    .finally(() => setLoadingServices(false));
}, [activeTab, trainerId]);

useEffect(() => {
  if (activeTab !== "comentarios") return;
  if (!trainerId) return;
  setLoadingReviews(true);
  setErrorReviews("");
  axios
    .get(`http://localhost:3001/api/trainers/${trainerId}/reviews`, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` }
    })
    .then(res => setReviews(res.data))
    .catch(() => setErrorReviews("No se pudieron cargar los comentarios."))
    .finally(() => setLoadingReviews(false));
}, [activeTab, trainerId]);
  
  // Utilidad para mostrar el nombre del cliente
  const getUserName = (persona) => {
    if (!persona) return "Cliente";
    const nombre = persona.nombre || "";
    const apellido = persona.apellido || "";
    const full = `${nombre} ${apellido}`.trim();
    return full.length > 0 ? full : "Cliente";
  };

  return (
    <Layout>
      <div className="metrics-container">
        <h2 className="metrics-title">Análisis de rendimiento</h2>
        <div className="metrics-subtitle">
          Realice un seguimiento del crecimiento de su negocio y la interacción con sus clientes
        </div>

        {/* Tab bar */}
        <div className="metrics-tabs">
          <button
            className={`metrics-tab${activeTab === "reseñas" ? " active" : ""}`}
            onClick={() => setActiveTab("reseñas")}
          >
            Métricas de reseñas
          </button>
          <button
            className={`metrics-tab${activeTab === "servicios" ? " active" : ""}`}
            onClick={() => setActiveTab("servicios")}
          >
            Métricas de servicios
          </button>
          <button
            className={`metrics-tab${activeTab === "comentarios" ? " active" : ""}`}
            onClick={() => setActiveTab("comentarios")}
          >
            Comentarios de usuarios
          </button>
        </div>

        {/* Loading/Error */}
        {loading && <p className="metrics-loading">Cargando métricas...</p>}
        {error && <p className="metrics-error">{error}</p>}

        {/* Métricas */}
        {activeTab === "reseñas" && (
            <div className="metrics-content">
                {loading ? (
                <p className="metrics-loading">Cargando métricas...</p>
                ) : error ? (
                <p className="metrics-error">{error}</p>
                ) : metrics && metrics.distribucion ? (
                <>
                    {/* Tabla de distribución de estrellas */}
                    <div className="metrics-table-card">
                    <div className="metrics-table-title">Distribución de la cantidad de estrellas obtenidas</div>
                    <table className="metrics-table">
                        <thead>
                        <tr>
                            <th>Estrellas</th>
                            <th>Cantidad obtenidas</th>
                        </tr>
                        </thead>
                        <tbody>
                        {[5, 4, 3, 2, 1].map(star => (
                            <tr key={star}>
                            <td>
                                <span className="metrics-stars">
                                {Array(star).fill("⭐").join("")}
                                </span>
                            </td>
                            <td>{metrics.distribucion[star] || 0}</td>
                            </tr>
                        ))}
                        </tbody>
                    </table>
                    </div>
                    {/* Card lateral con promedio */}
                    <div className="metrics-side-card">
                    <div className="metrics-side-title">Puntaje Promedio</div>
                    <div className="metrics-side-score">
                        {metrics.promedio?.toFixed(2) || "-"}
                        <span className="metrics-side-star">★</span>
                    </div>
                    <div className="metrics-side-reviews">
                        <span>de {metrics.total} reviews</span>
                    </div>
                    </div>
                </>
                ) : null}
            </div>
            )}

        {activeTab === "servicios" && (
          <div className="metrics-content">
            <div className="metrics-table-card">
              <div className="metrics-table-title">Métricas de conversión detalladas</div>
              {loadingServices ? (
                <p className="metrics-loading">Cargando métricas de servicios...</p>
              ) : errorServices ? (
                <p className="metrics-error">{errorServices}</p>
              ) : (
                <table className="metrics-table">
                  <thead>
                    <tr>
                      <th>Servicio</th>
                      <th>Vistas</th>
                      <th>Reservas</th>
                      <th>Tasas de conversión</th>
                    </tr>
                  </thead>
                  <tbody>
                    {serviceMetrics.map((s, i) => (
                        <tr key={s.servicio + i} style={s.servicio === "Total" ? { fontWeight: "bold" } : {}}>
                        <td>{s.servicio}</td>
                        <td>{s.vistas}</td>
                        <td>{s.reservas}</td>
                        <td>{s.tasaConversion}</td>
                        </tr>
                    ))}
                    </tbody>
                </table>
              )}
            </div>
          </div>
        )}

        {activeTab === "comentarios" && (
          <div className="metrics-comments-content">
            <h3 className="metrics-comments-title">Reseñas recientes y comentarios</h3>
            {loadingReviews ? (
              <p className="metrics-loading">Cargando comentarios...</p>
            ) : errorReviews ? (
              <p className="metrics-error">{errorReviews}</p>
            ) : (
              <>
                {reviews.length === 0 ? (
                  <p style={{ color: "#888", marginTop: 24 }}>No hay comentarios aún.</p>
                ) : (
                  <div className="metrics-comments-list">                    {reviews
                      .sort((a, b) => new Date(b.fecha || b.createdAt) - new Date(a.fecha || a.createdAt))
                      .map((r, i) => (
                        <div className="metrics-comment-card" key={i}>
                          <div className="metrics-comment-header">
                            <div className="metrics-comment-avatar">
                              {r.cliente?.nombre
                                ? r.cliente.nombre.charAt(0).toUpperCase()
                                : "U"}
                            </div>
                            <div>
                              <div className="metrics-comment-name">
                                {getUserName(r.cliente)}
                              </div>                              <div className="metrics-comment-date">
                                {r.fecha || r.createdAt
                                  ? dayjs(r.fecha || r.createdAt).utc().format('DD/MM/YYYY HH:mm')
                                  : ""}
                              </div>
                            </div>
                          </div>
                          <div className="metrics-comment-rating">
                            {Array(r.rating)
                              .fill("⭐")
                              .join("")}
                          </div>
                          <div className="metrics-comment-text">{r.texto}</div>
                          {r.reply && (
                            <div
                              className="metrics-reply-block"
                              style={{
                                background: "#f4f8ff",
                                borderLeft: "4px solid #1976d2",
                                borderRadius: 6,
                                marginTop: 14,
                                padding: "12px 16px",
                                display: "flex",
                                alignItems: "flex-start",
                                gap: 12
                              }}
                            >                              <div
                                style={{
                                  width: 36,
                                  height: 36,
                                  borderRadius: "50%",
                                  background: "#1976d2",
                                  color: "#fff",
                                  display: "flex",
                                  alignItems: "center",
                                  justifyContent: "center",
                                  fontWeight: 700,
                                  fontSize: 18,
                                  flexShrink: 0,
                                  overflow: "hidden"
                                }}
                                title="Entrenador"
                              >
                                {trainerData?.avatarUrl ? (
                                  <img
                                    src={
                                      trainerData.avatarUrl.startsWith('http')
                                        ? trainerData.avatarUrl
                                        : `http://localhost:3001${trainerData.avatarUrl}`
                                    }
                                    alt="Entrenador"
                                    style={{
                                      width: "100%",
                                      height: "100%",
                                      objectFit: "cover",
                                      borderRadius: "50%"
                                    }}
                                  />
                                ) : (
                                  <>🏋️</>
                                )}
                              </div><div>
                                <div style={{ fontWeight: 600, color: "#1976d2", marginBottom: 2 }}>
                                  Tu respuesta
                                </div>
                                <div style={{ color: "#222", fontSize: 15, whiteSpace: "pre-line", marginBottom: 8 }}>
                                  {r.reply.texto}
                                </div>                                {r.reply.fecha || r.reply.createdAt ? (
                                  <div style={{ fontSize: 11, color: "#666", marginTop: 4 }}>
                                    Respondido el {dayjs(r.reply.fecha || r.reply.createdAt).utc().format('DD/MM/YYYY HH:mm')}
                                  </div>
                                ) : null}
                              </div>
                            </div>
                          )}
                          {!r.reply && (
                            <button
                              className="metrics-comment-reply-btn"
                              onClick={() => setReplyingReview(r)}
                            >
                              Responder
                            </button>
                          )}
                        </div>
                      ))}
                  </div>
                )}
              </>
            )}
          </div>
        )}
      </div>

      {replyingReview && (
        <div className="reply-modal-overlay">
          <div className="reply-modal">
          <h2 className="reply-modal-title">
            Responda el comentario de ‘{getUserName(replyingReview.cliente)}’
          </h2>
            <div className="reply-modal-user">
              <span className="reply-modal-avatar">👤</span>
              <span>
              {getUserName(replyingReview.cliente)}
              </span>
            </div>
            {replyingReview.reply ? (
              <div className="reply-modal-answer">
                <div className="reply-modal-answer-label">Respuesta del entrenador:</div>
                <div className="reply-modal-answer-text">{replyingReview.reply.texto}</div>
                <div className="reply-modal-actions">
                  <button
                    className="reply-modal-cancel"
                    onClick={() => {
                      setReplyingReview(null);
                      setReplyText("");
                      setReplyError("");
                    }}
                  >
                    Cerrar
                  </button>
                </div>
              </div>
            ) : (
              <>
                <textarea
                  className="reply-modal-textarea"
                  placeholder="Responda a su cliente..."
                  value={replyText}
                  onChange={e => setReplyText(e.target.value)}
                  rows={4}
                  disabled={replyLoading}
                />
                {replyError && <div className="reply-modal-error">{replyError}</div>}
                <div className="reply-modal-actions">
                  <button
                    className="reply-modal-cancel"
                    onClick={() => {
                      setReplyingReview(null);
                      setReplyText("");
                      setReplyError("");
                    }}
                    disabled={replyLoading}
                  >
                    Cancelar
                  </button>
                  <button
                    className="reply-modal-send"
                    onClick={async () => {
                      setReplyLoading(true);
                      setReplyError("");
                      try {
                        await axios.post(
                          `http://localhost:3001/api/trainers/${trainerId}/reviews/${replyingReview._id}/reply`,
                          { texto: replyText },
                          { headers: { Authorization: `Bearer ${localStorage.getItem("token")}` } }
                        );
                        setReviews(reviews =>
                          reviews.map(r =>
                            r._id === replyingReview._id
                              ? { ...r, reply: { texto: replyText } }
                              : r
                          )
                        );
                        setReplyingReview(null);
                        setReplyText("");
                      } catch (err) {
                        setReplyError("No se pudo enviar la respuesta.");
                      }
                      setReplyLoading(false);
                    }}
                    disabled={replyLoading || !replyText.trim()}
                  >
                    Enviar
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </Layout>
  );
}
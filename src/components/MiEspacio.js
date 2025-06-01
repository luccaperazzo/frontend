// src/components/MiEspacio.js
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from './Layout';
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
dayjs.extend(utc);

export default function MiEspacio() {
  const navigate = useNavigate();

  // Pestaña activa
  const [activeTab, setActiveTab] = useState('sesiones');

  // —— Estado para sesiones ——
  const [reservas, setReservas] = useState([]);
  const [loadingReservas, setLoadingReservas] = useState(true);

  // —— Estado para “Mis Entrenadores” ——
  const [misEntrenadores, setMisEntrenadores] = useState([]);
  const [loadingEntrenadores, setLoadingEntrenadores] = useState(false);

  // —— Estado para review ——
  const [showReview, setShowReview] = useState(false);
  const [reviewTrainer, setReviewTrainer] = useState(null);

// —— Estado para confirmación de reseña ——
  // Esto es para mostrar un mensaje breve de éxito al enviar una reseña
  const [showReviewConfirm, setShowReviewConfirm] = useState(false);


  // — Cargar reservas al montar —
  useEffect(() => {
    const token = localStorage.getItem('token');
    fetch('http://localhost:3001/api/reserve', {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(res => res.json())
      .then(data => setReservas(data))
      .catch(console.error)
      .finally(() => setLoadingReservas(false));
  }, []);

  // — Cargar entrenadores cuando se activa esa pestaña —
  useEffect(() => {
    if (activeTab !== 'misEntrenadores') return;

    const token = localStorage.getItem('token');
    setLoadingEntrenadores(true);
    fetch('http://localhost:3001/api/trainers', {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(res => res.json())
      .then(data => setMisEntrenadores(data))
      .catch(console.error)
      .finally(() => setLoadingEntrenadores(false));
  }, [activeTab]);

  // — Función para cancelar reserva —
  const cancelar = async id => {
    const token = localStorage.getItem('token');
    await fetch(`http://localhost:3001/api/reserve/${id}/state`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify({ action: 'Cancelar' })
    });
    setReservas(r =>
      r.map(x => (x._id === id ? { ...x, estado: 'Cancelado' } : x))
    );
  };

  return (
    <Layout>
      <div style={{ maxWidth: 900, margin: '40px auto', position: 'relative' }}>
        <h2 style={{ fontSize: '1.8rem', marginBottom: 20 }}>Mi Espacio</h2>

        {/* ——— Pestañas ——— */}
        <div style={{ display: 'flex', gap: 16, marginBottom: 24 }}>
          {['sesiones', 'documentos', 'misEntrenadores'].map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              style={{
                padding: '8px 16px',
                background: 'none',
                border: 'none',
                borderBottom: activeTab === tab ? '3px solid #222' : '3px solid transparent',
                fontWeight: activeTab === tab ? 700 : 400,
                cursor: 'pointer'
              }}
            >
              {tab === 'sesiones' ? 'Sesiones'
                : tab === 'documentos' ? 'Documentos'
                : 'Mis Entrenadores'}
            </button>
          ))}
        </div>

        {/* ——— Contenido de la pestaña activa ——— */}
        {activeTab === 'sesiones' && (
          <>
            {loadingReservas ? (
              <p>Cargando reservas...</p>
            ) : reservas.length === 0 ? (
              <p>No tenés sesiones agendadas.</p>
            ) : (
              reservas.map(r => {
                const puedeCancelar = r.estado === 'Pendiente' || r.estado === 'Aceptado';
                const fecha = dayjs(r.fechaInicio).utc().format('DD/MM/YYYY');
                const hora = dayjs(r.fechaInicio).utc().format('HH:mm');
                return (
                  <div
                    key={r._id}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      border: '1px solid #eee',
                      borderRadius: 8,
                      padding: 16,
                      marginBottom: 12,
                      background: '#fff'
                    }}
                  >
                    {/* Avatar inicial */}
                    <div
                      style={{
                        width: 40,
                        height: 40,
                        borderRadius: '50%',
                        background: '#ddd',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        marginRight: 16,
                        fontSize: 18,
                        fontWeight: 600
                      }}
                    >
                      {r.servicio.titulo.charAt(0).toUpperCase()}
                    </div>

                    {/* Info */}
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: 16, fontWeight: 600 }}>
                        {r.servicio.titulo}
                      </div>
                      <div style={{ color: '#666', fontSize: 14, marginTop: 4 }}>
                        <span role="img" aria-label="calendario">📅</span> {fecha}
                        &nbsp;&nbsp;
                        <span role="img" aria-label="reloj">⏰</span> {hora}
                        &nbsp;&nbsp;
                        Estado:{' '}
                        <span style={{
                          fontWeight: 600,
                          color:
                            r.estado === 'Pendiente' ? '#d79a00'
                              : r.estado === 'Aceptado' ? '#1a9f06'
                              : '#d11a2a'
                        }}>
                          {r.estado}
                        </span>
                      </div>
                    </div>

                    {/* Botón Cancelar */}
                    <button
                      onClick={() => cancelar(r._id)}
                      disabled={!puedeCancelar}
                      style={{
                        padding: '6px 12px',
                        background: '#d11a2a',
                        color: '#fff',
                        border: 'none',
                        borderRadius: 4,
                        cursor: puedeCancelar ? 'pointer' : 'not-allowed'
                      }}
                    >
                      Cancelar
                    </button>
                  </div>
                );
              })
            )}
          </>
        )}

{activeTab === 'documentos' && (
  <div>
    <h3 style={{ margin: "12px 0 18px 0" }}>Documentos compartidos por tus entrenadores</h3>
    {loadingReservas ? (
      <p>Cargando documentos...</p>
    ) : (
      <>
        {(() => {
          // Agrupar documentos por entrenador
          const docsPorEntrenador = {};
          reservas.forEach(r => {
            const entrenador = r.servicio?.entrenador;
            if (!entrenador) return;
            const key = entrenador._id || entrenador; // Puede ser string o {_id,...}
            if (!docsPorEntrenador[key]) {
              docsPorEntrenador[key] = {
                entrenador,
                documentos: []
              };
            }
            (r.documentos || []).forEach(doc => {
              docsPorEntrenador[key].documentos.push({
                ...doc,
                reservaId: r._id,
                servicio: r.servicio
              });
            });
          });
          const grupos = Object.values(docsPorEntrenador);
          if (grupos.length === 0) {
            return <p>Aún no tenés documentos compartidos.</p>;
          }
          return grupos.map(grupo => (
            <div key={grupo.entrenador._id || grupo.entrenador} style={{ marginBottom: 28 }}>
              <div style={{ fontWeight: 700, fontSize: 17, marginBottom: 8 }}>
                {grupo.entrenador.nombre} {grupo.entrenador.apellido}
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                {grupo.documentos.map((doc, i) => (
                  <div key={doc.filename + i} style={{
                    background: "#fafafa",
                    border: "1px solid #eee",
                    borderRadius: 8,
                    padding: 14,
                    display: "flex",
                    alignItems: "center",
                    gap: 18
                  }}>
                    <span role="img" aria-label="archivo" style={{ fontSize: 24 }}>📄</span>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontWeight: 600, fontSize: 16 }}>
                        {doc.originalname}
                      </div>
                      <div style={{ color: "#666", fontSize: 14 }}>
                        {doc.descripcion}
                      </div>
                      <div style={{ color: "#aaa", fontSize: 13, marginTop: 2 }}>
                        {doc.fecha ? new Date(doc.fecha).toLocaleString() : ""}
                      </div>
                      <div style={{ color: "#888", fontSize: 13, marginTop: 2 }}>
                        Servicio: {doc.servicio?.titulo}
                      </div>
                    </div>
                    <a
                      href={`http://localhost:3001/uploads/documentos/${doc.filename}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{
                        background: "#222",
                        color: "#fff",
                        padding: "8px 16px",
                        borderRadius: 6,
                        textDecoration: "none",
                        fontWeight: 600,
                        fontSize: 15
                      }}
                    >
                      Descargar
                    </a>
                  </div>
                ))}
              </div>
            </div>
          ));
        })()}
      </>
    )}
  </div>
)}
        {activeTab === 'misEntrenadores' && (
          <>
            {loadingEntrenadores ? (
              <p>Cargando entrenadores…</p>
            ) : misEntrenadores.length === 0 ? (
              <p>No tenés entrenadores con sesiones aceptadas o finalizadas.</p>
            ) : (
              <div style={{
                display: 'flex',
                gap: 16,
                flexWrap: 'wrap'
              }}>
                {misEntrenadores.map(t => (
                  <div key={t._id} style={{
                    border: '1px solid #ddd',
                    borderRadius: 8,
                    padding: 16,
                    width: 260,
                    background: '#fff',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between'
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                      <div style={{
                        width: 48,
                        height: 48,
                        borderRadius: '50%',
                        background: '#eee',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: 20,
                        fontWeight: 700
                      }}>
                        {t.nombre.charAt(0)}
                      </div>
                      <div>
                        <h3 style={{ margin: 0, fontSize: '1.1rem' }}>
                          {t.nombre} {t.apellido}
                        </h3>
                        <div style={{ color: '#f6c948', fontWeight: 600 }}>
                          ★ {Number(t.avgRating).toFixed(1)}
                        </div>
                      </div>
                    </div>
                    <div style={{ display: 'flex', gap: 8, marginTop: 12 }}>
                      <button
                        onClick={() => navigate(`/trainers/${t._id}`)}
                        style={{
                          flex: 1,
                          padding: 8,
                          border: '1px solid #222',
                          background: '#fff',
                          color: '#222',
                          borderRadius: 4,
                          cursor: 'pointer'
                        }}
                      >
                        Ver perfil
                      </button>
                      <button
                        onClick={() => {
                          setReviewTrainer(t);
                          setShowReview(true);
                        }}
                        style={{
                          flex: 1,
                          padding: 8,
                          border: 'none',
                          background: '#222',
                          color: '#fff',
                          borderRadius: 4,
                          cursor: 'pointer'
                        }}
                      >
                        Reseña
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        )}

        {/* —— Modal de Reseña —— */}
        {showReview && reviewTrainer && (
          <ReviewModal
            trainer={reviewTrainer}
            onClose={() => {
              setShowReview(false);
              setReviewTrainer(null);
            }}
            // Podés recargar la lista de entrenadores después de comentar si querés
          onSuccess={() => {
            setShowReview(false);
            setReviewTrainer(null);
            setShowReviewConfirm(true); // <- Mostramos pantalla de éxito
            setTimeout(() => setShowReviewConfirm(false), 2500); // Ocultamos a los 2.5s
            }}
          />
        )}
      {/* —— ACA VA EL MODAL DE CONFIRMACIÓN —— */}
      {showReviewConfirm && (
        <div style={{
          position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh',
          background: 'rgba(0,0,0,0.10)', display: 'flex', alignItems: 'center', justifyContent: 'center',
          zIndex: 1001
        }}>
          <div style={{
            background: '#fff', borderRadius: 10, padding: 32, minWidth: 350, boxShadow: '0 6px 36px #0002',
            textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center'
          }}>
            <h2 style={{ fontSize: 22, marginBottom: 18 }}>¡Reseña enviada!</h2>
            <p style={{ fontSize: 16, color: "#444" }}>
              Tu comentario fue recibido correctamente.<br />
              Gracias por compartir tu experiencia.<br />
              <span style={{ fontSize: 26, color: "#f6c948" }}>★</span>
            </p>
          </div>
        </div>
      )}

    </div>
  </Layout>
);
}

// ——— Componente ReviewModal ———
function ReviewModal({ trainer, onClose, onSuccess }) {
  const [rating, setRating] = useState(5);
  const [texto, setTexto] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await fetch(`http://localhost:3001/api/trainers/${trainer._id}/reviews`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify({ rating, texto }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Error al enviar reseña");
      onSuccess();
    } catch (err) {
      setError(err.message);
    }
    setLoading(false);
  };

  return (
    <div style={{
      position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh',
      background: 'rgba(0,0,0,0.18)', display: 'flex', alignItems: 'center', justifyContent: 'center',
      zIndex: 1000
    }}>
      <form onSubmit={handleSubmit} style={{
        background: '#fff', borderRadius: 10, padding: 28, minWidth: 350, boxShadow: '0 6px 36px #0002',
        display: 'flex', flexDirection: 'column', alignItems: 'center'
      }}>
        <h2 style={{ marginBottom: 18, fontSize: 22 }}>Escriba una reseña de {trainer.nombre} {trainer.apellido}</h2>
        <div style={{ marginBottom: 16 }}>
          <span style={{ marginRight: 10, fontWeight: 500 }}>Calificación: </span>
          {[1, 2, 3, 4, 5].map(num =>
            <span
              key={num}
              style={{
                color: num <= rating ? "#f6c948" : "#ccc",
                fontSize: 28,
                cursor: "pointer"
              }}
              onClick={() => setRating(num)}
            >★</span>
          )}
        </div>
        <textarea
          maxLength={500}
          rows={5}
          style={{ width: 260, resize: 'none', marginBottom: 16, fontSize: 15, padding: 6, borderRadius: 5 }}
          placeholder="Diga algo acerca de su entrenador..."
          value={texto}
          onChange={e => setTexto(e.target.value)}
          required
        />
        {error && <div style={{ color: "red", marginBottom: 8 }}>{error}</div>}
        <div style={{ display: 'flex', gap: 12, marginTop: 8 }}>
          <button type="button" onClick={onClose} disabled={loading}
            style={{ padding: "8px 20px", background: "#eee", border: "none", borderRadius: 5, fontWeight: 600, cursor: "pointer" }}>Cancelar</button>
          <button type="submit" disabled={loading}
            style={{ padding: "8px 20px", background: "#222", color: "#fff", border: "none", borderRadius: 5, fontWeight: 600, cursor: "pointer" }}>Enviar</button>
        </div>
      </form>
    </div>
  );
}

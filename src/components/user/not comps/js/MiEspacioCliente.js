"use client"

import { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"
import Layout from "../../../layout/js/Layout"
import dayjs from "dayjs"
import utc from "dayjs/plugin/utc"
import "../css/MiEspacioCliente.css"
import ClientSessionCard from  "../../comps/js/ClientSessionCard"
import TrainerCard from "../../comps/js/TrainerCard"
import ReviewModal from "../../comps/js/ReviewModal"

dayjs.extend(utc)

export default function MiEspacioCliente() {
  const navigate = useNavigate()

  // Pestaña activa
  const [activeTab, setActiveTab] = useState("sesiones")

  // — Estado para sesiones —
  const [reservas, setReservas] = useState([])
  const [loadingReservas, setLoadingReservas] = useState(true)

  // — Estado para entrenadores —
  const [misEntrenadores, setMisEntrenadores] = useState([])
  const [loadingEntrenadores, setLoadingEntrenadores] = useState(false)

  // — Estado para review —
  const [showReview, setShowReview] = useState(false)
  const [reviewTrainer, setReviewTrainer] = useState(null)
  const [showReviewConfirm, setShowReviewConfirm] = useState(false)

  // — Estado para documentos —
  const [clientesConReservas, setClientesConReservas] = useState([])

  // — Cargar reservas al montar —
  useEffect(() => {
    const token = localStorage.getItem("token")
    fetch("http://localhost:3001/api/reserve", {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((response) => response.json())
      .then((data) => {
        setReservas(data)
        setLoadingReservas(false)
        // Procesar documentos por entrenador
        processDocumentsByTrainer(data)
      })
      .catch((error) => {
        console.error("Error al cargar reservas:", error)
        setLoadingReservas(false)
      })
  }, [])

  // — Procesar documentos agrupados por entrenador —
  const processDocumentsByTrainer = (reservasData) => {
    const trainerDocuments = new Map()

    reservasData.forEach((reserva) => {
      const entrenador = reserva.servicio?.entrenador
      if (!entrenador || !reserva.documentos || reserva.documentos.length === 0) return

      const trainerId = entrenador._id || entrenador
      if (!trainerDocuments.has(trainerId)) {
        trainerDocuments.set(trainerId, {
          entrenador,
          reservas: [],
        })
      }

      // Solo agregar reservas que tienen documentos
      if (reserva.documentos.length > 0) {
        trainerDocuments.get(trainerId).reservas.push(reserva)
      }
    })

    const trainersArray = Array.from(trainerDocuments.values())
    setClientesConReservas(trainersArray)
  }

  // — Cargar entrenadores cuando se activa esa pestaña —
  useEffect(() => {
    if (activeTab !== "misEntrenadores") return

    const token = localStorage.getItem("token")
    setLoadingEntrenadores(true)
    fetch("http://localhost:3001/api/trainers", {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((response) => response.json())
      .then((data) => setMisEntrenadores(data))
      .catch((error) => console.error("Error al cargar entrenadores:", error))
      .finally(() => setLoadingEntrenadores(false))
  }, [activeTab])

  // — Función para cancelar reserva —
  const handleCancelReserva = async (reservaId) => {
    try {
      const token = localStorage.getItem("token")
      const response = await fetch(`http://localhost:3001/api/reserve/${reservaId}/state`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ action: "Cancelar" }),
      })

      if (response.ok) {
        setReservas((prev) => prev.map((r) => (r._id === reservaId ? { ...r, estado: "Cancelado" } : r)))
      } else {
        console.error("Error al cancelar reserva")
      }
    } catch (error) {
      console.error("Error al cancelar reserva:", error)
    }
  }

  // — Función para abrir modal de reseña —
  const handleOpenReview = (trainer) => {
    setReviewTrainer(trainer)
    setShowReview(true)
  }

  // — Función para cerrar modal de reseña —
  const handleCloseReview = () => {
    setShowReview(false)
    setReviewTrainer(null)
  }

  // — Función para confirmar envío de reseña —
  const handleReviewSuccess = () => {
    setShowReview(false)
    setReviewTrainer(null)
    setShowReviewConfirm(true)
    setTimeout(() => setShowReviewConfirm(false), 2500)
  }

  // — Función para manejar documento subido —
  const handleDocumentUploaded = () => {
    // Recargar reservas para actualizar documentos
    const token = localStorage.getItem("token")
    fetch("http://localhost:3001/api/reserve", {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((response) => response.json())
      .then((data) => {
        setReservas(data)
        processDocumentsByTrainer(data)
      })
      .catch((error) => console.error("Error al recargar reservas:", error))
  }

  return (
    <Layout>
      <div className="mi-espacio-cliente">
        {/* Header con título */}
        <div className="header-section">
          <div className="title-section">
            <h1 className="main-title">MI ESPACIO</h1>
            <p className="subtitle">Gestiona tus sesiones, documentos y entrenadores en un solo lugar.</p>
          </div>
        </div>

        {/* Tabs de navegación */}
        <div className="tabs-navigation">
          <button
            className={`tab-btn ${activeTab === "sesiones" ? "active" : ""}`}
            onClick={() => setActiveTab("sesiones")}
          >
            Sesiones
          </button>
          <button
            className={`tab-btn ${activeTab === "documentos" ? "active" : ""}`}
            onClick={() => setActiveTab("documentos")}
          >
            Documentos
          </button>
          <button
            className={`tab-btn ${activeTab === "misEntrenadores" ? "active" : ""}`}
            onClick={() => setActiveTab("misEntrenadores")}
          >
            Mis Entrenadores
          </button>
        </div>

        {/* Contenido de las tabs */}
        <div className="tab-content">
          {activeTab === "sesiones" && (
            <div className="sesiones-content">
              <h2 className="section-title">Mis sesiones</h2>
              <p className="section-subtitle">Revisa y gestiona tus sesiones programadas</p>

              {loadingReservas ? (
                <div className="loading-state">Cargando sesiones...</div>
              ) : (
                <div className="reservas-container">
                  {reservas.length === 0 ? (
                    <div className="empty-state">
                      <p>No tienes sesiones programadas</p>
                    </div>
                  ) : (
                    reservas.map((reserva) => (
                      <ClientSessionCard key={reserva._id} reserva={reserva} onCancel={handleCancelReserva} />
                    ))
                  )}
                </div>
              )}
            </div>
          )}

          {activeTab === "documentos" && (
            <div className="documentos-content">
              <h2 className="section-title">Mis documentos</h2>
              <p className="section-subtitle">Documentos compartidos por tus entrenadores</p>

              {loadingReservas ? (
                <div className="loading-state">Cargando documentos...</div>
              ) : (
                <div className="documents-by-trainer">
                  {clientesConReservas.length === 0 ? (
                    <div className="empty-state">
                      <p>Aún no tienes documentos compartidos por tus entrenadores</p>
                    </div>
                  ) : (
                    clientesConReservas.map((trainerData) => (
                      <div
                        key={trainerData.entrenador._id || trainerData.entrenador}
                        className="trainer-documents-section"
                      >
                        <div className="trainer-header">
                          <div className="trainer-avatar">
                            {`${trainerData.entrenador.nombre?.charAt(0) || ""}${trainerData.entrenador.apellido?.charAt(0) || ""}`.toUpperCase()}
                          </div>
                          <div className="trainer-info">
                            <h3>
                              {trainerData.entrenador.nombre} {trainerData.entrenador.apellido}
                            </h3>
                            <p>
                              {trainerData.reservas.length} documento{trainerData.reservas.length !== 1 ? "s" : ""}{" "}
                              compartido{trainerData.reservas.length !== 1 ? "s" : ""}
                            </p>
                          </div>
                        </div>

                        {/* Aquí podríamos reutilizar ClientDocumentCard pero adaptado para cliente */}
                        <div className="documents-grid">
                          {trainerData.reservas.map((reserva) =>
                            reserva.documentos.map((doc, index) => (
                              <div key={`${reserva._id}-${index}`} className="document-item">
                                <div className="document-icon">📄</div>
                                <div className="document-info">
                                  <h4 className="document-name">{doc.split("_").slice(2).join("_") || doc}</h4>
                                  <p className="document-type">PDF</p>
                                  <p className="document-service">{reserva.servicio?.titulo}</p>
                                </div>
                                <div className="document-actions">
                                  <button
                                    className="download-btn"
                                    onClick={async () => {
                                      try {
                                        const token = localStorage.getItem("token")
                                        const response = await fetch(
                                          `http://localhost:3001/api/reserve/${reserva._id}/documents/${encodeURIComponent(doc)}`,
                                          {
                                            headers: { Authorization: `Bearer ${token}` },
                                          },
                                        )

                                        if (response.ok) {
                                          const blob = await response.blob()
                                          const url = window.URL.createObjectURL(blob)
                                          const a = document.createElement("a")
                                          a.href = url
                                          a.download = doc.split("_").slice(2).join("_") || doc
                                          document.body.appendChild(a)
                                          a.click()
                                          document.body.removeChild(a)
                                          window.URL.revokeObjectURL(url)
                                        } else {
                                          alert("Error al descargar el documento")
                                        }
                                      } catch (error) {
                                        console.error("Error downloading document:", error)
                                        alert("Error al descargar el documento")
                                      }
                                    }}
                                    title="Descargar"
                                  >
                                    ⬇️
                                  </button>
                                </div>
                              </div>
                            )),
                          )}
                        </div>
                      </div>
                    ))
                  )}
                </div>
              )}
            </div>
          )}

          {activeTab === "misEntrenadores" && (
            <div className="entrenadores-content">
              <h2 className="section-title">Mis entrenadores</h2>
              <p className="section-subtitle">Entrenadores con los que has tenido sesiones</p>

              {loadingEntrenadores ? (
                <div className="loading-state">Cargando entrenadores...</div>
              ) : (
                <div className="trainers-grid">
                  {misEntrenadores.length === 0 ? (
                    <div className="empty-state">
                      <p>No tienes entrenadores con sesiones completadas</p>
                    </div>
                  ) : (
                    misEntrenadores.map((trainer) => (
                      <TrainerCard key={trainer._id} trainer={trainer} onReview={handleOpenReview} />
                    ))
                  )}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Modal de reseña */}
        {showReview && reviewTrainer && (
          <ReviewModal trainer={reviewTrainer} onClose={handleCloseReview} onSuccess={handleReviewSuccess} />
        )}

        {/* Modal de confirmación de reseña */}
        {showReviewConfirm && (
          <div className="modal-overlay">
            <div className="modal-content" style={{ textAlign: "center", maxWidth: "400px" }}>
              <h2 style={{ fontSize: "1.5rem", marginBottom: "16px", color: "#28a745" }}>¡Reseña enviada!</h2>
              <p style={{ fontSize: "1rem", color: "#6c757d", marginBottom: "8px" }}>
                Tu comentario fue recibido correctamente.
              </p>
              <p style={{ fontSize: "1rem", color: "#6c757d" }}>Gracias por compartir tu experiencia.</p>
              <div style={{ fontSize: "2rem", color: "#f6c948", marginTop: "16px" }}>★</div>
            </div>
          </div>
        )}
      </div>
    </Layout>
  )
}

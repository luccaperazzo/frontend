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

  // Cantidad de sesiones por página (paginación)
  const PAGE_SIZE_SESIONES = 6;
  const [currentPageSesiones, setCurrentPageSesiones] = useState(1);

  // Cantidad de clientes-documentos por página
  const PAGE_SIZE_DOCUMENTOS = 4;
  const [currentPageDocumentos, setCurrentPageDocumentos] = useState(1);

  // Cantidad de entrenadores por página (paginación)
  const PAGE_SIZE_ENTRENADORES = 6;
  const [currentPageEntrenadores, setCurrentPageEntrenadores] = useState(1);

  // Filtros de sesiones
  const [filtroEntrenador, setFiltroEntrenador] = useState("");
  const [filtroEstado, setFiltroEstado] = useState("");
  const [filtroFecha, setFiltroFecha] = useState("");

  // Devuelve las reservas del usuario
  useEffect(() => {
    const token = localStorage.getItem("token")
    fetch("http://localhost:3001/api/reserve", {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((response) => response.json())
      .then((data) => {
        setReservas(data) //guarda las reservas 
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
    fetch("http://localhost:3001/api/trainers", { // Traer los trainers 
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

  // Abre el modal para escribir una reseña
  const handleOpenReview = (trainer) => {
    setReviewTrainer(trainer) // Guarda el trainer seleccionado en reviewTrainer
    setShowReview(true) // Muestra el modal de reseña
  }

  //Se ejecuta cuando el cliente cancela/Cierra el modal
  const handleCloseReview = () => {
    setShowReview(false) //oculta el modal
    setReviewTrainer(null) // Limpia el trainer seleccionado
  }

  // — Función para confirmar envío de reseña —
  const handleReviewSuccess = () => {
    setShowReview(false) // Oculta el modal de reseña
    setReviewTrainer(null) // Limpia el trainer seleccionado
    setShowReviewConfirm(true) // Muestra el modal de confirmación
    setTimeout(() => setShowReviewConfirm(false), 2500) // Lo oculta después de 2.5 segundos
  }

  // Filtrar sesiones según los filtros seleccionados
const reservasFiltradas = reservas.filter(reserva => {
  // Basicamente extraes el nombre y apellido del trainer
  const entrenadorNombre = (reserva.servicio?.entrenador?.nombre || reserva.entrenador?.nombre || "").toLowerCase();
  const entrenadorApellido = (reserva.servicio?.entrenador?.apellido || reserva.entrenador?.apellido || "").toLowerCase();
  // Busca coincidencias en el nombre y apellido del entrenador en base al filtro
  const matchEntrenador =
    !filtroEntrenador || // Si no hay filtro, muestra todas las reservas
    entrenadorNombre.includes(filtroEntrenador.toLowerCase()) ||
    entrenadorApellido.includes(filtroEntrenador.toLowerCase());

  // Filtra por estado, si no hay filtro trae todas las reservas
  const matchEstado =
    !filtroEstado || (reserva.estado && reserva.estado.toLowerCase() === filtroEstado.toLowerCase());
  // Filtra por fecha, si no hay filtro trae todas las reservas
  const matchFecha =
    !filtroFecha ||
    (reserva.fechaInicio && reserva.fechaInicio.slice(0, 10) === filtroFecha);

  return matchEntrenador && matchEstado && matchFecha; // Incluye reservas que cumplen con los filtros
});

  // Paginado Sesiones
  const totalPagesSesiones = Math.ceil(reservasFiltradas.length / PAGE_SIZE_SESIONES);
  const paginatedReservas = reservasFiltradas.slice(
    (currentPageSesiones - 1) * PAGE_SIZE_SESIONES,
    currentPageSesiones * PAGE_SIZE_SESIONES
  );

  // Paginado Documentos
  const totalPagesDocumentos = Math.ceil(clientesConReservas.length / PAGE_SIZE_DOCUMENTOS);
  const paginatedClientesConReservas = clientesConReservas.slice(
    (currentPageDocumentos - 1) * PAGE_SIZE_DOCUMENTOS,
    currentPageDocumentos * PAGE_SIZE_DOCUMENTOS
  );

  // — Paginado entrenadores —
  const totalPagesEntrenadores = Math.ceil(misEntrenadores.length / PAGE_SIZE_ENTRENADORES);
  const paginatedEntrenadores = misEntrenadores.slice(
  (currentPageEntrenadores - 1) * PAGE_SIZE_ENTRENADORES,
  currentPageEntrenadores * PAGE_SIZE_ENTRENADORES
);

  // Cuando se actualizan las reservas, volvemos a la primera página por si cambia la cantidad
  useEffect(() => {
    setCurrentPageSesiones(1);
  }, [reservas]);

  // Cuando se actualizan las reservas, volvemos a la primera página de los documentos por si cambia la cantidad
  useEffect(() => {
    setCurrentPageDocumentos(1);
  }, [clientesConReservas]);

  // Cuando se actualizan los entrenadores, volvemos a la primera página por si cambia la cantidad
  useEffect(() => {
    setCurrentPageEntrenadores(1);
  }, [misEntrenadores]);

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

              {/* --- Filtros de Sesiones --- */}
              <div className="filtros-sesiones">
                <div>
                  <label>Entrenador<br />
                    <input
                      type="text"
                      value={filtroEntrenador}
                      onChange={e => setFiltroEntrenador(e.target.value)}
                      placeholder="Buscar por nombre"
                      className="filtro-sesion-input"
                    />
                  </label>
                </div>
                <div>
                  <label>Estado<br />
                    <select
                      value={filtroEstado}
                      onChange={e => setFiltroEstado(e.target.value)}
                      className="filtro-sesion-input"
                    >
                      <option value="">Todos</option>
                      <option value="Pendiente">Pendiente</option>
                      <option value="Aceptado">Confirmado</option>
                      <option value="Cancelado">Cancelado</option>
                      <option value="Finalizado">Finalizado</option>
                    </select>
                  </label>
                </div>
                <div>
                  <label>Fecha<br />
                    <input
                      type="date"
                      value={filtroFecha}
                      onChange={e => setFiltroFecha(e.target.value)}
                      className="filtro-sesion-input"
                    />
                  </label>
                </div>
                <button
                  className="limpiar-btn"
                  onClick={() => { setFiltroEntrenador(""); setFiltroEstado(""); setFiltroFecha(""); }}
                >
                  Limpiar
                </button>
              </div>

              {loadingReservas ? (
                <div className="loading-state">Cargando sesiones...</div>
              ) : (
                <div className="reservas-container">
                  {reservas.length === 0 ? (
                    <div className="empty-state">
                      <p>No tienes sesiones programadas</p>
                    </div>
                  ) : (
                    <>
                      {paginatedReservas.map((reserva) => (
                        <ClientSessionCard key={reserva._id} reserva={reserva} onCancel={handleCancelReserva} />
                      ))}
                      {totalPagesSesiones > 1 && (
                        <div className="pagination-controls" style={{ display: "flex", gap: 8, alignItems: "center", justifyContent: "center", marginTop: 24 }}>
                          <button
                            disabled={currentPageSesiones === 1}
                            onClick={() => setCurrentPageSesiones(currentPageSesiones - 1)}
                          >
                            Anterior
                          </button>
                          <span>
                            Página {currentPageSesiones} de {totalPagesSesiones}
                          </span>
                          <button
                            disabled={currentPageSesiones === totalPagesSesiones}
                            onClick={() => setCurrentPageSesiones(currentPageSesiones + 1)}
                          >
                            Siguiente
                          </button>
                        </div>
                      )}
                    </>
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
                    paginatedClientesConReservas.map((trainerData) => (
                      <div
                        key={trainerData.entrenador._id || trainerData.entrenador}
                        className="trainer-documents-section"
                      >                        <div className="trainer-header">
                          <div className="trainer-avatar">
                            {trainerData.entrenador.avatarUrl ? (
                              <img 
                                src={
                                  trainerData.entrenador.avatarUrl.startsWith('http')
                                    ? trainerData.entrenador.avatarUrl
                                    : `http://localhost:3001${trainerData.entrenador.avatarUrl}`
                                }
                                alt={`${trainerData.entrenador.nombre} ${trainerData.entrenador.apellido}`}
                                className="trainer-avatar-img"
                                onError={(e) => {
                                  e.target.style.display = 'none';
                                  e.target.nextSibling.style.display = 'flex';
                                }}
                              />
                            ) : null}
                            <span 
                              className="trainer-initials"
                              style={{ display: trainerData.entrenador.avatarUrl ? 'none' : 'flex' }}
                            >
                              {`${trainerData.entrenador.nombre?.charAt(0) || ""}${trainerData.entrenador.apellido?.charAt(0) || ""}`.toUpperCase()}
                            </span>
                          </div>
                          <div className="trainer-info">
                            <h3>
                              {trainerData.entrenador.nombre} {trainerData.entrenador.apellido}
                            </h3>                            <p>
                              {trainerData.reservas.reduce((total, reserva) => total + reserva.documentos.length, 0)} documento{trainerData.reservas.reduce((total, reserva) => total + reserva.documentos.length, 0) !== 1 ? 's' : ''}{" "}
                              compartido{trainerData.reservas.reduce((total, reserva) => total + reserva.documentos.length, 0) !== 1 ? 's' : ''} • {trainerData.reservas.length} sesión{trainerData.reservas.length !== 1 ? 'es' : ''}
                            </p>
                          </div>
                        </div>                        {/* Documentos agrupados por reserva */}
                        <div className="reservations-list">
                          {trainerData.reservas.map((reserva) => (
                            <div key={reserva._id} className="reservation-documents-group">
                              <div className="reservation-header">
                                <div className="reservation-info">
                                  <h4 className="reservation-service">{reserva.servicio?.titulo}</h4>                                  <p className="reservation-date">
                                    📅 {new Date(reserva.fechaInicio).toLocaleDateString('es-AR', {
                                      weekday: 'long',
                                      year: 'numeric',
                                      month: 'long',
                                      day: 'numeric',
                                      timeZone: 'UTC'
                                    })} a las {new Date(reserva.fechaInicio).toLocaleTimeString('es-AR', {
                                      hour: '2-digit',
                                      minute: '2-digit',
                                      timeZone: 'UTC'
                                    })} UTC
                                  </p>
                                  <span className="documents-count">
                                    {reserva.documentos.length} documento{reserva.documentos.length !== 1 ? 's' : ''}
                                  </span>
                                </div>
                              </div>
                              
                              <div className="documents-grid">
                                {reserva.documentos.map((doc, index) => (
                                  <div key={`${reserva._id}-${index}`} className="document-item">
                                    <div className="document-icon">📄</div>
                                    <div className="document-info">
                                      <h5 className="document-name">{doc.split("_").slice(2).join("_") || doc}</h5>
                                      <p className="document-type">PDF</p>
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
                                ))}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    ))
                  )
                    }
                      {totalPagesDocumentos > 1 && (
                        <div
                          className="pagination-controls"
                          style={{
                            display: "flex",
                            gap: 8,
                            alignItems: "center",
                            justifyContent: "center",
                            marginTop: 24,
                          }}
                        >
                          <button
                            disabled={currentPageDocumentos === 1}
                            onClick={() => setCurrentPageDocumentos(currentPageDocumentos - 1)}
                          >
                            Anterior
                          </button>
                          <span>
                            Página {currentPageDocumentos} de {totalPagesDocumentos}
                          </span>
                          <button
                            disabled={currentPageDocumentos === totalPagesDocumentos}
                            onClick={() => setCurrentPageDocumentos(currentPageDocumentos + 1)}
                          >
                            Siguiente
                          </button>
                        </div>
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
                    <>
                      {paginatedEntrenadores.map((trainer) => (
                        <TrainerCard key={trainer._id} trainer={trainer} onReview={handleOpenReview} />
                      ))}
                      {totalPagesEntrenadores > 1 && (
                        <div className="pagination-controls" style={{ display: "flex", gap: 8, alignItems: "center", justifyContent: "center", marginTop: 24 }}>
                          <button
                            disabled={currentPageEntrenadores === 1}
                            onClick={() => setCurrentPageEntrenadores(currentPageEntrenadores - 1)}
                          >
                            Anterior
                          </button>
                          <span>
                            Página {currentPageEntrenadores} de {totalPagesEntrenadores}
                          </span>
                          <button
                            disabled={currentPageEntrenadores === totalPagesEntrenadores}
                            onClick={() => setCurrentPageEntrenadores(currentPageEntrenadores + 1)}
                          >
                            Siguiente
                          </button>
                        </div>
                      )}
                    </>
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

"use client"

import { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"
import Layout from "../Layout" // Ajusta la ruta según tu estructura
import dayjs from "dayjs"
import utc from "dayjs/plugin/utc"
import "./MiEspacioEntrenador.css"
import ServiceCard from "./ServiceCard"
import CrearServicioModal from "./CrearServicioModal"

dayjs.extend(utc)

export default function MiEspacioEntrenador() {
  const navigate = useNavigate()

  // Pestaña activa
  const [activeTab, setActiveTab] = useState("sesiones")

  // — Estado para sesiones —
  const [reservas, setReservas] = useState([])
  const [loadingReservas, setLoadingReservas] = useState(true)

  // — Estado para métricas —
  const [showMetricas, setShowMetricas] = useState(false)

  // — Estado para confirmación de acciones —
  const [showActionConfirm, setShowActionConfirm] = useState(false)
  const [actionType, setActionType] = useState("")
  const [selectedReserva, setSelectedReserva] = useState(null)

  // — Estado para servicios —
  const [servicios, setServicios] = useState([])
  const [loadingServicios, setLoadingServicios] = useState(false)
  const [showCreateService, setShowCreateService] = useState(false)

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
      })
      .catch((error) => {
        console.error("Error al cargar reservas:", error)
        setLoadingReservas(false)
      })
  }, [])

  // — Cargar servicios del entrenador —
  const cargarServicios = async () => {
    setLoadingServicios(true)
    try {
      const token = localStorage.getItem("token")
      const response = await fetch("http://localhost:3001/api/service/my", {
        headers: { Authorization: `Bearer ${token}` },
      })
      const data = await response.json()
      setServicios(data)
    } catch (error) {
      console.error("Error al cargar servicios:", error)
    } finally {
      setLoadingServicios(false)
    }
  }

  // — Manejar creación de servicio —
  const handleServiceCreated = (newService) => {
    setServicios((prev) => [newService, ...prev])
  }

  // — Manejar edición de servicio —
  const handleEditService = (servicio) => {
    console.log("Editar servicio:", servicio)
    // TODO: Implementar modal de edición
  }

  // — Manejar eliminación de servicio —
  const handleDeleteService = async (servicioId) => {
    try {
      const token = localStorage.getItem("token")
      const response = await fetch(`http://localhost:3001/api/service/${servicioId}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      })

      if (response.ok) {
        setServicios((prev) => prev.filter((s) => s._id !== servicioId))
      } else {
        console.error("Error al eliminar servicio")
      }
    } catch (error) {
      console.error("Error al eliminar servicio:", error)
    }
  }

  // — Manejar publicar/despublicar servicio —
  const handleTogglePublishService = async (servicioId, currentPublished) => {
    try {
      const token = localStorage.getItem("token")
      const response = await fetch(`http://localhost:3001/api/service/${servicioId}/publish`, {
        method: "PATCH",
        headers: { Authorization: `Bearer ${token}` },
      })

      if (response.ok) {
        setServicios((prev) => prev.map((s) => (s._id === servicioId ? { ...s, publicado: !currentPublished } : s)))
      } else {
        console.error("Error al cambiar estado de publicación")
      }
    } catch (error) {
      console.error("Error al cambiar estado de publicación:", error)
    }
  }

  // — Cargar servicios cuando se selecciona la tab —
  useEffect(() => {
    if (activeTab === "servicios") {
      cargarServicios()
    }
  }, [activeTab])

  // — Función para manejar acciones de reserva —
  const handleReservaAction = (reserva, action) => {
    setSelectedReserva(reserva)
    setActionType(action)
    setShowActionConfirm(true)
  }

  // — Confirmar acción —
  const confirmarAccion = () => {
    const token = localStorage.getItem("token")
    let newState = ""

    switch (actionType) {
      case "aceptar":
        newState = "confirmed"
        break
      case "cancelar":
        newState = "cancelled"
        break
      case "reagendar":
        newState = "rescheduled"
        break
      default:
        newState = actionType
    }

    fetch(`http://localhost:3001/api/reserve/${selectedReserva.id}/state`, {
      method: "PATCH",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ state: newState }),
    })
      .then((response) => response.json())
      .then((data) => {
        setReservas((prev) => prev.map((r) => (r.id === selectedReserva.id ? { ...r, state: newState } : r)))
        setShowActionConfirm(false)
        setSelectedReserva(null)
        setActionType("")
      })
      .catch((error) => {
        console.error("Error al actualizar reserva:", error)
        setShowActionConfirm(false)
      })
  }

  // — Función para obtener el color del estado —
  const getEstadoColor = (state) => {
    switch (state?.toLowerCase()) {
      case "confirmed":
        return "#28a745"
      case "pending":
        return "#ffc107"
      case "cancelled":
        return "#dc3545"
      case "rescheduled":
        return "#17a2b8"
      default:
        return "#6c757d"
    }
  }

  // — Función para obtener las iniciales —
  const getIniciales = (nombre) => {
    return nombre
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
  }

  // — Función para formatear fecha —
  const formatearFecha = (fecha) => {
    return dayjs(fecha).format("DD/MM/YYYY")
  }

  // — Función para formatear hora —
  const formatearHora = (fecha) => {
    return dayjs(fecha).format("HH:mm")
  }

  return (
    <Layout>
      <div className="mi-espacio-entrenador">
        {/* Header con título y botón métricas */}
        <div className="header-section">
          <div className="title-section">
            <h1 className="main-title">MI ESPACIO</h1>
            <p className="subtitle">Gestiona tus sesiones, servicios y documentos compartidos con cada cliente.</p>
          </div>
          <button className="metricas-btn" onClick={() => setShowMetricas(true)}>
            📊 Métricas
          </button>
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
            className={`tab-btn ${activeTab === "servicios" ? "active" : ""}`}
            onClick={() => setActiveTab("servicios")}
          >
            Servicios
          </button>
        </div>

        {/* Contenido de las tabs */}
        <div className="tab-content">
          {activeTab === "sesiones" && (
            <div className="sesiones-content">
              <h2 className="section-title">Mis sesiones</h2>
              <p className="section-subtitle">Organiza las sesiones con tus clientes</p>

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
                      <div key={reserva.id} className="reserva-item">
                        <div className="client-avatar">{getIniciales(reserva.clientName || "Cliente")}</div>

                        <div className="reserva-details">
                          <h4 className="client-name">{reserva.clientName || "Cliente"}</h4>
                          <p className="service-name">{reserva.serviceName || "Entrenamiento personalizado"}</p>
                        </div>

                        <div className="reserva-datetime">
                          <div className="date-info">📅 {formatearFecha(reserva.date)}</div>
                          <div className="time-info">🕐 {formatearHora(reserva.date)}</div>
                        </div>

                        <div className="reserva-status">
                          <span className="status-badge" style={{ backgroundColor: getEstadoColor(reserva.state) }}>
                            Estado: {reserva.state || "Pendiente"}
                          </span>
                        </div>

                        <div className="reserva-actions">
                          {reserva.state?.toLowerCase() === "pending" && (
                            <>
                              <button
                                className="action-btn accept-btn"
                                onClick={() => handleReservaAction(reserva, "aceptar")}
                              >
                                ✓ Aceptar
                              </button>
                              <button
                                className="action-btn cancel-btn"
                                onClick={() => handleReservaAction(reserva, "cancelar")}
                              >
                                ✗ Cancelar
                              </button>
                            </>
                          )}

                          {reserva.state?.toLowerCase() === "confirmed" && (
                            <>
                              <button
                                className="action-btn reschedule-btn"
                                onClick={() => handleReservaAction(reserva, "reagendar")}
                              >
                                📅 Reagendar
                              </button>
                              <button
                                className="action-btn cancel-btn"
                                onClick={() => handleReservaAction(reserva, "cancelar")}
                              >
                                ✗ Cancelar
                              </button>
                            </>
                          )}
                        </div>
                      </div>
                    ))
                  )}
                </div>
              )}
            </div>
          )}

          {activeTab === "documentos" && (
            <div className="documentos-content">
              <h2 className="section-title">Documentos</h2>
              <p className="section-subtitle">Gestiona los documentos compartidos con tus clientes</p>
              <div className="coming-soon">
                <p>Próximamente: Subir y compartir documentos</p>
              </div>
            </div>
          )}

          {activeTab === "servicios" && (
            <div className="servicios-content">
              <div className="servicios-header">
                <div>
                  <h2 className="section-title">Servicios</h2>
                  <p className="section-subtitle">Administra tus servicios y tarifas</p>
                </div>
                <button className="crear-servicio-btn" onClick={() => setShowCreateService(true)}>
                  ➕ Crear Servicio
                </button>
              </div>

              {loadingServicios ? (
                <div className="loading-state">Cargando servicios...</div>
              ) : (
                <div className="servicios-list">
                  {servicios.length === 0 ? (
                    <div className="empty-state">
                      <p>No tienes servicios creados</p>
                      <button className="crear-primer-servicio-btn" onClick={() => setShowCreateService(true)}>
                        Crear tu primer servicio
                      </button>
                    </div>
                  ) : (
                    servicios.map((servicio) => (
                      <ServiceCard
                        key={servicio._id}
                        servicio={servicio}
                        onEdit={handleEditService}
                        onDelete={handleDeleteService}
                        onTogglePublish={handleTogglePublishService}
                      />
                    ))
                  )}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Modal de confirmación */}
        {showActionConfirm && (
          <div className="modal-overlay">
            <div className="modal-content">
              <h3>Confirmar acción</h3>
              <p>
                ¿Estás seguro que quieres {actionType} la sesión con {selectedReserva?.clientName}?
              </p>
              <div className="modal-actions">
                <button className="confirm-btn" onClick={confirmarAccion}>
                  Confirmar
                </button>
                <button className="cancel-modal-btn" onClick={() => setShowActionConfirm(false)}>
                  Cancelar
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Modal de crear servicio */}
        <CrearServicioModal
          isOpen={showCreateService}
          onClose={() => setShowCreateService(false)}
          onServiceCreated={handleServiceCreated}
        />
      </div>
    </Layout>
  )
}

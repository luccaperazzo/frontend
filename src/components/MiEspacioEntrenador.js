"use client"

import { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"
import Layout from "../Layout" // Ajusta la ruta según tu estructura
import dayjs from "dayjs"
import utc from "dayjs/plugin/utc"
import "./MiEspacioEntrenador.css"
import ServiceCard from "./ServiceCard"
import CrearServicioModal from "./CrearServicioModal"
import SessionCard from "./SessionCard"
import ReprogramarModal from "./ReprogramarModal"

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

  // — Estado para reprogramación —
  const [showReprogramar, setShowReprogramar] = useState(false)
  const [reservaToReschedule, setReservaToReschedule] = useState(null)

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
  const handleReservaAction = async (reserva, action) => {
    try {
      const token = localStorage.getItem("token")
      const reservaId = reserva._id || reserva.id

      const response = await fetch(`http://localhost:3001/api/reserve/${reservaId}/state`, {
        method: "PATCH",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ action }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || "Error al actualizar la reserva")
      }

      const updatedReserva = await response.json()

      // Actualizar la lista de reservas
      setReservas((prev) =>
        prev.map((r) => (r._id === reservaId || r.id === reservaId ? { ...r, estado: updatedReserva.estado } : r)),
      )

      console.log(`Acción ${action} ejecutada correctamente`)
    } catch (error) {
      console.error("Error al ejecutar acción:", error)
      alert(`Error: ${error.message}`)
    }
  }

  // — Función para abrir modal de reprogramación —
  const handleReprogramar = (reserva) => {
    setReservaToReschedule(reserva)
    setShowReprogramar(true)
  }

  // — Función para confirmar reprogramación —
  const handleConfirmReprogramar = async (nuevaFechaInicio) => {
    try {
      const token = localStorage.getItem("token")
      const reservaId = reservaToReschedule._id || reservaToReschedule.id

      const response = await fetch(`http://localhost:3001/api/reserve/${reservaId}/state`, {
        method: "PATCH",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          action: "Reprogramar",
          fechaInicio: nuevaFechaInicio,
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || "Error al reprogramar la reserva")
      }

      const updatedReserva = await response.json()

      // Actualizar la lista de reservas
      setReservas((prev) =>
        prev.map((r) =>
          r._id === reservaId || r.id === reservaId
            ? { ...r, estado: updatedReserva.estado, fechaInicio: updatedReserva.fechaInicio }
            : r,
        ),
      )

      setShowReprogramar(false)
      setReservaToReschedule(null)
      console.log("Sesión reprogramada correctamente")
    } catch (error) {
      console.error("Error al reprogramar:", error)
      alert(`Error: ${error.message}`)
    }
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
                      <SessionCard
                        key={reserva._id || reserva.id}
                        reserva={reserva}
                        onAction={handleReservaAction}
                        onReprogramar={handleReprogramar}
                      />
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

        {/* Modal de crear servicio */}
        <CrearServicioModal
          isOpen={showCreateService}
          onClose={() => setShowCreateService(false)}
          onServiceCreated={handleServiceCreated}
        />

        {/* Modal de reprogramación */}
        <ReprogramarModal
          isOpen={showReprogramar}
          onClose={() => {
            setShowReprogramar(false)
            setReservaToReschedule(null)
          }}
          reserva={reservaToReschedule}
          onConfirm={handleConfirmReprogramar}
        />
      </div>
    </Layout>
  )
}

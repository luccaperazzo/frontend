"use client"

import { useState } from "react"
import dayjs from "dayjs"
import "../css/ClientSessionCard.css" // Asegúrate de tener este CSS para estilos

const ClientSessionCard = ({ reserva, onCancel }) => {
  const [loading, setLoading] = useState(false)

  const handleCancel = async () => {
    setLoading(true)
    try {
      await onCancel(reserva._id)
    } finally {
      setLoading(false)
    }
  }

  // Función para obtener las iniciales del servicio
  const getServiceInitials = (titulo) => {
    if (!titulo) return "S"
    return titulo
      .split(" ")
      .map((word) => word[0])
      .join("")
      .toUpperCase()
      .substring(0, 2)
  }

  // Ajusta la fecha sumando 3 horas (UTC-3)
  const ajustarZonaHoraria = (fecha) => {
    return dayjs(fecha).add(3, "hour")
  }

  // Función para formatear la fecha
  const formatearFecha = (fecha) => {
    return ajustarZonaHoraria(fecha).format("DD/MM/YYYY")
  }

  // Función para formatear la hora
  const formatearHora = (fecha) => {
    return ajustarZonaHoraria(fecha).format("HH:mm")
  }

  // Función para obtener el color y texto del estado
  const getEstadoInfo = (estado) => {
    switch (estado?.toLowerCase()) {
      case "aceptado":
      case "confirmed":
        return { color: "#28a745", text: "Confirmado" }
      case "pendiente":
      case "pending":
        return { color: "#ffc107", text: "Pendiente" }
      case "cancelado":
      case "cancelled":
        return { color: "#dc3545", text: "Cancelado" }
      case "finalizado":
      case "finished":
      case "completed":
        return { color: "#6610f2", text: "Finalizado" }
      default:
        return { color: "#6c757d", text: estado || "Desconocido" }
    }
  }

  const estadoInfo = getEstadoInfo(reserva.estado)
  const puedeCancelar = ["pendiente", "aceptado", "confirmed"].includes(reserva.estado?.toLowerCase())

  return (
    <div className="client-session-card">
      <div className="client-session-content">
        {/* Avatar del servicio */}
        <div className="service-avatar">{getServiceInitials(reserva.servicio?.titulo)}</div>

        {/* Información del servicio */}
        <div className="session-info-client">
          <h4 className="service-title-client">{reserva.servicio?.titulo || "Servicio"}</h4>
          <p className="trainer-name-client">
            Con {reserva.servicio?.entrenador?.nombre} {reserva.servicio?.entrenador?.apellido}
          </p>
        </div>

        {/* Fecha y hora */}
        <div className="session-datetime-client">
          <div className="datetime-item-client">
            <span className="datetime-icon">📅</span>
            <span className="datetime-text">{formatearFecha(reserva.fechaInicio)}</span>
          </div>
          <div className="datetime-item-client">
            <span className="datetime-icon">🕐</span>
            <span className="datetime-text">{formatearHora(reserva.fechaInicio)}</span>
          </div>
        </div>

        {/* Estado */}
        <div className="session-status-client">
          <span className="status-label">Estado:</span>
          <span className="status-value" style={{ color: estadoInfo.color }}>
            {estadoInfo.text}
          </span>
        </div>

        {/* Botón de cancelar */}
        <div className="session-actions-client">
          {puedeCancelar && (
            <button className="cancel-btn-client" onClick={handleCancel} disabled={loading}>
              {loading ? "Cancelando..." : "Cancelar"}
            </button>
          )}
        </div>
      </div>
    </div>
  )
}

export default ClientSessionCard

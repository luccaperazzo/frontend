"use client"

import { useState } from "react"
import dayjs from "dayjs"
import "./SessionCard.css"

const SessionCard = ({ reserva, onAction, onReprogramar }) => {
  const [loading, setLoading] = useState(false)

  const handleAction = async (action) => {
    if (action === "Reprogramar") {
      onReprogramar(reserva)
      return
    }

    setLoading(true)
    try {
      await onAction(reserva, action)
    } finally {
      setLoading(false)
    }
  }

  // Función para obtener las iniciales del cliente
  const getIniciales = (nombre) => {
    if (!nombre) return "C"
    return nombre
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .substring(0, 2)
  }

  // Función para formatear la fecha
  const formatearFecha = (fecha) => {
    return dayjs(fecha).format("DD/MM/YYYY")
  }

  // Función para formatear la hora
  const formatearHora = (fecha) => {
    return dayjs(fecha).format("HH:mm A")
  }

  // Función para obtener el color y texto del estado
  const getEstadoInfo = (state) => {
    switch (state?.toLowerCase()) {
      case "aceptado":
      case "confirmed":
        return { color: "#28a745", text: "Aceptado" }
      case "pendiente":
      case "pending":
        return { color: "#ffc107", text: "Pendiente" }
      case "cancelado":
      case "cancelled":
        return { color: "#dc3545", text: "Cancelado" }
      case "reprogramado":
      case "rescheduled":
        return { color: "#17a2b8", text: "Reprogramado" }
      default:
        return { color: "#ffc107", text: "Pendiente" }
    }
  }

  const estadoInfo = getEstadoInfo(reserva.estado || reserva.state)
  const isPending =
    reserva.estado?.toLowerCase() === "pendiente" ||
    reserva.estado?.toLowerCase() === "pending" ||
    reserva.state?.toLowerCase() === "pendiente" ||
    reserva.state?.toLowerCase() === "pending"
  const isAccepted =
    reserva.estado?.toLowerCase() === "aceptado" ||
    reserva.estado?.toLowerCase() === "confirmed" ||
    reserva.state?.toLowerCase() === "aceptado" ||
    reserva.state?.toLowerCase() === "confirmed"

  return (
    <div className="session-card">
      <div className="session-card-content">
        {/* Avatar del cliente */}
        <div className="client-avatar-session">
          {getIniciales(reserva.clientName || reserva.cliente?.nombre || "Cliente")}
        </div>

        {/* Información del cliente y servicio */}
        <div className="session-info">
          <h4 className="client-name-session">
            {reserva.clientName ||
              `${reserva.cliente?.nombre || ""} ${reserva.cliente?.apellido || ""}`.trim() ||
              "Cliente"}
          </h4>
          <p className="service-name-session">
            {reserva.serviceName || reserva.servicio?.titulo || "Entrenamiento personalizado"}
          </p>
        </div>

        {/* Fecha y hora */}
        <div className="session-datetime">
          <div className="datetime-item">
            <span className="datetime-icon">📅</span>
            <span className="datetime-text">{formatearFecha(reserva.fechaInicio || reserva.date)}</span>
          </div>
          <div className="datetime-item">
            <span className="datetime-icon">🕐</span>
            <span className="datetime-text">{formatearHora(reserva.fechaInicio || reserva.date)}</span>
          </div>
        </div>

        {/* Estado */}
        <div className="session-status">
          <span className="status-label">Estado:</span>
          <span className="status-value" style={{ color: estadoInfo.color }}>
            {estadoInfo.text}
          </span>
        </div>

        {/* Botones de acción */}
        <div className="session-actions">
          {isPending && (
            <>
              <button
                className="action-btn accept-btn-session"
                onClick={() => handleAction("Confirmar")}
                disabled={loading}
              >
                ✓ Aceptar
              </button>
              <button
                className="action-btn reschedule-btn-session"
                onClick={() => handleAction("Reprogramar")}
                disabled={loading}
              >
                Reprogramar
              </button>
              <button
                className="action-btn reject-btn-session"
                onClick={() => handleAction("Cancelar")}
                disabled={loading}
              >
                Rechazar
              </button>
            </>
          )}

          {isAccepted && (
            <>
              <button
                className="action-btn reschedule-btn-session"
                onClick={() => handleAction("Reprogramar")}
                disabled={loading}
              >
                Reprogramar
              </button>
              <button
                className="action-btn cancel-btn-session"
                onClick={() => handleAction("Cancelar")}
                disabled={loading}
              >
                Cancelar
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  )
}

export default SessionCard

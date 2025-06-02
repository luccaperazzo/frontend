"use client"

import { useState } from "react"
import "../css/ServiceCard.css"

const ServiceCard = ({ servicio, onEdit, onDelete, onTogglePublish }) => {
  const [loading, setLoading] = useState(false)

  const handleTogglePublish = async () => {
    setLoading(true)
    try {
      await onTogglePublish(servicio._id, servicio.publicado)
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async () => {
    if (window.confirm(`¿Estás seguro que quieres eliminar "${servicio.titulo}"?`)) {
      setLoading(true)
      try {
        await onDelete(servicio._id)
      } finally {
        setLoading(false)
      }
    }
  }

  const formatPrice = (price) => {
    return new Intl.NumberFormat("es-AR", {
      style: "currency",
      currency: "ARS",
      minimumFractionDigits: 0,
    }).format(price)
  }

  return (
    <div className="service-card">
      <div className="service-header">
        <h3 className="service-title">{servicio.titulo}</h3>
        <div className={`service-status ${servicio.publicado ? "published" : "unpublished"}`}>
          {servicio.publicado ? "Publicado" : "No publicado"}
        </div>
      </div>

      <p className="service-description">{servicio.descripcion}</p>

      <div className="service-details">
        <div className="service-detail-item">
          <span className="detail-label">Precio</span>
          <span className="detail-value price">{formatPrice(servicio.precio)}</span>
        </div>
        <div className="service-detail-item">
          <span className="detail-label">Duración</span>
          <span className="detail-value">{servicio.duracion} min</span>
        </div>
      </div>

      <div className="service-meta">
        <span className="service-category">{servicio.categoria}</span>
        <span className="service-type">{servicio.presencial ? "Presencial" : "Virtual"}</span>
      </div>

      <div className="service-actions">
        <button className="action-btn edit-btn" onClick={() => onEdit(servicio)} disabled={loading}>
          ✏️ Editar
        </button>

        <button className="action-btn delete-btn" onClick={handleDelete} disabled={loading}>
          🗑️ Borrar
        </button>

        <button
          className={`action-btn publish-btn ${servicio.publicado ? "unpublish" : "publish"}`}
          onClick={handleTogglePublish}
          disabled={loading}
        >
          {loading ? "..." : servicio.publicado ? "Despublicar" : "Publicar"}
        </button>
      </div>
    </div>
  )
}

export default ServiceCard

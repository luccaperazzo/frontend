"use client"

import { useState } from "react"
import "./ReviewModal.css"

const ReviewModal = ({ trainer, onClose, onSuccess }) => {
  const [rating, setRating] = useState(5)
  const [texto, setTexto] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError("")
    setLoading(true)

    try {
      const response = await fetch(`http://localhost:3001/api/trainers/${trainer._id}/reviews`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify({ rating, texto }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Error al enviar reseña")
      }

      onSuccess()
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content review-modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>Escribir reseña</h2>
          <button className="close-btn" onClick={onClose}>
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit} className="review-form">
          <div className="trainer-info-review">
            <h3>
              {trainer.nombre} {trainer.apellido}
            </h3>
            <p>Comparte tu experiencia con este entrenador</p>
          </div>

          {error && <div className="error-message">{error}</div>}

          <div className="form-group">
            <label>Calificación:</label>
            <div className="rating-selector">
              {[1, 2, 3, 4, 5].map((num) => (
                <button
                  key={num}
                  type="button"
                  className={`star-btn ${num <= rating ? "active" : ""}`}
                  onClick={() => setRating(num)}
                >
                  ★
                </button>
              ))}
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="texto">Tu reseña:</label>
            <textarea
              id="texto"
              value={texto}
              onChange={(e) => setTexto(e.target.value)}
              placeholder="Comparte tu experiencia con este entrenador..."
              maxLength={500}
              rows={5}
              className="form-textarea"
              required
            />
            <div className="char-count">{texto.length}/500</div>
          </div>

          <div className="modal-actions">
            <button type="button" className="cancel-btn" onClick={onClose} disabled={loading}>
              Cancelar
            </button>
            <button type="submit" className="submit-btn" disabled={loading}>
              {loading ? "Enviando..." : "Enviar reseña"}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default ReviewModal

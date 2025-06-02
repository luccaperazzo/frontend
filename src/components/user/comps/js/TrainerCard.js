"use client"
import { useNavigate } from "react-router-dom"
import "../css/TrainerCard.css"

const TrainerCard = ({ trainer, onReview }) => {
  const navigate = useNavigate()

  const getTrainerInitials = () => {
    return `${trainer.nombre?.charAt(0) || ""}${trainer.apellido?.charAt(0) || ""}`.toUpperCase()
  }

  const formatRating = (rating) => {
    return Number(rating || 0).toFixed(1)
  }

  return (
    <div className="trainer-card">
      <div className="trainer-card-header">
        <div className="trainer-avatar-card">{getTrainerInitials()}</div>
        <div className="trainer-details">
          <h3 className="trainer-name">
            {trainer.nombre} {trainer.apellido}
          </h3>
          <div className="trainer-rating">
            <span className="rating-stars">★</span>
            <span className="rating-value">{formatRating(trainer.avgRating)}</span>
          </div>
        </div>
      </div>

      <div className="trainer-card-actions">
        <button className="action-btn profile-btn" onClick={() => navigate(`/trainers/${trainer._id}`)}>
          Ver perfil
        </button>
        <button className="action-btn review-btn" onClick={() => onReview(trainer)}>
          Escribir reseña
        </button>
      </div>
    </div>
  )
}

export default TrainerCard

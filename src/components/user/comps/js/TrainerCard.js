"use client"
import { useNavigate } from "react-router-dom"
import { useState } from "react"
import "../css/TrainerCard.css"

const TrainerCard = ({ trainer, onReview }) => {
  const navigate = useNavigate()
  const [imageError, setImageError] = useState(false)

  // Debug logging
  console.log("TrainerCard received trainer data:", trainer)

  const getTrainerInitials = () => {
    return `${trainer.nombre?.charAt(0) || ""}${trainer.apellido?.charAt(0) || ""}`.toUpperCase()
  }

  const formatRating = (rating) => {
    return Number(rating || 0).toFixed(1)
  }
  const hasValidImage = trainer.avatarUrl && !imageError

  const handleImageError = () => {
    console.log("Image failed to load for trainer:", trainer.nombre, "avatarUrl:", trainer.avatarUrl)
    setImageError(true)
  }

  // Build the correct image URL
  const getImageUrl = () => {
    if (!trainer.avatarUrl) return null
    
    // If avatarUrl already contains the full URL, use it as is
    if (trainer.avatarUrl.startsWith('http')) {
      return trainer.avatarUrl
    }
    
    // If it starts with /uploads, prepend the server URL
    if (trainer.avatarUrl.startsWith('/uploads')) {
      return `http://localhost:3001${trainer.avatarUrl}`
    }
    
    // Otherwise, assume it's just the filename
    return `http://localhost:3001/uploads/perfiles/${trainer.avatarUrl}`
  }

  return (
    <div className="trainer-card">
      <div className="trainer-card-header">        <div className="trainer-avatar-card">
          {hasValidImage ? (
            <img 
              src={getImageUrl()}
              alt={`${trainer.nombre} ${trainer.apellido}`}
              className="trainer-avatar-img"
              onError={handleImageError}
            />
          ) : (
            <span className="trainer-initials">{getTrainerInitials()}</span>
          )}
        </div>
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

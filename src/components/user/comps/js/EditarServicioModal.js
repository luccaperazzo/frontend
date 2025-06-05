"use client"

import { useState, useEffect } from "react"
import "../css/CrearServicioModal.css"

const EditarServicioModal = ({ isOpen, onClose, onServiceUpdated, servicio = null, isEditing = false }) => {
  const [formData, setFormData] = useState({
    titulo: "",
    categoria: "",
    precio: "",
    duracion: "",
    descripcion: "",
    presencial: true,
    disponibilidad: {},
  })

  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [showDisponibilidad, setShowDisponibilidad] = useState(false)

  const categorias = ["Entrenamiento", "Nutrición", "Consultoría"]
  const duraciones = [
    { value: 30, label: "30 min" },
    { value: 45, label: "45 min" },
    { value: 60, label: "1h" },
    { value: 90, label: "1h 30m" },
  ]

  // Cargar datos del servicio cuando se abre en modo edición
  useEffect(() => {
    if (isOpen && isEditing && servicio) {
      setFormData({
        titulo: servicio.titulo || "",
        categoria: servicio.categoria || "",
        precio: servicio.precio?.toString() || "",
        duracion: servicio.duracion?.toString() || "",
        descripcion: servicio.descripcion || "",
        presencial: servicio.presencial !== undefined ? servicio.presencial : true,
        disponibilidad: servicio.disponibilidad || {},
      })
      // Mostrar disponibilidad si ya tiene configurada
      if (servicio.disponibilidad && Object.keys(servicio.disponibilidad).length > 0) {
        setShowDisponibilidad(true)
      }
    } else if (isOpen && !isEditing) {
      // Resetear formulario para crear nuevo servicio
      setFormData({
        titulo: "",
        categoria: "",
        precio: "",
        duracion: "",
        descripcion: "",
        presencial: true,
        disponibilidad: {},
      })
      setShowDisponibilidad(false)
    }
    setError("")
  }, [isOpen, isEditing, servicio])

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }))
  }

  const handleDisponibilidadChange = (dia, bloques) => {
    setFormData((prev) => ({
      ...prev,
      disponibilidad: {
        ...prev.disponibilidad,
        [dia]: bloques,
      },
    }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError("")
    setLoading(true)

    // Validaciones básicas
    if (!formData.titulo.trim()) {
      setError("El título es obligatorio")
      setLoading(false)
      return
    }

    if (!formData.categoria) {
      setError("Selecciona una categoría")
      setLoading(false)
      return
    }

    if (!formData.precio || formData.precio <= 0) {
      setError("El precio debe ser mayor a 0")
      setLoading(false)
      return
    }

    if (!formData.duracion) {
      setError("Selecciona una duración")
      setLoading(false)
      return
    }

    if (!formData.descripcion.trim()) {
      setError("La descripción es obligatoria")
      setLoading(false)
      return
    }

    if (Object.keys(formData.disponibilidad).length === 0) {
      setError("Debes configurar al menos un día de disponibilidad")
      setLoading(false)
      return
    }

    try {
      const token = localStorage.getItem("token")
      const url = isEditing
        ? `http://localhost:3001/api/service/${servicio._id}`
        : "http://localhost:3001/api/service/create"

      const method = isEditing ? "PUT" : "POST"

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          titulo: formData.titulo.trim(),
          categoria: formData.categoria,
          precio: Number.parseFloat(formData.precio),
          duracion: Number.parseInt(formData.duracion),
          descripcion: formData.descripcion.trim(),
          presencial: formData.presencial,
          disponibilidad: formData.disponibilidad,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || `Error al ${isEditing ? "actualizar" : "crear"} el servicio`)
      }

      // Resetear formulario solo si es creación
      if (!isEditing) {
        setFormData({
          titulo: "",
          categoria: "",
          precio: "",
          duracion: "",
          descripcion: "",
          presencial: true,
          disponibilidad: {},
        })
      }

      // Notificar al componente padre
      onServiceUpdated(data, isEditing)
      onClose()
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  if (!isOpen) return null

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>{isEditing ? "Editar servicio" : "Crear servicio"}</h2>
          <button className="close-btn" onClick={onClose}>
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit} className="service-form">
          {error && <div className="error-message">{error}</div>}

          <div className="form-group">
            <label htmlFor="titulo">Servicio</label>
            <input
              type="text"
              id="titulo"
              name="titulo"
              value={formData.titulo}
              onChange={handleInputChange}
              placeholder="Entrenamiento personal"
              className="form-input"
            />
          </div>

          <div className="form-group">
            <label htmlFor="categoria">Categoría</label>
            <select
              id="categoria"
              name="categoria"
              value={formData.categoria}
              onChange={handleInputChange}
              className="form-select"
            >
              <option value="">Categoría</option>
              {categorias.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label htmlFor="precio">Precio</label>
            <div className="price-input-container">
              <span className="currency-symbol">$</span>
              <input
                type="number"
                id="precio"
                name="precio"
                value={formData.precio}
                onChange={handleInputChange}
                placeholder="0"
                min="0"
                step="0.01"
                className="form-input price-input"
              />
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="duracion">Duración</label>
            <select
              id="duracion"
              name="duracion"
              value={formData.duracion}
              onChange={handleInputChange}
              className="form-select"
            >
              <option value="">Duración</option>
              {duraciones.map((dur) => (
                <option key={dur.value} value={dur.value}>
                  {dur.label}
                </option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label htmlFor="descripcion">Descripción del servicio</label>
            <textarea
              id="descripcion"
              name="descripcion"
              value={formData.descripcion}
              onChange={handleInputChange}
              placeholder="Entrenamiento personal enfocado en mejorar la fuerza..."
              className="form-textarea"
              rows="4"
            />
          </div>

          <div className="form-group">
            <label>Modalidad</label>
            <div className="radio-group">
              <label className="radio-label">
                <input
                  type="radio"
                  name="presencial"
                  checked={formData.presencial === true}
                  onChange={() => setFormData((prev) => ({ ...prev, presencial: true }))}
                />
                Presencial
              </label>
              <label className="radio-label">
                <input
                  type="radio"
                  name="presencial"
                  checked={formData.presencial === false}
                  onChange={() => setFormData((prev) => ({ ...prev, presencial: false }))}
                />
                Virtual
              </label>
            </div>
          </div>

          <div className="form-group">
            <button
              type="button"
              className="disponibilidad-btn"
              onClick={() => setShowDisponibilidad(!showDisponibilidad)}
            >
              🕐 Disponibilidad horaria
              <span className="disponibilidad-count">
                {Object.keys(formData.disponibilidad).length} días configurados
              </span>
            </button>
          </div>

          {showDisponibilidad && (
            <DisponibilidadSelector
              disponibilidad={formData.disponibilidad}
              onChange={handleDisponibilidadChange}
              duracion={Number.parseInt(formData.duracion) || 60}
            />
          )}

          <button type="submit" className="submit-btn" disabled={loading}>
            {loading
              ? isEditing
                ? "Actualizando..."
                : "Creando..."
              : isEditing
                ? "Actualizar servicio"
                : "Crear servicio"}
          </button>
        </form>
      </div>
    </div>
  )
}

// Componente para configurar disponibilidad
const DisponibilidadSelector = ({ disponibilidad, onChange, duracion }) => {
  const diasSemana = ["Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado", "Domingo"]

  const [selectedDia, setSelectedDia] = useState("")
  const [horaInicio, setHoraInicio] = useState("")
  const [horaFin, setHoraFin] = useState("")

  const agregarBloque = () => {
    if (!selectedDia || !horaInicio || !horaFin) return

    const bloques = disponibilidad[selectedDia] || []
    const nuevoBloque = [horaInicio, horaFin]

    // Validar que la hora de fin sea mayor que la de inicio
    if (horaInicio >= horaFin) {
      alert("La hora de fin debe ser mayor que la de inicio")
      return
    }

    // Validar que el bloque sea múltiplo de la duración
    const [h1, m1] = horaInicio.split(":").map(Number)
    const [h2, m2] = horaFin.split(":").map(Number)
    const minutosInicio = h1 * 60 + m1
    const minutosFin = h2 * 60 + m2
    const diff = minutosFin - minutosInicio

    if (diff < duracion) {
      alert(`El bloque debe durar al menos ${duracion} minutos`)
      return
    }

    if (diff % duracion !== 0) {
      alert(`El bloque debe ser múltiplo exacto de ${duracion} minutos`)
      return
    }

    onChange(selectedDia, [...bloques, nuevoBloque])
    setHoraInicio("")
    setHoraFin("")
  }

  const eliminarBloque = (dia, index) => {
    const bloques = disponibilidad[dia] || []
    const nuevosBloques = bloques.filter((_, i) => i !== index)
    if (nuevosBloques.length === 0) {
      const nuevaDisponibilidad = { ...disponibilidad }
      delete nuevaDisponibilidad[dia]
      onChange(dia, [])
    } else {
      onChange(dia, nuevosBloques)
    }
  }

  return (
    <div className="disponibilidad-selector">
      <h4>Configurar disponibilidad</h4>

      <div className="add-bloque-form">
        <select value={selectedDia} onChange={(e) => setSelectedDia(e.target.value)} className="form-select-small">
          <option value="">Seleccionar día</option>
          {diasSemana.map((dia) => (
            <option key={dia} value={dia}>
              {dia}
            </option>
          ))}
        </select>

        {/* Hora de inicio */}
        <select
          value={horaInicio}
          onChange={e => setHoraInicio(e.target.value)}
          className="form-input-small"
        >
          <option value="">Hora inicio</option>
          {Array.from({ length: 24 }, (_, h) =>
            ["00", "15", "30", "45"].map(m => {
              const val = `${h.toString().padStart(2, "0")}:${m}`;
              return (
                <option key={val} value={val}>{val}</option>
              );
            })
          ).flat()}
        </select>

        {/* Hora de fin */}
        <select
          value={horaFin}
          onChange={e => setHoraFin(e.target.value)}
          className="form-input-small"
        >
          <option value="">Hora fin</option>
          {Array.from({ length: 24 }, (_, h) =>
            ["00", "15", "30", "45"].map(m => {
              const val = `${h.toString().padStart(2, "0")}:${m}`;
              return (
                <option key={val} value={val}>{val}</option>
              );
            })
          ).flat()}
        </select>

        <button type="button" onClick={agregarBloque} className="add-btn">
          Agregar
        </button>
      </div>

      <div className="bloques-list">
        {Object.entries(disponibilidad).map(([dia, bloques]) => (
          <div key={dia} className="dia-bloques">
            <h5>{dia}</h5>
            {bloques.map((bloque, index) => (
              <div key={index} className="bloque-item">
                <span>
                  {bloque[0]} - {bloque[1]}
                </span>
                <button type="button" onClick={() => eliminarBloque(dia, index)} className="delete-bloque-btn">
                  ✕
                </button>
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  )
}

export default EditarServicioModal

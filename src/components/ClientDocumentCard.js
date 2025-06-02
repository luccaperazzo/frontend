"use client"

import { useState, useEffect } from "react"
import "./ClientDocumentCard.css"

const ClientDocumentCard = ({ cliente, reservas, onDocumentUploaded }) => {
  const [documents, setDocuments] = useState([])
  const [loading, setLoading] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [showUploadModal, setShowUploadModal] = useState(false)
  const [selectedFile, setSelectedFile] = useState(null)
  const [selectedReserva, setSelectedReserva] = useState(null)

  // Cargar documentos de todas las reservas del cliente
  useEffect(() => {
    loadAllDocuments()
  }, [reservas])

  const loadAllDocuments = async () => {
    setLoading(true)
    try {
      const token = localStorage.getItem("token")
      const allDocuments = []

      for (const reserva of reservas) {
        try {
          const response = await fetch(`http://localhost:3001/api/reserve/${reserva._id}/documents`, {
            headers: { Authorization: `Bearer ${token}` },
          })

          if (response.ok) {
            const data = await response.json()
            if (data.documentos && data.documentos.length > 0) {
              data.documentos.forEach((doc) => {
                allDocuments.push({
                  filename: doc,
                  reservaId: reserva._id,
                  serviceName: reserva.servicio?.titulo || "Servicio",
                  displayName: extractDisplayName(doc),
                })
              })
            }
          }
        } catch (error) {
          console.error(`Error loading documents for reservation ${reserva._id}:`, error)
        }
      }

      setDocuments(allDocuments)
    } catch (error) {
      console.error("Error loading documents:", error)
    } finally {
      setLoading(false)
    }
  }

  const extractDisplayName = (filename) => {
    // Extraer nombre legible del archivo (remover ID de reserva y timestamp)
    const parts = filename.split("_")
    if (parts.length >= 3) {
      return parts.slice(2).join("_")
    }
    return filename
  }

  const handleFileSelect = (e) => {
    const file = e.target.files[0]
    if (file) {
      if (file.type !== "application/pdf") {
        alert("Solo se permiten archivos PDF")
        return
      }
      setSelectedFile(file)
    }
  }

  const handleUpload = async () => {
    if (!selectedFile || !selectedReserva) return

    setUploading(true)
    try {
      const token = localStorage.getItem("token")
      const formData = new FormData()
      formData.append("document", selectedFile)

      const response = await fetch(`http://localhost:3001/api/reserve/${selectedReserva}/documents`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      })

      if (response.ok) {
        const data = await response.json()
        setShowUploadModal(false)
        setSelectedFile(null)
        setSelectedReserva(null)
        loadAllDocuments() // Recargar documentos
        onDocumentUploaded && onDocumentUploaded()
      } else {
        const errorData = await response.json()
        alert(`Error: ${errorData.error}`)
      }
    } catch (error) {
      console.error("Error uploading document:", error)
      alert("Error al subir el documento")
    } finally {
      setUploading(false)
    }
  }

  const handleDownload = async (doc) => {
    try {
      console.log("🔍 DEBUG Frontend - Intentando descargar:", {
        filename: doc.filename,
        reservaId: doc.reservaId,
        url: `http://localhost:3001/api/reserve/${doc.reservaId}/documents/${doc.filename}`,
      })

      const token = localStorage.getItem("token")

      // Crear la URL de descarga directa
      const downloadUrl = `http://localhost:3001/api/reserve/${doc.reservaId}/documents/${encodeURIComponent(doc.filename)}`

      const response = await fetch(downloadUrl, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      console.log("🔍 DEBUG Frontend - Response status:", response.status)

      if (response.ok) {
        // Obtener el blob del archivo
        const blob = await response.blob()

        // Crear URL temporal para el blob
        const blobUrl = window.URL.createObjectURL(blob)

        // Crear elemento de descarga
        const a = document.createElement("a")
        a.href = blobUrl
        a.download = doc.displayName
        a.style.display = "none"

        // Agregar al DOM, hacer click y remover
        document.body.appendChild(a)
        a.click()
        document.body.removeChild(a)

        // Limpiar la URL temporal
        window.URL.revokeObjectURL(blobUrl)

        console.log("✅ Descarga exitosa")
      } else {
        const errorText = await response.text()
        console.error("❌ Error en descarga:", response.status, errorText)
        alert("Error al descargar el documento: " + errorText)
      }
    } catch (error) {
      console.error("Error downloading document:", error)
      alert("Error al descargar el documento: " + error.message)
    }
  }

  const handleDelete = async (doc) => {
    if (!window.confirm(`¿Estás seguro de eliminar "${doc.displayName}"?`)) return

    try {
      const token = localStorage.getItem("token")
      const response = await fetch(`http://localhost:3001/api/reserve/${doc.reservaId}/documents/${doc.filename}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      })

      if (response.ok) {
        loadAllDocuments() // Recargar documentos
      } else {
        alert("Error al eliminar el documento")
      }
    } catch (error) {
      console.error("Error deleting document:", error)
      alert("Error al eliminar el documento")
    }
  }

  const getClientName = () => {
    return `${cliente.nombre || ""} ${cliente.apellido || ""}`.trim() || "Cliente"
  }

  const getClientInitials = () => {
    const name = getClientName()
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .substring(0, 2)
  }

  // Filtrar reservas que permiten subir documentos (Aceptado o Finalizado)
  const reservasParaDocumentos = reservas.filter(
    (r) =>
      r.estado?.toLowerCase() === "aceptado" ||
      r.estado?.toLowerCase() === "finalizado" ||
      r.estado?.toLowerCase() === "confirmed" ||
      r.estado?.toLowerCase() === "finished",
  )

  if (reservasParaDocumentos.length === 0) {
    return null // No mostrar cliente si no tiene reservas válidas
  }

  return (
    <div className="client-document-card">
      <div className="client-header">
        <div className="client-info">
          <div className="client-avatar-doc">{getClientInitials()}</div>
          <div className="client-details">
            <h3 className="client-name-doc">Para {getClientName()}</h3>
            <p className="client-reservations-count">
              {reservasParaDocumentos.length} reserva{reservasParaDocumentos.length !== 1 ? "s" : ""} activa
              {reservasParaDocumentos.length !== 1 ? "s" : ""}
            </p>
          </div>
        </div>
        <button
          className="upload-btn"
          onClick={() => setShowUploadModal(true)}
          disabled={reservasParaDocumentos.length === 0}
        >
          📄 Cargar documento
        </button>
      </div>

      {loading ? (
        <div className="documents-loading">Cargando documentos...</div>
      ) : (
        <div className="documents-list">
          {documents.length === 0 ? (
            <div className="no-documents">
              <p>No hay documentos subidos para este cliente</p>
            </div>
          ) : (
            <div className="documents-grid">
              {documents.map((doc, index) => (
                <div key={index} className="document-item">
                  <div className="document-icon">📄</div>
                  <div className="document-info">
                    <h4 className="document-name">{doc.displayName}</h4>
                    <p className="document-type">PDF</p>
                  </div>
                  <div className="document-actions">
                    <button className="download-btn" onClick={() => handleDownload(doc)} title="Descargar">
                      ⬇️
                    </button>
                    <button className="delete-btn" onClick={() => handleDelete(doc)} title="Eliminar">
                      🗑️
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Modal de subida */}
      {showUploadModal && (
        <div className="modal-overlay" onClick={() => setShowUploadModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Subir documento para {getClientName()}</h3>
              <button className="close-btn" onClick={() => setShowUploadModal(false)}>
                ✕
              </button>
            </div>

            <div className="modal-body">
              <div className="form-group">
                <label>Seleccionar reserva:</label>
                <select
                  value={selectedReserva || ""}
                  onChange={(e) => setSelectedReserva(e.target.value)}
                  className="form-select"
                >
                  <option value="">Selecciona una reserva</option>
                  {reservasParaDocumentos.map((reserva) => (
                    <option key={reserva._id} value={reserva._id}>
                      {reserva.servicio?.titulo} - {new Date(reserva.fechaInicio).toLocaleDateString()}
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label>Archivo PDF:</label>
                <input type="file" accept=".pdf" onChange={handleFileSelect} className="form-input" />
                {selectedFile && <p className="file-selected">Archivo seleccionado: {selectedFile.name}</p>}
              </div>
            </div>

            <div className="modal-actions">
              <button className="cancel-btn" onClick={() => setShowUploadModal(false)} disabled={uploading}>
                Cancelar
              </button>
              <button
                className="upload-confirm-btn"
                onClick={handleUpload}
                disabled={!selectedFile || !selectedReserva || uploading}
              >
                {uploading ? "Subiendo..." : "Subir documento"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default ClientDocumentCard

"use client"

import { useState, useEffect } from "react"
import DatePicker from "react-datepicker"
import "react-datepicker/dist/react-datepicker.css"
import es from "date-fns/locale/es"
import { registerLocale } from "react-datepicker"
import "../css/ReprogramarModal.css"

registerLocale("es", es)

const ReprogramarModal = ({ isOpen, onClose, reserva, onConfirm }) => {
  const [fecha, setFecha] = useState(null)
  const [horarios, setHorarios] = useState([])
  const [bloqueSeleccionado, setBloqueSeleccionado] = useState("")
  const [loadingHorarios, setLoadingHorarios] = useState(false)
  const [loading, setLoading] = useState(false)

  // Calcular fecha mínima en UTC para el calendario
  const getMinDateUTC = () => {
    const nowUTC = new Date();
    // Crear fecha en UTC para hoy
    const todayUTC = new Date(Date.UTC(
      nowUTC.getUTCFullYear(),
      nowUTC.getUTCMonth(),
      nowUTC.getUTCDate()
    ));
    
    // IMPORTANTE: El DatePicker trabaja en hora local, 
    // así que necesitamos ajustar para que muestre la fecha correcta
    const minDate = new Date(
      todayUTC.getUTCFullYear(),
      todayUTC.getUTCMonth(),
      todayUTC.getUTCDate()
    );
    
    return minDate;
  };

  // Calcular fecha máxima en UTC para el calendario (31 de diciembre de 2025)
  const getMaxDateUTC = () => {
    // Último día de 2025 en UTC
    const maxDateUTC = new Date(Date.UTC(2025, 11, 31)); // 31 de diciembre de 2025
    
    // Ajustar para DatePicker (hora local)
    const maxDate = new Date(
      maxDateUTC.getUTCFullYear(),
      maxDateUTC.getUTCMonth(),
      maxDateUTC.getUTCDate()
    );
    
    return maxDate;
  };

  // Resetear estado cuando se abre/cierra el modal
  useEffect(() => {
    if (isOpen) {
      setFecha(null)
      setHorarios([])
      setBloqueSeleccionado("")
    }
  }, [isOpen])

  // Cargar horarios disponibles cuando cambia la fecha
  useEffect(() => {
    if (!fecha || !reserva?.servicio?._id) return

    setLoadingHorarios(true)
    setBloqueSeleccionado("")

    const fechaISO = fecha.toISOString().split("T")[0]

    fetch(`http://localhost:3001/api/service/${reserva.servicio._id}/real-availability?fecha=${fechaISO}`)
      .then((res) => res.json())
      .then((data) => {
        setHorarios(data)
      })
      .catch((error) => {
        console.error("Error al cargar horarios:", error)
        setHorarios([])
      })
      .finally(() => {
        setLoadingHorarios(false)
      })
  }, [fecha, reserva])

  const handleConfirmar = async () => {
    if (!bloqueSeleccionado || !fecha) return

    setLoading(true)

    try {
      // Crear la fecha completa con la hora seleccionada
      const [h, m] = bloqueSeleccionado.split(":")
      const fechaHoraUTC = new Date(
        Date.UTC(fecha.getFullYear(), fecha.getMonth(), fecha.getDate(), Number(h), Number(m), 0, 0),
      )

      await onConfirm(fechaHoraUTC.toISOString())
      onClose()
    } catch (error) {
      console.error("Error al reprogramar:", error)
    } finally {
      setLoading(false)
    }
  }

  if (!isOpen) return null

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content reprogramar-modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>Reprogramar Sesión</h2>
          <button className="close-btn" onClick={onClose}>
            ✕
          </button>
        </div>

        <div className="reprogramar-content">
          <div className="session-info-reprogramar">
            <h3>
              {reserva?.clientName ||
                `${reserva?.cliente?.nombre || ""} ${reserva?.cliente?.apellido || ""}`.trim() ||
                "Cliente"}
            </h3>
            <p>{reserva?.serviceName || reserva?.servicio?.titulo || "Servicio"}</p>
          </div>

          <div className="reprogramar-body">
            {/* Calendario */}
            <div className="calendar-section">
              <h4>Seleccionar nueva fecha</h4>
              <div className="calendar-container">                <DatePicker
                  selected={fecha}
                  onChange={date => {
                    // IMPORTANTE: Convertir la fecha seleccionada a UTC
                    if (date) {
                      // Crear fecha UTC usando los valores de la fecha local seleccionada
                      const utcDate = new Date(Date.UTC(
                        date.getFullYear(),
                        date.getMonth(),
                        date.getDate(),
                        12, 0, 0 // Usar mediodía UTC para evitar problemas de zona horaria
                      ));
                      setFecha(utcDate);
                      console.log(`[ReprogramarModal] Fecha seleccionada convertida a UTC: ${utcDate.toISOString()}`);
                    } else {
                      setFecha(null);
                    }
                  }}
                  minDate={getMinDateUTC()} // Fecha mínima seleccionable (hoy)
                  maxDate={getMaxDateUTC()} // Fecha máxima seleccionable (31 dic 2025)
                  dateFormat="dd/MM/yyyy"
                  inline
                  calendarStartDay={1}
                  locale="es"
                />
              </div>
            </div>

            {/* Horarios disponibles */}
            <div className="horarios-section">
              <h4>Horarios disponibles</h4>
              {!fecha ? (
                <div className="no-date-selected">Selecciona una fecha para ver los horarios disponibles</div>
              ) : loadingHorarios ? (
                <div className="loading-horarios">Cargando horarios...</div>
              ) : horarios.length === 0 ? (
                <div className="no-horarios">No hay horarios disponibles para la fecha seleccionada</div>              ) : (
                <div className="horarios-grid">
                  {horarios.map((horario, index) => {
                    // Verificar si el horario ya pasó en UTC
                    let disabled = false;
                    if (fecha) {
                      // Obtener fecha y hora actual en UTC
                      const nowUTC = new Date();
                      const isTodayUTC = // Se calcula si la fecha seleccionada es hoy en UTC
                        fecha.getUTCFullYear() === nowUTC.getUTCFullYear() &&
                        fecha.getUTCMonth() === nowUTC.getUTCMonth() &&
                        fecha.getUTCDate() === nowUTC.getUTCDate();

                      if (isTodayUTC) {
                        // horario = "HH:mm"
                        const [hh, mm] = horario.split(":").map(Number);
                        const bloqueDateUTC = new Date(Date.UTC(
                          fecha.getUTCFullYear(),
                          fecha.getUTCMonth(),
                          fecha.getUTCDate(),
                          hh,
                          mm,
                          0,
                          0
                        ));
                        
                        if (bloqueDateUTC <= nowUTC) { //Si el horario ya paso en UTC, se marca como deshabilitado
                          disabled = true;
                        }
                        console.log(`[ReprogramarModal] Comparando bloque ${horario} (${bloqueDateUTC.toISOString()}) con ahora (${nowUTC.toISOString()}) - Deshabilitado: ${disabled}`);
                      }
                    }

                    return (
                      <button
                        key={index}
                        type="button"
                        className={`horario-btn ${bloqueSeleccionado === horario ? "selected" : ""} ${disabled ? "disabled" : ""}`}
                        onClick={() => !disabled && setBloqueSeleccionado(horario)}
                        disabled={disabled}
                        title={disabled ? "Este horario ya pasó" : ""}
                        style={{
                          backgroundColor: disabled 
                            ? "#f6f6f6" 
                            : bloqueSeleccionado === horario 
                            ? "#e6f0ff" 
                            : "#fff",
                          color: disabled ? "#bbb" : "#222",
                          cursor: disabled ? "not-allowed" : "pointer",
                          opacity: disabled ? 0.6 : 1
                        }}
                      >
                        <span className="horario-icon">🕐</span>
                        {horario.length === 5 ? horario : horario + ":00"}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          </div>

          <div className="modal-actions">
            <button className="cancel-btn" onClick={onClose} disabled={loading}>
              Cancelar
            </button>
            <button
              className="confirm-btn"
              onClick={handleConfirmar}
              disabled={!bloqueSeleccionado || !fecha || loading}
            >
              {loading ? "Reprogramando..." : "Confirmar Reprogramación"}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ReprogramarModal

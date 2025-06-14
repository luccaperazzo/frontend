"use client"

import { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"
import Layout from "../../../layout/js/Layout" // Ajusta la ruta según tu estructura
import dayjs from "dayjs"
import utc from "dayjs/plugin/utc"
import "../css/MiEspacioEntrenador.css"
import ServiceCard from "../../comps/js/ServiceCard"
import EditarServicioModal from "../../comps/js/EditarServicioModal"
import SessionCard from "../../comps/js/SessionCard"
import ReprogramarModal from "../../comps/js/ReprogramarModal"
import ClientDocumentCard from "../../comps/js/ClientDocumentCard"

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
  const [showServiceModal, setShowServiceModal] = useState(false)
  const [isEditingService, setIsEditingService] = useState(false)
  const [selectedService, setSelectedService] = useState(null)

  // — Estado para reprogramación —
  const [showReprogramar, setShowReprogramar] = useState(false)
  const [reservaToReschedule, setReservaToReschedule] = useState(null)

  // — Estado para documentos —
  const [clientesConReservas, setClientesConReservas] = useState([])
  const [loadingDocuments, setLoadingDocuments] = useState(false)

  // Add after the existing state declarations
  const [userData, setUserData] = useState(null)
  const [loadingUser, setLoadingUser] = useState(true)

  // Cantidad de Servicios por página (paginación)
  const PAGE_SIZE_SERVICIO = 6;
  const [currentPageServicio, setCurrentPageServicio] = useState(1);

  // Cantidad de sesiones por página (paginación)
  const PAGE_SIZE_SESIONES = 6;
  const [currentPageSesiones, setCurrentPageSesiones] = useState(1);

  // Cantidad de clientes-documentos por página
  const PAGE_SIZE_DOCUMENTOS = 4;
  const [currentPageDocumentos, setCurrentPageDocumentos] = useState(1);

  // Filtros de sesiones (para entrenadores)
  const [filtroCliente, setFiltroCliente] = useState("");
  const [filtroEstado, setFiltroEstado] = useState("");
  const [filtroFecha, setFiltroFecha] = useState("");

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
        // Procesar clientes para documentos
        processClientsForDocuments(data)
      })
      .catch((error) => {
        console.error("Error al cargar reservas:", error)
        setLoadingReservas(false)
      })
  }, [])

  // Add this useEffect after the existing ones
  useEffect(() => {
    const token = localStorage.getItem("token")
    fetch("http://localhost:3001/api/auth/me", {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((response) => response.json())
      .then((data) => {
        setUserData(data)
        setLoadingUser(false)
      })
      .catch((error) => {
        console.error("Error al cargar datos del usuario:", error)
        setLoadingUser(false)
      })
  }, [])

  // — Procesar clientes para la sección de documentos —
  const processClientsForDocuments = (reservasData) => {
    // Agrupar reservas por cliente
    const clientesMap = new Map()

    reservasData.forEach((reserva) => {
      // Solo incluir reservas aceptadas o finalizadas
      const estadoValido = ["aceptado", "confirmed", "finalizado", "finished"].includes(reserva.estado?.toLowerCase())

      if (estadoValido && reserva.cliente) {
        const clienteId = reserva.cliente._id || reserva.cliente.id

        if (!clientesMap.has(clienteId)) {
          clientesMap.set(clienteId, {
            cliente: reserva.cliente,
            reservas: [],
          })
        }

        clientesMap.get(clienteId).reservas.push(reserva)
      }
    })

    // Convertir Map a Array
    const clientesArray = Array.from(clientesMap.values())
    setClientesConReservas(clientesArray)
  }

  // — Cálculo de paginado de servicios —
  const totalPages = Math.ceil(servicios.length / PAGE_SIZE_SERVICIO);
  // Array de servicios a mostrar en la página actual
  const paginatedServicios = servicios.slice(
    (currentPageServicio - 1) * PAGE_SIZE_SERVICIO,
    currentPageServicio * PAGE_SIZE_SERVICIO
  );

  // — Cálculo de paginado de Documentos —
  const totalPagesDocumentos = Math.ceil(clientesConReservas.length / PAGE_SIZE_DOCUMENTOS);
  const paginatedClientesConReservas = clientesConReservas.slice(
    (currentPageDocumentos - 1) * PAGE_SIZE_DOCUMENTOS,
    currentPageDocumentos * PAGE_SIZE_DOCUMENTOS
  );

  // Filtrar sesiones según los filtros seleccionados
  const reservasFiltradas = reservas.filter(reserva => {
    const clienteNombre = (reserva.cliente?.nombre || "").toLowerCase();
    const clienteApellido = (reserva.cliente?.apellido || "").toLowerCase();

    const matchCliente =
      !filtroCliente ||
      clienteNombre.includes(filtroCliente.toLowerCase()) ||
      clienteApellido.includes(filtroCliente.toLowerCase());

    const matchEstado =
      !filtroEstado || (reserva.estado && reserva.estado.toLowerCase() === filtroEstado.toLowerCase());

    const matchFecha =
      !filtroFecha ||
      (reserva.fechaInicio && reserva.fechaInicio.slice(0, 10) === filtroFecha);

    return matchCliente && matchEstado && matchFecha;
  });

  // — Cálculo de paginado de sesiones —
  const totalPagesSesiones = Math.ceil(reservasFiltradas.length / PAGE_SIZE_SESIONES);
  // Array de sesiones a mostrar en la página actual
  const paginatedReservas = reservasFiltradas.slice(
    (currentPageSesiones - 1) * PAGE_SIZE_SESIONES,
    currentPageSesiones * PAGE_SIZE_SESIONES
  );

  // Cuando se actualizan las reservas, volvemos a la primera página por si cambia la cantidad
  useEffect(() => {
    setCurrentPageSesiones(1);
  }, [reservas]);

  // Cuando se actualizan las reservas, volvemos a la primera página de los documentos por si cambia la cantidad
  useEffect(() => {
    setCurrentPageDocumentos(1);
  }, [clientesConReservas]);

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

  // — Manejar creación/edición de servicio —
  const handleServiceUpdated = (updatedService, isEditing) => {
    if (isEditing) {
      // Actualizar servicio existente
      setServicios((prev) => prev.map((s) => (s._id === updatedService._id ? updatedService : s)))
    } else {
      // Agregar nuevo servicio
      setServicios((prev) => [updatedService, ...prev])
    }
  }

  // — Manejar edición de servicio —
  const handleEditService = (servicio) => {
    setSelectedService(servicio)
    setIsEditingService(true)
    setShowServiceModal(true)
  }

  // — Manejar creación de nuevo servicio —
  const handleCreateService = () => {
    setSelectedService(null)
    setIsEditingService(false)
    setShowServiceModal(true)
  }

  // — Cerrar modal de servicio —
  const handleCloseServiceModal = () => {
    setShowServiceModal(false)
    setIsEditingService(false)
    setSelectedService(null)
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

  // — Función para manejar documento subido —
  const handleDocumentUploaded = () => {
    // Recargar datos si es necesario
    console.log("Documento subido exitosamente")
  }

  return (
    <Layout>
      <div className="mi-espacio-entrenador">
        {/* Header con título y botón métricas */}
        <div className="header-section">
          <div className="title-section">
            <h1 className="main-title">MI ESPACIO</h1>
            {!loadingUser && userData && (
              <div className="user-info">
                <span className="user-name">
                  {userData.nombre} {userData.apellido}
                </span>
                <span className="user-role">Entrenador</span>
              </div>
            )}
            <p className="subtitle">Gestiona tus sesiones, servicios y documentos compartidos con cada cliente.</p>
          </div>
          <button className="metricas-btn" onClick={() => navigate("/metrics")}>
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

              {/* --- Filtros de Sesiones --- */}
              <div className="filtros-sesiones">
                <div>
                  <label>Cliente<br />
                    <input
                      type="text"
                      value={filtroCliente}
                      onChange={e => setFiltroCliente(e.target.value)}
                      placeholder="Buscar por nombre"
                      className="filtro-sesion-input"
                    />
                  </label>
                </div>
                <div>
                  <label>Estado<br />
                    <select
                      value={filtroEstado}
                      onChange={e => setFiltroEstado(e.target.value)}
                      className="filtro-sesion-input"
                    >
                      <option value="">Todos</option>
                      <option value="Pendiente">Pendiente</option>
                      <option value="Aceptado">Confirmado</option>
                      <option value="Cancelado">Cancelado</option>
                      <option value="Finalizado">Finalizado</option>
                    </select>
                  </label>
                </div>
                <div>
                  <label>Fecha<br />
                    <input
                      type="date"
                      value={filtroFecha}
                      onChange={e => setFiltroFecha(e.target.value)}
                      className="filtro-sesion-input"
                    />
                  </label>
                </div>
                <button
                  className="limpiar-btn"
                  onClick={() => { setFiltroCliente(""); setFiltroEstado(""); setFiltroFecha(""); }}
                >
                  Limpiar
                </button>
              </div>
              {loadingReservas ? (
                <div className="loading-state">Cargando sesiones...</div>
              ) : (
                <div className="reservas-container">
                  {reservas.length === 0 ? (
                    <div className="empty-state">
                      <p>No tienes sesiones programadas</p>
                    </div>
                  ) : (
                    <>
                      {paginatedReservas.map((reserva) => (
                        <SessionCard
                          key={reserva._id || reserva.id}
                          reserva={reserva}
                          onAction={handleReservaAction}
                          onReprogramar={handleReprogramar}
                        />
                      ))}
                      {/* Paginado de sesiones: solo si hay más de una página */}
                      {totalPagesSesiones > 1 && (
                        <div className="pagination-controls" style={{ display: "flex", gap: 8, alignItems: "center", justifyContent: "center", marginTop: 24 }}>
                          <button
                            disabled={currentPageSesiones === 1}
                            onClick={() => setCurrentPageSesiones(currentPageSesiones - 1)}
                          >
                            Anterior
                          </button>
                          <span>
                            Página {currentPageSesiones} de {totalPagesSesiones}
                          </span>
                          <button
                            disabled={currentPageSesiones === totalPagesSesiones}
                            onClick={() => setCurrentPageSesiones(currentPageSesiones + 1)}
                          >
                            Siguiente
                          </button>
                        </div>
                      )}
                    </>
                  )}
                </div>
              )}
            </div>
          )}

          {activeTab === "documentos" && (
            <div className="documentos-content">
              <h2 className="section-title">Mis documentos</h2>
              <p className="section-subtitle">Planes de entrenamiento y recursos de tus clientes</p>

              {loadingReservas ? (
                <div className="loading-state">Cargando clientes...</div>
              ) : (
                <div className="clients-documents-container">
                  {clientesConReservas.length === 0 ? (
                    <div className="empty-state">
                      <p>No tienes clientes con reservas activas para compartir documentos</p>
                    </div>
                  ) : (
                    <>
                      {paginatedClientesConReservas.map((clienteData) => (
                        <ClientDocumentCard
                          key={clienteData.cliente._id || clienteData.cliente.id}
                          cliente={clienteData.cliente}
                          reservas={clienteData.reservas}
                          onDocumentUploaded={handleDocumentUploaded}
                        />
                      ))}
                      {totalPagesDocumentos > 1 && (
                        <div
                          className="pagination-controls"
                          style={{
                            display: "flex",
                            gap: 8,
                            alignItems: "center",
                            justifyContent: "center",
                            marginTop: 24,
                          }}
                        >
                          <button
                            disabled={currentPageDocumentos === 1}
                            onClick={() => setCurrentPageDocumentos(currentPageDocumentos - 1)}
                          >
                            Anterior
                          </button>
                          <span>
                            Página {currentPageDocumentos} de {totalPagesDocumentos}
                          </span>
                          <button
                            disabled={currentPageDocumentos === totalPagesDocumentos}
                            onClick={() => setCurrentPageDocumentos(currentPageDocumentos + 1)}
                          >
                            Siguiente
                          </button>
                        </div>
                      )}
                    </>
                  )}
                </div>
              )}
            </div>
          )}

          {activeTab === "servicios" && (
            <div className="servicios-content">
              <div className="servicios-header">
                <div>
                  <h2 className="section-title">Servicios</h2>
                  <p className="section-subtitle">Administra tus servicios y tarifas</p>
                </div>
                <button className="crear-servicio-btn" onClick={handleCreateService}>
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
                      <button className="crear-primer-servicio-btn" onClick={handleCreateService}>
                        Crear tu primer servicio
                      </button>
                    </div>
                  ) : (
                    paginatedServicios.map((servicio) => (
                      <ServiceCard
                        key={servicio._id}
                        servicio={servicio}
                        onEdit={handleEditService}
                        onDelete={handleDeleteService}
                        onTogglePublish={handleTogglePublishService}
                      />
                    ))
                  )}
                  {/* Paginado de servicios: solo si hay más de una página */}
                  {totalPages > 1 && (
                    <div className="pagination-controls" style={{ display: "flex", gap: 8, alignItems: "center", justifyContent: "center", marginTop: 16 }}>
                      <button
                        disabled={currentPageServicio === 1}
                        onClick={() => setCurrentPageServicio(currentPageServicio - 1)}
                      >
                        Anterior
                      </button>
                      <span>
                        Página {currentPageServicio} de {totalPages}
                      </span>
                      <button
                        disabled={currentPageServicio === totalPages}
                        onClick={() => setCurrentPageServicio(currentPageServicio + 1)}
                      >
                        Siguiente
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Modal de crear/editar servicio */}
        <EditarServicioModal
          isOpen={showServiceModal}
          onClose={handleCloseServiceModal}
          onServiceUpdated={handleServiceUpdated}
          servicio={selectedService}
          isEditing={isEditingService}
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

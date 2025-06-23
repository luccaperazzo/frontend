import React, { useEffect, useState , useRef} from "react";
import { useParams } from "react-router-dom";
import Layout from "../../layout/js/Layout";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import es from "date-fns/locale/es";            // ①
import { registerLocale } from "react-datepicker";

// Registrar el locale español para el calendario
registerLocale("es", es);                        // ②

/**
 * Página de detalle de un servicio.
 * Permite ver la información del servicio, seleccionar una fecha y horario disponible,
 * y realizar la reserva y pago a través de Stripe.
 */
const DetalleServicio = () => {
  // Obtener el ID del servicio desde la URL
  const { id } = useParams();

  // Estado para los datos del servicio y control de carga
  const [servicio, setServicio] = useState(null);
  const [loading, setLoading] = useState(true);
  const hasFetched = useRef(false); // Para evitar múltiples fetchs
  // Estados para el calendario y la selección de horarios
  const [fecha, setFecha] = useState(null); // Fecha seleccionada
  const [horarios, setHorarios] = useState([]); // Horarios disponibles para la fecha
  const [bloqueSeleccionado, setBloqueSeleccionado] = useState(""); // Horario elegido
  const [loadingHorarios, setLoadingHorarios] = useState(false); // Cargando horarios
  const [bookingLoading, setBookingLoading] = useState(false); // Cargando reserva/pago
  // NUEVO: Leer el usuario y rol desde localStorage
  const user = JSON.parse(localStorage.getItem("user") || "null");
  const role = localStorage.getItem("role");  // Calcular fecha mínima en UTC para el calendario
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
    
    console.log(`Fecha mínima UTC: ${todayUTC.toISOString()}`);
    console.log(`Fecha mínima para DatePicker: ${minDate.toISOString()}`);
    
    return minDate;  };

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
    
    console.log(`Fecha máxima UTC: ${maxDateUTC.toISOString()}`);
    console.log(`Fecha máxima para DatePicker: ${maxDate.toISOString()}`);
    
    return maxDate;
  };

  // Básicamente estableces la variable de estado `servicio` con el servicio que obtuviste del backend.
  useEffect(() => {
    if (hasFetched.current) return;       // 🚩 si ya corrimos, salimos
    hasFetched.current = true;            // marcamos que ya corrimos

    const fetchServicio = async () => {
      try {
        // Obtener token del localStorage si existe
        const token = localStorage.getItem("token");
        
        // Preparar headers, incluir Authorization si hay token
        const headers = {
          "Content-Type": "application/json"
        };
        
        if (token) {
          headers.Authorization = `Bearer ${token}`;
        }
        
        const res = await fetch(`http://localhost:3001/api/service/${id}`, {
          method: "GET",
          headers: headers
        });
        const data = await res.json();
        setServicio(data);
      } catch {
        setServicio(null); // Si hay error, setear servicio a null
      } finally {
        setLoading(false); // Marcar que ya terminó de cargar
      }
    };

    fetchServicio();
  }, [id]);// Cada vez que clickeas una fecha, se actualiza el estado de fecha y se limpian horarios.
  useEffect(() => {
    if (!fecha || !servicio) return;
    setLoadingHorarios(true);
    setBloqueSeleccionado(""); // reset al cambiar fecha
    
    // Convertir fecha a UTC para enviar al backend
    const fechaUTC = new Date(Date.UTC(
      fecha.getUTCFullYear(),
      fecha.getUTCMonth(), 
      fecha.getUTCDate()
    ));
    const fechaISO = fechaUTC.toISOString().split("T")[0];
    console.log(`Fecha seleccionada (UTC): ${fechaISO}`); // Log para depuración
    
    fetch(`http://localhost:3001/api/service/${servicio._id}/real-availability?fecha=${fechaISO}`)
      .then(res => res.json())
      .then(setHorarios)
      .catch(() => setHorarios([]))
      .finally(() => setLoadingHorarios(false));
  }, [fecha, servicio]);

  /**
   * Handler para reservar y redirigir a Stripe.
   * Toma la fecha y horario seleccionados, crea la sesión de pago y redirige.
   */
  const handleReservaYStripe = async () => {
    if (!bloqueSeleccionado || !fecha) return;
    setBookingLoading(true);    try {
      // Armá la fecha completa, fusionando fecha con la hora seleccionada (bloque) para formar la fecha que mandas al backend
      const [h, m] = bloqueSeleccionado.split(":");
      const fechaHoraUTC = new Date(Date.UTC(
        fecha.getUTCFullYear(),
        fecha.getUTCMonth(),
        fecha.getUTCDate(),
        Number(h),
        Number(m),
        0,
        0      ));
      
      // 🚀 LOGS PARA VER QUÉ SE ENVÍA AL BACKEND
      console.log('🎯 === DATOS DE RESERVA ===');
      console.log('📅 Fecha seleccionada:', fecha);
      console.log('⏰ Horario seleccionado:', bloqueSeleccionado);
      console.log('🌍 Fecha y hora final enviada al backend (UTC):', fechaHoraUTC.toISOString());
      console.log('📦 JSON que se envía:', JSON.stringify({
        serviceId: servicio._id,
        fechaInicio: fechaHoraUTC.toISOString()
      }, null, 2));

      // Llamá al backend para crear la sesión de pago (pasando fechaInicio en metadata)
      const token = localStorage.getItem("token");
      const res = await fetch("http://localhost:3001/api/payment/create-checkout-session", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({
          serviceId: servicio._id,
          fechaInicio: fechaHoraUTC.toISOString()
        })
      });
      const data = await res.json();


      if (!res.ok) {
        // si status es 400 muestra mensaje y no redirige
        alert(data.message || "No se pudo crear la reserva, ya existe una reserva para esa fecha y hora.");
        setBookingLoading(false); // <--- ¡Asegurate de ponerlo aquí!
        return;
      }


      if (data.url) {
        window.location.href = data.url; // Redirigí a Stripe
      } else {
        alert("No se pudo iniciar el pago");
      }
    } catch (err) {
      alert("Ocurrió un error al iniciar el pago.");
    }
    setBookingLoading(false);
  };

  // Renderizado condicional según el estado de carga y existencia del servicio
  if (loading) return <Layout><div>Cargando servicio...</div></Layout>;
  if (!servicio) return <Layout><div>No se encontró el servicio.</div></Layout>;
  // Detectar si estamos en móvil
  const isMobile = window.innerWidth <= 768;

  // Render principal de la página
  return (
    <Layout>
      <div style={{
        maxWidth: 700,
        margin: isMobile ? "20px auto" : "40px auto",
        background: "#fff",
        borderRadius: 15,
        boxShadow: "0 2px 10px #0001",
        padding: isMobile ? 20 : 38
      }}>
        {/* Título y datos principales del servicio */}
        <h1 style={{ fontSize: "2.1rem", fontWeight: 700, marginBottom: 8 }}>{servicio.titulo}</h1>
        <div style={{ color: "#999", fontSize: 16, marginBottom: 18 }}>
          Categoría: <b>{servicio.categoria}</b> &nbsp;
          • Duración: <b>{servicio.duracion} min</b>
        </div>
        <div style={{ color: "#333", fontSize: 17, marginBottom: 19 }}>
          {servicio.descripcion || "Sin descripción detallada"}
        </div>
        <div style={{ color: "#444", fontWeight: 600, fontSize: 22, marginBottom: 11 }}>
          Precio: ${servicio.precio?.toLocaleString("es-AR")}
        </div>
        <div style={{ color: "#666", fontSize: 16, marginBottom: 13 }}>
          Modalidad: <b>{servicio.presencial ? "Presencial" : "Virtual"}</b>
        </div>
        <div style={{
          marginTop: 24,
          color: "#222",
          borderTop: "1.5px solid #f2f2f2",
          paddingTop: 16
        }}>
          <b>Entrenador:</b> {servicio.entrenador?.nombre} {servicio.entrenador?.apellido}
        </div>        {/* Calendario y bloques horarios */}
        <div style={{ 
          display: "flex", 
          flexDirection: isMobile ? "column" : "row",
          gap: isMobile ? 24 : 32, 
          alignItems: "flex-start", 
          marginTop: 35 
        }}>
          {/* Calendario para seleccionar fecha */}
          <div style={{ width: isMobile ? "100%" : "auto" }}>
            <b style={{ fontSize: 18 }}>Seleccione una fecha</b>
            <div style={{ marginTop: 8 }}>
              <DatePicker
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
                    console.log(`Fecha seleccionada convertida a UTC: ${utcDate.toISOString()}`);
                  } else {
                    setFecha(null);
                  }                }}
                minDate={getMinDateUTC()} // Fecha mínima seleccionable en el calendario
                maxDate={getMaxDateUTC()} // Fecha máxima seleccionable (31 dic 2025)
                dateFormat="dd/MM/yyyy"
                inline
                calendarStartDay={1}
                locale="es"
                disabled={role === "entrenador"}
              />
            </div>
          </div>
          {/* Horarios disponibles para la fecha seleccionada */}
          <div style={{ flex: 1, width: isMobile ? "100%" : "auto" }}>
            <b style={{ fontSize: 19, marginBottom: 12, display: "block" }}>Horarios Disponibles</b>
            {/* Si es entrenador, mostrar mensaje y no mostrar horarios */}
            {role === "entrenador" ? (
              <div style={{ color: "#d00", margin: "20px 0", fontWeight: 600 }}>
                Los entrenadores no pueden reservar servicios.
              </div>
            ) : loadingHorarios ? (
              <div style={{ color: "#999", margin: "20px 0" }}>Cargando horarios...</div>
            ) : horarios.length === 0 && fecha ? (
              <div style={{ color: "#999", margin: "20px 0" }}>No hay horarios disponibles para la fecha seleccionada.</div>
            ) : (              <div style={{
                display: "grid",
                gridTemplateColumns: isMobile ? "1fr" : "repeat(2, 1fr)",
                gap: 18
              }}>{horarios.map((h, i) => {
                  // --- NUEVO BLOQUE: deshabilitar si ya pasó en UTC ---
                  let disabled = false;
                  if (fecha) {
                    // Obtener fecha y hora actual en UTC
                    const nowUTC = new Date();
                    const isTodayUTC = // Se calcula si la fecha seleccionada es hoy en UTC
                      fecha.getUTCFullYear() === nowUTC.getUTCFullYear() &&
                      fecha.getUTCMonth() === nowUTC.getUTCMonth() &&
                      fecha.getUTCDate() === nowUTC.getUTCDate();

                    if (isTodayUTC) {
                      // h = "HH:mm"
                      const [hh, mm] = h.split(":").map(Number);
                      const bloqueDateUTC = new Date(Date.UTC(
                        fecha.getUTCFullYear(),
                        fecha.getUTCMonth(),
                        fecha.getUTCDate(),
                        hh,
                        mm,
                        0,
                        0
                      ));
                      // Log para ver qué horas se están comparando

                      if (bloqueDateUTC <= nowUTC) { //Si el horario ya paso en UTC, se marca como deshabilitado
                        disabled = true;
                      }
                      console.log(`Comparando bloque ${h} (${bloqueDateUTC.toISOString()}) con ahora (${nowUTC.toISOString()}) - Deshabilitado: ${disabled}`);
                    }
                  }
                  return (
                    <button
                      key={i}
                      type="button"
                      style={{
                        display: "flex",
                        alignItems: "center",
                        border: bloqueSeleccionado === h ? "2px solid #222" : "1.2px solid #bbb",
                        borderRadius: 6,
                        padding: "7px 15px",
                        fontSize: 16,
                        background: disabled
                          ? "#f6f6f6"
                          : bloqueSeleccionado === h
                          ? "#e6f0ff"
                          : "#fff",
                        color: disabled ? "#bbb" : "#222",
                        fontWeight: bloqueSeleccionado === h ? 700 : 500,
                        cursor: disabled
                          ? "not-allowed"
                          : bloqueSeleccionado && !disabled
                          ? "pointer"
                          : "pointer"
                      }}
                      onClick={() => !disabled && setBloqueSeleccionado(h)} // Si el horario no está deshabilitado, se asigna como bloque seleccionado
                      disabled={disabled || role === "entrenador"}
                      title={role === "entrenador" ? "Los entrenadores no pueden reservar" : (disabled ? "Este horario ya pasó" : "")}
                    >
                      <span role="img" aria-label="calendario" style={{ marginRight: 9 }}>📅</span>
                      {h.length === 5 ? h : (h + ":00")}
                    </button>
                  );
                })}
              </div>
            )}
            {/* Botón de confirmación de reserva y pago */}
            <div style={{ marginTop: 36 }}>
              <button
                style={{
                  padding: "12px 28px",
                  fontWeight: 700,
                  fontSize: 16,
                  borderRadius: 8,
                  border: "none",
                  background: bloqueSeleccionado && fecha && role !== "entrenador" ? "#222" : "#ccc",
                  color: "#fff",
                  cursor: bloqueSeleccionado && fecha && role !== "entrenador" ? "pointer" : "not-allowed",
                  float: "right"
                }}
                disabled={!bloqueSeleccionado || !fecha || bookingLoading || role === "entrenador"}
                onClick={handleReservaYStripe}
              >
                {role === "entrenador"                 //si el rol es entrenador, no se puede reservar, si no lo es, se muestra el texto de reserva y pago

                  ? "No puedes reservar"
                  : (bookingLoading ? "Procesando..." : "Reservar y Pagar")}
              </button>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default DetalleServicio;

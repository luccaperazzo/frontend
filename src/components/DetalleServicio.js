import React, { useEffect, useState , useRef} from "react";
import { useParams } from "react-router-dom";
import Layout from "./Layout";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import es from "date-fns/locale/es";            // ①
import { registerLocale } from "react-datepicker";

registerLocale("es", es);                        // ②


const DetalleServicio = () => {
  const { id } = useParams();
  const [servicio, setServicio] = useState(null);
  const [loading, setLoading] = useState(true);
  const hasFetched = useRef(false);

  // Para el calendario y bloques horarios
  const [fecha, setFecha] = useState(null);
  const [horarios, setHorarios] = useState([]);
  const [bloqueSeleccionado, setBloqueSeleccionado] = useState("");
  const [loadingHorarios, setLoadingHorarios] = useState(false);
  const [bookingLoading, setBookingLoading] = useState(false);

  useEffect(() => {
    if (hasFetched.current) return;       // 🚩 si ya corrimos, salimos
    hasFetched.current = true;            // marcamos que ya corrimos

    const fetchServicio = async () => {
      try {
        const res = await fetch(`http://localhost:3001/api/service/${id}`);
        const data = await res.json();
        setServicio(data);
      } catch {
        setServicio(null);
      } finally {
        setLoading(false);
      }
    };

    fetchServicio();
  }, [id]);
  // Cuando cambia la fecha, traé los bloques horarios disponibles
  useEffect(() => {
    if (!fecha || !servicio) return;
    setLoadingHorarios(true);
    setBloqueSeleccionado(""); // reset al cambiar fecha
    const fechaISO = fecha.toISOString().split("T")[0];
    fetch(`http://localhost:3001/api/service/${servicio._id}/real-availability?fecha=${fechaISO}`)
      .then(res => res.json())
      .then(setHorarios)
      .catch(() => setHorarios([]))
      .finally(() => setLoadingHorarios(false));
  }, [fecha, servicio]);

  // Handler de reserva y pago
  const handleReservaYStripe = async () => {
    if (!bloqueSeleccionado || !fecha) return;
    setBookingLoading(true);

    try {
      // Armá la fecha completa con la hora seleccionada (bloque)
      const [h, m] = bloqueSeleccionado.split(":");
      const fechaHoraUTC = new Date(Date.UTC(
        fecha.getFullYear(),
        fecha.getMonth(),
        fecha.getDate(),
        Number(h),
        Number(m),
        0,
        0
      ));

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

  if (loading) return <Layout><div>Cargando servicio...</div></Layout>;
  if (!servicio) return <Layout><div>No se encontró el servicio.</div></Layout>;

  return (
    <Layout>
      <div style={{
        maxWidth: 700,
        margin: "40px auto",
        background: "#fff",
        borderRadius: 15,
        boxShadow: "0 2px 10px #0001",
        padding: 38
      }}>
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
        </div>
        {/* Calendario y bloques horarios */}
        <div style={{ display: "flex", gap: 32, alignItems: "flex-start", marginTop: 35 }}>
          {/* Calendario */}
          <div>
            <b style={{ fontSize: 18 }}>Seleccione una fecha</b>
            <div style={{ marginTop: 8 }}>
              <DatePicker
                selected={fecha}
                onChange={date => setFecha(date)}
                minDate={new Date()}
                dateFormat="dd/MM/yyyy"
                inline
                calendarStartDay={1}
                locale="es"
              />
            </div>
          </div>
          {/* Horarios disponibles */}
          <div style={{ flex: 1 }}>
            <b style={{ fontSize: 19, marginBottom: 12, display: "block" }}>Horarios Disponibles</b>
            {loadingHorarios ? (
              <div style={{ color: "#999", margin: "20px 0" }}>Cargando horarios...</div>
            ) : horarios.length === 0 && fecha ? (
              <div style={{ color: "#999", margin: "20px 0" }}>No hay horarios disponibles para la fecha seleccionada.</div>
            ) : (
              <div style={{
                display: "grid",
                gridTemplateColumns: "repeat(2, 1fr)",
                gap: 18
              }}>
                {horarios.map((h, i) => (
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
                      background: bloqueSeleccionado === h ? "#e6f0ff" : "#fff",
                      color: "#222",
                      fontWeight: bloqueSeleccionado === h ? 700 : 500,
                      cursor: "pointer"
                    }}
                    onClick={() => setBloqueSeleccionado(h)}
                  >
                    <span role="img" aria-label="calendario" style={{ marginRight: 9 }}>📅</span>
                    {h.length === 5 ? h : (h + ":00")}
                  </button>
                ))}
              </div>
            )}
            {/* Botón de confirmación */}
            <div style={{ marginTop: 36 }}>
              <button
                style={{
                  padding: "12px 28px",
                  fontWeight: 700,
                  fontSize: 16,
                  borderRadius: 8,
                  border: "none",
                  background: bloqueSeleccionado && fecha ? "#222" : "#ccc",
                  color: "#fff",
                  cursor: bloqueSeleccionado && fecha ? "pointer" : "not-allowed",
                  float: "right"
                }}
                disabled={!bloqueSeleccionado || !fecha || bookingLoading}
                onClick={handleReservaYStripe}
              >
                {bookingLoading ? "Procesando..." : "Reservar y Pagar"}
              </button>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default DetalleServicio;

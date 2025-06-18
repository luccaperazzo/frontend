import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import Layout from "../../layout/js/Layout";
import "../css/PerfilEntrenador.css"; // Asegúrate de tener este CSS para estilos
import { useNavigate } from "react-router-dom";

/**
 * formateaTiempo
 * Formatea una fecha en string relativo (ej: "Hace 2 días").
 * Maneja fechas en UTC para consistencia con el backend.
 * @param {string|Date} fecha - Fecha a formatear.
 * @returns {string} - Texto relativo al tiempo transcurrido.
 */
function formateaTiempo(fecha) {
  if (!fecha) return "";
  
  // Crear objetos Date y trabajar directamente con getTime() para UTC
  const f = new Date(fecha);
  const ahora = new Date();

  console.log("Fecha de la reseña:", f, "Fecha actual:", ahora);

  // getTime() ya devuelve milisegundos UTC desde epoch
  const fechaUTC = f.getTime();
  const ahoraUTC = ahora.getTime();
  


  console.log("Fecha de la reseña (ISO):", f.toISOString(), "Fecha actual (ISO):", ahora.toISOString()); //toISOString convierte la fecha a UTC
  
  const dif = (ahoraUTC - fechaUTC) / 1000;
  
  console.log("Diferencia en segundos:", dif);
  
  if (dif < 60) return "Hace unos segundos";
  if (dif < 3600) return `Hace ${Math.floor(dif / 60)} minutos`; //X
  if (dif < 86400) return `Hace ${Math.floor(dif / 3600)} horas`; // X
  if (dif < 604800) return `Hace ${Math.floor(dif / 86400)} días`;// X
  if (dif < 2592000) return `Hace ${Math.floor(dif / 604800)} semanas`; // X
  if (dif < 31536000) return `Hace ${Math.floor(dif / 2592000)} meses`; //X
  return `Hace ${Math.floor(dif / 31536000)} años`; //X
}

const PerfilEntrenador = () => {
  // Obtiene el id del entrenador desde la URL
  const { id } = useParams();

  // Estado para los datos del entrenador
  const [entrenador, setEntrenador] = useState(null);
  const [loading, setLoading] = useState(true);

  // Estado para los servicios del entrenador
  const [servicios, setServicios] = useState([]);
  const [loadingServicios, setLoadingServicios] = useState(true);

  // Estado para el tab seleccionado ("servicios" o "reseñas")
  const [tab, setTab] = useState("servicios");

  // Estado para las reseñas del entrenador
  const [reseñas, setReseñas] = useState([]);
  const [loadingReseñas, setLoadingReseñas] = useState(false);
  // Nuevo estado para mostrar todas las reseñas o solo 3
  const [mostrarTodasReseñas, setMostrarTodasReseñas] = useState(false);

  // Hook para navegación programática
  const navigate = useNavigate();

  /**
   * useEffect: Trae los datos del entrenador al montar el componente o cambiar el id.
   */
  useEffect(() => {
    const fetchEntrenador = async () => {
      try {
        const res = await fetch(`http://localhost:3001/api/trainers/${id}`);
        const data = await res.json();
        setEntrenador(data);
      } catch (err) {
        setEntrenador(null);
      } finally {
        setLoading(false);
      }
    };
    fetchEntrenador();
  }, [id]);
  /**
   * useEffect: Trae los servicios del entrenador al montar o cambiar el id.
   */
  useEffect(() => {
    const fetchServicios = async () => {
      setLoadingServicios(true);
      try {
        const res = await fetch(`http://localhost:3001/api/service/trainer/${id}`);
        const data = await res.json();
        console.log('✅ Servicios data received:', data);
        console.log('📋 Number of servicios:', data.servicios?.length || 0);
        
        setServicios(data.servicios || []);
      } catch (error) {
        console.error('❌ Error fetching servicios:', error);
        setServicios([]);
      } finally {
        setLoadingServicios(false);
      }
    };
    fetchServicios();
  }, [id]);

  /**
   * useEffect: Trae las reseñas solo cuando se selecciona el tab "reseñas".
   */
  useEffect(() => {
    if (tab !== "reseñas") return;
    setLoadingReseñas(true);
    fetch(`http://localhost:3001/api/trainers/${id}/reviews`)
      .then(res => res.json())
      .then(setReseñas)
      .catch(() => setReseñas([]))
      .finally(() => setLoadingReseñas(false));
  }, [tab, id]);

  // Renderiza mensaje de carga o error si corresponde
  if (loading) return <Layout><div>Cargando perfil...</div></Layout>;
  if (!entrenador) return <Layout><div>No se encontró el entrenador.</div></Layout>;

  return (
    <Layout>
      <div className="perfil-root">
        <div className="perfil-row">          {/* Foto del entrenador */}
          <div className="perfil-img">
            {entrenador.avatarUrl ? (
              <img
                src={
                  entrenador.avatarUrl.startsWith('http')
                    ? entrenador.avatarUrl
                    : `http://localhost:3001${entrenador.avatarUrl}`
                }
                alt={`${entrenador.nombre} ${entrenador.apellido}`}
                className="trainer-avatar-large"
                style={{ borderRadius: 10, width: 280, height: 280, objectFit: "cover" }}
              />
            ) : (
              <div
                className="trainer-avatar-large"
                style={{
                  borderRadius: 10,
                  width: 280,
                  height: 280,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  background: "#f6c94822",
                  color: "#222",
                  fontWeight: 700,
                  fontSize: 64,
                  letterSpacing: 2,
                }}
              >
                {(entrenador.nombre?.charAt(0) || "") + (entrenador.apellido?.charAt(0) || "")}
              </div>
            )}
          </div>
          {/* Información principal del entrenador */}
          <div className="perfil-main">
            <h2>{entrenador.nombre} {entrenador.apellido}</h2>
            <div style={{ color: "#888", fontWeight: 500, marginBottom: 7 }}>
              Entrenador personal certificado
            </div>
            {/* Zona + icono ubicación */}
            <div style={{
              display: "flex",
              alignItems: "center",
              fontSize: 16,
              color: "#888",
              marginBottom: 6
            }}>
              {/* Icono de ubicación */}
              <svg width="19" height="19" viewBox="0 0 20 20" fill="none" style={{ marginRight: 6, marginTop: 2 }}>
                <circle cx="10" cy="9" r="3" stroke="#888" strokeWidth="1.5" fill="none"/>
                <path d="M10 2.5C6 2.5 3 6 3 10.5c0 3.7 5.4 6.4 6.5 7 .4.2.6.2 1 0C11.6 16.9 17 14.2 17 10.5c0-4.5-3-8-7-8z"
                  stroke="#888" strokeWidth="1.5" fill="none"/>
              </svg>
              <span>{entrenador.zona}{entrenador.zona ? ", BA" : ""}</span>
            </div>            {/* Rating promedio */}
            <div style={{ fontSize: 14, color: "#555", marginBottom: 6 }}>
              <span style={{ color: "#f5c21d", fontWeight: 600 }}>
                ★ {Number(entrenador.avgRating).toFixed(1)}
              </span>
              <span style={{ fontSize: 13, color: "#999", marginLeft: 8 }}>
                ({entrenador.totalRatings || 0} {entrenador.totalRatings === 1 ? 'calificación' : 'calificaciones'})
              </span>
            </div>
            {/* Presentación del entrenador */}
            <div className="perfil-presentacion" style={{
              border: "1.5px solid #eee",
              borderRadius: 8,
              padding: 15,
              background: "#fafafa",
              marginBottom: 13
            }}>
              {entrenador.presentacion}
            </div>
            {/* Idiomas */}
            <div className="perfil-info-extra" style={{ display: "flex", gap: 45 }}>
              <div>
                <b>Idiomas</b>
                <div style={{ display: "flex", gap: 8, marginTop: 3 }}>
                  {entrenador.idiomas?.map(id => (
                    <span key={id} style={{
                      border: "1.3px solid #bbb",
                      borderRadius: 8,
                      padding: "2px 12px",
                      fontSize: 13,
                      background: "#fff",
                      color: "#444"
                    }}>{id}</span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Tabs: Servicios y Reseñas */}
        <div style={{
          display: "flex",
          width: "100%",
          maxWidth: 700,
          margin: "30px auto 15px auto",
          borderRadius: 9,
          overflow: "hidden",
          border: "1px solid #f2f3f6",
          fontWeight: 600,
          fontSize: "1.09rem"
        }}>
          {/* Tab Servicios */}
          <div
            onClick={() => setTab("servicios")}
            style={{
              flex: 1,
              background: tab === "servicios" ? "#fff" : "#f7f9fb",
              textAlign: "center",
              padding: "10px 0",
              borderBottom: tab === "servicios" ? "3px solid #222" : "3px solid #f2f3f6",
              color: tab === "servicios" ? "#222" : "#aaa",
              cursor: "pointer"
            }}
          >Servicios</div>
          {/* Tab Reseñas */}
          <div
            onClick={() => setTab("reseñas")}
            style={{
              flex: 1,
              background: tab === "reseñas" ? "#fff" : "#f7f9fb",
              textAlign: "center",
              padding: "10px 0",
              borderBottom: tab === "reseñas" ? "3px solid #222" : "3px solid #f2f3f6",
              color: tab === "reseñas" ? "#222" : "#aaa",
              cursor: "pointer"
            }}
          >Reseñas</div>
        </div>

        {/* Contenido del tab Servicios */}
        {tab === "servicios" && (
          <div style={{
            display: "flex",
            gap: 22,
            flexWrap: "wrap",
            margin: "0 auto",
            maxWidth: 900
          }}>
            {loadingServicios ? (
              <div style={{ margin: 30 }}>Cargando servicios...</div>
            ) : servicios.length === 0 ? (
              <div style={{ margin: 30 }}>Este entrenador aún no tiene servicios publicados.</div>
            ) : (
              servicios.map(s => (
                <div
                  key={s._id}
                  style={{
                    flex: 1,
                    minWidth: 300,
                    maxWidth: 380,
                    background: "#fff",
                    border: "1.5px solid #ececec",
                    borderRadius: 12,
                    boxShadow: "0 1px 7px #ddd4",
                    padding: "24px 24px 18px 24px",
                    marginBottom: 22,
                    display: "flex",
                    flexDirection: "column",
                    justifyContent: "space-between"
                  }}>
                  <div>
                    {/* Título y descripción del servicio */}
                    <div style={{
                      fontWeight: 700,
                      fontSize: "1.19rem",
                      marginBottom: 5
                    }}>{s.titulo}</div>
                    <div style={{ color: "#666", fontSize: 15, marginBottom: 18 }}>
                      {s.descripcion || s.categoria || "Sin descripción."}
                    </div>
                  </div>
                  <div style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    marginTop: 16
                  }}>
                    {/* Precio del servicio */}
                    <div style={{ fontWeight: 800, fontSize: "1.25rem" }}>
                      ${s.precio.toLocaleString("es-AR")}
                    </div>
                    {/* Botón para ver más detalles del servicio */}
                    <button
                    style={{
                        padding: "7px 22px",
                        fontWeight: 600,
                        fontSize: "1.06rem",
                        borderRadius: 8,
                        border: "1.3px solid #e3e3e3",
                        background: "#fff",
                        color: "#222",
                        cursor: "pointer",
                        transition: "background 0.14s"
                    }}
                    onClick={() => navigate(`/service/${s._id}`)}
                    >
                    Ver más
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {/* Contenido del tab Reseñas */}
        {tab === "reseñas" && (
          <div style={{
            background: "#fff",
            border: "1.5px solid #ececec",
            borderRadius: 12,
            maxWidth: 900,
            margin: "0 auto",
            padding: "25px 30px"
          }}>
            <h3 style={{ fontWeight: 700, fontSize: "1.18rem", marginBottom: 20 }}>Reseñas recientes y comentarios</h3>
            {loadingReseñas ? (
              <div style={{ margin: 30 }}>Cargando reseñas...</div>
            ) : reseñas.length === 0 ? (
              <div style={{ margin: 30, color: "#888" }}>Aún no hay reseñas para este entrenador.</div>
            ) : (
              <>                {(mostrarTodasReseñas ? reseñas : reseñas.slice(0, 3)).map(r => (
                  <div key={r._id} className="resena-container">
                    {/* Layout desktop: avatar + contenido + rating */}
                    <div className="resena-avatar">
                      {r.cliente?.avatarUrl
                        ? <img src={r.cliente.avatarUrl} alt="" style={{ width: 38, height: 38, borderRadius: "50%" }} />
                        : (r.cliente?.nombre?.[0] || "U")}
                    </div>
                    
                    <div className="resena-content">
                      {/* Header con nombre, tiempo y rating (móvil) */}
                      <div className="resena-header">
                        <div className="resena-usuario-info">
                          <span className="resena-nombre">{r.cliente?.nombre} {r.cliente?.apellido}</span>
                          <span className="resena-tiempo">
                            {formateaTiempo(r.createdAt)}
                          </span>
                        </div>
                        {/* Rating visible solo en móvil */}
                        <div className="resena-rating" style={{ display: 'none' }}>
                          <span style={{ color: "#F6C948", fontSize: 20 }}>
                            {Array.from({ length: 5 }).map((_, i) =>
                              <span key={i}>{i < r.rating ? "★" : "☆"}</span>
                            )}
                          </span>
                        </div>
                      </div>
                        {/* Texto de la reseña */}
                      <div className="resena-texto">{r.texto}</div>
                      
                      {/* Respuesta del entrenador */}
                      {r.reply && (
                        <div style={{
                          marginTop: 12,
                          padding: "12px 16px",
                          background: "#f8f9fa",
                          border: "1px solid #e9ecef",
                          borderRadius: 8,
                          borderLeft: "3px solid #28a745"
                        }}>
                          <div style={{
                            display: "flex",
                            alignItems: "center",
                            gap: 8,
                            marginBottom: 6
                          }}>
                            <div style={{
                              width: 20,
                              height: 20,
                              background: "#28a745",
                              borderRadius: "50%",
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              color: "white",
                              fontSize: 12,
                              fontWeight: 600
                            }}>
                              E
                            </div>
                            <span style={{
                              fontWeight: 600,
                              fontSize: 14,
                              color: "#495057"
                            }}>
                              Respuesta del entrenador
                            </span>
                            <span style={{
                              fontSize: 12,
                              color: "#6c757d"
                            }}>
                              {formateaTiempo(r.reply.createdAt)}
                            </span>
                          </div>
                          <div style={{
                            fontSize: 14,
                            color: "#495057",
                            lineHeight: 1.4
                          }}>
                            {r.reply.texto}
                          </div>
                        </div>
                      )}
                    </div>
                    
                    {/* Rating visible solo en desktop */}
                    <div className="resena-rating">
                      <span style={{ color: "#F6C948", fontSize: 20 }}>
                        {Array.from({ length: 5 }).map((_, i) =>
                          <span key={i}>{i < r.rating ? "★" : "☆"}</span>
                        )}
                      </span>
                    </div>
                  </div>
                ))}
                {/* Botón Ver más / Ver menos */}
                {reseñas.length > 3 && (
                  <div style={{ textAlign: "center", marginTop: 10 }}>
                    <button
                      style={{
                        padding: "7px 22px",
                        fontWeight: 600,
                        fontSize: "1.06rem",
                        borderRadius: 8,
                        border: "1.3px solid #e3e3e3",
                        background: "#fff",
                        color: "#222",
                        cursor: "pointer",
                        transition: "background 0.14s"
                      }}
                      onClick={() => setMostrarTodasReseñas(v => !v)}
                    >
                      {mostrarTodasReseñas ? "Ver menos" : "Ver más"}
                    </button>
                  </div>
                )}
              </>
            )}
          </div>
        )}
      </div>
    </Layout>
  );
};

export default PerfilEntrenador;

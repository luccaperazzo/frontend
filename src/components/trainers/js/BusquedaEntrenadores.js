import React, { useEffect, useState } from "react";
import Layout from "../../layout/js/Layout";
import "../css/BusquedaEntrenadores.css"; // Asegúrate de tener este CSS para estilos
import { useNavigate } from "react-router-dom";

// Listado de categorías disponibles para filtrar
const categorias = ['Entrenamiento', 'Nutrición', 'Consultoría'];

// Listado de zonas/barrio para filtrar entrenadores
const zonas = [
  "Almagro", "Balvanera", "Barracas", "Belgrano", "Boedo",
  "Caballito", "Chacarita", "Coghlan", "Colegiales", "Constitución",
  "Flores", "Floresta", "La Boca", "La Paternal", "Liniers", "Mataderos",
  "Monserrat", "Monte Castro", "Nueva Pompeya", "Nuñez", "Palermo",
  "Parque Avellaneda", "Parque Chacabuco", "Parque Chas", "Parque Patricios",
  "Puerto Madero", "Recoleta", "Retiro", "Saavedra", "San Cristóbal",
  "San Nicolás", "San Telmo", "Vélez Sarsfield", "Versalles", "Villa Crespo",
  "Villa del Parque", "Villa Devoto", "Villa Gral. Mitre", "Villa Lugano",
  "Villa Luro", "Villa Ortúzar", "Villa Pueyrredón", "Villa Real",
  "Villa Riachuelo", "Villa Santa Rita", "Villa Soldati", "Villa Urquiza"
];

// Idiomas disponibles para filtrar entrenadores
const idiomas = [
  { value: "Español", label: "Español" },
  { value: "Inglés", label: "Inglés" },
  { value: "Portugués", label: "Portugués" }
];

// Duraciones posibles de los servicios (en minutos)
const duraciones = [30, 45, 60, 90];

// Opciones de rating para el filtro
const ratings = [1, 2, 3, 4, 5];

// Cantidad de entrenadores por página (paginación)
const PAGE_SIZE = 6;

/**
 * Componente principal para la búsqueda y filtrado de entrenadores.
 * Permite aplicar filtros, ver resultados paginados y navegar al perfil de cada entrenador.
 */
const BusquedaEntrenadores = () => {
  // Estado para los filtros aplicados
  const [filtros, setFiltros] = useState({
    categoria: "",
    presencial: "",
    precioMax: "",
    duracion: "",
    zona: "",
    idioma: [],
    rating: "",
  });

  // Estado para la lista de entrenadores obtenidos del backend
  const [entrenadores, setEntrenadores] = useState([]);

  // Estado para mostrar indicador de carga
  const [loading, setLoading] = useState(false);

  // Estado para la página actual de la paginación
  const [currentPage, setCurrentPage] = useState(1);

  // Hook de navegación de React Router
  const navigate = useNavigate();

  /**
   * Construye el query string para la API a partir de los filtros seleccionados.
   * Devuelve una cadena como "?categoria=Entrenamiento&zona=Palermo&..."
   */
  const buildQuery = () => {
    const params = [];
    for (let key in filtros) {
      const value = filtros[key];
      if (Array.isArray(value) && value.length) {
        // Solo para idioma: eliminá duplicados
        if (key === "idioma") {
          const clean = [...new Set(value)];
          params.push(`${key}=${clean.join(",")}`);
        } else {
          params.push(`${key}=${value.join(",")}`);
        }
      } else if (value) {
        params.push(`${key}=${encodeURIComponent(value)}`);
      }
    }
    return params.length ? "?" + params.join("&") : "";
  };

  /**
   * useEffect: Llama a la API para buscar entrenadores cada vez que cambian los filtros.
   * Actualiza el estado de entrenadores y loading.
   */
  useEffect(() => {
    const fetchEntrenadores = async () => {
      setLoading(true);
      const res = await fetch("http://localhost:3001/api/service/trainers" + buildQuery(), {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });
      const data = await res.json();
      setEntrenadores(data.entrenadores || []);
      setLoading(false);
    };
    fetchEntrenadores();
    // eslint-disable-next-line
  }, [JSON.stringify(filtros)]);

  /**
   * useEffect: Cuando cambian los filtros, resetea la página actual a 1.
   */
  useEffect(() => {
    setCurrentPage(1);
  }, [JSON.stringify(filtros)]);

  // Cálculo de la cantidad total de páginas según los resultados
  const totalPages = Math.ceil(entrenadores.length / PAGE_SIZE);

  // Entrenadores a mostrar en la página actual
  const paginatedEntrenadores = entrenadores.slice(
    (currentPage - 1) * PAGE_SIZE,
    currentPage * PAGE_SIZE
  );

  /**
   * Handler para cambios en los filtros.
   * Actualiza el estado de filtros según el input modificado.
   */
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    if (type === "checkbox") {
      setFiltros(prev => ({
        ...prev,
        idioma: checked
          ? [...prev.idioma, value]
          : prev.idioma.filter(idioma => idioma !== value),
      }));
    } else {
      setFiltros(prev => ({
        ...prev,
        [name]: value,
      }));
    }
  };

  /**
   * Limpia todos los filtros y los resetea a su valor inicial.
   */
  const limpiarFiltros = () => {
    setFiltros({
      categoria: "",
      presencial: "",
      precioMax: "",
      duracion: "",
      zona: "",
      idioma: [],
      rating: "",
    });
  };

  return (
    <Layout>
      <div className="busqueda-root">
        {/* Panel lateral de filtros */}
        <aside className="busqueda-filtros">
          <h2>Filtros</h2>

          {/* Filtro de categoría */}
          <label>Categoría</label>
          <select name="categoria" value={filtros.categoria} onChange={handleChange}>
            <option value="">Todas</option>
            {categorias.map(cat => <option key={cat} value={cat}>{cat}</option>)}
          </select>

          {/* Filtro de modalidad */}
          <label>Modalidad</label>
          <select name="presencial" value={filtros.presencial} onChange={handleChange}>
            <option value="">Ambas</option>
            <option value="presencial">Presencial</option>
            <option value="virtual">Virtual</option>
          </select>

          {/* Filtro de precio máximo */}
          <label>Precio máximo</label>
          <input name="precioMax" type="number" min="0" value={filtros.precioMax} onChange={handleChange} />

          {/* Filtro de duración */}
          <label>Duración (min)</label>
          <select name="duracion" value={filtros.duracion} onChange={handleChange}>
            <option value="">Cualquiera</option>
            {duraciones.map(d => (
              <option key={d} value={d}>{d}</option>
            ))}
          </select>

          {/* Filtro de zona */}
          <label>Zona</label>
          <select name="zona" value={filtros.zona} onChange={handleChange}>
            <option value="">Todas</option>
            {zonas.map(z => <option key={z} value={z}>{z}</option>)}
          </select>

          {/* Filtro de rating promedio */}
          <label>Promedio de rating</label>
          <select name="rating" value={filtros.rating || ""} onChange={handleChange}>
            <option value="">Cualquiera</option>
            {ratings.slice(0, -1).map(r => (
              <option key={r} value={String(r)}>{r}+</option>
            ))}
            <option value="5+">5+</option>
          </select>

          {/* Filtro de idiomas */}
          <label>Idiomas</label>
          <div className="busqueda-idiomas">
            {idiomas.map(({ value, label }) => (
              <label key={value}>
                <input
                  type="checkbox"
                  name="idioma"
                  value={value}
                  checked={filtros.idioma.includes(value)}
                  onChange={handleChange}
                />{" "}
                {label}
              </label>
            ))}
          </div>

          {/* Botón para limpiar todos los filtros */}
          <button className="filtros-reset" type="button" onClick={limpiarFiltros}>Limpiar</button>
        </aside>

        {/* Sección principal de resultados */}
        <main className="busqueda-resultados">
          <h2>Entrenadores encontrados</h2>
          {/* Indicador de carga */}
          {loading && <div className="busqueda-loading">Cargando...</div>}
          {/* Mensaje si no hay resultados */}
          {!loading && entrenadores.length === 0 && (
            <div className="busqueda-vacio">No hay entrenadores para los filtros seleccionados.</div>
          )}
          {/* Cards de entrenadores */}          <div className="busqueda-cards">
            {paginatedEntrenadores.map((e, idx) => (
              <div className="trainer-card" key={e._id || idx}>
                {/* Imagen circular del entrenador o iniciales */}
                {e.avatarUrl ? (
                  <img
                    src={
                      e.avatarUrl.startsWith("http") 
                        ? e.avatarUrl 
                        : `http://localhost:3001${e.avatarUrl}`
                    }
                    alt={`${e.nombre} ${e.apellido}`}
                    className="trainer-avatar"
                    style={{
                      width: 90,
                      height: 90,
                      borderRadius: "50%",
                      objectFit: "cover",
                      margin: "0 auto 12px auto",
                      display: "block"
                    }}
                  />
                ) : (
                  <div
                    className="trainer-avatar"
                    style={{
                      width: 90,
                      height: 90,
                      borderRadius: "50%",
                      margin: "0 auto 12px auto",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      background: "#f6c94822",
                      color: "#222",
                      fontWeight: 700,
                      fontSize: 28,
                      letterSpacing: 1,
                    }}
                  >
                    {(e.nombre?.charAt(0) || "") + (e.apellido?.charAt(0) || "")}
                  </div>
                )}
                {/* Nombre y apellido */}
                <div className="trainer-name" style={{ fontWeight: 700, fontSize: "1.2rem", marginBottom: 2 }}>
                  {e.nombre} {e.apellido}
                </div>
                {/* Rating promedio y cantidad de ratings */}
                {typeof e.avgRating === "number" && (
                  <div
                    style={{
                      color: "#f6c948",
                      fontSize: 16,
                      fontWeight: 600,
                      margin: "3px 0"
                    }}
                  >
                    ★ {e.avgRating.toFixed(1)}{" "}
                    <span style={{ fontWeight: 400, color: "#555" }}>
                      ({e.totalRatings})
                    </span>
                  </div>
                )}
                {/* Zona del entrenador */}
                <div className="trainer-zona" style={{ color: "#888", fontSize: 14, marginBottom: 2 }}>
                  {e.zona}
                </div>
                {/* Idiomas del entrenador */}
                <div className="trainer-idiomas" style={{ color: "#666", fontSize: 13, marginBottom: 5 }}>
                  {e.idiomas?.join(" / ")}
                </div>
                {/* Botón para ver el perfil del entrenador */}
                <button
                  className="ver-perfil-btn"
                  onClick={() => {
                    if (!localStorage.getItem("token")) {
                      window.location.href = "/login";
                    } else {
                      navigate(`/trainers/${e._id}`); //le pasas el ID del trainer implicitamente en la URL
                    }
                  }}
                  style={{
                    width: "100%",
                    background: "#222",
                    color: "#fff",
                    fontWeight: 700,
                    fontSize: "1.08rem",
                    borderRadius: 7,
                    border: "none",
                    padding: "9px 0",
                    marginTop: 9,
                    cursor: "pointer",
                    transition: "background 0.14s"
                  }}
                >
                  Ver perfil
                </button>
                {/* Fin del botón Ver perfil */}
              </div>
            ))}
          </div>
          {/* Barra de paginación */}
          {totalPages > 1 && (
            <div style={{ display: "flex", justifyContent: "center", marginTop: 24, gap: 12 }}>
              <button
                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                style={{
                  padding: "8px 18px",
                  borderRadius: 6,
                  border: "1px solid #ccc",
                  background: currentPage === 1 ? "#f4f4f4" : "#fff",
                  color: "#333",
                  cursor: currentPage === 1 ? "not-allowed" : "pointer",
                  fontWeight: 600
                }}
              >
                Anterior
              </button>
              <span style={{ alignSelf: "center", fontWeight: 500 }}>
                Página {currentPage} de {totalPages}
              </span>
              <button
                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
                style={{
                  padding: "8px 18px",
                  borderRadius: 6,
                  border: "1px solid #ccc",
                  background: currentPage === totalPages ? "#f4f4f4" : "#fff",
                  color: "#333",
                  cursor: currentPage === totalPages ? "not-allowed" : "pointer",
                  fontWeight: 600
                }}
              >
                Siguiente
              </button>
            </div>
          )}
        </main>
      </div>
    </Layout>
  );
};

export default BusquedaEntrenadores;

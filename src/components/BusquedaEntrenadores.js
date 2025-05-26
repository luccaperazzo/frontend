import React, { useEffect, useState } from "react";
import Layout from "./Layout";
import "./BusquedaEntrenadores.css";
import { useNavigate } from "react-router-dom";

const categorias = ['Entrenamiento', 'Nutrición', 'Consultoría'];
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
const idiomas = [
  { value: "Español", label: "Español" },
  { value: "Inglés", label: "Inglés" },
  { value: "Portugués", label: "Portugués" }
];
const duraciones = [30, 45, 60, 90];

const BusquedaEntrenadores = () => {
  const [filtros, setFiltros] = useState({
    categoria: "",
    presencial: "",
    precioMax: "",
    duracion: "",
    zona: "",
    idioma: [],
  });
  const [entrenadores, setEntrenadores] = useState([]);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate(); // ¡Esto debe estar en el componente!

  // Query string con los filtros aplicados
const buildQuery = () => {
  const params = [];
  for (let key in filtros) {
    const value = filtros[key];
    if (Array.isArray(value) && value.length) {
      // Solo para idioma: eliminá duplicados
      if (key === "idioma") {
        const clean = [...new Set(value)]; // NO .toLowerCase()
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


  // Buscar entrenadores cada vez que cambian los filtros
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

  // Handler de filtros
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

  // Limpiar filtros
  const limpiarFiltros = () => {
    setFiltros({
      categoria: "",
      presencial: "",
      precioMax: "",
      duracion: "",
      zona: "",
      idioma: [],
    });
  };

  return (
    <Layout>
      <div className="busqueda-root">
        {/* Filtros */}
        <aside className="busqueda-filtros">
          <h2>Filtros</h2>

          <label>Categoría</label>
          <select name="categoria" value={filtros.categoria} onChange={handleChange}>
            <option value="">Todas</option>
            {categorias.map(cat => <option key={cat} value={cat}>{cat}</option>)}
          </select>

          <label>Modalidad</label>
          <select name="presencial" value={filtros.presencial} onChange={handleChange}>
            <option value="">Ambas</option>
            <option value="presencial">Presencial</option>
            <option value="virtual">Virtual</option>
          </select>

          <label>Precio máximo</label>
          <input name="precioMax" type="number" min="0" value={filtros.precioMax} onChange={handleChange} />

          <label>Duración (min)</label>
          <select name="duracion" value={filtros.duracion} onChange={handleChange}>
            <option value="">Cualquiera</option>
            {duraciones.map(d => (
              <option key={d} value={d}>{d}</option>
            ))}
          </select>

          <label>Zona</label>
          <select name="zona" value={filtros.zona} onChange={handleChange}>
            <option value="">Todas</option>
            {zonas.map(z => <option key={z} value={z}>{z}</option>)}
          </select>

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
          <button className="filtros-reset" type="button" onClick={limpiarFiltros}>Limpiar</button>
        </aside>

        {/* Resultados */}
        <main className="busqueda-resultados">
          <h2>Entrenadores encontrados</h2>
          {loading && <div className="busqueda-loading">Cargando...</div>}
          {!loading && entrenadores.length === 0 && (
            <div className="busqueda-vacio">No hay entrenadores para los filtros seleccionados.</div>
          )}
<div className="busqueda-cards">
  {entrenadores.map((e, idx) => (
    <div className="trainer-card" key={e._id || idx}>
      {/* Imagen circular */}
      <img
        src={e.foto || "/foto-por-defecto.png"}
        alt={e.nombre}
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
      <div className="trainer-name" style={{ fontWeight: 700, fontSize: "1.2rem", marginBottom: 2 }}>
        {e.nombre} {e.apellido}
      </div>
      {/* Rating si lo tenés */}
      {e.avgRating && (
        <div style={{ color: "#f6c948", fontSize: 16, fontWeight: 600, margin: "3px 0" }}>
          ★ {Number(e.avgRating).toFixed(1)}
        </div>
      )}
      {/* Zona */}
      <div className="trainer-zona" style={{ color: "#888", fontSize: 14, marginBottom: 2 }}>
        {e.zona}
      </div>
      {/* Idiomas */}
      <div className="trainer-idiomas" style={{ color: "#666", fontSize: 13, marginBottom: 5 }}>
        {e.idiomas?.join(" / ")}
      </div>
      {/* Botón Ver perfil */}
          <button
            className="ver-perfil-btn"
            onClick={() => navigate(`/trainers/${e._id}`)}
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
        </div>
      ))}
    </div>
        </main>
      </div>
    </Layout>
  );
};

export default BusquedaEntrenadores;

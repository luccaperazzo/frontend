import React, { useEffect, useState } from "react";
import Layout from "./Layout";
import "./BusquedaEntrenadores.css";

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
              <div className="trainer-card" key={idx}>
                <div className="trainer-name">{e.nombre} {e.apellido}</div>
                <div className="trainer-presentacion">{e.presentacion}</div>
                <div className="trainer-zona">{e.zona}</div>
                <div className="trainer-idiomas">{e.idiomas.join(" / ")}</div>
                {/* Podés agregar rating y un botón "Ver más" */}
              </div>
            ))}
          </div>
        </main>
      </div>
    </Layout>
  );
};

export default BusquedaEntrenadores;

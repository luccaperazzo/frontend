import React, { useState } from "react";
import Layout from "../../layout/js/Layout";
import "../css/CrearCuenta-CSS.css"; // Usá el CSS de abajo

// Lista de barrios de CABA para el campo "Zona" del formulario
const BARRIOS_CABA = [
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

// Lista de idiomas disponibles para entrenadores
const IDIOMAS = [
  { value: "Español", label: "Español" },
  { value: "Inglés", label: "Inglés" },
  { value: "Portugués", label: "Portugués" }
];

/**
 * Componente CrearCuenta
 * Permite a los usuarios registrarse como "usuario" o "entrenador".
 * - Si elige "entrenador", se muestran campos adicionales (zona, idiomas, presentación).
 * - Envía los datos al backend para crear la cuenta.
 */
const CrearCuenta = () => {
  // Estado para saber si el registro es como entrenador o usuario
  const [isTrainer, setIsTrainer] = useState(false); // False, ya que la opción por defecto es "cliente"

  // Estado para los datos del formulario
  const [formData, setFormData] = useState({
    nombre: "",
    apellido: "",
    email: "",
    password: "",
    confirmPassword: "",
    fechaNacimiento: "",
    zona: "",
    idiomas: [],
    presentacion: "",
  });

  // Estado para mostrar errores en el formulario
  const [error, setError] = useState("");
  // Estado para mostrar mensaje de éxito
  const [success, setSuccess] = useState("");

  /**
   * handleChange
   * Actualiza el estado formData cuando cambia un campo del formulario.
   */
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  /**
   * handleIdiomaToggle
   * Agrega o quita un idioma del array de idiomas seleccionados.
   */
  const handleIdiomaToggle = (value) => {
    let nuevosIdiomas = [...formData.idiomas];
    if (nuevosIdiomas.includes(value)) {
      nuevosIdiomas = nuevosIdiomas.filter(idm => idm !== value);
    } else {
      nuevosIdiomas.push(value);
    }
    setFormData({ ...formData, idiomas: nuevosIdiomas });
  };

  /**
   * handleRoleToggle
   * Cambia el rol entre usuario y entrenador.
   * Si cambia, limpia los campos específicos de entrenador.
   */
  const handleRoleToggle = (trainer) => {
    setIsTrainer(trainer);
    setFormData({
      ...formData,
      zona: "",
      idiomas: [],
      presentacion: "",
    });
  };

  /**
   * handleSubmit
   * Envía el formulario al backend para registrar el usuario.
   * Muestra mensajes de error o éxito según la respuesta.
   */
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    try {
      const response = await fetch("http://localhost:3001/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          role: isTrainer ? "entrenador" : "cliente",
          idiomas: isTrainer ? formData.idiomas : undefined, //Este campo se pasa aparte ya que tiene un handle específico
        }),
      });

      const data = await response.json();
      if (!response.ok) {
        setError(data.error || data.message || "Error en el registro");
        return;
      }

      setSuccess("¡Cuenta creada con éxito!");
      setFormData({           //Cuando crear con éxito, reiniciar el formulario
        nombre: "",
        apellido: "",
        email: "",
        password: "",
        confirmPassword: "",
        fechaNacimiento: "",
        zona: "",
        idiomas: [],
        presentacion: "",
      });
    } catch (err) {
      setError("Error de red o del servidor. Intenta de nuevo.");
    }
  };

  // Renderizado del formulario de registro
  return (
    <Layout>
      <div className="register-root">
        <form className="register-form" onSubmit={handleSubmit}>
          <h2 className="register-title">Registrarse</h2>
          {/* Botones para elegir el rol */}
          <div className="register-toggle">
            <button
              type="button"
              className={`toggle-btn ${!isTrainer ? "active" : ""}`}
              onClick={() => handleRoleToggle(false)}
            >
              Como usuario
            </button>
            <button
              type="button"
              className={`toggle-btn ${isTrainer ? "active" : ""}`}
              onClick={() => handleRoleToggle(true)}
            >
              Como entrenador
            </button>
          </div>
          {/* Campos comunes para ambos roles */}
          <div className="register-group">
            <label>Nombre</label>
            <input
              className="register-input"
              type="text"
              name="nombre"
              value={formData.nombre}
              onChange={handleChange}
              required //Esto hace que lo tengas que completar sí o sí
            />
          </div>
          <div className="register-group">
            <label>Apellido</label>
            <input
              className="register-input"
              type="text"
              name="apellido"
              value={formData.apellido}
              onChange={handleChange}
              required
            />
          </div>
          <div className="register-group">
            <label>Email</label>
            <input
              className="register-input"
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              required
            />
          </div>
          <div className="register-group">
            <label>Contraseña</label>
            <input
              className="register-input"
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              required
            />
          </div>
          <div className="register-group">
            <label>Confirmar Contraseña</label>
            <input
              className="register-input"
              type="password"
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleChange}
              required
            />
          </div>
          <div className="register-group">
            <label>Fecha de nacimiento</label>
            <input
              className="register-input"
              type="date"
              name="fechaNacimiento"
              value={formData.fechaNacimiento}
              onChange={handleChange}
              required
            />
          </div>
          {/* Campos solo visibles si el usuario elige "entrenador" */}
          {isTrainer && (
            <>
              <div className="register-group">
                <label>Zona</label>
                <select
                  className="register-input"
                  name="zona"
                  value={formData.zona}
                  onChange={handleChange}
                  required
                >
                  <option value="">Seleccioná un barrio</option>
                  {BARRIOS_CABA.map((barrio, i) => (
                    <option key={i} value={barrio}>{barrio}</option>
                  ))}
                </select>
              </div>
              <div className="register-group">
                <label>Idiomas</label>
                <div className="idiomas-options">
                  {IDIOMAS.map(({ value, label }) => (
                    <label
                      key={value}
                      className={`idioma-btn${formData.idiomas.includes(value) ? " selected" : ""}`}
                    >
                      <input
                        type="checkbox"
                        name="idiomas"
                        value={value}
                        checked={formData.idiomas.includes(value)}
                        onChange={() => handleIdiomaToggle(value)}
                      />
                      {label}
                    </label>
                  ))}
                </div>
              </div>
              <div className="register-group">
                <label>Presentación</label>
                <input
                  className="register-input"
                  type="text"
                  name="presentacion"
                  value={formData.presentacion}
                  onChange={handleChange}
                  required
                  placeholder="Soy entrenador personal certificado..."
                />
              </div>
            </>
          )}
          {/* Mensajes de error o éxito */}
          {error && <p className="register-error">{error}</p>}
          {success && <p className="register-success">{success}</p>}
          {/* Botón para enviar el formulario */}
          <button className="register-btn" type="submit"> 
            {/* activa la función handleSubmit */}
            Crear cuenta
          </button>
        </form>
      </div>
    </Layout>
  );
};

export default CrearCuenta;

import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Layout from "../../layout/js/Layout";
import { el } from "date-fns/locale";

const LoginSuccess = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const role = localStorage.getItem("role");
    if (role === "cliente") {
      const timer = setTimeout(() => {
        navigate("/service/trainers");
      }, 3000)
      return () => clearTimeout(timer);
    }
    if (role === "entrenador") {
      const timer = setTimeout(() => {
        navigate("/entrenador/mi-espacio");
      }, 3000)
      return () => clearTimeout(timer);
    }
    // Si es entrenador, no redirige
  }, [navigate]);

  return (
    <Layout>
      <div style={{
        minHeight: "60vh",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center"
      }}>
        <h2 style={{ fontWeight: 700, fontSize: "2rem" }}>
          {localStorage.getItem("role") === "entrenador"
            ? "¡Bienvenido Entrenador!"
            : "¡Bienvenido!"}
        </h2>
        <p style={{ fontSize: "1.1rem", color: "#444" }}>
          El inicio de sesión fue exitoso.<br />
          {localStorage.getItem("role") === "cliente"
            ? "Serás redirigido automáticamente a la búsqueda de entrenadores..."
            : "Gracias por contribuir al crecimiento de FitConnect."}
        </p>
      </div>
    </Layout>
  );
};

export default LoginSuccess;

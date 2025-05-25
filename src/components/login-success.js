import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Layout from "./Layout";

const LoginSuccess = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const role = localStorage.getItem("role");
    if (role === "cliente") {
      const timer = setTimeout(() => {
        navigate("/service/trainers");
      }, 3000);
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
        <h2 style={{ fontWeight: 700, fontSize: "2rem" }}>¡Bienvenido!</h2>
        <p style={{ fontSize: "1.1rem", color: "#444" }}>
          El inicio de sesión fue exitoso.<br />
          {localStorage.getItem("role") === "cliente"
            ? "Serás redirigido automáticamente a la búsqueda de entrenadores..."
            : "Ya puedes navegar la plataforma."}
        </p>
      </div>
    </Layout>
  );
};

export default LoginSuccess;

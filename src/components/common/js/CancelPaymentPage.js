import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Layout from "../../layout/js/Layout";

const CancelPaymentPage = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const timer = setTimeout(() => {
      navigate("/service/trainers");
    }, 5000);
    return () => clearTimeout(timer);
  }, [navigate]);

  return (
    <Layout>
      <div style={{
        maxWidth: 500,
        margin: "60px auto",
        background: "#fff",
        borderRadius: 14,
        boxShadow: "0 2px 10px #0001",
        padding: 38,
        textAlign: "center"
      }}>
        <h2 style={{ color: "#dc3545", marginBottom: 18 }}>Se ha cancelado la sesión de pago</h2>
        <p style={{ color: "#555", fontSize: 18 }}>
          No se realizó el pago.<br />
          Serás redirigido a la búsqueda de entrenadores en unos segundos...
        </p>
      </div>
    </Layout>
  );
};

export default CancelPaymentPage;

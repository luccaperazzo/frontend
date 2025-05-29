import React from 'react';
import { Link } from 'react-router-dom';
import Layout from './Layout';

export default function SuccessPage() {
  return (
    <Layout>
      <div style={{
        maxWidth: 600,
        margin: '80px auto',
        textAlign: 'center',
        padding: '40px',
        background: '#fff',
        borderRadius: 12,
        boxShadow: '0 2px 10px rgba(0,0,0,0.1)'
      }}>
        <h1 style={{ fontSize: '2rem', marginBottom: 16 }}>¡Pago Exitoso! 🎉</h1>
        <p style={{ fontSize: '1.1rem', marginBottom: 24 }}>
          Gracias por tu compra. Tu reserva ha sido confirmada y recibirás una notificación cuando el entrenador la acepte.
        </p>
        <div style={{ display: 'flex', justifyContent: 'center', gap: 16 }}>
          <Link
            to="/"
            style={{
              padding: '10px 20px',
              background: '#222',
              color: '#fff',
              borderRadius: 8,
              textDecoration: 'none',
              fontWeight: 600
            }}
          >
            Volver al Inicio
          </Link>
          <Link
            to="/mi-espacio"
            style={{
              padding: '10px 20px',
              background: '#007bff',
              color: '#fff',
              borderRadius: 8,
              textDecoration: 'none',
              fontWeight: 600
            }}
          >
            Ver Mis Reservas
          </Link>
        </div>
      </div>
    </Layout>
  );
}

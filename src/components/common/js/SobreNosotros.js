import Layout from "../../layout/js/Layout";

const equipo = [
  {
    nombre: "Juan Pérez",
    rol: "Fundador & CEO",
    img: "https://randomuser.me/api/portraits/men/32.jpg"
  },
  {
    nombre: "Lucía Gómez",
    rol: "Co-Fundadora & Marketing",
    img: "https://randomuser.me/api/portraits/women/44.jpg"
  },
  {
    nombre: "Matías Ruiz",
    rol: "Desarrollo de Producto",
    img: "https://randomuser.me/api/portraits/men/52.jpg"
  },
  {
    nombre: "Carla Martínez",
    rol: "Atención al Cliente",
    img: "https://randomuser.me/api/portraits/women/61.jpg"
  },
];

const SobreNosotros = () => (
  <Layout>
    <div style={{
      minHeight: "76vh",
      maxWidth: 900,
      margin: "0 auto",
      padding: "42px 12px 40px 12px",
      fontFamily: "Inter, Montserrat, Arial, sans-serif"
    }}>
      <h1 style={{
        fontWeight: 800,
        fontSize: "2.6rem",
        color: "#161616",
        letterSpacing: "-1px",
        marginBottom: 7,
        textAlign: "center"
      }}>
        Sobre Nosotros
      </h1>
      <p style={{
        fontSize: "1.15rem",
        color: "#444",
        maxWidth: 620,
        margin: "12px auto 36px auto",
        textAlign: "center"
      }}>
        Somos un equipo apasionado por conectar personas con los mejores entrenadores personales.  
        Creemos en la tecnología como puente para una vida más saludable, inspiradora y con sentido de comunidad.<br />
        <span style={{ color: "#888", fontSize: "1rem" }}>
          Nuestra misión es democratizar el acceso a entrenadores profesionales para que cualquier persona pueda alcanzar su mejor versión.
        </span>
      </p>

      <div style={{
        display: "flex",
        gap: 30,
        justifyContent: "center",
        flexWrap: "wrap",
        margin: "40px 0 18px 0"
      }}>
        {equipo.map((persona, idx) => (
          <div key={idx} style={{
            background: "#fff",
            border: "1.3px solid #eee",
            borderRadius: 14,
            minWidth: 170,
            maxWidth: 200,
            textAlign: "center",
            boxShadow: "0 1px 9px #bbb2",
            padding: 22
          }}>
            <img
              src={persona.img}
              alt={persona.nombre}
              style={{
                width: 66,
                height: 66,
                objectFit: "cover",
                borderRadius: "50%",
                marginBottom: 13,
                border: "2px solid #f6f6f6"
              }}
            />
            <div style={{ fontWeight: 700, fontSize: 17, color: "#1b1b1b", marginBottom: 3 }}>
              {persona.nombre}
            </div>
            <div style={{ fontSize: 14.5, color: "#888", marginBottom: 2 }}>
              {persona.rol}
            </div>
          </div>
        ))}
      </div>

      <div style={{ textAlign: "center", margin: "48px 0 8px 0" }}>
        <img
          src="https://images.unsplash.com/photo-1518600506278-4e8ef466b810?auto=format&fit=crop&w=600&q=80"
          alt="Equipo trabajando"
          style={{
            width: "85%",
            maxWidth: 600,
            borderRadius: 16,
            margin: "0 auto",
            boxShadow: "0 2px 8px #0002"
          }}
        />
        <p style={{
          margin: "18px 0 0 0",
          fontSize: 15.3,
          color: "#666"
        }}>
          Trabajamos día a día para crear el mejor marketplace de entrenamiento y bienestar personal.
        </p>
      </div>
    </div>
  </Layout>
);

export default SobreNosotros;

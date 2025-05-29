import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';  // Usamos Router y Routes
import Login from './components/Login';  // Asegúrate de que la ruta sea correcta
import CrearCuenta from './components/CrearCuenta';  // Asegúrate de que la ruta sea correcta
import ForgotPassword from './components/ForgotPassword';  // Ruta para la recuperación de contraseña
import ResetPassword from './components/ResetPassword';  // Ruta para restablecer la contraseña
import LoginSuccess from "./components/login-success";
import LandingPage from './components/LandingPage';
import SobreNosotros from "./components/SobreNosotros";
import BusquedaEntrenadores from "./components/BusquedaEntrenadores";
import PerfilEntrenador from "./components/PerfilEntrenador";
import DetalleServicio from "./components/DetalleServicio";
import SuccessPage from './components/SuccessPaymentPage';
import MiEspacio from './components/MiEspacio';


const App = () => {
  return (
    <Router>
      <div className="App">
        <Routes>  {/* Usamos Routes en lugar de Switch */}
          <Route path="/login" element={<Login />} />
          <Route path="/login-success" element={<LoginSuccess />} />
          <Route path="/register" element={<CrearCuenta />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/reset-password" element={<ResetPassword />} />
          <Route path="/" element={<LandingPage/>} />
          <Route path="/sobre-nosotros" element={<SobreNosotros />} />
          <Route path="/sobre-nosotros" element={<SobreNosotros />} />
          <Route path="/service/trainers" element={<BusquedaEntrenadores />} />
          <Route path="/trainers/:id" element={<PerfilEntrenador />} />
          <Route path="/service/:id" element={<DetalleServicio />} />
          <Route path="/success" element={<SuccessPage />} />
          <Route path="/mi-espacio" element={<MiEspacio />} />

        </Routes>
      </div>
    </Router>
  );
}

export default App;

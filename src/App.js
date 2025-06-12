import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';  // Usamos Router y Routes
import Login from './components/auth/js/Login';  // Asegúrate de que la ruta sea correcta
import CrearCuenta from './components/auth/js/CrearCuenta';  // Asegúrate de que la ruta sea correcta
import ForgotPassword from './components/auth/js/ForgotPassword';  // Ruta para la recuperación de contraseña
import ResetPassword from './components/auth/js/ResetPassword';  // Ruta para restablecer la contraseña
import LoginSuccess from "./components/auth/js/login-success";
import CancelPaymentPage from "./components/common/js/CancelPaymentPage";
import LandingPage from './components/common/js/LandingPage';
import SobreNosotros from "./components/common/js/SobreNosotros";
import BusquedaEntrenadores from "./components/trainers/js/BusquedaEntrenadores";
import PerfilEntrenador from "./components/trainers/js/PerfilEntrenador";
import DetalleServicio from "./components/common/js/DetalleServicio";
import SuccessPage from './components/common/js/SuccessPaymentPage';
import MiEspacioCliente from './components/user/not comps/js/MiEspacioCliente';
import MiEspacioEntrenador from './components/user/not comps/js/MiEspacioEntrenador';
import MiEspacioEntrenadorMetrics from './components/user/not comps/js/MiEspacioEntrenadorMetrics';

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
          <Route path="/service/trainers" element={<BusquedaEntrenadores />} />
          <Route path="/trainers/:id" element={<PerfilEntrenador />} />
          <Route path="/service/:id" element={<DetalleServicio />} />
          <Route path="/success" element={<SuccessPage />} />
          <Route path="/mi-espacio" element={<MiEspacioCliente />} />
          <Route path="/entrenador/mi-espacio" element={<MiEspacioEntrenador />} />
          <Route path="/metrics" element={<MiEspacioEntrenadorMetrics />} />
          <Route path="/cancel" element={<CancelPaymentPage />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;

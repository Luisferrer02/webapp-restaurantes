import React from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import RestauranteList from "./components/RestauranteList";
import RestauranteDetails from "./components/RestauranteDetails";
import Auth from "./components/Auth";
import { AuthProvider } from "./context/AuthContext";
import 'leaflet/dist/leaflet.css';

const App = () => {
  return (
    <AuthProvider>
      <Router>
        <div>
          <Routes>
            <Route path="/public" element={<RestauranteList readOnly={true} />} />
            {/* Define rutas privadas y públicas según el estado de autenticación */}
            {/* Aquí podrías usar un componente de Ruta Protegida */}
            <Route path="/" element={<RestauranteList />} />
            <Route path="/restaurantes/:id" element={<RestauranteDetails />} />
            <Route path="/*" element={<Navigate to="/" />} />
          </Routes>
        </div>
      </Router>
    </AuthProvider>
  );
};

export default App;

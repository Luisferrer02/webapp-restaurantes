import React, { useState, useEffect } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import RestauranteList from "./components/RestauranteList";
import RestauranteDetails from "./components/RestauranteDetails";
import Auth from "./components/Auth";

const App = () => {
  // Estado para determinar si el usuario está autenticado
  const [authenticated, setAuthenticated] = useState(false);

  useEffect(() => {
    // Verifica si existe un token guardado en localStorage
    const token = localStorage.getItem("token");
    if (token) {
      setAuthenticated(true);
    }
  }, []);

  return (
    <Router>
      {authenticated ? (
        <Routes>
          <Route path="/" element={<RestauranteList />} />
          <Route path="/restaurantes/:id" element={<RestauranteDetails />} />
          {/* Redirecciona cualquier ruta no definida a la lista de restaurantes */}
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      ) : (
        // Si el usuario no está autenticado, muestra la pantalla de login/registro
        <Auth onAuthSuccess={() => setAuthenticated(true)} />
      )}
    </Router>
  );
};

export default App;

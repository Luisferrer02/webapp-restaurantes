// src/App.jsx
import React, { useState, useEffect } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import RestauranteList from "./components/RestauranteList";
import RestauranteDetails from "./components/RestauranteDetails";
import Auth from "./components/Auth";
import { jwtDecode } from "jwt-decode";


const App = () => {
  const [authenticated, setAuthenticated] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      try {
        const decoded = jwtDecode(token);
        // Si el token no ha expirado, marcamos como autenticado
        if (decoded.exp * 1000 > Date.now()) {
          setAuthenticated(true);
        } else {
          // Si expiró, eliminamos el token
          localStorage.removeItem("token");
        }
      } catch (err) {
        console.error("Error al decodificar el token:", err);
        localStorage.removeItem("token");
      }
    }
  }, []);

  // Función para cerrar sesión
  const handleLogout = () => {
    localStorage.removeItem("token");
    setAuthenticated(false);
  };

  return (
    <Router>
      {authenticated ? (
        <div>
          {/* Botón para cerrar sesión */}
          <button onClick={handleLogout} style={{ margin: "10px" }}>
            Cerrar Sesión
          </button>

          <Routes>
            <Route path="/" element={<RestauranteList />} />
            <Route path="/restaurantes/:id" element={<RestauranteDetails />} />
            <Route path="/public" element={<RestauranteList readOnly={true} />} />
            <Route path="*" element={<Navigate to="/" />} />
          </Routes>
        </div>
      ) : (
        <Auth onAuthSuccess={() => setAuthenticated(true)} />
      )}
    </Router>
  );
};

export default App;

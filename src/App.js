// src/App.jsx
import React, { useState, useEffect } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import RestauranteList from "./components/RestauranteList";
import RestauranteDetails from "./components/RestauranteDetails";
import Auth from "./components/Auth";
import { jwtDecode } from "jwt-decode";
import 'leaflet/dist/leaflet.css';


const App = () => {
  const [authenticated, setAuthenticated] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      try {
        const decoded = jwtDecode(token);
        if (decoded.exp * 1000 > Date.now()) {
          setAuthenticated(true);
        } else {
          localStorage.removeItem("token");
        }
      } catch (err) {
        console.error("Error al decodificar el token:", err);
        localStorage.removeItem("token");
      }
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("token");
    setAuthenticated(false);
  };

  return (
    <Router>
      <div>
        {authenticated && (
          <button onClick={handleLogout} style={{ margin: "10px" }} className="logout-button">
            Cerrar Sesión
          </button>
        )}
        <Routes>
          {/* Ruta pública accesible sin autenticación */}
          <Route path="/public" element={<RestauranteList readOnly={true} />} />

          {authenticated ? (
            <>
              <Route path="/" element={<RestauranteList />} />
              <Route path="/restaurantes/:id" element={<RestauranteDetails />} />
              <Route path="*" element={<Navigate to="/" />} />
            </>
          ) : (
            <Route path="/*" element={<Auth onAuthSuccess={() => setAuthenticated(true)} />} />
          )}
        </Routes>
      </div>
    </Router>
  );
};

export default App;

// src/components/Auth.jsx
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";
import "./Auth.css";

const Auth = ({ onAuthSuccess }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState({ email: "", password: "", username: "" });
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (isLogin) {
        const response = await api.post("/auth/login", { email: formData.email, password: formData.password });
        localStorage.setItem("token", response.data.token);
      } else {
        await api.post("/auth/register", { email: formData.email, password: formData.password, username: formData.username });
        // Auto-login tras registro:
        const loginResponse = await api.post("/auth/login", { email: formData.email, password: formData.password });
        localStorage.setItem("token", loginResponse.data.token);
      }
      onAuthSuccess();
    } catch (err) {
      setError(err.response?.data?.message || "Error en autenticación");
    }
  };

  return (
    <div className="auth-container">
      <h2>{isLogin ? "Iniciar Sesión" : "Registrarse"}</h2>
      <form onSubmit={handleSubmit}>
        {!isLogin && (
          <div>
            <input
              type="text"
              placeholder="Nombre de usuario"
              value={formData.username}
              onChange={(e) => setFormData({ ...formData, username: e.target.value })}
              required
            />
          </div>
        )}
        <div>
          <input
            type="email"
            placeholder="Email"
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            required
          />
        </div>
        <div>
          <input
            type="password"
            placeholder="Contraseña"
            value={formData.password}
            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
            required
          />
        </div>
        {error && <p className="error">{error}</p>}
        <button type="submit" className="btn btn-primary">
          {isLogin ? "Ingresar" : "Registrarse"}
        </button>
      </form>
      <p
        onClick={() => {
          setIsLogin(!isLogin);
          setError("");
        }}
        style={{ cursor: "pointer", color: "blue" }}
      >
        {isLogin ? "¿No tienes cuenta? Regístrate" : "¿Ya tienes cuenta? Inicia sesión"}
      </p>
      {/* Botón para ver la lista pública de "luisferrer2002@gmail.com" */}
      <button 
        onClick={() => navigate("/public")} 
        className="btn btn-secondary" 
        style={{ marginTop: "20px" }}
      >
        Ver lista pública de luisferrer2002@gmail.com
      </button>
    </div>
  );
};

export default Auth;

// src/components/Auth.jsx
import React, { useState } from "react";
import api from "../services/api";
import "./Auth.css"; // Puedes crear estilos específicos para la autenticación

const Auth = ({ onAuthSuccess }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState({ email: "", password: "", username: "" });
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    console.log("handleSubmit - isLogin:", isLogin);
    console.log("Form data:", formData);
    try {
      if (isLogin) {
        console.log("Intentando iniciar sesión con email:", formData.email);
        const response = await api.post("/auth/login", { email: formData.email, password: formData.password });
        console.log("Respuesta de login:", response.data);
        localStorage.setItem("token", response.data.token);
      } else {
        console.log("Intentando registrarse con email:", formData.email, "y username:", formData.username);
        const registerResponse = await api.post("/auth/register", { email: formData.email, password: formData.password, username: formData.username });
        console.log("Respuesta de registro:", registerResponse.data);
        // Auto-login tras registro
        console.log("Intentando iniciar sesión automáticamente tras registro");
        const loginResponse = await api.post("/auth/login", { email: formData.email, password: formData.password });
        console.log("Respuesta de auto-login:", loginResponse.data);
        localStorage.setItem("token", loginResponse.data.token);
      }
      console.log("Autenticación exitosa, llamando onAuthSuccess()");
      onAuthSuccess();
    } catch (err) {
      console.error("Error en autenticación:", err);
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
              onChange={(e) => {
                console.log("Username cambiado:", e.target.value);
                setFormData({ ...formData, username: e.target.value });
              }}
              required
            />
          </div>
        )}
        <div>
          <input
            type="email"
            placeholder="Email"
            value={formData.email}
            onChange={(e) => {
              console.log("Email cambiado:", e.target.value);
              setFormData({ ...formData, email: e.target.value });
            }}
            required
          />
        </div>
        <div>
          <input
            type="password"
            placeholder="Contraseña"
            value={formData.password}
            onChange={(e) => {
              console.log("Contraseña cambiada:", e.target.value);
              setFormData({ ...formData, password: e.target.value });
            }}
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
          console.log("Cambiando modo de autenticación. isLogin antes:", isLogin);
          setIsLogin(!isLogin);
          setError("");
          console.log("isLogin después del cambio:", !isLogin);
        }}
        style={{ cursor: "pointer", color: "blue" }}
      >
        {isLogin ? "¿No tienes cuenta? Regístrate" : "¿Ya tienes cuenta? Inicia sesión"}
      </p>
    </div>
  );
};

export default Auth;

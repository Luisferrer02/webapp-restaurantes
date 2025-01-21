// RestauranteDetailsModal.jsx
import React, { useEffect, useState } from 'react';
import api from '../services/api';
import './RestauranteDetailsModal.css'; // Asegúrate de crear este archivo de estilos

const RestauranteDetailsModal = ({ isOpen, onClose, restauranteId, onUpdate }) => {
  const [restaurante, setRestaurante] = useState(null);
  const [descripcion, setDescripcion] = useState('');
  const [imagen, setImagen] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // Estados para el sub-modal de registrar visita con comentario
  const [isRegisteringVisit, setIsRegisteringVisit] = useState(false);
  const [comentario, setComentario] = useState('');

  useEffect(() => {
    if (restauranteId && isOpen) {
      const fetchRestaurante = async () => {
        setIsLoading(true);
        try {
          const response = await api.get(`/restaurantes/${restauranteId}`);
          setRestaurante(response.data);
          setDescripcion(response.data.Descripcion || '');
          setImagen(response.data.Imagen || '');
        } catch (error) {
          console.error('Error al cargar detalles del restaurante:', error);
          alert('Error al cargar detalles del restaurante.');
        } finally {
          setIsLoading(false);
        }
      };
      fetchRestaurante();
    } else {
      // Reset states cuando el modal se cierra
      setRestaurante(null);
      setDescripcion('');
      setImagen('');
      setIsRegisteringVisit(false);
      setComentario('');
    }
  }, [restauranteId, isOpen]);

  const handleUpdate = async () => {
    try {
      const dataToSend = { Descripcion: descripcion, Imagen: imagen };
      const response = await api.put(`/restaurantes/${restauranteId}`, dataToSend);
      alert('Actualizado correctamente');
      setRestaurante(response.data);
      onUpdate(); // Actualiza la lista de restaurantes en el componente padre
      onClose(); // Cierra el modal después de actualizar
    } catch (error) {
      console.error('Error al actualizar:', error);
      alert(`Error: ${error.response?.data?.message || error.message}`);
    }
  };

  // Función para registrar una visita con comentario
  const handleRegisterVisit = async () => {
    try {
      const dataToSend = { Comentario: comentario };
      const response = await api.put(`/restaurantes/${restauranteId}/visita`, dataToSend);
      alert('Visita registrada correctamente');
      setRestaurante(response.data);
      setIsRegisteringVisit(false);
      setComentario('');
      onUpdate(); // Actualiza la lista de restaurantes en el componente padre
    } catch (error) {
      console.error('Error al registrar la visita:', error);
      alert(`Error al registrar la visita: ${error.response?.data?.message || error.message}`);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <button className="close-button" onClick={onClose}>
          &times;
        </button>
        {isLoading ? (
          <p className="loading-text">Cargando...</p>
        ) : restaurante ? (
          <div className="restaurante-details">
            <h2>{restaurante.Nombre}</h2>
            <p><strong>Tipo de cocina:</strong> {restaurante['Tipo de cocina']}</p>
            <p><strong>Localización:</strong> {restaurante['Localización']}</p>
            {restaurante.Imagen && (
              <img src={restaurante.Imagen} alt={`${restaurante.Nombre}`} className="restaurante-imagen" />
            )}
            <p><strong>Descripción:</strong> {restaurante.Descripcion || 'No hay descripción.'}</p>
            <h3>Visitas:</h3>
            <ul className="visit-list">
              {restaurante.fechasVisita.length > 0 ? (
                restaurante.fechasVisita.map((fecha, index) => (
                  <li key={index}>
                    {new Date(fecha).toLocaleDateString()}
                    {/* Puedes mostrar comentarios aquí si los tienes */}
                  </li>
                ))
              ) : (
                <li>No hay visitas registradas</li>
              )}
            </ul>

            {/* Botón para registrar una visita con comentario */}
            <button
              className="btn btn-primary"
              onClick={() => setIsRegisteringVisit(true)}
            >
              Registrar Visita
            </button>

            {/* Sub-Modal para Registrar Visita con Comentario */}
            {isRegisteringVisit && (
              <div className="sub-modal-overlay" onClick={() => setIsRegisteringVisit(false)}>
                <div className="sub-modal-content" onClick={(e) => e.stopPropagation()}>
                  <h3>Registrar Visita</h3>
                  <textarea
                    value={comentario}
                    onChange={(e) => setComentario(e.target.value)}
                    placeholder="Añadir un comentario (opcional)"
                    className="textarea"
                  />
                  <div className="sub-modal-buttons">
                    <button
                      className="btn btn-primary"
                      onClick={handleRegisterVisit}
                      disabled={!comentario.trim()}
                    >
                      Confirmar
                    </button>
                    <button
                      className="btn btn-secondary"
                      onClick={() => setIsRegisteringVisit(false)}
                    >
                      Cancelar
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Formulario para actualizar descripción e imagen */}
            <div className="form-group">
              <label htmlFor="descripcion">Descripción:</label>
              <textarea
                id="descripcion"
                value={descripcion}
                onChange={(e) => setDescripcion(e.target.value)}
                placeholder="Añadir descripción"
                className="textarea"
              />
            </div>
            <div className="form-group">
              <label htmlFor="imagen">URL de la Imagen:</label>
              <input
                id="imagen"
                type="text"
                value={imagen}
                onChange={(e) => setImagen(e.target.value)}
                placeholder="URL de la imagen"
                className="input"
              />
            </div>
            <button onClick={handleUpdate} className="btn btn-primary">
              Actualizar
            </button>
          </div>
        ) : (
          <p className="error-text">Restaurante no encontrado.</p>
        )}
      </div>
    </div>
  );
};

export default RestauranteDetailsModal;

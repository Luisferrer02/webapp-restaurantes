// RestauranteDetailsModal.jsx
import React, { useEffect, useState } from 'react';
import api from '../services/api';
import './RestauranteDetailsModal.css'; // Asegúrate de crear este archivo de estilos

const RestauranteDetailsModal = ({ isOpen, onClose, restauranteId }) => {
    const [restaurante, setRestaurante] = useState(null);
    const [descripcion, setDescripcion] = useState('');
    const [imagen, setImagen] = useState('');
    const [isLoading, setIsLoading] = useState(false);

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
        }
    }, [restauranteId, isOpen]);

    const handleUpdate = async () => {
        try {
            const dataToSend = { Descripcion: descripcion, Imagen: imagen };
            const response = await api.put(`/restaurantes/${restauranteId}`, dataToSend);
            alert('Actualizado correctamente');
            setRestaurante(response.data);
            onClose(); // Cierra el modal después de actualizar
        } catch (error) {
            console.error('Error al actualizar:', error);
            alert(`Error: ${error.response?.data?.message || error.message}`);
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
                        <ul className="visit-list">
                            {restaurante.fechasVisita.length > 0 ? (
                                restaurante.fechasVisita.map((fecha, index) => (
                                    <li key={index}>{new Date(fecha).toLocaleDateString()}</li>
                                ))
                            ) : (
                                <li>No hay visitas registradas</li>
                            )}
                        </ul>
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

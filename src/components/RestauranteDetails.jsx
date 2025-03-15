import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import api from '../services/api';
import './RestauranteDetails.css';

const RestauranteDetails = () => {
    const { id } = useParams();
    const [restaurante, setRestaurante] = useState(null);
    const [descripcion, setDescripcion] = useState('');
    const [imagen, setImagen] = useState('');

    useEffect(() => {
        const fetchRestaurante = async () => {
            try {
                const response = await api.get(`/restaurantes/${id}`);
                setRestaurante(response.data);
            } catch (error) {
                console.error('Error al cargar detalles del restaurante:', error);
            }
        };
        fetchRestaurante();
    }, [id]);

    const handleUpdate = async () => {
        try {
            const response = await api.put(`/restaurantes/${id}`, { Descripcion: descripcion, Imagen: imagen });
            alert('Actualizado correctamente');
            setRestaurante(response.data);
        } catch (error) {
            console.error('Error al actualizar:', error);
        }
    };

    if (!restaurante) return <p className="loading-text">Cargando...</p>;

    return (
        <div className="restaurante-details-container">
            <h2 className="restaurante-name">{restaurante.Nombre}</h2>
            <p className="restaurante-cuisine">{restaurante['Tipo de cocina']}</p>
            <p className="restaurante-location">{restaurante['Localización']}</p>
            <ul className="visit-list">
                {restaurante.visitas?.map((visita, index) => (
                    <li key={index} className="visit-date">
                        {new Date(visita.fecha).toLocaleDateString()}
                    </li>
                ))}
            </ul>
            <textarea
                className="description-input"
                value={descripcion}
                onChange={(e) => setDescripcion(e.target.value)}
                placeholder="Añadir descripción"
            />
            <input
                className="image-input"
                type="text"
                value={imagen}
                onChange={(e) => setImagen(e.target.value)}
                placeholder="URL de la imagen"
            />
            <button className="update-button" onClick={handleUpdate}>
                Actualizar
            </button>
        </div>
    );
};

export default RestauranteDetails;

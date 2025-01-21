import React, { useState, useEffect } from 'react';
import api from '../services/api';

function RestauranteList() {
  const [restaurantes, setRestaurantes] = useState([]);

  useEffect(() => {
    // Obtener los restaurantes desde el backend
    api.get('/restaurantes')
      .then(response => setRestaurantes(response.data))
      .catch(error => console.error('Error al cargar restaurantes:', error));
  }, []);

  return (
    <div>
      <h2>Lista de Restaurantes</h2>
      <ul>
        {restaurantes.map((restaurante) => (
          <li key={restaurante._id}>
            {restaurante.Nombre} - {restaurante['Tipo de cocina']} - {restaurante['Localización']}
          </li>
        ))}
      </ul>
    </div>
  );
}

export default RestauranteList;

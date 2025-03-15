import React, { useState } from 'react';
import api from '../services/api';
import './LocationSelectionModal.css';

const LocationSelectionModal = ({ 
  isOpen, 
  onClose, 
  restaurantName, 
  onSelect // Asegúrate de usar onSelect aquí
}) => {
  const [query, setQuery] = useState(`restaurante ${restaurantName || ''}`);
  const [suggestions, setSuggestions] = useState([]);
  const [loading, setLoading] = useState(false);

  const handleSearch = async () => {
    if (!query) return;
    try {
      setLoading(true);
      const response = await api.post(`/googleplaces/search`, { textQuery: query });
      setSuggestions(response.data.features || []);
    } catch (error) {
      console.error('Error fetching locations:', error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSelect = (feature) => {
    onSelect(feature); // Llama a onSelect
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="location-modal-overlay" onClick={onClose}>
      <div className="location-modal-content" onClick={(e) => e.stopPropagation()}>
        <h2>Selecciona una localización (opcional)</h2>
        <input
          type="text"
          placeholder="Buscar localización..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="input"
        />
        <button onClick={handleSearch} className="btn btn-primary">
          Buscar
        </button>
        {loading && <p>Cargando...</p>}
        {suggestions.length > 0 && (
          <ul className="suggestions-list">
            {suggestions.map((feature) => (
              <li 
                key={feature.id} 
                className="suggestion-item"
                onClick={() => handleSelect(feature)}
              >
                {feature.place_name}
              </li>
            ))}
          </ul>
        )}
        <button className="btn btn-secondary" onClick={onClose}>
          Cancelar
        </button>
      </div>
    </div>
  );
};

export default LocationSelectionModal;

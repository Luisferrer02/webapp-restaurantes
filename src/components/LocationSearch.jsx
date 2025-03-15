import React, { useState } from 'react';
import api from '../services/api';
import './LocationSearch.css';

const LocationSearch = ({ onSelect }) => {
  const [query, setQuery] = useState('');
  const [suggestions, setSuggestions] = useState([]);

  const handleSearch = async () => {
    if (!query) return;
    try {
      // Se usa POST al endpoint de googleplaces con el body { textQuery }
      const response = await api.post(`/googleplaces/search`, { textQuery: query });
      setSuggestions(response.data.features || []);
    } catch (error) {
      console.error('Error fetching locations:', error);
    }
  };

  return (
    <div className="location-search">
      <input
        type="text"
        placeholder="Buscar ubicación..."
        value={query}
        onChange={(e) => setQuery(e.target.value)}
      />
      <button onClick={handleSearch}>Buscar</button>
      {suggestions.length > 0 && (
        <ul className="suggestions-list">
          {suggestions.map((feature) => (
            <li
              key={feature.id}
              onClick={() => {
                onSelect(feature);
                setQuery(feature.place_name);
                setSuggestions([]);
              }}
              className="suggestion-item"
            >
              {feature.place_name}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default LocationSearch;

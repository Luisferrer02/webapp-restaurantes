import React, { useState, useEffect, useCallback } from 'react';
import api from '../services/api';

const RestauranteList = () => {
  const [restaurantes, setRestaurantes] = useState([]);
  const [filteredRestaurantes, setFilteredRestaurantes] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [tiposCocina, setTiposCocina] = useState([]);
  const [localizaciones, setLocalizaciones] = useState([]);
  const [selectedTipoCocina, setSelectedTipoCocina] = useState('');
  const [selectedLocalizacion, setSelectedLocalizacion] = useState('');
  const [formData, setFormData] = useState({
    Nombre: '',
    'Tipo de cocina': '',
    'Localización': '',
  });
  const [isEditing, setIsEditing] = useState(false);
  const [editingId, setEditingId] = useState(null);

  const cargarRestaurantes = async () => {
    try {
      const response = await api.get('/restaurantes');
      setRestaurantes(response.data);
    } catch (error) {
      console.error('Error al cargar restaurantes:', error);
    }
  };

  const aplicarFiltros = useCallback(() => {
    let filtered = [...restaurantes];

    if (searchTerm) {
      filtered = filtered.filter(rest => 
        rest.Nombre.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (selectedTipoCocina) {
      filtered = filtered.filter(rest => 
        rest['Tipo de cocina'] === selectedTipoCocina
      );
    }

    if (selectedLocalizacion) {
      filtered = filtered.filter(rest => 
        rest['Localización'] === selectedLocalizacion
      );
    }

    setFilteredRestaurantes(filtered);
  }, [restaurantes, searchTerm, selectedTipoCocina, selectedLocalizacion]);

  useEffect(() => {
    cargarRestaurantes();
  }, []);

  useEffect(() => {
    // Extraer tipos de cocina y localizaciones únicos
    const tipos = [...new Set(restaurantes.map(r => r['Tipo de cocina']))];
    const locs = [...new Set(restaurantes.map(r => r['Localización']))];
    setTiposCocina(tipos);
    setLocalizaciones(locs);
    aplicarFiltros();
  }, [restaurantes, aplicarFiltros]);

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (isEditing) {
        await api.put(`/restaurantes/${editingId}`, formData);
      } else {
        await api.post('/restaurantes', formData);
      }
      cargarRestaurantes();
      resetForm();
    } catch (error) {
      console.error('Error al guardar restaurante:', error);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('¿Estás seguro de querer eliminar este restaurante?')) {
      try {
        await api.delete(`/restaurantes/${id}`);
        cargarRestaurantes();
      } catch (error) {
        console.error('Error al eliminar restaurante:', error);
      }
    }
  };

  const handleEdit = (restaurante) => {
    setFormData({
      Nombre: restaurante.Nombre,
      'Tipo de cocina': restaurante['Tipo de cocina'],
      'Localización': restaurante['Localización']
    });
    setIsEditing(true);
    setEditingId(restaurante._id);
  };

  const resetForm = () => {
    setFormData({
      Nombre: '',
      'Tipo de cocina': '',
      'Localización': ''
    });
    setIsEditing(false);
    setEditingId(null);
  };

  return (
    <div style={{ padding: '20px' }}>
      <h2 style={{ marginBottom: '20px' }}>Gestión de Restaurantes</h2>

      {/* Formulario de creación/edición */}
      <div style={{ marginBottom: '20px', padding: '20px', border: '1px solid #ccc', borderRadius: '4px' }}>
        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: '10px' }}>
            <input
              type="text"
              name="Nombre"
              placeholder="Nombre del restaurante"
              value={formData.Nombre}
              onChange={handleInputChange}
              style={{ padding: '8px', marginRight: '10px', width: '200px' }}
            />
            <input
              type="text"
              name="Tipo de cocina"
              placeholder="Tipo de cocina"
              value={formData['Tipo de cocina']}
              onChange={handleInputChange}
              style={{ padding: '8px', marginRight: '10px', width: '200px' }}
            />
            <input
              type="text"
              name="Localización"
              placeholder="Localización"
              value={formData['Localización']}
              onChange={handleInputChange}
              style={{ padding: '8px', marginRight: '10px', width: '200px' }}
            />
          </div>
          <button 
            type="submit"
            style={{ 
              padding: '8px 16px', 
              backgroundColor: '#007bff', 
              color: 'white', 
              border: 'none', 
              borderRadius: '4px',
              marginRight: '10px'
            }}
          >
            {isEditing ? 'Actualizar' : 'Crear'} Restaurante
          </button>
          {isEditing && (
            <button 
              type="button" 
              onClick={resetForm}
              style={{ 
                padding: '8px 16px', 
                backgroundColor: '#6c757d', 
                color: 'white', 
                border: 'none', 
                borderRadius: '4px' 
              }}
            >
              Cancelar
            </button>
          )}
        </form>
      </div>

      {/* Filtros y búsqueda */}
      <div style={{ marginBottom: '20px' }}>
        <input
          type="text"
          placeholder="Buscar restaurantes..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          style={{ padding: '8px', marginRight: '10px', width: '200px' }}
        />
        <select
          value={selectedTipoCocina}
          onChange={(e) => setSelectedTipoCocina(e.target.value)}
          style={{ padding: '8px', marginRight: '10px' }}
        >
          <option value="">Todos los tipos de cocina</option>
          {tiposCocina.map(tipo => (
            <option key={tipo} value={tipo}>{tipo}</option>
          ))}
        </select>
        <select
          value={selectedLocalizacion}
          onChange={(e) => setSelectedLocalizacion(e.target.value)}
          style={{ padding: '8px' }}
        >
          <option value="">Todas las localizaciones</option>
          {localizaciones.map(loc => (
            <option key={loc} value={loc}>{loc}</option>
          ))}
        </select>
      </div>

      {/* Lista de restaurantes */}
      <div>
        {filteredRestaurantes.map((restaurante) => (
          <div 
            key={restaurante._id} 
            style={{
              padding: '15px',
              marginBottom: '10px',
              border: '1px solid #ddd',
              borderRadius: '4px',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center'
            }}
          >
            <div>
              <h3 style={{ margin: '0 0 5px 0' }}>{restaurante.Nombre}</h3>
              <p style={{ margin: 0 }}>{restaurante['Tipo de cocina']} - {restaurante['Localización']}</p>
            </div>
            <div>
              <button
                onClick={() => handleEdit(restaurante)}
                style={{ 
                  padding: '5px 10px', 
                  backgroundColor: '#28a745', 
                  color: 'white', 
                  border: 'none', 
                  borderRadius: '4px',
                  marginRight: '5px'
                }}
              >
                Editar
              </button>
              <button
                onClick={() => handleDelete(restaurante._id)}
                style={{ 
                  padding: '5px 10px', 
                  backgroundColor: '#dc3545', 
                  color: 'white', 
                  border: 'none', 
                  borderRadius: '4px'
                }}
              >
                Eliminar
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default RestauranteList;
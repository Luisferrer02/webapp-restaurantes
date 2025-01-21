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
    'Fecha': ''
  });
  const [isEditing, setIsEditing] = useState(false);
  const [editingId, setEditingId] = useState(null);

  const cargarRestaurantes = async () => {
    try {
      const response = await api.get('/restaurantes');
      console.log('Datos recibidos:', response.data);
      setRestaurantes(response.data);
      setFilteredRestaurantes(response.data);
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
      const dataToSend = {
        ...formData,
        Fecha: formData.Fecha || new Date().toISOString().split('T')[0] // Si no hay fecha, usa la actual
      };

      console.log('Datos a enviar:', dataToSend);

      if (isEditing && editingId) {
        console.log('Editando restaurante con ID:', editingId);
        const response = await api.put(`/restaurantes/${editingId}`, dataToSend);
        console.log('Respuesta de edición:', response.data);
      } else {
        console.log('Creando nuevo restaurante');
        const response = await api.post('/restaurantes', dataToSend);
        console.log('Respuesta de creación:', response.data);
      }
      
      await cargarRestaurantes();
      resetForm();
    } catch (error) {
      console.error('Error detallado:', error);
      console.error('Datos de la respuesta:', error.response?.data);
      alert(`Error: ${error.response?.data?.message || error.message}`);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('¿Estás seguro de querer eliminar este restaurante?')) {
      try {
        await api.delete(`/restaurantes/${id}`);
        cargarRestaurantes();
      } catch (error) {
        console.error('Error al eliminar restaurante:', error);
        alert(`Error al eliminar: ${error.response?.data?.message || error.message}`);
      }
    }
  };

  const handleEdit = (restaurante) => {
    setFormData({
      Nombre: restaurante.Nombre || '',
      'Tipo de cocina': restaurante['Tipo de cocina'] || '',
      'Localización': restaurante['Localización'] || '',
      'Fecha': restaurante.Fecha || ''
    });
    setIsEditing(true);
    setEditingId(restaurante._id);
  };

  const resetForm = () => {
    setFormData({
      Nombre: '',
      'Tipo de cocina': '',
      'Localización': '',
      'Fecha': ''
    });
    setIsEditing(false);
    setEditingId(null);
  };

  return (
    <div style={{ padding: '20px' }}>
      <h2 style={{ marginBottom: '20px' }}>Gestión de Restaurantes</h2>

      {/* Formulario */}
      <div style={{ marginBottom: '20px', padding: '20px', border: '1px solid #ccc', borderRadius: '4px' }}>
        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: '10px' }}>
            <input
              type="text"
              name="Nombre"
              placeholder="Nombre del restaurante"
              value={formData.Nombre}
              onChange={handleInputChange}
              required
              style={{ padding: '8px', marginRight: '10px', width: '200px' }}
            />
            <input
              type="text"
              name="Tipo de cocina"
              placeholder="Tipo de cocina"
              value={formData['Tipo de cocina']}
              onChange={handleInputChange}
              required
              style={{ padding: '8px', marginRight: '10px', width: '200px' }}
            />
            <input
              type="text"
              name="Localización"
              placeholder="Localización"
              value={formData['Localización']}
              onChange={handleInputChange}
              required
              style={{ padding: '8px', marginRight: '10px', width: '200px' }}
            />
            <input
              type="date"
              name="Fecha"
              value={formData.Fecha}
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

      {/* Filtros */}
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

      {/* Lista */}
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
              <p style={{ margin: 0 }}>
                {restaurante['Tipo de cocina']} - {restaurante['Localización']}
                {restaurante.Fecha && ` - ${new Date(restaurante.Fecha).toLocaleDateString()}`}
              </p>
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
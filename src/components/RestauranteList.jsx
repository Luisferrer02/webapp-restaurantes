// RestauranteList.jsx
import React, { useState, useEffect, useCallback } from "react";
import api from "../services/api";
import "./Restaurante.css";
import RestauranteDetailsModal from "./RestauranteDetailsModal";

const RestauranteList = () => {
  const [restaurantes, setRestaurantes] = useState([]);
  const [filteredRestaurantes, setFilteredRestaurantes] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [tiposCocina, setTiposCocina] = useState([]);
  const [localizaciones, setLocalizaciones] = useState([]);
  const [showLocalizacionDropdown, setShowLocalizacionDropdown] = useState(false);
  const [selectedLocalizacion, setSelectedLocalizacion] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedRestauranteId, setSelectedRestauranteId] = useState(null);

  const [showDropdown, setShowDropdown] = useState(false);
  const [formData, setFormData] = useState({
    Nombre: "",
    "Tipo de cocina": "",
    Localización: "",
    Fecha: "",
  });
  const [isEditing, setIsEditing] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [selectedTiposCocina, setSelectedTiposCocina] = useState([]);
  const [visitadoFilter, setVisitadoFilter] = useState("");

  const handleTipoCocinaChange = (e) => {
    const value = e.target.value;
    setSelectedTiposCocina(
      (prev) =>
        prev.includes(value)
          ? prev.filter((tipo) => tipo !== value) // Quitar si ya está seleccionado
          : [...prev, value] // Añadir si no está seleccionado
    );
  };

  const cargarRestaurantes = async () => {
    try {
      const response = await api.get("/restaurantes");
      console.log("Datos recibidos:", response.data);
      setRestaurantes(response.data);
      setFilteredRestaurantes(response.data);
    } catch (error) {
      console.error("Error al cargar restaurantes:", error);
      alert("Error al cargar restaurantes.");
    }
  };

  const handleSort = (order) => {
    if (!filteredRestaurantes || filteredRestaurantes.length === 0) return;

    const sorted = [...filteredRestaurantes].sort((a, b) => {
      const dateA =
        a.fechasVisita?.length > 0 ? new Date(a.fechasVisita[a.fechasVisita.length - 1]) : new Date(0);
      const dateB =
        b.fechasVisita?.length > 0 ? new Date(b.fechasVisita[b.fechasVisita.length - 1]) : new Date(0);
      return order === "asc" ? dateA - dateB : dateB - dateA;
    });
    setFilteredRestaurantes(sorted);
  };

  const handleRestaurantClick = (id) => {
    setSelectedRestauranteId(id);
    setIsModalOpen(true);
  };

  const aplicarFiltros = useCallback(() => {
    let filtered = [...restaurantes];

    // Filtro por nombre (búsqueda)
    if (searchTerm) {
      filtered = filtered.filter((rest) =>
        rest.Nombre.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Filtro por múltiples tipos de cocina
    if (selectedTiposCocina.length > 0) {
      filtered = filtered.filter((rest) =>
        selectedTiposCocina.includes(rest["Tipo de cocina"])
      );
    }

    // Filtro por localización
    if (selectedLocalizacion) {
      filtered = filtered.filter(
        (rest) => rest["Localización"] === selectedLocalizacion
      );
    }

    // Filtro por visitado/no visitado
    if (visitadoFilter === "visitado") {
      filtered = filtered.filter((rest) => rest.fechasVisita?.length > 0);
    } else if (visitadoFilter === "no-visitado") {
      filtered = filtered.filter(
        (rest) => !rest.fechasVisita || rest.fechasVisita.length === 0
      );
    }

    setFilteredRestaurantes(filtered);
  }, [
    restaurantes,
    searchTerm,
    selectedTiposCocina,
    selectedLocalizacion,
    visitadoFilter,
  ]);

  useEffect(() => {
    cargarRestaurantes();
  }, []);

  useEffect(() => {
    const tipos = [...new Set(restaurantes.map((r) => r["Tipo de cocina"]))];
    const locs = [...new Set(restaurantes.map((r) => r["Localización"]))];
    setTiposCocina(tipos);
    setLocalizaciones(locs);
    aplicarFiltros();
  }, [restaurantes, aplicarFiltros]);

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const dataToSend = {
        Nombre: formData.Nombre,
        "Tipo de cocina": formData["Tipo de cocina"],
        Localización: formData["Localización"],
        Fecha: formData.Fecha || "", // Si no hay fecha, se envía como vacío
      };

      console.log("Datos a enviar:", dataToSend);

      if (isEditing && editingId) {
        console.log("Editando restaurante con ID:", editingId);
        const response = await api.put(
          `/restaurantes/${editingId}`,
          dataToSend
        );
        console.log("Respuesta de edición:", response.data);
      } else {
        console.log("Creando nuevo restaurante");
        const response = await api.post("/restaurantes", dataToSend);
        console.log("Respuesta de creación:", response.data);
      }

      await cargarRestaurantes();
      resetForm();
    } catch (error) {
      console.error("Error detallado:", error);
      alert(`Error: ${error.response?.data?.message || error.message}`);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm("¿Estás seguro de querer eliminar este restaurante?")) {
      try {
        await api.delete(`/restaurantes/${id}`);
        cargarRestaurantes();
      } catch (error) {
        console.error("Error al eliminar restaurante:", error);
        alert(
          `Error al eliminar: ${error.response?.data?.message || error.message}`
        );
      }
    }
  };

  const handleEdit = (restaurante) => {
    setFormData({
      Nombre: restaurante.Nombre || "",
      "Tipo de cocina": restaurante["Tipo de cocina"] || "",
      Localización: restaurante["Localización"] || "",
      Fecha: restaurante.Fecha || "",
    });
    setIsEditing(true);
    setEditingId(restaurante._id);
  };

  const resetForm = () => {
    setFormData({
      Nombre: "",
      "Tipo de cocina": "",
      Localización: "",
      Fecha: "",
    });
    setIsEditing(false);
    setEditingId(null);
  };

  return (
    <div className="container">
      <h2 className="title">Gestión de Restaurantes</h2>

      {/* Formulario */}
      <div className="form-container">
        <form onSubmit={handleSubmit}>
          <div className="form-inputs">
            <input
              type="text"
              name="Nombre"
              placeholder="Nombre del restaurante"
              value={formData.Nombre}
              onChange={handleInputChange}
              required
              className="input"
            />
            <input
              type="text"
              name="Tipo de cocina"
              placeholder="Tipo de cocina"
              value={formData["Tipo de cocina"]}
              onChange={handleInputChange}
              required
              className="input"
            />
            <input
              type="text"
              name="Localización"
              placeholder="Localización"
              value={formData["Localización"]}
              onChange={handleInputChange}
              required
              className="input"
            />
            <input
              type="date"
              name="Fecha"
              value={formData.Fecha}
              onChange={handleInputChange}
              className="input"
            />
          </div>
          <button type="submit" className="btn btn-primary">
            {isEditing ? "Actualizar" : "Crear"} Restaurante
          </button>
          {isEditing && (
            <button
              type="button"
              onClick={resetForm}
              className="btn btn-secondary"
            >
              Cancelar
            </button>
          )}
        </form>
      </div>

      {/* Filtros */}
      <div className="filters-section">
        {/* Búsqueda por nombre */}
        <div className="filter-item">
          <input
            type="text"
            placeholder="Buscar restaurantes..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-input"
          />
        </div>

        {/* Dropdown de Tipos de Cocina */}
        <div className="filter-item dropdown-container">
          <button
            onClick={() => setShowDropdown((prev) => !prev)}
            className="dropdown-button"
          >
            {selectedTiposCocina.length > 0
              ? `Seleccionados: ${selectedTiposCocina.join(", ")}`
              : "Seleccionar Tipos de Cocina"}
            <span className="dropdown-arrow">▼</span>
          </button>

          {showDropdown && (
            <div className="dropdown-menu dropdown-tipos-cocina">
              {tiposCocina.map((tipo) => (
                <label key={tipo} className="dropdown-item tipo-cocina-item">
                  <input
                    type="checkbox"
                    value={tipo}
                    onChange={handleTipoCocinaChange}
                    checked={selectedTiposCocina.includes(tipo)}
                    className="checkbox"
                  />
                  {tipo}
                </label>
              ))}
            </div>
          )}
        </div>

        {/* Dropdown de Localización */}
        <div className="filter-item dropdown-container">
          <button
            onClick={() => setShowLocalizacionDropdown((prev) => !prev)}
            className="dropdown-button"
          >
            {selectedLocalizacion || "Seleccionar Localización"}
            <span className="dropdown-arrow">▼</span>
          </button>

          {showLocalizacionDropdown && (
            <div className="dropdown-menu dropdown-localizacion">
              {localizaciones.map((loc) => (
                <label key={loc} className="dropdown-item localizacion-item">
                  <input
                    type="radio"
                    name="localizacion"
                    value={loc}
                    checked={selectedLocalizacion === loc}
                    onChange={(e) => setSelectedLocalizacion(e.target.value)}
                    className="radio"
                  />
                  {loc}
                </label>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Filtros por visitas y ordenación */}
      <div className="visit-sort-section">
        {/* Botones de visitas */}
        <div className="visit-buttons">
          <button onClick={() => setVisitadoFilter("")} className="btn">
            Todos
          </button>
          <button onClick={() => setVisitadoFilter("visitado")} className="btn">
            Visitados
          </button>
          <button
            onClick={() => setVisitadoFilter("no-visitado")}
            className="btn"
          >
            No Visitados
          </button>
        </div>

        {/* Botones para ordenar */}
        <div className="sort-buttons">
          <button onClick={() => handleSort("asc")} className="btn">
            Ordenar por Fecha (Asc)
          </button>
          <button onClick={() => handleSort("desc")} className="btn">
            Ordenar por Fecha (Desc)
          </button>
        </div>
      </div>

      {/* Lista */}
      <div className="restaurant-list">
        {filteredRestaurantes.map((restaurante) => (
          <div
            key={restaurante._id}
            className="restaurant-card"
            onClick={() => handleRestaurantClick(restaurante._id)}
          >
            <div className="restaurant-info">
              <h3 className="restaurant-title">{restaurante.Nombre}</h3>
              <p className="restaurant-details">
                {restaurante["Tipo de cocina"]} - {restaurante["Localización"]}
                {restaurante.fechasVisita?.length > 0
                  ? ` - ${restaurante.fechasVisita.length} visita(s)`
                  : " - No visitado"}
              </p>
              <ul className="visit-list">
                {restaurante.fechasVisita?.length > 0 ? (
                  restaurante.fechasVisita.map((fecha, index) => (
                    <li key={index}>{new Date(fecha).toLocaleDateString()}</li>
                  ))
                ) : (
                  <li>No hay visitas registradas</li>
                )}
              </ul>
            </div>
            <div className="action-buttons">
              <button
                onClick={async (e) => {
                  e.stopPropagation(); // Evita que el clic navegue al modal
                  try {
                    const response = await api.put(
                      `/restaurantes/${restaurante._id}/visita`
                    );
                    console.log("Visita registrada:", response.data);
                    await cargarRestaurantes();
                  } catch (error) {
                    console.error("Error al registrar la visita:", error);
                    alert(
                      `Error al registrar la visita: ${error.response?.data?.message || error.message}`
                    );
                  }
                }}
                className="btn btn-primary"
              >
                Registrar Visita
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation(); // Evita que el clic navegue al modal
                  handleEdit(restaurante);
                }}
                className="btn btn-success"
              >
                Editar
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation(); // Evita que el clic navegue al modal
                  handleDelete(restaurante._id);
                }}
                className="btn btn-danger"
              >
                Eliminar
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Modal de Detalles del Restaurante */}
      <RestauranteDetailsModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        restauranteId={selectedRestauranteId}
        onUpdate={() => cargarRestaurantes()}
      />
    </div>
  );
};

export default RestauranteList;

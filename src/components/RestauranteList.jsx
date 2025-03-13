import React, { useState, useEffect, useCallback } from "react";
import api from "../services/api";
import "./Restaurante.css";
import RestauranteDetailsModal from "./RestauranteDetailsModal";

const RestauranteList = () => {
  // Estados para la lista y filtros
  const [restaurantes, setRestaurantes] = useState([]);
  const [filteredRestaurantes, setFilteredRestaurantes] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [tiposCocina, setTiposCocina] = useState([]);
  const [localizaciones, setLocalizaciones] = useState([]);
  const [showLocalizacionDropdown, setShowLocalizacionDropdown] = useState(false);
  const [selectedLocalizacion, setSelectedLocalizacion] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedRestauranteId, setSelectedRestauranteId] = useState(null);

  // Estados para el formulario de creación/edición
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
  const [sortCriteria, setSortCriteria] = useState("");

  // Función para manejar la selección de tipos de cocina
  const handleTipoCocinaChange = (e) => {
    const value = e.target.value;
    setSelectedTiposCocina((prev) =>
      prev.includes(value)
        ? prev.filter((tipo) => tipo !== value)
        : [...prev, value]
    );
  };

  // Función para cargar restaurantes desde la API
  const cargarRestaurantes = useCallback(async () => {
    try {
      // Se envían los parámetros de filtro y ordenación al backend
      const params = {
        visitado:
          visitadoFilter === "visitado"
            ? "si"
            : visitadoFilter === "no-visitado"
            ? "no"
            : undefined,
        sort: sortCriteria || undefined,
      };
      const response = await api.get("/restaurantes", { params });
      console.log("Datos recibidos:", response.data);
      // Asumimos que el backend envía { total, restaurantes }
      setRestaurantes(response.data.restaurantes);
      setFilteredRestaurantes(response.data.restaurantes);
    } catch (error) {
      console.error("Error al cargar restaurantes:", error);
      alert("Error al cargar restaurantes.");
    }
  }, [visitadoFilter, sortCriteria]);

  // useEffect para cargar los datos al montar y cuando cambien filtros de backend
  useEffect(() => {
    cargarRestaurantes();
  }, [cargarRestaurantes]);

  // Aplicar filtros adicionales en el frontend (por búsqueda, tipos y localización)
  const aplicarFiltros = useCallback(() => {
    let filtered = [...restaurantes];

    // Filtro por nombre
    if (searchTerm) {
      filtered = filtered.filter((rest) =>
        rest.Nombre.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Filtro por tipos de cocina (frontend)
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

    setFilteredRestaurantes(filtered);
  }, [restaurantes, searchTerm, selectedTiposCocina, selectedLocalizacion]);

  // Actualizar listas de tipos y localizaciones, y aplicar filtros
  useEffect(() => {
    const tipos = [
      ...new Set(restaurantes.map((r) => r["Tipo de cocina"])),
    ].sort((a, b) => a.localeCompare(b));
    const locs = [...new Set(restaurantes.map((r) => r["Localización"]))];
    setTiposCocina(tipos);
    setLocalizaciones(locs);
    aplicarFiltros();
  }, [restaurantes, aplicarFiltros]);

  // Manejo de cambios en el formulario
  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  // Envío del formulario para crear o actualizar restaurante
  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const dataToSend = {
        Nombre: formData.Nombre,
        "Tipo de cocina": formData["Tipo de cocina"],
        Localización: formData["Localización"],
        Fecha: formData.Fecha || "",
      };

      console.log("Datos a enviar:", dataToSend);

      if (isEditing && editingId) {
        console.log("Editando restaurante con ID:", editingId);
        const response = await api.put(`/restaurantes/${editingId}`, dataToSend);
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

  // Función para eliminar un restaurante
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

  // Función para preparar la edición
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

  // Reiniciar formulario
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

  // Abrir modal de detalles
  const handleRestaurantClick = (id) => {
    setSelectedRestauranteId(id);
    setIsModalOpen(true);
  };

  return (
    <div className="container">
      <h2 className="title">Gestión de Restaurantes</h2>

      {/* Formulario para crear o editar restaurante */}
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

      {/* Sección de filtros */}
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

        {/* Dropdown para seleccionar tipos de cocina */}
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

        {/* Dropdown para seleccionar localización */}
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

      {/* Sección de botones para filtrar por visitas y ordenar */}
      <div className="visit-sort-section">
        {/* Filtro por visitas */}
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
          <button
            onClick={() => {
              setSortCriteria("fecha");
              cargarRestaurantes();
            }}
            className="btn"
          >
            Ordenar por Fecha (visitados primero)
          </button>
          <button
            onClick={() => {
              setSortCriteria("nombre");
              cargarRestaurantes();
            }}
            className="btn"
          >
            Ordenar alfabéticamente por Nombre
          </button>
          <button
            onClick={() => {
              setSortCriteria("tipo");
              cargarRestaurantes();
            }}
            className="btn"
          >
            Ordenar alfabéticamente por Tipo de Cocina
          </button>
        </div>
      </div>

      {/* Mostrar el número de resultados */}
      <div className="results-count">
        <p>{`Resultados: ${filteredRestaurantes.length}`}</p>
      </div>

      {/* Lista de restaurantes */}
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
                {restaurante["Tipo de cocina"]} - {restaurante["Localización"]}{" "}
                {restaurante.visitas?.length > 0
                  ? `- ${restaurante.visitas.length} visita(s)`
                  : "- No visitado"}
              </p>
              <ul className="visit-list">
                {restaurante.visitas?.length > 0 ? (
                  restaurante.visitas.map((visita, index) => (
                    <li key={index}>
                      {new Date(visita.fecha).toLocaleDateString()} -{" "}
                      {visita.comentario || "Sin comentario"}
                    </li>
                  ))
                ) : (
                  <li>No hay visitas registradas</li>
                )}
              </ul>
            </div>
            <div className="action-buttons">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleEdit(restaurante);
                }}
                className="btn btn-success"
              >
                Editar
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
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

      {/* Modal de detalles */}
      <RestauranteDetailsModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        restauranteId={selectedRestauranteId}
        onUpdate={cargarRestaurantes}
      />
    </div>
  );
};

export default RestauranteList;

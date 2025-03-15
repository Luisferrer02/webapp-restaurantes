//src/components/RestauranteList.jsx

import React, { useState, useEffect, useCallback } from "react";
import api from "../services/api";
import "./Restaurante.css";
import RestauranteDetailsModal from "./RestauranteDetailsModal";
import LocationSelectionModal from "./LocationSelectionModal"; // Importamos el nuevo modal
const RestauranteList = () => {
  // States for restaurants and UI features
  const [originalRestaurantes, setOriginalRestaurantes] = useState([]);
  const [filteredRestaurantes, setFilteredRestaurantes] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");

  // States for filtering options
  const [tiposCocina, setTiposCocina] = useState([]);
  const [selectedTiposCocina, setSelectedTiposCocina] = useState([]);
  const [showTiposDropdown, setShowTiposDropdown] = useState(false);
  const [localizaciones, setLocalizaciones] = useState([]);
  const [showLocalizacionDropdown, setShowLocalizacionDropdown] =
    useState(false);
  const [selectedLocalizacion, setSelectedLocalizacion] = useState("");

  // Additional filters and sorting
  const [visitadoFilter, setVisitadoFilter] = useState("");
  const [activeSort, setActiveSort] = useState({
    criterion: null,
    order: null,
  });

  // Modal and selection states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedRestauranteId, setSelectedRestauranteId] = useState(null);

  // Form states for creation/editing
  const [formData, setFormData] = useState({
    Nombre: "",
    "Tipo de cocina": "",
    Localización: "",
    Fecha: "",
  });
  const [isEditing, setIsEditing] = useState(false);
  const [editingId, setEditingId] = useState(null);

  // Nuevo estado para controlar la apertura del modal de localización
  const [showLocationModal, setShowLocationModal] = useState(false);
  // Nuevo estado para almacenar la localización seleccionada
  const [selectedLocationData, setSelectedLocationData] = useState(null);

  // Instead of using a readOnly boolean, we now use viewMode:
  // "private" (full access) or "public" (read-only)
  const [viewMode, setViewMode] = useState("private");
  const [loading, setLoading] = useState(false);

  // Fetch function: solo carga los datos, el filtrado se aplica después
  const fetchRestaurantes = useCallback(async () => {
    setLoading(true);
    try {
      const endpoint =
        viewMode === "public" ? "/restaurantes/public" : "/restaurantes";
      const params = {};
      const response = await api.get(endpoint, { params });
      console.log("Datos recibidos:", response.data);
      const restaurantes = response.data.restaurantes || [];
      setOriginalRestaurantes(restaurantes);
      setFilteredRestaurantes(restaurantes);
    } catch (error) {
      console.error("Error al cargar restaurantes:", error);
      alert("Error al cargar restaurantes.");
      setOriginalRestaurantes([]);
      setFilteredRestaurantes([]);
    } finally {
      setLoading(false);
    }
  }, [viewMode]);

  // Apply filters and sorting to the original list
  const aplicarFiltros = useCallback(() => {
    let filtered = [...originalRestaurantes]; // Declaramos 'filtered' aquí

    // Filtrado por término de búsqueda
    if (searchTerm) {
      filtered = filtered.filter((rest) =>
        rest.Nombre.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Filtrado por tipo de cocina
    if (selectedTiposCocina.length > 0) {
      filtered = filtered.filter((rest) =>
        selectedTiposCocina.includes(rest["Tipo de cocina"])
      );
    }

    // Filtrado por localización
    if (selectedLocalizacion) {
      filtered = filtered.filter(
        (rest) => rest["Localización"] === selectedLocalizacion
      );
    }

    // Filtrado por visitado/no visitado
    if (visitadoFilter) {
      filtered = filtered.filter((rest) =>
        visitadoFilter === "visitado"
          ? rest.visitas && rest.visitas.length > 0
          : rest.visitas && rest.visitas.length === 0
      );
    }

    // Ordenamiento según criterio activo
    if (activeSort.criterion) {
      filtered.sort((a, b) => {
        let fieldA, fieldB;
        if (activeSort.criterion === "fecha") {
          fieldA =
            a.visitas && a.visitas.length > 0
              ? new Date(a.visitas[a.visitas.length - 1].fecha)
              : new Date(0);
          fieldB =
            b.visitas && b.visitas.length > 0
              ? new Date(b.visitas[b.visitas.length - 1].fecha)
              : new Date(0);
        } else if (activeSort.criterion === "nombre") {
          fieldA = a.Nombre;
          fieldB = b.Nombre;
        } else if (activeSort.criterion === "tipo") {
          fieldA = a["Tipo de cocina"];
          fieldB = b["Tipo de cocina"];
        }
        if (activeSort.order === "asc") {
          return fieldA < fieldB ? -1 : fieldA > fieldB ? 1 : 0;
        } else if (activeSort.order === "desc") {
          return fieldA > fieldB ? -1 : fieldA < fieldB ? 1 : 0;
        }
        return 0;
      });
    }

    setFilteredRestaurantes(filtered);
  }, [
    originalRestaurantes,
    searchTerm,
    selectedTiposCocina,
    selectedLocalizacion,
    visitadoFilter,
    activeSort,
  ]);

  useEffect(() => {
    fetchRestaurantes();
  }, [fetchRestaurantes]);

  useEffect(() => {
    const tipos = [
      ...new Set(originalRestaurantes.map((r) => r["Tipo de cocina"])),
    ].sort((a, b) => a.localeCompare(b));
    const locs = [
      ...new Set(originalRestaurantes.map((r) => r["Localización"])),
    ];
    setTiposCocina(tipos);
    setLocalizaciones(locs);
    aplicarFiltros();
  }, [originalRestaurantes, aplicarFiltros]);

  useEffect(() => {
    aplicarFiltros();
  }, [
    searchTerm,
    selectedTiposCocina,
    selectedLocalizacion,
    activeSort,
    aplicarFiltros,
  ]);

  const handleToggleView = () => {
    setViewMode((prevMode) => (prevMode === "private" ? "public" : "private"));
  };

  const toggleSort = (criterion) => {
    setActiveSort((prev) => {
      if (prev.criterion !== criterion) {
        return { criterion, order: "asc" };
      } else {
        if (prev.order === "asc") {
          return { criterion, order: "desc" };
        } else if (prev.order === "desc") {
          return { criterion: null, order: null };
        } else {
          return { criterion, order: "asc" };
        }
      }
    });
  };

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    // Abrir modal de selección de localización (opcional)
    setShowLocationModal(true);
  };

  const submitRestaurantCreation = async () => {
    try {
      const dataToSend = {
        Nombre: formData.Nombre,
        "Tipo de cocina": formData["Tipo de cocina"],
        Localización: formData["Localización"],
        Fecha: formData.Fecha || "",
      };
      // Si se ha seleccionado una localización, la incluimos
      if (selectedLocationData) {
        dataToSend.location = {
          type: "Point",
          coordinates: selectedLocationData.geometry.coordinates, // [lon, lat]
          place_name: selectedLocationData.place_name,
        };
      }
      if (isEditing && editingId) {
        await api.put(`/restaurantes/${editingId}`, dataToSend);
      } else {
        await api.post("/restaurantes", dataToSend);
      }
      await fetchRestaurantes();
      resetForm();
      setSelectedLocationData(null);
    } catch (error) {
      alert(`Error: ${error.response?.data?.message || error.message}`);
    }
  };

  const handleLocationSelected = (feature) => {
    setSelectedLocationData(feature);
    // Una vez seleccionada la ubicación, enviar la creación del restaurante
    submitRestaurantCreation();
  };

  const handleDelete = async (id) => {
    if (window.confirm("¿Estás seguro de querer eliminar este restaurante?")) {
      try {
        await api.delete(`/restaurantes/${id}`);
        fetchRestaurantes();
      } catch (error) {
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

  const handleRestaurantClick = (id) => {
    if (viewMode === "private") {
      setSelectedRestauranteId(id);
      setIsModalOpen(true);
    }
  };

  const handleTipoCocinaChange = (e) => {
    const value = e.target.value;
    setSelectedTiposCocina((prev) =>
      prev.includes(value) ? prev.filter((v) => v !== value) : [...prev, value]
    );
  };

  const getVisitButtonClass = (filterValue) => {
    return visitadoFilter === filterValue
      ? "btn btn-primary"
      : "btn btn-secondary";
  };

  return (
    <div className="container">
      <h2 className="title">Gestión de Restaurantes</h2>

      {/* Toggle button for view mode */}
      <div style={{ marginBottom: "10px" }}>
        <button className="btn btn-secondary" onClick={handleToggleView}>
          {viewMode === "private"
            ? "Ver lista pública"
            : "Ver mis restaurantes"}
        </button>
      </div>

      {/* Form for creating/editing restaurants (only in private mode) */}
      {viewMode === "private" && (
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
      )}

      {/* Modal para seleccionar la localización (opcional) */}
      <LocationSelectionModal
        isOpen={showLocationModal}
        onClose={() => setShowLocationModal(false)}
        restaurantName={formData.Nombre}
        onSelect={handleLocationSelected} // Asegúrate de que handleLocationSelected esté definido
      />

      {/* Filters */}
      <div className="filters-section">
        <div className="filter-item">
          <input
            type="text"
            placeholder="Buscar restaurantes..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-input"
          />
        </div>
        <div className="filter-item dropdown-container">
          <button
            onClick={() => setShowTiposDropdown((prev) => !prev)}
            className="dropdown-button"
          >
            {selectedTiposCocina.length > 0
              ? `Seleccionados: ${selectedTiposCocina.join(", ")}`
              : "Seleccionar Tipos de Cocina"}
            <span className="dropdown-arrow">▼</span>
          </button>
          {showTiposDropdown && (
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

      {/* Visit filter and sorting */}
      <div className="visit-sort-section">
        <div className="visit-buttons">
          <button
            onClick={() => setVisitadoFilter("")}
            className={getVisitButtonClass("")}
          >
            Todos
          </button>
          <button
            onClick={() => setVisitadoFilter("visitado")}
            className={getVisitButtonClass("visitado")}
          >
            Visitados
          </button>
          <button
            onClick={() => setVisitadoFilter("no-visitado")}
            className={getVisitButtonClass("no-visitado")}
          >
            No Visitados
          </button>
        </div>
        <div className="sort-section">
          <button
            onClick={() => toggleSort("fecha")}
            className={
              activeSort.criterion === "fecha"
                ? "btn btn-primary"
                : "btn btn-secondary"
            }
          >
            Ordenar por Fecha{" "}
            {activeSort.criterion === "fecha"
              ? activeSort.order === "asc"
                ? "(Asc)"
                : activeSort.order === "desc"
                ? "(Desc)"
                : ""
              : ""}
          </button>
          <button
            onClick={() => toggleSort("nombre")}
            className={
              activeSort.criterion === "nombre"
                ? "btn btn-primary"
                : "btn btn-secondary"
            }
          >
            Ordenar por Nombre{" "}
            {activeSort.criterion === "nombre"
              ? activeSort.order === "asc"
                ? "(Asc)"
                : activeSort.order === "desc"
                ? "(Desc)"
                : ""
              : ""}
          </button>
          <button
            onClick={() => toggleSort("tipo")}
            className={
              activeSort.criterion === "tipo"
                ? "btn btn-primary"
                : "btn btn-secondary"
            }
          >
            Ordenar por Tipo de Cocina{" "}
            {activeSort.criterion === "tipo"
              ? activeSort.order === "asc"
                ? "(Asc)"
                : activeSort.order === "desc"
                ? "(Desc)"
                : ""
              : ""}
          </button>
        </div>
      </div>

      {/* Results count */}
      <div className="results-count">
        <p>{`Resultados: ${
          filteredRestaurantes ? filteredRestaurantes.length : 0
        }`}</p>
      </div>

      {/* Restaurant list */}
      <div className="restaurant-list">
        {loading ? (
          <p>Cargando restaurantes...</p>
        ) : (
          filteredRestaurantes.map((restaurante) => (
            <div
              key={restaurante._id}
              className="restaurant-card"
              onClick={() => handleRestaurantClick(restaurante._id)}
              style={{ cursor: viewMode === "private" ? "pointer" : "default" }}
            >
              <div className="restaurant-info">
                <h3 className="restaurant-title">{restaurante.Nombre}</h3>
                <p className="restaurant-details">
                  {restaurante["Tipo de cocina"]} -{" "}
                  {restaurante["Localización"]}{" "}
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
              {viewMode === "private" && (
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
              )}
            </div>
          ))
        )}
      </div>

      {/* Details modal (only in private view) */}
      {viewMode === "private" && (
        <RestauranteDetailsModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          restauranteId={selectedRestauranteId}
          onUpdate={fetchRestaurantes}
        />
      )}
    </div>
  );
};

export default RestauranteList;

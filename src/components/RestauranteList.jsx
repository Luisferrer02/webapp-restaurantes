import React, { useState, useEffect, useCallback } from "react";
import api from "../services/api";
import "./Restaurante.css";
import RestauranteDetailsModal from "./RestauranteDetailsModal";

const RestauranteList = () => {
  // Estados para la lista de restaurantes
  const [originalRestaurantes, setOriginalRestaurantes] = useState([]);
  const [filteredRestaurantes, setFilteredRestaurantes] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  
  // Estados para tipos de cocina y localizaciones
  const [tiposCocina, setTiposCocina] = useState([]);
  const [selectedTiposCocina, setSelectedTiposCocina] = useState([]);
  const [showTiposDropdown, setShowTiposDropdown] = useState(false);
  const [localizaciones, setLocalizaciones] = useState([]);
  const [showLocalizacionDropdown, setShowLocalizacionDropdown] = useState(false);
  const [selectedLocalizacion, setSelectedLocalizacion] = useState("");

  // Otros estados
  const [visitadoFilter, setVisitadoFilter] = useState("");
  const [activeSort, setActiveSort] = useState({ criterion: null, order: null });
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedRestauranteId, setSelectedRestauranteId] = useState(null);

  // Estados y funciones para el formulario de creación/edición
  const [formData, setFormData] = useState({
    Nombre: "",
    "Tipo de cocina": "",
    Localización: "",
    Fecha: "",
  });
  const [isEditing, setIsEditing] = useState(false);
  const [editingId, setEditingId] = useState(null);

  // Función para alternar el orden de ordenación
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

  // Función para cargar restaurantes desde el backend (filtrado por "visitado" se hace en backend)
  const cargarRestaurantes = useCallback(async () => {
    try {
      const params = {
        visitado:
          visitadoFilter === "visitado"
            ? "si"
            : visitadoFilter === "no-visitado"
            ? "no"
            : undefined,
      };
      const response = await api.get("/restaurantes", { params });
      console.log("Datos recibidos:", response.data);
      setOriginalRestaurantes(response.data.restaurantes);
      setFilteredRestaurantes(response.data.restaurantes);
    } catch (error) {
      console.error("Error al cargar restaurantes:", error);
      alert("Error al cargar restaurantes.");
    }
  }, [visitadoFilter]);

  // Función para aplicar filtros y orden en el frontend
  const aplicarFiltros = useCallback(() => {
    let filtered = [...originalRestaurantes];

    // Filtrado por término de búsqueda
    if (searchTerm) {
      filtered = filtered.filter((rest) =>
        rest.Nombre.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Filtrado por tipos de cocina
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

    // Aplicar ordenación según activeSort
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
          if (fieldA < fieldB) return -1;
          if (fieldA > fieldB) return 1;
          return 0;
        } else if (activeSort.order === "desc") {
          if (fieldA > fieldB) return -1;
          if (fieldA < fieldB) return 1;
          return 0;
        }
        return 0;
      });
    }
    setFilteredRestaurantes(filtered);
  }, [originalRestaurantes, searchTerm, selectedTiposCocina, selectedLocalizacion, activeSort]);

  useEffect(() => {
    cargarRestaurantes();
  }, [cargarRestaurantes]);

  useEffect(() => {
    // Actualizar listas de tipos de cocina y localizaciones
    const tipos = [...new Set(originalRestaurantes.map((r) => r["Tipo de cocina"]))].sort((a, b) =>
      a.localeCompare(b)
    );
    const locs = [...new Set(originalRestaurantes.map((r) => r["Localización"]))];
    setTiposCocina(tipos);
    setLocalizaciones(locs);
    aplicarFiltros();
  }, [originalRestaurantes, aplicarFiltros]);

  useEffect(() => {
    aplicarFiltros();
  }, [searchTerm, selectedTiposCocina, selectedLocalizacion, activeSort, aplicarFiltros]);

  // Manejo de inputs del formulario de creación/edición
  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const dataToSend = {
        Nombre: formData.Nombre,
        "Tipo de cocina": formData["Tipo de cocina"],
        Localización: formData["Localización"],
        Fecha: formData.Fecha || "",
      };

      if (isEditing && editingId) {
        await api.put(`/restaurantes/${editingId}`, dataToSend);
      } else {
        await api.post("/restaurantes", dataToSend);
      }
      await cargarRestaurantes();
      resetForm();
    } catch (error) {
      alert(`Error: ${error.response?.data?.message || error.message}`);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm("¿Estás seguro de querer eliminar este restaurante?")) {
      try {
        await api.delete(`/restaurantes/${id}`);
        cargarRestaurantes();
      } catch (error) {
        alert(`Error al eliminar: ${error.response?.data?.message || error.message}`);
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
    setFormData({ Nombre: "", "Tipo de cocina": "", Localización: "", Fecha: "" });
    setIsEditing(false);
    setEditingId(null);
  };

  const handleRestaurantClick = (id) => {
    setSelectedRestauranteId(id);
    setIsModalOpen(true);
  };

  // Función para manejar el cambio de selección en el dropdown de tipos de cocina
  const handleTipoCocinaChange = (e) => {
    const value = e.target.value;
    setSelectedTiposCocina((prev) => {
      if (prev.includes(value)) {
        return prev.filter((v) => v !== value);
      } else {
        return [...prev, value];
      }
    });
  };

  // Asigna clases a los botones de filtro de visitas según estén activos o no
  const getVisitButtonClass = (filterValue) => {
    return visitadoFilter === filterValue ? "btn btn-primary" : "btn btn-secondary";
  };

  return (
    <div className="container">
      <h2 className="title">Gestión de Restaurantes</h2>

      {/* Formulario para crear/editar */}
      <div className="form-container">
        <form onSubmit={handleSubmit}>
          <div className="form-inputs">
            <input type="text" name="Nombre" placeholder="Nombre del restaurante" value={formData.Nombre} onChange={handleInputChange} required className="input" />
            <input type="text" name="Tipo de cocina" placeholder="Tipo de cocina" value={formData["Tipo de cocina"]} onChange={handleInputChange} required className="input" />
            <input type="text" name="Localización" placeholder="Localización" value={formData["Localización"]} onChange={handleInputChange} required className="input" />
          </div>
          <button type="submit" className="btn btn-primary">
            {isEditing ? "Actualizar" : "Crear"} Restaurante
          </button>
          {isEditing && (
            <button type="button" onClick={resetForm} className="btn btn-secondary">
              Cancelar
            </button>
          )}
        </form>
      </div>

      {/* Sección de filtros */}
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
          <button onClick={() => setShowTiposDropdown((prev) => !prev)} className="dropdown-button">
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
          <button onClick={() => setShowLocalizacionDropdown((prev) => !prev)} className="dropdown-button">
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

      {/* Botones de filtro de visitas y ordenación toggle */}
      <div className="visit-sort-section">
        <div className="visit-buttons">
          <button onClick={() => setVisitadoFilter("")} className={getVisitButtonClass("")}>
            Todos
          </button>
          <button onClick={() => setVisitadoFilter("visitado")} className={getVisitButtonClass("visitado")}>
            Visitados
          </button>
          <button onClick={() => setVisitadoFilter("no-visitado")} className={getVisitButtonClass("no-visitado")}>
            No Visitados
          </button>
        </div>
        <div className="sort-section">
          <button onClick={() => toggleSort("fecha")} className={activeSort.criterion === "fecha" ? "btn btn-primary" : "btn btn-secondary"}>
            Ordenar por Fecha{" "}
            {activeSort.criterion === "fecha" ? (activeSort.order === "asc" ? "(Asc)" : activeSort.order === "desc" ? "(Desc)" : "") : ""}
          </button>
          <button onClick={() => toggleSort("nombre")} className={activeSort.criterion === "nombre" ? "btn btn-primary" : "btn btn-secondary"}>
            Ordenar por Nombre{" "}
            {activeSort.criterion === "nombre" ? (activeSort.order === "asc" ? "(Asc)" : activeSort.order === "desc" ? "(Desc)" : "") : ""}
          </button>
          <button onClick={() => toggleSort("tipo")} className={activeSort.criterion === "tipo" ? "btn btn-primary" : "btn btn-secondary"}>
            Ordenar por Tipo de Cocina{" "}
            {activeSort.criterion === "tipo" ? (activeSort.order === "asc" ? "(Asc)" : activeSort.order === "desc" ? "(Desc)" : "") : ""}
          </button>
        </div>
      </div>

      {/* Mostrar número de resultados */}
      <div className="results-count">
        <p>{`Resultados: ${filteredRestaurantes.length}`}</p>
      </div>

      {/* Lista de restaurantes */}
      <div className="restaurant-list">
        {filteredRestaurantes.map((restaurante) => (
          <div key={restaurante._id} className="restaurant-card" onClick={() => handleRestaurantClick(restaurante._id)}>
            <div className="restaurant-info">
              <h3 className="restaurant-title">{restaurante.Nombre}</h3>
              <p className="restaurant-details">
                {restaurante["Tipo de cocina"]} - {restaurante["Localización"]}{" "}
                {restaurante.visitas?.length > 0 ? `- ${restaurante.visitas.length} visita(s)` : "- No visitado"}
              </p>
              <ul className="visit-list">
                {restaurante.visitas?.length > 0 ? (
                  restaurante.visitas.map((visita, index) => (
                    <li key={index}>
                      {new Date(visita.fecha).toLocaleDateString()} - {visita.comentario || "Sin comentario"}
                    </li>
                  ))
                ) : (
                  <li>No hay visitas registradas</li>
                )}
              </ul>
            </div>
            <div className="action-buttons">
              <button onClick={(e) => { e.stopPropagation(); handleEdit(restaurante); }} className="btn btn-success">
                Editar
              </button>
              <button onClick={(e) => { e.stopPropagation(); handleDelete(restaurante._id); }} className="btn btn-danger">
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

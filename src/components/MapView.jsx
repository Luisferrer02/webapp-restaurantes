import React, { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import './MapView.css';

import userMarkerImg from '../assets/user-marker.png';
import restaurantMarkerImg from '../assets/restaurant-marker.png';

// Iconos de ejemplo (ajusta la ruta o importa tus propias imágenes)
const userIcon = L.icon({
  iconUrl: userMarkerImg,
  iconSize: [25, 41],
  iconAnchor: [12, 41]
});
const restaurantIcon = L.icon({
  iconUrl: restaurantMarkerImg,
  iconSize: [25, 41],
  iconAnchor: [12, 41]
});

// Componente para obtener la instancia del mapa y guardarla en el padre
function MapInstanceSetter({ setMapRef }) {
  const map = useMap();
  useEffect(() => {
    setMapRef(map);
  }, [map, setMapRef]);
  return null;
}

const MapView = ({ restaurants, onClose }) => {
  const [userLocation, setUserLocation] = useState(null);
  const [sortedRestaurants, setSortedRestaurants] = useState([]);
  const [mapRef, setMapRef] = useState(null); // Referencia al mapa para moverlo al hacer clic en la lista
  const [selectedRestaurant, setSelectedRestaurant] = useState(null);

  // Obtener la localización actual del usuario
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        pos => {
          const { latitude, longitude } = pos.coords;
          setUserLocation([latitude, longitude]);
        },
        err => {
          console.error("Error al obtener localización", err);
          // Localización por defecto
          setUserLocation([40.416775, -3.70379]); // Madrid
        }
      );
    } else {
      // Si no está disponible la geolocalización
      setUserLocation([40.416775, -3.70379]); // Madrid
    }
  }, []);

  // Función para calcular la distancia entre dos puntos (fórmula haversine)
  const calculateDistance = (lat1, lon1, lat2, lon2) => {
    const toRad = (value) => (value * Math.PI) / 180;
    const R = 6371; // Radio de la Tierra en km
    const dLat = toRad(lat2 - lat1);
    const dLon = toRad(lon2 - lon1);
    const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
              Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) *
              Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c; // distancia en km
  };

  // Ordenar restaurantes por distancia al usuario
  useEffect(() => {
    if (userLocation && restaurants) {
      const [userLat, userLon] = userLocation;
      const sorted = restaurants
        .filter(r => r.location && Array.isArray(r.location.coordinates) && r.location.coordinates.length === 2)
        .map(r => {
          const [lng, lat] = r.location.coordinates; // [longitud, latitud]
          const distance = calculateDistance(userLat, userLon, lat, lng);
          return { ...r, distance };
        })
        .sort((a, b) => a.distance - b.distance);

      setSortedRestaurants(sorted);
    }
  }, [userLocation, restaurants]);

  // Manejar el clic en un restaurante de la lista: centrar el mapa en ese restaurante
const handleListItemClick = (restaurant) => {
    setSelectedRestaurant(restaurant);
    if (mapRef) {
      const [lng, lat] = restaurant.location.coordinates;
      // Zoom más cercano (por ejemplo, 17)
      mapRef.flyTo([lat, lng], 17);
    }
  };

  if (!userLocation) {
    return <div>Cargando mapa...</div>;
  }

  return (
    <div className="map-list-container">
      <button className="close-map-button" onClick={onClose}>
        Cerrar Mapa
      </button>

      {/* Sección del mapa */}
      <div className="map-wrapper">
        <MapContainer
          center={userLocation}
          zoom={13}
          scrollWheelZoom={true}
          className="map-container"
        >
          {/* Guardamos la referencia al mapa */}
          <MapInstanceSetter setMapRef={setMapRef} />

          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />

          {/* Marcador de la ubicación del usuario */}
          <Marker position={userLocation} icon={userIcon}>
            <Popup>Tu ubicación</Popup>
          </Marker>

          {/* Marcadores de los restaurantes */}
          {sortedRestaurants.map(r => {
            const [lng, lat] = r.location.coordinates;
            return (
              <Marker key={r._id} position={[lat, lng]} icon={restaurantIcon}>
                <Popup>
                  <strong>{r.Nombre}</strong><br/>
                  {r['Localización']}<br/>
                  {r.distance && `Distancia: ${r.distance.toFixed(2)} km`}
                </Popup>
              </Marker>
            );
          })}

{selectedRestaurant && (
            <Popup
              position={[
                selectedRestaurant.location.coordinates[1],
                selectedRestaurant.location.coordinates[0]
              ]}
              onClose={() => setSelectedRestaurant(null)}
            >
              <div>
                <strong>{selectedRestaurant.Nombre}</strong><br/>
                {selectedRestaurant["Localización"]}<br/>
                {selectedRestaurant["Tipo de cocina"]}<br/>
                {selectedRestaurant.visitas && selectedRestaurant.visitas.length > 0 &&
                  <span>{selectedRestaurant.visitas.length} visita(s)</span>}
              </div>
            </Popup>
          )}
        </MapContainer>
      </div>

      {/* Sección de la lista */}
      <div className="list-wrapper">
        <h3>Restaurantes cercanos</h3>
        <ul className="restaurant-list">
          {sortedRestaurants.map(r => (
            <li
              key={r._id}
              className="restaurant-item"
              onClick={() => handleListItemClick(r)}
            >
              <strong>{r.Nombre}</strong>
              {r.distance && ` - ${r.distance.toFixed(2)} km`}
              <br />
              <small>{r['Localización']}</small>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default MapView;

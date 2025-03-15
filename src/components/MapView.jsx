import React, { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import './MapView.css';

// Si tus imágenes están en "public/assets", usa rutas absolutas:
// const userMarkerImg = '/assets/user-marker.png';
// const restaurantMarkerImg = '/assets/restaurant-marker.png';

// Si tus imágenes están en "src/assets" y tu bundler lo soporta, puedes importarlas así:
// import userMarkerImg from '../assets/user-marker.png';
// import restaurantMarkerImg from '../assets/restaurant-marker.png';

// Definimos el ícono para la ubicación del usuario
const userIcon = L.icon({
  iconUrl: '/assets/user-marker.png',   // Cambia según tu proyecto
  iconSize: [25, 41],  // Ajusta el tamaño a tu imagen
  iconAnchor: [12, 41] // El punto de anclaje del icono (normalmente la "punta")
});

// Definimos el ícono para los restaurantes
const restaurantIcon = L.icon({
  iconUrl: '/assets/restaurant-marker.png', // Cambia según tu proyecto
  iconSize: [25, 41],
  iconAnchor: [12, 41]
});

const MapView = ({ restaurants, onClose }) => {
  const [userLocation, setUserLocation] = useState(null);
  const [sortedRestaurants, setSortedRestaurants] = useState([]);

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
          // Localización por defecto (por ejemplo, Madrid)
          setUserLocation([40.416775, -3.70379]);
        }
      );
    } else {
      // Si el navegador no soporta geolocalización
      setUserLocation([40.416775, -3.70379]);
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
    return R * c; // Distancia en km
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

  if (!userLocation) return <div>Cargando mapa...</div>;

  return (
    <div className="map-view-container">
      <button className="close-map-button" onClick={onClose}>Cerrar Mapa</button>
      <MapContainer
        center={userLocation}
        zoom={13}
        scrollWheelZoom={true}
        className="map-container"
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        {/* Marcador para la ubicación del usuario */}
        <Marker position={userLocation} icon={userIcon}>
          <Popup>Tu ubicación</Popup>
        </Marker>
        {/* Marcadores para cada restaurante */}
        {sortedRestaurants.map(r => {
          const [lng, lat] = r.location.coordinates; // [longitud, latitud]
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
      </MapContainer>
      <div className="restaurant-list-map">
        <h3>Restaurantes cercanos</h3>
        <ul>
          {sortedRestaurants.map(r => (
            <li key={r._id}>
              {r.Nombre} - {r.distance ? r.distance.toFixed(2) : 'N/A'} km
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default MapView;

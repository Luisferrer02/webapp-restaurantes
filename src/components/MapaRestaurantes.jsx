import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';

const MapaRestaurantes = ({ restaurantes }) => (
    <MapContainer center={[40.416775, -3.70379]} zoom={13} style={{ height: '400px', width: '100%' }}>
        <TileLayer
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        />
        {restaurantes.map((restaurante) => (
            <Marker position={restaurante.Coordenadas} key={restaurante._id}>
                <Popup>{restaurante.Nombre}</Popup>
            </Marker>
        ))}
    </MapContainer>
);

export default MapaRestaurantes;

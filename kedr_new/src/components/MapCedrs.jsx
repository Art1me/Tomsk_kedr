import { MapContainer, TileLayer, Marker, Popup, useMap, useMapEvent } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { useEffect, useState } from 'react';
import style from "../css/mapcedrs.module.css"
import '../css/popup_leaflet.css';
import CustomPopupContent from './PopUp/CustomPopupContent';
import config from '../config';

//Кастомные иконки деревьев:
const defaultTreeIcon = new L.Icon({
  iconUrl: '/tree-icon.png',
  iconSize: [30, 50],
});

const userTreeIcon = new L.Icon({
  iconUrl: '/tree-icon-red.png',
  iconSize: [30, 50],
});

const selectedPointIcon = new L.Icon({
  iconUrl: '/selected-point.svg',
  iconSize: [32, 32],
  iconAnchor: [16, 16],
});

const tomskBounds = [
  [56.4847 - 1.8, 84.9482 - 3.0], // юго-западная точка
  [56.4847 + 1.8, 84.9482 + 3.0]  // северо-восточная точка
];

function ClickHandler({ onMapClick }) {
  useMapEvent('click', (e) => {
    if (onMapClick) {
      onMapClick([e.latlng.lat, e.latlng.lng]);
    }
  });
  return null;
}

function ResizeHandler() {
  const map = useMap();

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      map.invalidateSize();
    }, 0);

    return () => window.clearTimeout(timeoutId);
  }, [map]);

  return null;
}

const normalizeCedar = (cedar) => {
  const latitude = Number(cedar.latitude);
  const longitude = Number(cedar.longitude);

  if (!Number.isFinite(latitude) || !Number.isFinite(longitude)) {
    return null;
  }

  return {
    ...cedar,
    latitude,
    longitude,
  };
};

const MapCedars = ({ onMapClick, selectedCoords }) => {
  const [cedars, setCedars] = useState([]);
  const [currentUserId, setCurrentUserId] = useState(null);

  useEffect(() => {
    // Получаем информацию о текущем пользователе
    const token = localStorage.getItem("token");
    if (token) {
      fetch(`${config}/api/users/me/`, {
        headers: {
          "Authorization": `Token ${token}`,
        },
      })
      .then(res => res.json())
      .then(data => {
        setCurrentUserId(data.id);
      })
      .catch(err => console.error('Ошибка загрузки данных пользователя:', err));
    }

    // Получаем список кедров
    fetch(`${config}/api/trees/`)
    .then(res => {
      if (!res.ok) {
        throw new Error(`Trees request failed: ${res.status}`);
      }
      return res.json();
    })
    .then(data => {
      console.log('Данные с сервера:', data);
      const trees = Array.isArray(data) ? data : data.results;
      setCedars(
        Array.isArray(trees)
          ? trees.map(normalizeCedar).filter(Boolean)
          : [],
      );
    })
    .catch(err => console.error('Ошибка загрузки кедров:', err));
  }, []);

  return (
    <MapContainer
      center={[56.5, 84.97]}
      zoom={13}
      minZoom={2}
      maxZoom={18}
      scrollWheelZoom={true}
      className={style.mapcon}
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      <ResizeHandler />
      {onMapClick && <ClickHandler onMapClick={onMapClick} />}
      {selectedCoords && (
        <Marker
          position={selectedCoords}
          icon={selectedPointIcon}
        />
      )}
      {cedars.map((cedar) => (
        <Marker
          key={cedar.id}
          position={[cedar.latitude, cedar.longitude]}
          icon={cedar.owner === currentUserId ? userTreeIcon : defaultTreeIcon}
        >
          <Popup closeButton={false}>
            <CustomPopupContent cedar={cedar} style={style} />
          </Popup>
        </Marker>
      ))}
    </MapContainer>
  );
};

export default MapCedars;

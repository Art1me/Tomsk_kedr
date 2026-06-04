import React, { useEffect, useState, useRef } from "react";
import style from "../css/mycedarspage.module.css";
import { useNavigate } from "react-router-dom";
import config from "../config";
import mapStyle from "../css/mapcedrs.module.css";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import CustomPopupContent from "../components/PopUp/CustomPopupContent";
import markerIcon2x from 'leaflet/dist/images/marker-icon-2x.png';
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: markerIcon2x,
  iconUrl: markerIcon,
  shadowUrl: markerShadow,
});

const userTreeIcon = new L.Icon({
  iconUrl: "/tree-icon-red.png",
  iconSize: [30, 50],
});

function MyCedarsPage() {
  const [currentUserId, setCurrentUserId] = useState(null);
  const [cedars, setCedars] = useState([]);
  const [openCedarId, setOpenCedarId] = useState(null);
  const [currentPhotos, setCurrentPhotos] = useState({});
  const [viewMode, setViewMode] = useState("cards");
  const navigate = useNavigate();
  const mapRef = useRef(null);

  useEffect(() => {
    // Получаем id пользователя
    fetch(`${config}/api/users/me/`, {
      headers: { Authorization: `Token ${localStorage.getItem("token")}` },
    })
      .then((res) => res.json())
      .then((data) => setCurrentUserId(data.id));
  }, []);

  useEffect(() => {
    if (currentUserId) {
      fetch(`${config}/api/trees/`, {
        headers: { Authorization: `Token ${localStorage.getItem("token")}` },
      })
        .then((res) => res.json())
        .then((data) => {
          const userCedars = data.filter(
            (cedar) => cedar.owner === currentUserId,
          );
          setCedars(userCedars);
        });
    }
  }, [currentUserId]);

  const formatDate = (dateString) => {
    if (!dateString) return "—";
    const date = new Date(dateString);
    return date.toLocaleDateString("ru-RU");
  };

  const getCedarPhotos = (cedar) => {
    const photos = [];
    if (cedar.picture) photos.push({ url: cedar.picture, id: "main" });
    if (cedar.images && cedar.images.length > 0) {
      cedar.images.forEach((img) =>
        photos.push({ url: img.image, id: img.id }),
      );
    }
    return photos;
  };

  const goPrev = (cedarId, photos) => {
    setCurrentPhotos((prev) => {
      const current = prev[cedarId] || 0;
      return {
        ...prev,
        [cedarId]: (current - 1 + photos.length) % photos.length,
      };
    });
  };

  const goNext = (cedarId, photos) => {
    setCurrentPhotos((prev) => {
      const current = prev[cedarId] || 0;
      return {
        ...prev,
        [cedarId]: (current + 1) % photos.length,
      };
    });
  };

  const renderMap = () => {
    const cedarsWithCoords = cedars.filter(
      (cedar) =>
        cedar.latitude &&
        cedar.longitude &&
        !isNaN(parseFloat(cedar.latitude)) &&
        !isNaN(parseFloat(cedar.longitude)),
    );

    if (cedarsWithCoords.length === 0) {
      return (
        <div className={style.mapContainer}>
          <p className={style.noDataText}>
            У ваших кедров не указаны координаты на карте
          </p>
        </div>
      );
    }

    const avgLat =
      cedarsWithCoords.reduce((sum, c) => sum + parseFloat(c.latitude), 0) /
      cedarsWithCoords.length;
    const avgLng =
      cedarsWithCoords.reduce((sum, c) => sum + parseFloat(c.longitude), 0) /
      cedarsWithCoords.length;
    const center = [avgLat, avgLng];
    const zoom = cedarsWithCoords.length === 1 ? 10 : 6;

    const tomskBounds = [
      [56.4847 - 1.8, 84.9482 - 3.0],
    ];

    return (
      <div className={style.mapWrapper}>
        <div className={style.mapContainer}>
          <MapContainer
            center={center}
            zoom={zoom}
            minZoom={6}
            maxZoom={18}
            scrollWheelZoom={true}
            maxBounds={tomskBounds}
            maxBoundsViscosity={1.0}
            style={{ height: "500px", width: "100%" }}
            whenCreated={(map) => {
              mapRef.current = map;
            }}
          >
            <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />

            {cedarsWithCoords.map((cedar) => {
              const lat = parseFloat(cedar.latitude);
              const lng = parseFloat(cedar.longitude);

              return (
                <Marker
                  key={cedar.id}
                  position={[lat, lng]}
                  icon={userTreeIcon}
                >
                  <Popup closeButton={false} className="custom-popup">
                    <CustomPopupContent cedar={cedar} style={mapStyle} />
                  </Popup>
                </Marker>
              );
            })}
          </MapContainer>
        </div>
      </div>
    );
  };

  const renderCards = () => {
    return (
      <div className={style.cedarsList}>
        {cedars.map((cedar) => {
          const photos = getCedarPhotos(cedar);
          const currentPhoto = currentPhotos[cedar.id] || 0;
          const hasCoords =
            cedar.latitude &&
            cedar.longitude &&
            !isNaN(parseFloat(cedar.latitude)) &&
            !isNaN(parseFloat(cedar.longitude));

          return (
            <div key={cedar.id}>
              <div
                className={style.cedarItem}
                onClick={() =>
                  setOpenCedarId(openCedarId === cedar.id ? null : cedar.id)
                }
                style={{ cursor: "pointer" }}
              >
                <span
                  className={
                    openCedarId === cedar.id
                      ? `${style.cedarCheck} ${style.cedarCheckOpen}`
                      : style.cedarCheck
                  }
                >
                  ❯
                </span>
                <span className={style.cedarName}>
                  Кедр "{cedar.title || "Без названия"}"
                </span>
              </div>
              {openCedarId === cedar.id && (
                <div className={style.cedarInfoBlock}>
                  <div className={style.popup_main_flex}>
                    <div className={style.popup_left_desc}>
                      <div className={mapStyle.popup_info_block}>
                        <p className={mapStyle.popup_registered}>
                          <span className={mapStyle.popup_label}>
                            Кем зарегистрирован:
                          </span>
                          {cedar.owner_name || "—"}
                        </p>
                        <p className={mapStyle.popup_dedicated}>
                          <span className={mapStyle.popup_label}>
                            Кому посвящён:
                          </span>
                          {cedar.dedicated_to || "—"}
                        </p>
                        {hasCoords && (
                          <p className={mapStyle.popup_coordinates}>
                            <span className={mapStyle.popup_label}>
                              Координаты:
                            </span>
                            {parseFloat(cedar.latitude).toFixed(6)},{" "}
                            {parseFloat(cedar.longitude).toFixed(6)}
                          </p>
                        )}
                        <span className={mapStyle.popup_desc_label}>
                          Описание:
                        </span>
                      </div>
                      <p className={mapStyle.popup_desc}>{cedar.content}</p>
                    </div>

                    {photos.length > 0 && (
                      <div className={mapStyle.photo_gallery_block}>
                        <div className={mapStyle.photo_gallery_imgwrap}>
                          <img
                            src={photos[currentPhoto].url}
                            alt={`Фотография ${currentPhoto + 1}`}
                            className={mapStyle.photo_gallery_img}
                            onError={(e) => {
                              e.target.onerror = null;
                              e.target.src = "/placeholder-image.png";
                            }}
                          />
                        </div>
                        <div className={mapStyle.photo_gallery_nav}>
                          <button
                            className={mapStyle.photo_gallery_arrow}
                            onClick={(e) => {
                              e.preventDefault();
                              e.stopPropagation();
                              goPrev(cedar.id, photos);
                            }}
                            disabled={photos.length < 2}
                          >
                            <span>&#x276E;</span>
                          </button>
                          <span className={mapStyle.photo_gallery_counter}>
                            {currentPhoto + 1}/{photos.length}
                          </span>
                          <button
                            className={mapStyle.photo_gallery_arrow}
                            onClick={(e) => {
                              e.preventDefault();
                              e.stopPropagation();
                              goNext(cedar.id, photos);
                            }}
                            disabled={photos.length < 2}
                          >
                            <span>&#x276F;</span>
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                  <div className={style.popup_footer}>
                    <div className={mapStyle.popup_footer_left}>
                      Дата регистрации: {formatDate(cedar.creation_date)}
                    </div>
                    <div className={mapStyle.popup_footer_right}>
                      Дата посадки: {formatDate(cedar.plant_date)}
                    </div>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    );
  };

  return (
    <div>
      <div className={style.root}>
        <div className={style.header}>
          <button className={style.back_btn} onClick={() => navigate("/")}>
            <span className={style.backArrow}>←</span>
            <span className={style.backText}>Вернуться на главную</span>
          </button>
        </div>

        {viewMode === "cards" ? renderCards() : renderMap()}

        <div className={style.viewToggleBottom}>
          <button
            className={`${style.toggleButton} ${viewMode === "cards" ? style.active : ""}`}
            onClick={() => setViewMode("cards")}
          >
            Список
          </button>
          <button
            className={`${style.toggleButton} ${viewMode === "map" ? style.active : ""}`}
            onClick={() => setViewMode("map")}
          >
            Карта
          </button>
        </div>
      </div>
    </div>
  );
}

export default MyCedarsPage;

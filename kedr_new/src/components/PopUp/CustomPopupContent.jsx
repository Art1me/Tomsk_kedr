import { useMap } from 'react-leaflet';
import { useState, useMemo } from 'react';

function CustomPopupContent({ cedar, style }) {
  const map = useMap();

  // Функция для форматирования даты
  const formatDate = (dateString) => {
    if (!dateString) return '—';
    const date = new Date(dateString);
    return date.toLocaleDateString('ru-RU');
  };

  // Собираем массив всех фото (титульная + дополнительные)
  const photos = useMemo(() => {
    const arr = [];
    if (cedar.picture) arr.push({ url: cedar.picture, id: 'main' });
    if (cedar.images && cedar.images.length > 0) {
      cedar.images.forEach(img => arr.push({ url: img.image, id: img.id }));
    }
    return arr;
  }, [cedar]);

  const [currentPhoto, setCurrentPhoto] = useState(0);
  const totalPhotos = photos.length;

  const goPrev = () => setCurrentPhoto(i => (i - 1 + totalPhotos) % totalPhotos);
  const goNext = () => setCurrentPhoto(i => (i + 1) % totalPhotos);

  return (
    <div className={style.custom_popup}>
      <button className={style.popup_close} onClick={() => map.closePopup()}>
          <img src="/close-icon.png" alt="Закрыть" />
      </button>
      {/* Header */}
      <div className={style.popup_header}>
        <h3 className={style.popup_title}>Кедр «{cedar.title}»</h3>
      </div>
      {/* Main */}
      <div className={style.popup_content}>
        <div className={style.popup_info_block}>
          <p className={style.popup_registered}>
            <span className={style.popup_label}>Кем зарегистрирован:</span> 
            {cedar.owner_name || '—'}
          </p>
          <p className={style.popup_dedicated}>
            <span className={style.popup_label}>Кому посвящён:</span> 
            {cedar.dedicated_to || '—'}
          </p>
          <span className={style.popup_desc_label}>Описание:</span>
        </div>
        <div className={style.popup_main_flex}>
          <div
            className={
              cedar.picture
                ? style.popup_left_desc
                : `${style.popup_left_desc} ${style.popup_full_width}`
            }
          >
            <p className={style.popup_desc}>{cedar.content}</p>
          </div>
          {/* Новый блок для фото-галереи */}
          {totalPhotos > 0 && (
            <div className={style.photo_gallery_block}>
              <div className={style.photo_gallery_imgwrap}>
                <img
                  src={photos[currentPhoto].url}
                  alt={`Фотография ${currentPhoto + 1}`}
                  className={style.photo_gallery_img}
                  onError={e => {
                    e.target.onerror = null;
                    e.target.src = '/placeholder-image.png';
                  }}
                />
              </div>
              <div className={style.photo_gallery_nav}>
                <button
                  className={style.photo_gallery_arrow}
                  onClick={goPrev}
                  disabled={totalPhotos < 2}
                  aria-label="Предыдущее фото"
                >
                  <span>&#x276E;</span>
                </button>
                <span className={style.photo_gallery_counter}>{currentPhoto + 1}/{totalPhotos}</span>
                <button
                  className={style.photo_gallery_arrow}
                  onClick={goNext}
                  disabled={totalPhotos < 2}
                  aria-label="Следующее фото"
                >
                  <span>&#x276F;</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
      {/* Footer */}
      <div className={style.popup_footer}>
        <div className={style.popup_footer_left}>
          Дата регистрации: {formatDate(cedar.creation_date)}
        </div>
        <div className={style.popup_footer_right}>
          Дата посадки: {formatDate(cedar.plant_date)}
        </div>
      </div>
    </div>
  );
}

export default CustomPopupContent;

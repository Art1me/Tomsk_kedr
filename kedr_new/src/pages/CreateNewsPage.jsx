import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "../css/createnewspage.css";
import config from "../config.js";

const CreateNewsPage = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    title: "",
    text: "", // ИЗМЕНЕНО: content -> text
    images: [],
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [previewImages, setPreviewImages] = useState([]);

  // Обработка изменения текстовых полей
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // Обработка загрузки изображений
  const handleImageUpload = (e) => {
    const files = Array.from(e.target.files);

    if (formData.images.length + files.length > 5) {
      alert(
        `Можно загрузить не более 5 изображений. Сейчас выбрано: ${formData.images.length + files.length}`,
      );
      return;
    }

    const validFiles = files.filter((file) => {
      if (file.size > 5 * 1024 * 1024) {
        alert(`Файл ${file.name} слишком большой. Максимальный размер 5MB`);
        return false;
      }
      return true;
    });

    if (validFiles.length === 0) return;

    const newPreviewImages = validFiles.map((file) =>
      URL.createObjectURL(file),
    );

    setFormData((prev) => ({
      ...prev,
      images: [...prev.images, ...validFiles],
    }));

    setPreviewImages((prev) => [...prev, ...newPreviewImages]);
  };

  // Удаление изображения
  const handleRemoveImage = (index) => {
    setFormData((prev) => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index),
    }));

    URL.revokeObjectURL(previewImages[index]);
    setPreviewImages((prev) => prev.filter((_, i) => i !== index));
  };

  // Отправка формы
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.title.trim()) {
      alert("Введите заголовок новости");
      return;
    }

    if (!formData.text.trim()) {
      // ИЗМЕНЕНО: content -> text
      alert("Введите текст новости");
      return;
    }

    setIsSubmitting(true);
    setUploadProgress(0);

    try {
      const token = localStorage.getItem("token");

      if (!token) {
        alert("Необходимо авторизоваться");
        navigate("/login");
        return;
      }

      const submitData = new FormData();
      submitData.append("title", formData.title);
      submitData.append("text", formData.text); // ИЗМЕНЕНО: content -> text

      // Добавляем изображения с правильным ключом
      formData.images.forEach((image) => {
        submitData.append("images", image); // Бэкенд ждет массив images
      });

      // Логируем данные для отладки
      console.log("Отправляемые данные:");
      for (let pair of submitData.entries()) {
        console.log(pair[0], pair[1]);
      }

      const response = await fetch(`${config}/api/news/`, {
        // ИЗМЕНЕНО: убрал create/
        method: "POST",
        headers: {
          Authorization: `Token ${token}`,
          // НЕ СТАВЬ Content-Type, браузер сам поставит с boundary для FormData
        },
        body: submitData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error("Ошибка сервера:", errorData);
        throw new Error(errorData.message || "Ошибка при создании новости");
      }

      const data = await response.json(); // Получаем ответ с созданной новостью
      console.log("Новость создана:", data);

      previewImages.forEach((url) => URL.revokeObjectURL(url));

      alert("Новость успешно создана!");
      navigate("/news"); // Или можно перейти на созданную новость: navigate(`/news/${data.id}`)
    } catch (error) {
      console.error("Ошибка:", error);
      alert("Ошибка при создании новости: " + error.message);
    } finally {
      setIsSubmitting(false);
      setUploadProgress(0);
    }
  };

  const goToHome = () => {
    navigate("/");
  };

  const goToNews = () => {
    navigate("/news");
  };

  const goBack = () => {
    navigate(-1);
  };

  return (
    <div className="personal-cabinet">
      <header className="header">
        <div className="back-arrow-container" onClick={goBack}>
          <img src="/back.png" alt="Назад" className="back-arrow" />
        </div>

        <div className="header-left">
          <button className="header-btn" onClick={goToHome}>
            На главную
          </button>
          <button className="header-btn" onClick={goToNews}>
            Новости
          </button>
        </div>

        <div className="header-right">
          <span>Создание новости</span>
        </div>
      </header>

      <main className="main-content">
        <h1 className="page-title">Создание новости</h1>

        <form onSubmit={handleSubmit} className="create-news-form">
          <div className="form-group">
            <label htmlFor="title" className="form-label">
              Заголовок <span className="required">*</span>
            </label>
            <input
              type="text"
              id="title"
              name="title"
              value={formData.title}
              onChange={handleInputChange}
              placeholder="Введите заголовок новости"
              className="form-input"
              maxLength={200}
              required
            />
            <div className="char-counter">{formData.title.length}/200</div>
          </div>

          <div className="form-group">
            <label htmlFor="text" className="form-label">
              {" "}
              {/* ИЗМЕНЕНО: content -> text */}
              Текст новости <span className="required">*</span>
            </label>
            <textarea
              id="text" // ИЗМЕНЕНО: content -> text
              name="text" // ИЗМЕНЕНО: content -> text
              value={formData.text}
              onChange={handleInputChange}
              placeholder="Введите текст новости"
              className="form-textarea"
              rows={10}
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">
              Изображения
              <span className="image-count">({formData.images.length}/5)</span>
            </label>

            <div className="image-upload-area">
              <input
                type="file"
                id="images"
                accept="image/*"
                multiple
                onChange={handleImageUpload}
                className="image-input"
                disabled={formData.images.length >= 5}
              />
              <label htmlFor="images" className="image-upload-label">
                <img
                  src="./upload-icon.png"
                  alt="загрузить изображение"
                  className="upload-icon-img"
                />
                <span className="upload-text">
                  {formData.images.length >= 5
                    ? "Достигнут лимит изображений"
                    : "Нажмите для загрузки изображений"}
                </span>
                <span className="upload-hint">
                  Поддерживаются .png, *.jpeg, *.jpg, *.svg, *.gif, *.webp
                </span>
              </label>
            </div>

            {previewImages.length > 0 && (
              <div className="image-preview-grid">
                {previewImages.map((preview, index) => (
                  <div key={index} className="image-preview-item">
                    <img
                      src={preview}
                      alt={`Превью ${index + 1}`}
                      className="image-preview"
                    />
                    <button
                      type="button"
                      className="remove-image-btn"
                      onClick={() => handleRemoveImage(index)}
                      title="Удалить изображение"
                    >
                      ×
                    </button>
                    <div className="image-number">{index + 1}</div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {isSubmitting && uploadProgress > 0 && (
            <div className="progress-bar-container">
              <div
                className="progress-bar"
                style={{ width: `${uploadProgress}%` }}
              >
                {uploadProgress}%
              </div>
            </div>
          )}

          <div className="form-actions">
            <button
              type="submit"
              className="submit-btn"
              disabled={isSubmitting}
            >
              {isSubmitting ? "Отправка..." : "Опубликовать"}
            </button>
          </div>
        </form>
      </main>
    </div>
  );
};

export default CreateNewsPage;

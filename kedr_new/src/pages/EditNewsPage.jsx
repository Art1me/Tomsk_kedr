import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import { useState, useRef, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";

import { TextStyle } from "@tiptap/extension-text-style";
import { Link } from "@tiptap/extension-link";
import { TextAlign } from "@tiptap/extension-text-align";
import { Color } from "@tiptap/extension-color";
import { Highlight } from "@tiptap/extension-highlight";
import { Underline } from "@tiptap/extension-underline";
import { Image } from "@tiptap/extension-image";

import styles from "../css/editnews.module.css";
import config from "../config.js";

const EditNewsPage = () => {
  const { slug } = useParams();
  const navigate = useNavigate();

  const [title, setTitle] = useState("");
  const [allImages, setAllImages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [newsId, setNewsId] = useState(null);
  const [error, setError] = useState(null);
  const fileInputRef = useRef(null);

  const editor = useEditor({
    extensions: [
      StarterKit,
      TextStyle,
      Link.configure({
        openOnClick: false,
      }),
      TextAlign.configure({
        types: ["heading", "paragraph"],
      }),
      Color,
      Highlight,
      Underline,
      Image,
    ],
    content: "",
  });

  const generateSlug = (title) => {
    const translit = {
      а: "a",
      б: "b",
      в: "v",
      г: "g",
      д: "d",
      е: "e",
      ё: "yo",
      ж: "zh",
      з: "z",
      и: "i",
      й: "y",
      к: "k",
      л: "l",
      м: "m",
      н: "n",
      о: "o",
      п: "p",
      р: "r",
      с: "s",
      т: "t",
      у: "u",
      ф: "f",
      х: "h",
      ц: "ts",
      ч: "ch",
      ш: "sh",
      щ: "sch",
      ъ: "",
      ы: "y",
      ь: "",
      э: "e",
      ю: "yu",
      я: "ya",
    };
    return title
      .toLowerCase()
      .split("")
      .map((char) => translit[char] || char)
      .join("")
      .replace(/[^a-z0-9\s-]/g, "")
      .replace(/\s+/g, "-")
      .replace(/--+/g, "-")
      .trim();
  };

  useEffect(() => {
    const loadNewsData = async () => {
      setLoading(true);
      try {
        const allNewsResponse = await fetch(`${config}/api/news/`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        });

        if (!allNewsResponse.ok) {
          throw new Error("Ошибка загрузки списка новостей");
        }

        const allNews = await allNewsResponse.json();

        const foundNews = allNews.find((item) => {
          const itemSlug = generateSlug(item.title);
          return itemSlug === slug;
        });

        if (!foundNews) {
          throw new Error("Новость не найдена");
        }

        setNewsId(foundNews.id);

        const newsResponse = await fetch(
          `${config}/api/news/${foundNews.id}/`,
          {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
            },
          },
        );

        if (!newsResponse.ok) {
          throw new Error("Ошибка загрузки новости");
        }

        const newsData = await newsResponse.json();
        console.log("Загруженная новость для редактирования:", newsData);

        setTitle(newsData.title || "");

        if (newsData.images && newsData.images.length > 0) {
          const existingImgs = newsData.images.map((img) => ({
            id: img.id,
            url: img.image,
            name: img.image.split("/").pop() || "image.jpg",
            isExisting: true,
          }));
          setAllImages(existingImgs);
        }

        if (editor && newsData.text) {
          const htmlContent = newsData.text
            .split("\n")
            .map((paragraph) => paragraph.trim())
            .filter((paragraph) => paragraph)
            .map((paragraph) => `<p>${paragraph}</p>`)
            .join("");

          editor.commands.setContent(htmlContent || "<p></p>");
        }

        setLoading(false);
      } catch (error) {
        console.error("Ошибка загрузки новости:", error);
        setError(error.message);
        setLoading(false);
      }
    };

    if (slug && editor) {
      loadNewsData();
    }
  }, [slug, editor]);

  const goToHome = () => {
    navigate("/");
  };

  const goToNews = () => {
    navigate("/news");
  };

  const handleCancel = () => {
    navigate(`/news/${slug}`);
  };

  const handleImageUpload = (e) => {
    const files = Array.from(e.target.files);
    const newUploadedImages = files.map((file) => ({
      id: `new_${Date.now()}_${Math.random()}`,
      file,
      url: URL.createObjectURL(file),
      preview: URL.createObjectURL(file),
      name: file.name,
      isExisting: false,
    }));
    setAllImages([...allImages, ...newUploadedImages]);

    // Сбрасываем значение input, чтобы можно было загрузить те же файлы повторно
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const removeImage = (id) => {
    setAllImages(allImages.filter((img) => img.id !== id));
  };

  const insertImageToEditor = (imageUrl) => {
    if (editor) {
      editor.chain().focus().setImage({ src: imageUrl }).run();
    }
  };

  const handleSave = async () => {
    if (!newsId) {
      alert("Ошибка: ID новости не найден");
      return;
    }

    const content = editor?.getHTML() || "";

    const tempDiv = document.createElement("div");
    tempDiv.innerHTML = content;
    const plainText = tempDiv.textContent || tempDiv.innerText || "";

    const formData = new FormData();
    formData.append("title", title);
    formData.append("text", plainText);

    const existingImageIds = allImages
      .filter((img) => img.isExisting)
      .map((img) => img.id);

    const newImageFiles = allImages
      .filter((img) => !img.isExisting && img.file)
      .map((img) => img.file);

    formData.append("existing_images", JSON.stringify(existingImageIds));

    newImageFiles.forEach((file) => {
      formData.append("new_images", file);
    });

    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`${config}/api/news/${newsId}/`, {
        method: "PATCH",
        headers: token ? { Authorization: `Token ${token}` } : {},
        body: formData,
      });

      if (response.ok) {
        const updatedNews = await response.json();
        console.log("Изменения сохранены:", updatedNews);
        alert("Изменения сохранены!");

        const newSlug = generateSlug(updatedNews.title);
        navigate(`/news/${newSlug}`);
      } else {
        const errorData = await response.json();
        throw new Error(errorData.detail || "Ошибка при сохранении");
      }
    } catch (error) {
      console.error("Ошибка сохранения:", error);
      alert(`Ошибка при сохранении: ${error.message}`);
    }
  };

  const handleDelete = async () => {
    if (!newsId) {
      alert("Ошибка: ID новости не найден");
      return;
    }

    if (window.confirm("Вы уверены, что хотите удалить эту новость?")) {
      try {
        const token = localStorage.getItem("token");
        const response = await fetch(`${config}/api/news/${newsId}/`, {
          method: "DELETE",
          headers: token ? { Authorization: `Token ${token}` } : {},
        });

        if (response.ok) {
          console.log("Новость удалена");
          alert("Новость удалена");
          navigate("/news");
        } else {
          throw new Error("Ошибка при удалении");
        }
      } catch (error) {
        console.error("Ошибка удаления:", error);
        alert("Ошибка при удалении");
      }
    }
  };

  if (loading || !editor) {
    return <div className={styles.loading}>Загрузка редактора...</div>;
  }

  if (error) {
    return (
      <div className={styles.loading}>
        <p>Ошибка: {error}</p>
        <button className={styles.cancelBtn} onClick={() => navigate("/news")}>
          ← К списку новостей
        </button>
      </div>
    );
  }

  return (
    <div className={`${styles.personalCabinet} ${styles.editorCabinet}`}>
      {/* Хедер */}
      <header className={styles.header}>
        <div className={styles.headerLeft}>
          <button className={styles.headerBtn} onClick={goToHome}>
            На главную
          </button>
          <button className={styles.headerBtn} onClick={goToNews}>
            Новости
          </button>
        </div>
        <div className={styles.headerRight}>Редактирование новости</div>
      </header>

      {/* Основной контент */}
      <div className={styles.mainContent}>
        <h1 className={styles.pageTitle}>Редактирование новости</h1>

        <div className={styles.dataContainer}>
          {/* Поле заголовка */}
          <div className={styles.inputGroup}>
            <label>Заголовок</label>
            <input
              type="text"
              placeholder="Введите заголовок"
              className={styles.inputField}
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
          </div>

          {/* Поле основного текста с панелью форматирования */}
          <div className={styles.inputGroup}>
            <label>Основной текст</label>

            {/* Панель форматирования */}
            <div className={styles.editorToolbar}>
              <button
                type="button"
                className={`${styles.toolbarBtn} ${editor.isActive("bold") ? styles.active : ""}`}
                onClick={() => editor.chain().focus().toggleBold().run()}
                disabled={!editor.can().chain().focus().toggleBold().run()}
                title="Жирный"
              >
                <strong>B</strong>
              </button>

              <button
                type="button"
                className={`${styles.toolbarBtn} ${editor.isActive("italic") ? styles.active : ""}`}
                onClick={() => editor.chain().focus().toggleItalic().run()}
                disabled={!editor.can().chain().focus().toggleItalic().run()}
                title="Курсив"
              >
                <em>I</em>
              </button>

              <button
                type="button"
                className={`${styles.toolbarBtn} ${editor.isActive("underline") ? styles.active : ""}`}
                onClick={() => editor.chain().focus().toggleUnderline().run()}
                disabled={!editor.can().chain().focus().toggleUnderline().run()}
                title="Подчёркнутый"
              >
                <u>U</u>
              </button>

              <button
                type="button"
                className={`${styles.toolbarBtn} ${editor.isActive("heading", { level: 1 }) ? styles.active : ""}`}
                onClick={() =>
                  editor.chain().focus().toggleHeading({ level: 1 }).run()
                }
                title="Заголовок 1"
              >
                H1
              </button>

              <button
                type="button"
                className={`${styles.toolbarBtn} ${editor.isActive("heading", { level: 2 }) ? styles.active : ""}`}
                onClick={() =>
                  editor.chain().focus().toggleHeading({ level: 2 }).run()
                }
                title="Заголовок 2"
              >
                H2
              </button>

              <button
                type="button"
                className={`${styles.toolbarBtn} ${editor.isActive({ textAlign: "left" }) ? styles.active : ""}`}
                onClick={() =>
                  editor.chain().focus().setTextAlign("left").run()
                }
                title="По левому краю"
              >
                ⬅
              </button>

              <button
                type="button"
                className={`${styles.toolbarBtn} ${editor.isActive({ textAlign: "center" }) ? styles.active : ""}`}
                onClick={() =>
                  editor.chain().focus().setTextAlign("center").run()
                }
                title="По центру"
              >
                ⬆
              </button>

              <button
                type="button"
                className={`${styles.toolbarBtn} ${editor.isActive({ textAlign: "right" }) ? styles.active : ""}`}
                onClick={() =>
                  editor.chain().focus().setTextAlign("right").run()
                }
                title="По правому краю"
              >
                ➡
              </button>

              <button
                type="button"
                className={`${styles.toolbarBtn} ${editor.isActive("bulletList") ? styles.active : ""}`}
                onClick={() => editor.chain().focus().toggleBulletList().run()}
                title="Маркированный список"
              >
                •
              </button>

              <button
                type="button"
                className={`${styles.toolbarBtn} ${editor.isActive("orderedList") ? styles.active : ""}`}
                onClick={() => editor.chain().focus().toggleOrderedList().run()}
                title="Нумерованный список"
              >
                1.
              </button>

              <button
                type="button"
                className={`${styles.toolbarBtn} ${editor.isActive("link") ? styles.active : ""}`}
                onClick={() => {
                  const url = window.prompt("Введите URL ссылки:");
                  if (url) {
                    editor.chain().focus().setLink({ href: url }).run();
                  }
                }}
                title="Вставить ссылку"
              >
                🔗
              </button>

              <button
                type="button"
                className={styles.toolbarBtn}
                onClick={() => editor.chain().focus().unsetLink().run()}
                disabled={!editor.isActive("link")}
                title="Убрать ссылку"
              >
                ✂
              </button>

              <input
                type="color"
                onInput={(e) =>
                  editor.chain().focus().setColor(e.target.value).run()
                }
                value={editor.getAttributes("textStyle").color || "#000000"}
                title="Цвет текста"
                className={styles.colorPicker}
              />

              <button
                type="button"
                className={`${styles.toolbarBtn} ${editor.isActive("highlight") ? styles.active : ""}`}
                onClick={() => editor.chain().focus().toggleHighlight().run()}
                title="Выделить текст"
              >
                🖍
              </button>
            </div>

            {/* Редактор */}
            <div className={styles.editorWrapper}>
              <EditorContent editor={editor} className={styles.editorContent} />
            </div>
          </div>

          <div className={styles.inputGroup}>
            <label>Изображения</label>

            {/* Кнопка загрузки */}
            <input
              type="file"
              accept="image/*"
              multiple
              onChange={handleImageUpload}
              className={styles.inputField}
              ref={fileInputRef}
            />

            {/* Галерея всех изображений */}
            {allImages.length > 0 && (
              <div className={styles.newsGallery}>
                <div className={styles.galleryTitle}>
                  Все изображения ({allImages.length}):
                </div>
                <div className={styles.galleryGrid}>
                  {allImages.map((img) => (
                    <div key={img.id} className={styles.galleryItem}>
                      <img
                        src={img.url || img.preview}
                        alt={img.name}
                        className={styles.galleryThumbnail}
                        onClick={() =>
                          insertImageToEditor(img.url || img.preview)
                        }
                        title="Нажмите, чтобы вставить в текст"
                      />
                      <button
                        type="button"
                        className={styles.galleryDeleteBtn}
                        onClick={() => removeImage(img.id)}
                        title="Удалить изображение"
                      >
                        ✕
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Кнопки действий */}
          <div className={styles.editorActions}>
            <button className={styles.saveBtn} onClick={handleSave}>
              Сохранить изменения
            </button>
            <button className={styles.cancelBtn} onClick={handleCancel}>
              Отмена
            </button>
            <button className={styles.deleteNewsBtn} onClick={handleDelete}>
              Удалить новость
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EditNewsPage;

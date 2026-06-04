import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import style from "../css/currentnews.module.css";
import config from "../config.js";

function CurrentNewsPage() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const [news, setNews] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [likes, setLikes] = useState(0);
  const [dislikes, setDislikes] = useState(0);
  const [hasLiked, setHasLiked] = useState(false);
  const [hasDisliked, setHasDisliked] = useState(false);

  useEffect(() => {
    const fetchNews = async () => {
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
        console.log("Полученная новость:", newsData);
        setNews(newsData);
        setLikes(newsData.likes || 0);
        setDislikes(newsData.dislikes || 0);

        const savedLikes = localStorage.getItem(`likes_${slug}`);
        const savedHasLiked = localStorage.getItem(`hasLiked_${slug}`);
        if (savedHasLiked === "true") {
          setHasLiked(true);
          setLikes(parseInt(savedLikes) || newsData.likes || 0);
        }

        const savedDislikes = localStorage.getItem(`dislikes_${slug}`);
        const savedHasDisliked = localStorage.getItem(`hasDisliked_${slug}`);
        if (savedHasDisliked === "true") {
          setHasDisliked(true);
          setDislikes(parseInt(savedDislikes) || 0);
        }
      } catch (error) {
        console.error("Ошибка загрузки новости:", error);
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };

    if (slug) {
      fetchNews();
    }
  }, [slug]);

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

  const handleLike = async () => {
    if (!hasLiked) {
      // Убираем дизлайк если был
      if (hasDisliked) {
        const newDislikes = dislikes - 1;
        setDislikes(newDislikes);
        setHasDisliked(false);
        localStorage.setItem(`dislikes_${slug}`, newDislikes.toString());
        localStorage.setItem(`hasDisliked_${slug}`, "false");
      }

      // Добавляем лайк
      const newLikes = likes + 1;
      setLikes(newLikes);
      setHasLiked(true);
      localStorage.setItem(`likes_${slug}`, newLikes.toString());
      localStorage.setItem(`hasLiked_${slug}`, "true");

      // ОТПРАВЛЯЕМ НА СЕРВЕР - PATCH
      if (news?.id) {
        try {
          const response = await fetch(`${config}/api/news/${news.id}/`, {
            method: "PATCH",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              likes: newLikes,
              dislikes: hasDisliked ? dislikes - 1 : news.dislikes,
            }),
          });

          if (response.ok) {
            const updatedNews = await response.json();
            setNews(updatedNews);
            console.log("Лайк обновлен на сервере");
          }
        } catch (err) {
          console.error("Ошибка отправки лайка:", err);
        }
      }
    } else {
      // Убираем лайк
      const newLikes = likes - 1;
      setLikes(newLikes);
      setHasLiked(false);
      localStorage.setItem(`likes_${slug}`, newLikes.toString());
      localStorage.setItem(`hasLiked_${slug}`, "false");

      // ОТПРАВЛЯЕМ НА СЕРВЕР - PATCH
      if (news?.id) {
        try {
          const response = await fetch(`${config}/api/news/${news.id}/`, {
            method: "PATCH",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              likes: newLikes,
            }),
          });

          if (response.ok) {
            const updatedNews = await response.json();
            setNews(updatedNews);
          }
        } catch (err) {
          console.error("Ошибка отправки лайка:", err);
        }
      }
    }
  };

  const handleDislike = async () => {
    if (!hasDisliked) {
      // Убираем лайк если был
      if (hasLiked) {
        const newLikes = likes - 1;
        setLikes(newLikes);
        setHasLiked(false);
        localStorage.setItem(`likes_${slug}`, newLikes.toString());
        localStorage.setItem(`hasLiked_${slug}`, "false");
      }

      // Добавляем дизлайк
      const newDislikes = dislikes + 1;
      setDislikes(newDislikes);
      setHasDisliked(true);
      localStorage.setItem(`dislikes_${slug}`, newDislikes.toString());
      localStorage.setItem(`hasDisliked_${slug}`, "true");

      // ОТПРАВЛЯЕМ НА СЕРВЕР - PATCH
      if (news?.id) {
        try {
          const response = await fetch(`${config}/api/news/${news.id}/`, {
            method: "PATCH",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              dislikes: newDislikes,
              likes: hasLiked ? likes - 1 : news.likes,
            }),
          });

          if (response.ok) {
            const updatedNews = await response.json();
            setNews(updatedNews);
          }
        } catch (err) {
          console.error("Ошибка отправки дизлайка:", err);
        }
      }
    } else {
      const newDislikes = dislikes - 1;
      setDislikes(newDislikes);
      setHasDisliked(false);
      localStorage.setItem(`dislikes_${slug}`, newDislikes.toString());
      localStorage.setItem(`hasDisliked_${slug}`, "false");

      if (news?.id) {
        try {
          const response = await fetch(`${config}/api/news/${news.id}/`, {
            method: "PATCH",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              dislikes: newDislikes,
            }),
          });

          if (response.ok) {
            const updatedNews = await response.json();
            setNews(updatedNews);
          }
        } catch (err) {
          console.error("Ошибка отправки дизлайка:", err);
        }
      }
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    const today = new Date();
    const yesterday = new Date();
    yesterday.setDate(today.getDate() - 1);

    date.setHours(0, 0, 0, 0);
    today.setHours(0, 0, 0, 0);
    yesterday.setHours(0, 0, 0, 0);

    if (date.getTime() === today.getTime()) {
      return "Сегодня";
    }
    if (date.getTime() === yesterday.getTime()) {
      return "Вчера";
    }

    return date.toLocaleDateString("ru-RU", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  };

  if (loading) {
    return (
      <div className={style.loadingContainer}>
        <div className={style.spinner}></div>
        <p>Загрузка новости...</p>
      </div>
    );
  }

  if (error || !news) {
    return (
      <div className={style.loadingContainer}>
        <div className={style.spinner}></div>
        <p>{error || "Новость не найдена"}</p>
        <button className={style.backButton} onClick={() => navigate("/news")}>
          ← К списку новостей
        </button>
      </div>
    );
  }

  return (
    <div className={style.container}>
      <header className={style.mainHeader}>
        <div className={style.headerContent}>
          <button className={style.back} onClick={() => navigate("/news")}>
            <img
              src="/back.png"
              alt="Вернуться на новостную страницу"
              className={style.backimg}
            />
          </button>

          <div className={style.rightButtons}>
            <button
              className={style.headerButton}
              onClick={() => navigate("/")}
            >
              На главную
            </button>

            <button
              className={style.headerButton}
              onClick={() => navigate("/my-cedars")}
            >
              Личный кабинет
            </button>
          </div>
        </div>
      </header>

      <main className={style.mainContent}>
        <div className={style.titleSection}>
          <div className={style.titleContainer}>
            <h1 className={style.title}>{news.title}</h1>
            <div className={style.metaInfo}>
              <span className={style.date}>
                {formatDate(news.published_at)}
              </span>
              <span className={style.category}>
                {news.category || "События"}
              </span>
            </div>
          </div>
        </div>

        {news.images && news.images.length > 0 && (
          <div className={style.mainImage}>
            <div className={style.imageContainer}>
              <img src={news.images[0].image} alt={news.title} />
            </div>
          </div>
        )}

        <div className={style.contentContainer}>
          <article className={style.content}>
            {news.text &&
              news.text.split("\n").map((paragraph, index) => (
                <p key={index} className={style.paragraph}>
                  {paragraph}
                </p>
              ))}
          </article>
        </div>

        {news.images && news.images.length > 1 && (
          <div className={style.gallerySection}>
            <div className={style.galleryContainer}>
              <h3 className={style.galleryTitle}>Фотографии</h3>
              <div className={style.gallery}>
                {news.images.slice(1).map((img, index) => (
                  <div key={img.id || index} className={style.galleryItem}>
                    <img src={img.image} alt={`Фото ${index + 2} к новости`} />
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        <div className={style.likesSection}>
          <span className={style.likesText}>Понравилась статья? Оцените</span>
          <div className={style.ratingButtons}>
            <button
              className={`${style.ratingBtn} ${hasLiked ? style.liked : ""}`}
              onClick={handleLike}
            >
              <img
                src={hasLiked ? "/liked-icon.png" : "/like-icon.png"}
                alt="Нравится"
                className={style.ratingIcon}
              />
              <span className={style.ratingCount}>{likes}</span>
            </button>

            <button
              className={`${style.ratingBtn} ${hasDisliked ? style.disliked : ""}`}
              onClick={handleDislike}
            >
              <img
                src={hasDisliked ? "/disliked-icon.png" : "/dislike-icon.png"}
                alt="Не нравится"
                className={style.ratingIcon}
              />
              <span className={style.ratingCount}>{dislikes}</span>
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}

export default CurrentNewsPage;

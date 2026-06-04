import React, { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import styles from "../css/newsmainpage.module.css";
import config from "../config.js";
import ModalAlertPortal from "../components/PopUp/ModalAlertPortal";

function NewsMainPage() {
  const navigate = useNavigate();
  const [activeFilter, setActiveFilter] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [newsData, setNewsData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAuthAlert, setShowAuthAlert] = useState(false);
  const newsPerPage = 5;

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

  // Проверка авторизации
  const checkAuth = () => {
    const token = localStorage.getItem("token");
    return !!token; // Возвращает true если токен есть
  };

  // Обработчик нажатия на личный кабинет
  const handleCabinetClick = () => {
    if (checkAuth()) {
      navigate("/lk"); // Если авторизован - переходим
    } else {
      setShowAuthAlert(true); // Если нет - показываем портал
    }
  };

  useEffect(() => {
    const fetchNews = async () => {
      setLoading(true);
      try {
        const response = await fetch(`${config}/api/news/`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        });
        const data = await response.json();
        setNewsData(data);
      } catch (error) {
        console.error("Error:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchNews();
  }, []);

  const getNewsType = (newsItem) => {
    const newsDate = new Date(newsItem.published_at);
    const today = new Date();
    const weekAgo = new Date();
    weekAgo.setDate(today.getDate() - 7);

    const normalizeDate = (date) => {
      const d = new Date(date);
      d.setHours(0, 0, 0, 0);
      return d;
    };

    const normalizedNewsDate = normalizeDate(newsDate);
    const normalizedToday = normalizeDate(today);
    const normalizedWeekAgo = normalizeDate(weekAgo);

    if (normalizedNewsDate.getTime() === normalizedToday.getTime()) {
      return "today";
    }
    if (normalizedNewsDate >= normalizedWeekAgo) {
      return "week";
    }
    return "all";
  };

  const filterButtons = [
    { id: "all", label: "Все новости" },
    { id: "today", label: "Сегодня" },
    { id: "week", label: "На этой неделе" },
  ];

  const filteredNews = newsData.filter((newsItem) => {
    if (activeFilter === "all") return true;
    return getNewsType(newsItem) === activeFilter;
  });

  const indexOfLastNews = currentPage * newsPerPage;
  const indexOfFirstNews = indexOfLastNews - newsPerPage;
  const currentNews = filteredNews.slice(indexOfFirstNews, indexOfLastNews);
  const totalPages = Math.ceil(filteredNews.length / newsPerPage);

  const formatDisplayDate = (dateString) => {
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

  const nextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  const prevPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  const goToPage = (pageNumber) => {
    setCurrentPage(pageNumber);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <>
      <header className={styles.mainHeader}>
        <div className={styles.headerContent}>
          <button className={styles.headerButton} onClick={() => navigate("/")}>
            Главная
          </button>
          <button className={styles.headerButton} onClick={handleCabinetClick}>
            Личный кабинет
          </button>
        </div>
      </header>

      <div className={styles.filterSection}>
        <div className={styles.filterButtons}>
          {filterButtons.map((filter) => (
            <button
              key={filter.id}
              className={`${styles.filterButton} ${activeFilter === filter.id ? styles.active : ""}`}
              onClick={() => {
                setActiveFilter(filter.id);
                setCurrentPage(1);
              }}
            >
              <span className={styles.filterLabel}>{filter.label}</span>
            </button>
          ))}
        </div>
      </div>

      <div className={styles.container}>
        <main className={styles.mainContent}>
          <div className={styles.newsGrid}>
            {loading ? (
              <div style={{ textAlign: "center", padding: "40px" }}>
                Загрузка новостей...
              </div>
            ) : currentNews.length > 0 ? (
              currentNews.map((newsItem) => {
                const slug = generateSlug(newsItem.title);

                return (
                  <div key={newsItem.id} className={styles.newsCard}>
                    <div className={styles.cardHeader}>
                      <h2 className={styles.cardTitle}>{newsItem.title}</h2>
                      <div className={styles.cardDateTop}>
                        {formatDisplayDate(newsItem.published_at)}
                      </div>
                    </div>

                    <div className={styles.cardContent}>
                      <p className={styles.cardExcerpt}>{newsItem.text}</p>

                      {newsItem.images && newsItem.images.length > 0 && (
                        <div className={styles.imageGallery}>
                          {newsItem.images.slice(0, 4).map((img, index) => (
                            <div
                              key={img.id || index}
                              className={styles.imageThumbnail}
                            >
                              <img
                                src={img.image}
                                alt={`${newsItem.title} ${index + 1}`}
                              />
                            </div>
                          ))}
                        </div>
                      )}

                      <div className={styles.readMoreContainer}>
                        <Link
                          to={`/news/${slug}`}
                          className={styles.readMoreButton}
                        >
                          Читать далее
                          <span className={styles.arrowIcon}>→</span>
                        </Link>
                      </div>
                    </div>
                  </div>
                );
              })
            ) : (
              <div className={styles.noResults}>
                <div className={styles.noResultsIcon}>📰</div>
                <h3>Новости не найдены</h3>
                <p>В выбранной категории пока нет новостей</p>
                <button
                  className={styles.resetButton}
                  onClick={() => setActiveFilter("all")}
                >
                  Показать все новости
                </button>
              </div>
            )}
          </div>

          {totalPages > 1 && (
            <div className={styles.pagination}>
              <button
                className={`${styles.pageButton} ${styles.prevButton}`}
                onClick={prevPage}
                disabled={currentPage === 1}
              >
                ← Предыдущая
              </button>

              <div className={styles.pageNumbers}>
                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                  let pageNum;
                  if (totalPages <= 5) {
                    pageNum = i + 1;
                  } else if (currentPage <= 3) {
                    pageNum = i + 1;
                  } else if (currentPage >= totalPages - 2) {
                    pageNum = totalPages - 4 + i;
                  } else {
                    pageNum = currentPage - 2 + i;
                  }

                  return (
                    <button
                      key={pageNum}
                      className={`${styles.pageNumber} ${currentPage === pageNum ? styles.active : ""}`}
                      onClick={() => goToPage(pageNum)}
                    >
                      {pageNum}
                    </button>
                  );
                })}
              </div>

              <button
                className={`${styles.pageButton} ${styles.nextButton}`}
                onClick={nextPage}
                disabled={currentPage === totalPages}
              >
                Следующая →
              </button>
            </div>
          )}

          {totalPages > 1 && (
            <div className={styles.pageInfo}>
              Страница <strong>{currentPage}</strong> из{" "}
              <strong>{totalPages}</strong>
            </div>
          )}
        </main>
      </div>

      {/* ПОРТАЛ для неавторизованных пользователей */}
      {showAuthAlert && (
        <ModalAlertPortal
          onClose={() => setShowAuthAlert(false)}
          contentClass="AlertPopUp"
        >
          Сначала пройдите регистрацию на сайте
        </ModalAlertPortal>
      )}
    </>
  );
}

export default NewsMainPage;

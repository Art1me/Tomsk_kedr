import React, { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import "../css/usercabinet.css";
import config from "../config.js";
const EditorCabinet = () => {
    const navigate = useNavigate();
    const [personalData, setPersonalData] = useState({
        firstName: "",
        lastName: "",
        middleName: "",
        phone: "",
        email: "",
        password: "",
        confirmPassword: "",
      });

    const generateSlug = useCallback((title) => {
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
  }, []);
        
    const [news, setNews] = useState([]);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [newsLoading, setNewsLoading] = useState(false);
    const [isChangingPassword, setIsChangingPassword] = useState(false);

    const fetchNews = useCallback(async (page = 1) => {
        try {
        setNewsLoading(true);
        const token = localStorage.getItem("token");

        const response = await fetch(`${config}/api/news/?page=${page}`, {
            headers: {
            Authorization: `Token ${token}`,
            "Content-Type": "application/json",
            },
        });

        if (!response.ok) {
            throw new Error("Ошибка загрузки новостей");
        }

        const data = await response.json();

        let newsList = [];
        let total = 0;

        if (Array.isArray(data)) {
            newsList = data;
            total = data.length;
            setTotalPages(Math.ceil(data.length / 10) || 1);
        } else if (data.results) {
            newsList = data.results;
            total = data.count || data.results.length;
            setTotalPages(Math.ceil(total / 10) || 1);
        } else {
            newsList = Array.isArray(data) ? data : [];
            total = newsList.length;
            setTotalPages(Math.ceil(newsList.length / 10) || 1);
        }

        setNews(newsList);
        setCurrentPage(page);
        } catch (error) {
        console.error("Ошибка загрузки новостей:", error);
        } finally {
        setNewsLoading(false);
        }
    }, []);

      
    const fetchUserData = useCallback(async () => {
        try {
            const token = localStorage.getItem("token");

            if (!token) {
                throw new Error("Токен не найден");
            }

            const response = await fetch(`${config}/api/users/me/`, {
                headers: {
                Authorization: `Token ${token}`,
                "Content-Type": "application/json",
                },
            });

            if (!response.ok) {
                throw new Error("Ошибка загрузки данных пользователя");
            }

            const data = await response.json();
            const simpleProfile = data.simple_profile || {};

            setPersonalData({
                firstName: simpleProfile.first_name || "",
                lastName: simpleProfile.last_name || "",
                middleName: simpleProfile.middle_name || simpleProfile.surname || "",
                phone: data.phone_number || "",
                email: data.email || "",
                password: "",
                confirmPassword: "",
            });
            fetchNews(1);
        } catch (error) {
        console.error("Ошибка:", error);
        alert("Не удалось загрузить данные");
        }
    }, [fetchNews]); 

    const handleDeleteNews = useCallback(
        async (newsId) => {
        if (!window.confirm("Вы уверены, что хотите удалить эту новость?")) {
            return;
        }

        try {
            const token = localStorage.getItem("token");

            const response = await fetch(`${config}/api/news/${newsId}/`, {
            method: "DELETE",
            headers: {
                Authorization: `Token ${token}`,
            },
            });

            if (!response.ok) {
            throw new Error("Ошибка удаления новости");
            }

            alert("Новость успешно удалена!");
            fetchNews(currentPage);
        } catch (error) {
            console.error("Ошибка:", error);
            alert("Ошибка при удалении новости");
        }
        },
        [currentPage, fetchNews],
    );
    
    const handleEditNews = useCallback(
        (newsItem) => {
        const slug = generateSlug(newsItem.title);
        navigate(`/edit-news/${slug}`);
        },
        [generateSlug, navigate],
    );

    const handleCreateNews = useCallback(() => {
        navigate("/create-news");
    }, [navigate]);

  const handleLogout = useCallback(() => {
    localStorage.removeItem("token");
    navigate("/");
  }, [navigate]);

  
    const handleSave = useCallback(async () => {
        try {
        const token = localStorage.getItem("token");
        if (!token) {
            alert("Вы не авторизованы!");
            return;
        }

        const requestPasswordChange = async (newPassword) => {
            const response = await fetch(`${config}/api/password/change/`, {
            method: "POST",
            headers: {
                Authorization: `Token ${token}`,
                "Content-Type": "application/json",
            },
            body: JSON.stringify({ new_password: newPassword }),
            });

            if (!response.ok) {
            throw new Error("Failed to send email");
            }
        };


        if (
            isChangingPassword &&
            personalData.password &&
            personalData.password !== personalData.confirmPassword
        ) {
        alert("Пароли не совпадают!");
        return;
        }

        const updateData = {
            email: personalData.email,
            phone_number: personalData.phone,
            simple_profile: {
                first_name: personalData.firstName,
                last_name: personalData.lastName,
                surname: personalData.middleName,
            },
            };

        const response = await fetch(`${config}/api/users/me/`, {
            method: "PATCH",
            headers: {
                Authorization: `Token ${token}`,
                "Content-Type": "application/json",
            },
            body: JSON.stringify(updateData),
            });

        if (!response.ok) {
            throw new Error("Ошибка сохранения данных");
        }

        if (isChangingPassword && personalData.password) {
            await requestPasswordChange(personalData.password);
            alert("Password reset instructions were sent to email.");
        }

        alert("Данные успешно сохранены!");

        setPersonalData((prev) => ({
        ...prev,
        password: "",
        confirmPassword: "",
        }));

        setIsChangingPassword(false);
        await fetchUserData();
        } catch (error) {
        console.error("Ошибка:", error);
        alert("Ошибка при сохранении: " + error.message);
        }
    }, [isChangingPassword, personalData, fetchUserData]);

    const handlePersonalInputChange = (field, value) => {
        setPersonalData((prev) => ({
        ...prev,
        [field]: value,
        }));
    };

    const goBack = useCallback(() => {
        navigate(-1);
    }, [navigate]);

    const goToHome = useCallback(() => {
        navigate("/");
    }, [navigate]);

    const goToNews = useCallback(() => {
        navigate("/news");
    }, [navigate]);


    useEffect(() => {
        fetchUserData();
    }, [fetchUserData]);

    useEffect(() => {
        if (isChangingPassword) {
        document.getElementById("password")?.focus();
        }
    }, [isChangingPassword]);

    const renderNewsSection = () => (
        <div className="news-section">
        <button className="create-news-btn" onClick={handleCreateNews}>
            <img src="/pen-icon.png" alt="Создать" className="btn-icon" />
            Создать статью
        </button>

        <div className="news-list">
            <h3>Новости</h3>
            {newsLoading ? (
            <div className="news-loading">Загрузка новостей...</div>
            ) : news.length > 0 ? (
            <>
                {news.map((item) => {
                const slug = generateSlug(item.title);

                return (
                    <div key={item.id} className="news-item">
                    <div className="news-content">
                        <h4 className="news-title">{item.title}</h4>
                        <p className="news-preview">
                        {item.text && item.text.length > 150
                            ? `${item.text.substring(0, 150)}...`
                            : item.text}
                        </p>
                        <div className="news-meta">
                        <span className="news-date">
                            {new Date(
                            item.created_at || item.published_at,
                            ).toLocaleDateString()}
                        </span>
                        </div>

                        {item.images && item.images.length > 0 && (
                        <div className="news-gallery">
                            <div className="gallery-grid">
                            {item.images.map((img, index) => (
                                <div key={img.id || index} className="gallery-item">
                                <img
                                    src={img.image}
                                    alt={`${item.title} - ${index + 1}`}
                                    className="gallery-thumbnail"
                                    onClick={() => window.open(img.image, "_blank")}
                                />
                                </div>
                            ))}
                            </div>
                        </div>
                        )}
                    </div>

                    <div className="news-actions">
                        <button
                        className="edit-btn"
                        onClick={() => handleEditNews(item)}
                        title="Редактировать"
                        >
                        <img
                            src="/pen-icon.png"
                            alt="Редактировать"
                            className="btn-icon-small"
                        />
                        </button>
                        <button
                        className="delete-btn"
                        onClick={() => handleDeleteNews(item.id)}
                        title="Удалить"
                        >
                        <img
                            src="/trush-icon.png"
                            alt="Удалить"
                            className="btn-icon-small"
                        />
                        </button>
                        <button
                        className="read-more-btn"
                        onClick={() => navigate(`/news/${slug}`)}
                        >
                        Читать далее
                        </button>
                    </div>
                    </div>
                );
                })}

                {totalPages > 1 && (
                <div className="pagination">
                    <button
                    className="pagination-btn"
                    onClick={() => fetchNews(currentPage - 1)}
                    disabled={currentPage === 1}
                    >
                    ←
                    </button>
                    <span className="page-info">
                    {currentPage} из {totalPages}
                    </span>
                    <button
                    className="pagination-btn"
                    onClick={() => fetchNews(currentPage + 1)}
                    disabled={currentPage === totalPages}
                    >
                    →
                    </button>
                </div>
                )}
            </>
            ) : (
            <div className="no-news">Новости не найдены</div>
            )}
        </div>
        </div>
    );

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
                    <span>Личный кабинет</span>
                </div>
            </header>

            <main className="main-content">
                <h1 className="page-title">Мои данные</h1>
                
                <form onSubmit={(e) => e.preventDefault()}>
                    <div className="data-container editor-container">
                        <div className="column left-column">
                            <div className="input-group">
                                <label>Имя:</label>
                                <input
                                    type="text"
                                    value={personalData.firstName}
                                    onChange={(e) =>
                                        handlePersonalInputChange("firstName", e.target.value)
                                    }
                                    placeholder="Введите имя"
                                    className="input-field"
                                />
                            </div>

                            <div className="input-group">
                                <label>Фамилия:</label>
                                <input
                                    type="text"
                                    value={personalData.lastName}
                                    onChange={(e) =>
                                        handlePersonalInputChange("lastName", e.target.value)
                                    }
                                    placeholder="Введите фамилию"
                                    className="input-field"
                                />
                            </div>

                            <div className="input-group">
                                <label>Отчество:</label>
                                <input
                                    type="text"
                                    value={personalData.middleName}
                                    onChange={(e) =>
                                        handlePersonalInputChange("middleName", e.target.value)
                                    }
                                    placeholder="Введите отчество"
                                    className="input-field"
                                />
                            </div>

                            <button className="logout-btn" onClick={handleLogout}>
                                Выйти
                            </button>
                        </div>

                        <div className="column right-column">
                            <div className="input-group">
                                <label>Телефон:</label>
                                <input
                                    type="tel"
                                    value={personalData.phone}
                                    onChange={(e) =>
                                        handlePersonalInputChange("phone", e.target.value)
                                    }
                                    placeholder="Введите телефон"
                                    className="input-field"
                                />
                            </div>

                            <div className="input-group">
                                <label>Почта:</label>
                                <input
                                    type="email"
                                    value={personalData.email}
                                    onChange={(e) =>
                                        handlePersonalInputChange("email", e.target.value)
                                    }
                                    placeholder="Введите почту"
                                    className="input-field"
                                />
                            </div>

                            <div className="input-group">
                                <label>Пароль:</label>
                                <div className="password-container">
                                    <input
                                        id="password"
                                        type="password"
                                        value={personalData.password}
                                        onChange={(e) => {
                                            handlePersonalInputChange("password", e.target.value);
                                            if (e.target.value && !isChangingPassword) {
                                                setIsChangingPassword(true);
                                            }
                                        }}
                                        placeholder="Новый пароль"
                                        className="input-field"
                                    />
                                    {!isChangingPassword && personalData.password === "" && (
                                        <button
                                            className="change-password-btn"
                                            onClick={() => setIsChangingPassword(true)}
                                        >
                                            Изменить пароль
                                        </button>
                                    )}
                                </div>
                            </div>

                            {isChangingPassword && (
                                <div className="input-group">
                                    <label>Повторите пароль:</label>
                                    <input
                                        type="password"
                                        value={personalData.confirmPassword}
                                        onChange={(e) =>
                                            handlePersonalInputChange("confirmPassword", e.target.value)
                                        }
                                        placeholder="Повторите пароль"
                                        className="input-field"
                                    />
                                </div>
                            )}

                            <button className="save-btn" onClick={handleSave}>
                                Сохранить
                            </button>
                        </div>
                    </div>
                </form>
                
                {renderNewsSection()}
            </main>
        </div>
    );
}
export default EditorCabinet;

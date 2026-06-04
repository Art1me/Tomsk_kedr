import React, { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import "../css/usercabinet.css";

import config from "../config.js";

const PartnerCabinet = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("data"); // 'data', 'orders', 'workers'
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [showDetachModal, setShowDetachModal] = useState(false);
  const [workerToDetach, setWorkerToDetach] = useState(null);

  const [partnerData, setPartnerData] = useState({
    name: "",
    phone_number: "",
    email: "",
    address: "",
    password: "",
    confirmPassword: "",
    owner_last_name: "",
    owner_first_name: "",
    owner_surname: "",
  });

  const [workers, setWorkers] = useState([
    {
      id: 1,
      first_name: "Иван",
      last_name: "Петров",
      patronymic: "Иванович",
      cedars_count: 15,
      avatar: null,
    },
    {
      id: 2,
      first_name: "Мария",
      last_name: "Сидорова",
      patronymic: "Алексеевна",
      cedars_count: 8,
      avatar: null,
    },
    {
      id: 3,
      first_name: "Алексей",
      last_name: "Смирнов",
      patronymic: "Дмитриевич",
      cedars_count: 23,
      avatar: null,
    },
    {
      id: 4,
      first_name: "Елена",
      last_name: "Кузнецова",
      patronymic: "Андреевна",
      cedars_count: 12,
      avatar: null,
    },
    {
      id: 5,
      first_name: "Дмитрий",
      last_name: "Волков",
      patronymic: "Сергеевич",
      cedars_count: 7,
      avatar: null,
    },
  ]);

  // Состояние для заказов (пока пустой массив)
  const [orders, setOrders] = useState([]);

  // Фильтрация сотрудников по поиску
  const filteredWorkers = workers.filter((worker) => {
    const fullName =
      `${worker.last_name} ${worker.first_name} ${worker.patronymic}`.toLowerCase();
    return fullName.includes(searchQuery.toLowerCase());
  });

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
      const partnerProfile = data.partner_profile || null;

      setPartnerData({
        name: partnerProfile?.name || "",
        phone_number: partnerProfile?.phone_number || data.phone_number || "",
        email: partnerProfile?.email || data.email || "",
        address: partnerProfile?.address || "",
        password: "",
        confirmPassword: "",
        owner_last_name: partnerProfile?.owner_last_name || "",
        owner_first_name: partnerProfile?.owner_first_name || "",
        owner_surname: partnerProfile?.owner_surname || "",
      });
    } catch (error) {
      console.error("Ошибка:", error);
      alert("Не удалось загрузить данные");
    }
  }, []);

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
        partnerData.password &&
        partnerData.password !== partnerData.confirmPassword
      ) {
        alert("Пароли не совпадают!");
        return;
      }

      const updateData = {
        email: partnerData.email,
        phone_number: partnerData.phone_number,
        partner_profile: {
          name: partnerData.name,
          address: partnerData.address,
          owner_last_name: partnerData.owner_last_name,
          owner_first_name: partnerData.owner_first_name,
          owner_surname: partnerData.owner_surname,
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
        throw new Error("Ошибка сохранения данных партнера");
      }

      if (isChangingPassword && partnerData.password) {
        await requestPasswordChange(partnerData.password);
        alert("Password reset instructions were sent to email.");
      }

      alert("Данные партнера успешно сохранены!");

      setPartnerData((prev) => ({
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
  }, [isChangingPassword, partnerData, fetchUserData]);

  const handlePartnerInputChange = (field, value) => {
    setPartnerData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  // Обработчики для сотрудников
  const handleAvatarChange = (workerId, event) => {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setWorkers(
          workers.map((worker) =>
            worker.id === workerId
              ? { ...worker, avatar: reader.result }
              : worker,
          ),
        );
      };
      reader.readAsDataURL(file);
    }
  };

  const openDetachModal = (worker) => {
    setWorkerToDetach(worker);
    setShowDetachModal(true);
  };

  const closeDetachModal = () => {
    setShowDetachModal(false);
    setWorkerToDetach(null);
  };

  const confirmDetachWorker = () => {
    if (workerToDetach) {
      setWorkers(workers.filter((worker) => worker.id !== workerToDetach.id));
      closeDetachModal();
    }
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

  // Рендер содержимого в зависимости от активной вкладки
  const renderContent = () => {
    switch (activeTab) {
      case "data":
        return (
          <div className="data-container partner-data-container">
            <div className="column left-column">
              <div className="input-group">
                <label>Название компании *</label>
                <input
                  type="text"
                  value={partnerData.name}
                  onChange={(e) =>
                    handlePartnerInputChange("name", e.target.value)
                  }
                  placeholder="Введите название компании"
                  className="input-field"
                  required
                />
              </div>

              <div className="input-group">
                <label>Телефон компании *</label>
                <input
                  type="tel"
                  value={partnerData.phone_number}
                  onChange={(e) =>
                    handlePartnerInputChange("phone_number", e.target.value)
                  }
                  placeholder="+7 (XXX) XXX-XX-XX"
                  className="input-field"
                  required
                />
              </div>

              <div className="input-group">
                <label>Почта компании *</label>
                <input
                  type="email"
                  value={partnerData.email}
                  onChange={(e) =>
                    handlePartnerInputChange("email", e.target.value)
                  }
                  placeholder="company@example.com"
                  className="input-field"
                  required
                />
              </div>

              <div className="input-group">
                <label>Адрес компании *</label>
                <input
                  type="text"
                  value={partnerData.address}
                  onChange={(e) =>
                    handlePartnerInputChange("address", e.target.value)
                  }
                  placeholder="Полный адрес компании"
                  className="input-field"
                  required
                />
              </div>
              <button className="save-btn" onClick={handleSave}>
                Сохранить
              </button>
            </div>

            <div className="column right-column">
              <div className="input-group">
                <label>Фамилия представителя *</label>
                <input
                  type="text"
                  value={partnerData.owner_last_name}
                  onChange={(e) =>
                    handlePartnerInputChange("owner_last_name", e.target.value)
                  }
                  placeholder="Введите фамилию"
                  className="input-field"
                  required
                />
              </div>

              <div className="input-group">
                <label>Имя представителя *</label>
                <input
                  type="text"
                  value={partnerData.owner_first_name}
                  onChange={(e) =>
                    handlePartnerInputChange("owner_first_name", e.target.value)
                  }
                  placeholder="Введите имя"
                  className="input-field"
                  required
                />
              </div>

              <div className="input-group">
                <label>Отчество представителя</label>
                <input
                  type="text"
                  value={partnerData.owner_surname}
                  onChange={(e) =>
                    handlePartnerInputChange("owner_surname", e.target.value)
                  }
                  placeholder="Введите отчество"
                  className="input-field"
                />
              </div>

              <div className="input-group">
                <label>Пароль</label>
                <div className="password-container">
                  <input
                    id="password"
                    type="password"
                    value={partnerData.password}
                    onChange={(e) => {
                      handlePartnerInputChange("password", e.target.value);
                      if (e.target.value && !isChangingPassword) {
                        setIsChangingPassword(true);
                      }
                    }}
                    placeholder="Новый пароль"
                    className="input-field"
                  />
                  {!isChangingPassword && partnerData.password === "" && (
                    <button
                      className="change-password-btn"
                      onClick={() => setIsChangingPassword(true)}
                    >
                      Изменить
                    </button>
                  )}
                </div>
              </div>

              {isChangingPassword && (
                <div className="input-group">
                  <label>Повторите пароль</label>
                  <input
                    type="password"
                    value={partnerData.confirmPassword}
                    onChange={(e) =>
                      handlePartnerInputChange(
                        "confirmPassword",
                        e.target.value,
                      )
                    }
                    placeholder="Повторите пароль"
                    className="input-field"
                  />
                </div>
              )}

              <button className="logout-btn" onClick={handleLogout}>
                Выйти
              </button>
            </div>
          </div>
        );
      case "orders":
        return (
          <div className="orders-section">
            <button className="order-btn" onClick={() => {}}>
              Заказать
            </button>
            {orders.length > 0 ? (
              <div className="orders-list">
                {/* Здесь будет список заказов */}
              </div>
            ) : null}
          </div>
        );
      case "workers":
        return (
          <div className="workers-section">
            <div className="search-container">
              <input
                type="text"
                className="search-input"
                placeholder="Поиск по ФИО..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              {searchQuery && (
                <button
                  className="clear-search-btn"
                  onClick={() => setSearchQuery("")}
                >
                  ✕
                </button>
              )}
            </div>

            <div className="workers-container">
              {filteredWorkers.map((worker) => (
                <div key={worker.id} className="worker-card">
                  <div className="worker-info">
                    <div className="worker-name">
                      {worker.last_name} {worker.first_name} {worker.patronymic}
                    </div>
                    <div className="worker-cedars">
                      Зарегистрировано кедров: {worker.cedars_count}
                    </div>
                  </div>
                  <div className="worker-actions">
                    <button
                      className="detach-worker-btn"
                      onClick={() => openDetachModal(worker)}
                    >
                      Открепить
                    </button>
                    <div className="worker-avatar-container">
                      {worker.avatar ? (
                        <img
                          src={worker.avatar}
                          alt="Аватар"
                          className="worker-avatar"
                        />
                      ) : (
                        <div className="worker-avatar-placeholder">
                          {worker.first_name?.[0]}
                          {worker.last_name?.[0]}
                        </div>
                      )}
                      <label className="change-avatar-btn">
                        Изменить
                        <input
                          type="file"
                          accept="image/*"
                          onChange={(e) => handleAvatarChange(worker.id, e)}
                          style={{ display: "none" }}
                        />
                      </label>
                    </div>
                  </div>
                </div>
              ))}
              {filteredWorkers.length === 0 && (
                <div className="empty-tab-content">
                  <p>Сотрудники не найдены</p>
                </div>
              )}
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="personal-cabinet partner-cabinet">
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
        <div className="partner-tabs">
          <div className="tabs-container">
            <div
              className={`tab ${activeTab === "data" ? "active" : ""}`}
              onClick={() => setActiveTab("data")}
            >
              <span className="tab-title">Мои данные</span>
              <div
                className={`tab-underline ${activeTab === "data" ? "active" : ""}`}
              ></div>
            </div>
            <div
              className={`tab ${activeTab === "orders" ? "active" : ""}`}
              onClick={() => setActiveTab("orders")}
            >
              <span className="tab-title">Мои заказы</span>
              <div
                className={`tab-underline ${activeTab === "orders" ? "active" : ""}`}
              ></div>
            </div>
            <div
              className={`tab ${activeTab === "workers" ? "active" : ""}`}
              onClick={() => setActiveTab("workers")}
            >
              <span className="tab-title">Мои работники</span>
              <div
                className={`tab-underline ${activeTab === "workers" ? "active" : ""}`}
              ></div>
            </div>
          </div>
        </div>

        <div className="tab-content">{renderContent()}</div>
      </main>

      {/* Модальное окно подтверждения удаления сотрудника */}
      {showDetachModal && (
        <div className="modal-overlay" onClick={closeDetachModal}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h2 className="modal-title">Подтвердите удаление сотрудника</h2>
            <p className="modal-message">
              Вы уверены, что хотите открепить сотрудника{" "}
              <strong>
                {workerToDetach?.last_name} {workerToDetach?.first_name}{" "}
                {workerToDetach?.patronymic}
              </strong>
              ? Все связанные данные, включая сертификаты и отчёты будут
              безвозвратно удалены.
            </p>
            <div className="modal-actions">
              <button
                className="modal-btn modal-btn-cancel"
                onClick={closeDetachModal}
              >
                Отмена
              </button>
              <button
                className="modal-btn modal-btn-confirm"
                onClick={confirmDetachWorker}
              >
                Удалить
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PartnerCabinet;

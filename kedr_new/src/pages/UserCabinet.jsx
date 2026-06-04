import React, { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import "../css/usercabinet.css";
import config from "../config.js";

const UserCabinet = () => {
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
  const [isChangingPassword, setIsChangingPassword] = useState(false);

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
        middleName: simpleProfile.surname || "",
        phone: data.phone_number || "",
        email: data.email || "",
        password: "",
        confirmPassword: "",
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

        <div className="data-container">
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
      </main>
    </div>
  );
};

export default UserCabinet;

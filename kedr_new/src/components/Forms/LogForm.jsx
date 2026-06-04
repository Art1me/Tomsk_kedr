import React, { useState } from "react";
import style from "../../css/logform.module.css";
import ResetPasswordForm from "./ResetPasswordForm";
import PopUp from "../PopUp/PopUp";
import config from "../../config";

const LogForm = ({ switchToRegister, onLogin, onResetPassword }) => {
  const [login, setLogin] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showResetPassword, setShowResetPassword] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    // Проверка: что введено
    if (!login) {
      setError("Укажите почту или телефон");
      return;
    }

    // Проверка пароля
    if (!password) {
      setError("Введите пароль");
      return;
    }

    // Определяем, что введено: email или телефон
    let isEmail = login.includes("@");
    let isPhone = /^\+?[\d\s-]+$/.test(login);

    if (!isEmail && !isPhone) {
      setError("Введите корректный email или телефон");
      return;
    }

    try {
      setIsLoading(true);
      const response = await fetch(`${config}/api/djoser-auth/token/login/`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          username: login,
          password: password,
        }),
      });

      const data = await response.json();
      if (response.ok) {
        localStorage.setItem("token", data.auth_token);
        onLogin?.();
        setSuccess("Успешный вход!");
        setTimeout(() => {
          window.location.reload();
        }, 1000);
      } else {
        setError(data.detail || "Ошибка входа");
      }
    } catch (error) {
      setError("Ошибка сети: " + error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={style.container}>
      <header className={style.header}>
        <p>Вход в личный кабинет</p>
      </header>
      <form className={style.form} onSubmit={handleSubmit}>
        {error && <div className={style.error}>{error}</div>}
        {success && <div className={style.success}>{success}</div>}

        <label htmlFor="login">Почта/Телефон</label>
        <input
          id="login"
          value={login}
          onChange={(e) => {
            setLogin(e.target.value);
            setError("");
            setSuccess("");
          }}
          className={style.input}
        />

        <label htmlFor="password">Пароль</label>
        <input
          id="password"
          type="password"
          value={password}
          onChange={(e) => {
            setPassword(e.target.value);
            setError("");
            setSuccess("");
          }}
          className={style.input}
        />

        <div className={style.button_con}>
          {isLoading ? (
            <button type="submit" className={style.button} disabled>
              Войти
            </button>
          ) : (
            <button type="submit" className={style.button}>
              Войти
            </button>
          )}
        </div>
      </form>

      <footer className={style.footer}>
        <p onClick={onResetPassword} className={style.reg_button}>
          Забыли пароль?
        </p>
        <p onClick={switchToRegister} className={style.reg_button}>
          Нет аккаунта? Зарегистрироваться
        </p>
      </footer>
      {showResetPassword && (
        <PopUp
          obj={ResetPasswordForm}
          object="resetPassword"
          contentClass="resetPassword"
          closePopUp={() => setShowResetPassword(false)}
        />
      )}
    </div>
  );
};

export default LogForm;

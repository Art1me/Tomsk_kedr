import React from "react";
import style from "./accesschoice.module.css";
import { useState } from "react";

const AccessChoice = ({ AccessActive, setAccessActive, onChoice }) => {
  const [isClosing, setIsClosing] = useState(false);

  const handleClose = () => {
    setIsClosing(true);
    setTimeout(() => {
      setAccessActive(false);
    }, 300); // Время анимации
  };
  return (
    <div className={`${style.accessModal}`} onClick={handleClose}>
      <div
        className={`${style.accessModal__content} ${isClosing ? style.slideOut : style.slideIn}`}
        onClick={(e) => e.stopPropagation()}
      >
        <div className={`${style.title}`}>Что вы хотите сделать?</div>

        {/* Контейнер для всех элементов */}
        <div className={`${style.optionsContainer}`}>
          <img
            src="/close.png"
            alt="закрыть"
            className={style.close}
            onClick={handleClose}
          />
          <div className={`${style.option}`}>
            <button
              className={`${style.imageButton}`}
              onClick={() => onChoice("register")}
            >
              <div className={`${style.imageWrapper}`}>
                <img src="/reg_auth-icon-1.png" alt="Зарегистрироваться" />
              </div>
            </button>
            <p className={`${style.text}`}>
              Зарегистри<wbr></wbr>рова<wbr></wbr>ться
            </p>
          </div>

          <div className={`${style.option}`}>
            <button
              className={`${style.imageButton}`}
              onClick={() => onChoice("login")}
            >
              <div className={`${style.imageWrapper}`}>
                <img src="/reg_auth-icon-3.png" alt="Войти в профиль" />
              </div>
            </button>
            <p className={`${style.text}`}>Войти в профиль</p>
          </div>

          <div className={`${style.option}`}>
            <button
              className={`${style.imageButton}`}
              onClick={() => onChoice("registerPartner")}
            >
              <div className={`${style.imageWrapper}`}>
                <img src="/reg_auth-icon-2.png" alt="Регистрация партнера" />
              </div>
            </button>
            <p className={`${style.text}`}>Регистрация партнера</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AccessChoice;

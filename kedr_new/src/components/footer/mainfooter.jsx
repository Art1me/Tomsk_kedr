import React from "react";
import { useState } from "react";
import "./mainfooter.css";
import ModalAlertPortal from "../PopUp/ModalAlertPortal";

const MainFooter = () => {
  const [showAuthInfo, setShowAuthInfo] = useState(false);
  const token = localStorage.getItem("token");

  const CheckAuth = (e) => {
    if (!token) {
      e.preventDefault();
      setShowAuthInfo(true);
    }
  };

  return (
    <footer className="main-footer">
      <div className="main-footer-container">
        {/* Первый столбец - Контакты */}
        <div className="main-footer-column">
          <h3 className="main-footer-title">Наши контакты</h3>
          <div className="main-footer-contact-info">
            <div className="main-footer-contact-item">
              <span className="main-footer-contact-value">
                <img
                  src="./phone-img.png"
                  alt="Иконка телефона"
                  className="phone-icon"
                />
                +7 952 152 40-04
              </span>
            </div>
            <div className="main-footer-contact-item">
              <span className="main-footer-contact-value">
                <img
                  src="./mail-img.png"
                  alt="Иконка почты"
                  className="mail-icon"
                />
                artemdushnila@tomsk.org
              </span>
            </div>
          </div>
        </div>

        {/* Второй столбец - Навигация */}
        <div className="main-footer-column">
          <h3 className="main-footer-title">Ориентация по сайту</h3>
          <nav className="main-footer-nav">
            <a href="/lk" className="main-footer-nav-link" onClick={CheckAuth}>
              Личный кабинет
            </a>
            <a href="/news" className="main-footer-nav-link">
              Новости
            </a>
            <a
              href="/my-cedars"
              className="main-footer-nav-link"
              onClick={CheckAuth}
            >
              Мои кедры
            </a>
            <a
              href="/register-cedar"
              className="main-footer-nav-link"
              onClick={CheckAuth}
            >
              Зарегистрировать кедр
            </a>
          </nav>
        </div>

        {/* Третий столбец - Лозунг */}
        <div className="main-footer-column main-footer-slogan-column">
          <h2 className="main-footer-slogan">ТОМСК - СТОЛИЦА КЕДРА</h2>
        </div>
      </div>

      {/* Копирайт */}
      <div className="main-footer-bottom">
        <p className="main-footer-copyright">
          © {new Date().getFullYear()} Томск - столица кедра. Все права
          защищены.
        </p>
      </div>
      {showAuthInfo && (
        <ModalAlertPortal
          onClose={() => setShowAuthInfo(false)}
          contentClass="AlertPopUp"
        >
          Сначала пройдите авторизацию на сайте
        </ModalAlertPortal>
      )}
    </footer>
  );
};

export default MainFooter;

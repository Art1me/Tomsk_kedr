import React from "react";
import style from "../css/helpinfo.module.css";

const HelpInfo = () => {
  return (
    <div className={style.helpContainer}>
      <h2 className={style.title}>Чтобы зарегистрировать кедр нужно:</h2>
      <ul className={style.list}>
        <li className={style.listItem}>
          Войти в личный кабинет/авторизоваться
        </li>
        <li className={style.listItem}>Выбрать место кедра на карте</li>
        <li className={style.listItem}>Добавить описание и фото</li>
      </ul>
      <p className={style.info}>
        После заполнения формы и нажатия кнопки "Отправить" появится qr-код для
        оплаты.
      </p>
    </div>
  );
};

export default HelpInfo;

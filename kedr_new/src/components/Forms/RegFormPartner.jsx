import React, { useState } from "react";
import style from "../../css/regpartner.module.css";
import config from "../../config";

const RegFormPartner = ({ switchToLogin }) => {
  const [formData, setFormData] = useState({
    partner_name: "",
    inn: "",
    password: "",
    confirm_password: "",
    director_last_name: "",
    director_first_name: "",
    director_surname: "",
    director_phone: "",
    director_email: "",
    coord_last_name: "",
    coord_first_name: "",
    coord_surname: "",
    coord_phone: "",
    coord_email: "",
    acc_last_name: "",
    acc_first_name: "",
    acc_surname: "",
    acc_phone: "",
    acc_email: "",
    consent: false,
  });

  const [step, setStep] = useState(1);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleOpenPolicy = (e) => {
    e.preventDefault();
    window.open("/ПОЛОЖЕНИЕ.pdf", "_blank");
  };

  const handleChange = (e) => {
    const value =
      e.target.type === "checkbox" ? e.target.checked : e.target.value;
    setFormData({ ...formData, [e.target.id]: value });
    setError("");
    setSuccess("");
  };

  const validateEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  const validatePhone = (phone) => /^\+?[\d\s-()]+$/.test(phone);

  const handleNextStep = () => {
    setError("");
    if (step === 1) {
      if (!formData.password || !formData.confirm_password) {
        setError("Пожалуйста, заполните поля пароля");
        return;
      }
      if (formData.password !== formData.confirm_password) {
        setError("Пароли не совпадают");
        return;
      }
    }
    setStep((prev) => prev + 1);
    window.scrollTo(0, 0);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (!formData.consent) {
      setError("Необходимо дать согласие на обработку персональных данных");
      return;
    }

    const requiredChecks = [
      { field: "partner_name", msg: "Введите название компании" },
      { field: "inn", msg: "Введите ИНН" },
      { field: "password", msg: "Введите пароль" },
      { field: "director_last_name", msg: "Введите фамилию директора" },
      { field: "director_first_name", msg: "Введите имя директора" },
      { field: "director_phone", msg: "Введите телефон директора" },
      { field: "director_email", msg: "Введите почту директора" },
      { field: "coord_last_name", msg: "Введите фамилию координатора" },
      { field: "coord_first_name", msg: "Введите имя координатора" },
      { field: "coord_phone", msg: "Введите телефон координатора" },
      { field: "coord_email", msg: "Введите почту координатора" },
    ];

    for (const req of requiredChecks) {
      if (!formData[req.field]) {
        setError(req.msg);
        return;
      }
    }

    if (formData.password !== formData.confirm_password) {
      setError("Пароли не совпадают");
      return;
    }

    if (!validateEmail(formData.director_email)) {
      setError("Введите корректный email директора");
      return;
    }
    if (!validatePhone(formData.director_phone)) {
      setError("Введите корректный номер телефона директора");
      return;
    }
    if (!validateEmail(formData.coord_email)) {
      setError("Введите корректный email координатора");
      return;
    }
    if (!validatePhone(formData.coord_phone)) {
      setError("Введите корректный номер телефона координатора");
      return;
    }

    try {
      const response = await fetch(`${config}/api/registration/partner/`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          partner_name: formData.partner_name,
          partner_address: formData.inn,
          inn: formData.inn,
          email: formData.director_email,
          phone_number: formData.director_phone,
          password: formData.password,
          owner_last_name: formData.director_last_name,
          owner_first_name: formData.director_first_name,
          owner_surname: formData.director_surname,
          owner_birthday: "1963-01-15",
        }),
      });

      const text = await response.text();
      try {
        const data = JSON.parse(text);
        if (response.ok) {
          setSuccess("Регистрация успешна! Проверьте email для подтверждения.");
        } else {
          setError(
            "Ошибка регистрации: " + (data.error || JSON.stringify(data)),
          );
        }
      } catch (e) {
        setError("Ошибка: сервер вернул не JSON. Ответ: " + text);
      }
    } catch (error) {
      setError("Ошибка сети: " + error);
    }
  };

  const renderStep = () => {
    switch (step) {
      case 1:
        return (
          <>
            <header className={style.stepTitle}>Регистрация</header>
            <div className={style.form_container_grid}>
              <div className={style.form_group}>
                <label htmlFor="partner_name">Название компании*</label>
                <input
                  id="partner_name"
                  placeholder='ООО "ТЫЩА ДЕНЕГ"'
                  value={formData.partner_name}
                  onChange={handleChange}
                  className={style.input}
                />
              </div>
              <div className={style.form_group}>
                <label htmlFor="inn">ИНН*</label>
                <input
                  id="inn"
                  placeholder="00 00 000000 00"
                  value={formData.inn}
                  onChange={handleChange}
                  className={style.input}
                />
              </div>
              <div className={style.form_group}>
                <label htmlFor="password">Пароль*</label>
                <input
                  id="password"
                  type="password"
                  placeholder="Придумайте пароль"
                  value={formData.password}
                  onChange={handleChange}
                  className={style.input}
                />
              </div>
              <div className={style.form_group}>
                <label htmlFor="confirm_password">Повторите пароль*</label>
                <input
                  id="confirm_password"
                  type="password"
                  placeholder="Повторите пароль"
                  value={formData.confirm_password}
                  onChange={handleChange}
                  className={style.input}
                />
              </div>
            </div>
            <div className={style.required}>
              *Поля обязательные для заполнения
            </div>
            <button
              type="button"
              onClick={handleNextStep}
              className={style.button}
            >
              Далее
            </button>
          </>
        );

      case 2:
        return (
          <>
            <header className={style.stepTitle}>Контакты Директора*</header>
            <div className={style.form_container_grid}>
              <div className={style.form_group}>
                <label htmlFor="director_first_name">Имя*</label>
                <input
                  id="director_first_name"
                  placeholder="Введите имя"
                  value={formData.director_first_name}
                  onChange={handleChange}
                  className={style.input}
                />
              </div>
              <div className={style.form_group}>
                <label htmlFor="director_phone">Телефон*</label>
                <input
                  id="director_phone"
                  placeholder="+7 (xxx) xxx xx-xx"
                  value={formData.director_phone}
                  onChange={handleChange}
                  className={style.input}
                />
              </div>
              <div className={style.form_group}>
                <label htmlFor="director_last_name">Фамилия*</label>
                <input
                  id="director_last_name"
                  placeholder="Введите фамилию"
                  value={formData.director_last_name}
                  onChange={handleChange}
                  className={style.input}
                />
              </div>
              <div className={style.form_group}>
                <label htmlFor="director_email">Почта*</label>
                <input
                  id="director_email"
                  type="email"
                  placeholder="Введите почту через @"
                  value={formData.director_email}
                  onChange={handleChange}
                  className={style.input}
                />
              </div>
              <div className={style.form_group}>
                <label htmlFor="director_surname">Отчество*</label>
                <input
                  id="director_surname"
                  placeholder="Введите отчество"
                  value={formData.director_surname}
                  onChange={handleChange}
                  className={style.input}
                />
              </div>
            </div>
            <div className={style.required}>
              *Поля обязательные для заполнения
            </div>
            <button
              type="button"
              onClick={handleNextStep}
              className={style.button}
            >
              Далее
            </button>
          </>
        );

      case 3:
        return (
          <>
            <header className={style.stepTitle}>Контакты Координатора*</header>
            <div className={style.form_container_grid}>
              <div className={style.form_group}>
                <label htmlFor="coord_first_name">Имя*</label>
                <input
                  id="coord_first_name"
                  placeholder="Введите имя"
                  value={formData.coord_first_name}
                  onChange={handleChange}
                  className={style.input}
                />
              </div>
              <div className={style.form_group}>
                <label htmlFor="coord_phone">Телефон*</label>
                <input
                  id="coord_phone"
                  placeholder="+7 (xxx) xxx xx-xx"
                  value={formData.coord_phone}
                  onChange={handleChange}
                  className={style.input}
                />
              </div>
              <div className={style.form_group}>
                <label htmlFor="coord_last_name">Фамилия*</label>
                <input
                  id="coord_last_name"
                  placeholder="Введите фамилию"
                  value={formData.coord_last_name}
                  onChange={handleChange}
                  className={style.input}
                />
              </div>
              <div className={style.form_group}>
                <label htmlFor="coord_email">Почта*</label>
                <input
                  id="coord_email"
                  type="email"
                  placeholder="Введите почту через @"
                  value={formData.coord_email}
                  onChange={handleChange}
                  className={style.input}
                />
              </div>
              <div className={style.form_group}>
                <label htmlFor="coord_surname">Отчество*</label>
                <input
                  id="coord_surname"
                  placeholder="Введите отчество"
                  value={formData.coord_surname}
                  onChange={handleChange}
                  className={style.input}
                />
              </div>
            </div>
            <div className={style.required}>
              *Поля обязательные для заполнения
            </div>
            <button
              type="button"
              onClick={handleNextStep}
              className={style.button}
            >
              Далее
            </button>
          </>
        );

      case 4:
        return (
          <>
            <header className={style.stepTitle}>Контакты Бухгалтера</header>
            <div className={style.form_container_grid}>
              <div className={style.form_group}>
                <label htmlFor="acc_first_name">Имя</label>
                <input
                  id="acc_first_name"
                  placeholder="Введите имя"
                  value={formData.acc_first_name}
                  onChange={handleChange}
                  className={style.input}
                />
              </div>
              <div className={style.form_group}>
                <label htmlFor="acc_phone">Телефон</label>
                <input
                  id="acc_phone"
                  placeholder="+7 (xxx) xxx xx-xx"
                  value={formData.acc_phone}
                  onChange={handleChange}
                  className={style.input}
                />
              </div>
              <div className={style.form_group}>
                <label htmlFor="acc_last_name">Фамилия</label>
                <input
                  id="acc_last_name"
                  placeholder="Введите фамилию"
                  value={formData.acc_last_name}
                  onChange={handleChange}
                  className={style.input}
                />
              </div>
              <div className={style.form_group}>
                <label htmlFor="acc_email">Почта</label>
                <input
                  id="acc_email"
                  type="email"
                  placeholder="Введите почту через @"
                  value={formData.acc_email}
                  onChange={handleChange}
                  className={style.input}
                />
              </div>
              <div className={style.form_group}>
                <label htmlFor="acc_surname">Отчество</label>
                <input
                  id="acc_surname"
                  placeholder="Введите отчество"
                  value={formData.acc_surname}
                  onChange={handleChange}
                  className={style.input}
                />
              </div>
            </div>
            <div className={style.required}>
              *Поля обязательные для заполнения
            </div>

            <div className={style.consent}>
              <input
                type="checkbox"
                id="consent"
                checked={formData.consent}
                onChange={handleChange}
              />
              <label htmlFor="consent">
                Даю согласие на{" "}
                <span
                  className={style.greenText}
                  onClick={handleOpenPolicy}
                  style={{ cursor: "pointer" }}
                >
                  обработку персональных данных
                </span>{" "}
                и принимаю условия{" "}
                <span
                  href="#"
                  className={style.greenText}
                  onClick={handleOpenPolicy}
                >
                  "Политики конфиденциальности"
                </span>
              </label>
            </div>

            <button type="submit" className={style.button}>
              Зарегистрировать Компанию
            </button>
          </>
        );
      default:
        return null;
    }
  };

  return (
    <div className={style.container}>
      <div className={style.closeIcon} onClick={() => switchToLogin()}>
        &times;
      </div>

      <form className={style.form} onSubmit={handleSubmit}>
        {error && <div className={style.error}>{error}</div>}
        {success && <div className={style.success}>{success}</div>}

        {renderStep()}
      </form>
    </div>
  );
};

export default RegFormPartner;

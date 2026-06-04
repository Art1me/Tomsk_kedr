import React, { useState } from "react";
import config from "../../config.js";
import styles from "../../css/resetpasswordform.module.css";

const ResetPasswordForm = ({ onClose }) => {
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (!email) {
      setError("Укажите почту");
      return;
    }

    if (!email.includes("@")) {
      setError("Введите корректный email");
      return;
    }

    try {
      setIsLoading(true);
      const response = await fetch(`${config}/api/users/reset_password/`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email }),
      });

      if (!response.ok) {
        throw new Error("?? ??????? ????????? ??????");
      }

      setSuccess(
        "?????????? ?? ?????????????? ?????? ?????????? ?? ???? ?????",
      );
    } catch (error) {
      setError("Произошла ошибка: " + error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      {success ? (
        <div className={styles.successMessageContainer}>
          <p className={styles.successText}>Письмо отправлено Вам на почту!</p>
          <img
            src="/send_letter.svg"
            alt="Письмо отправлено"
            className={styles.emailIcon}
          />
        </div>
      ) : (
        <div className={styles.resetPassword}>
          <header className={styles.resetPassword_header}>
            <p>
              Укажите почту, на которую придёт письмо с ссылкой на
              восстановление пароля
            </p>
          </header>
          <form className={styles.resetPassword_form} onSubmit={handleSubmit}>
            <input
              id="email"
              type="email"
              className={styles.resetPassword_input}
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                setError("");
                // Не сбрасываем success здесь, чтобы сообщение об успехе оставалось
              }}
              placeholder="Укажите Вашу почту"
            />
            <div className={styles.resetPassword_button_container}>
              {isLoading ? (
                <button
                  type="submit"
                  className={styles.resetPassword_button}
                  disabled
                >
                  Отправить
                </button>
              ) : (
                <button type="submit" className={styles.resetPassword_button}>
                  Отправить
                </button>
              )}
            </div>
          </form>
          {error && <div className={styles.resetPassword_error}>{error}</div>}
        </div>
      )}
    </>
  );
};

export default ResetPasswordForm;

import React, { useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import style from "../css/regkedr.module.css";
import MapCedars from "../components/MapCedrs";
import ModalRegKedr from "../components/PopUp/ModalRegKedr";
import config from "../config";
import { useState } from "react";

const RegisterKedrPage = () => {
  const navigate = useNavigate();
  const textareaRef = useRef(null);

  const [currentStep, setCurrentStep] = useState(1);
  const [state, setState] = useState({
    selectedCoords: null,
    showModal: false,
    showSuccessModal: false,
    description: "",
    promo: "",
    file: null,
    title: "",
    userInfo: null,
    Error: "",
    filePreview: null,
    fileName: "",
    dedication: "",
    img_dedication: [],
    img_previews: [],
    mainPhoto: null,
    mainPhotoName: "",
    dedicationPhotos: [],
    date: "",
  });

  const [email, setEmail] = useState("");

  useEffect(() => {
    fetchUserInfo();
    return () => {
      document.body.style.overflow = "";
    };
  }, []);

  // Очистка URL при размонтировании компонента
  useEffect(() => {
    return () => {
      state.img_previews?.forEach((preview) => {
        URL.revokeObjectURL(preview.url);
      });
    };
  }, [state.img_previews]);

  const fetchUserInfo = async () => {
    try {
      const response = await fetch(`${config}/api/users/me/`, {
        headers: {
          Authorization: `Token ${localStorage.getItem("token")}`,
        },
      });
      if (response.ok) {
        const data = await response.json();
        setState((prev) => ({ ...prev, userInfo: data }));

        if (data.email) {
          setEmail(data.email);
        }
      } else {
        localStorage.removeItem("token");
        setState((prev) => ({ ...prev, userInfo: null }));
      }
    } catch (error) {
      console.error("Ошибка при получении данных пользователя:", error);
      localStorage.removeItem("token");
      setState((prev) => ({ ...prev, userInfo: null }));
    }
  };

  const getUserName = () => {
    if (!state.userInfo) return "";

    const {
      simple_profile,
      partner_profile,
      email: userEmail,
    } = state.userInfo;

    if (partner_profile) {
      return partner_profile.name || userEmail || "";
    }

    if (simple_profile) {
      const { first_name, last_name, surname } = simple_profile;
      const nameParts = [];
      if (last_name) nameParts.push(last_name);
      if (first_name) nameParts.push(first_name);
      if (surname) nameParts.push(surname);
      return nameParts.join(" ").trim() || userEmail || "";
    }

    return userEmail || "";
  };

  // Функции навигации
  const goToNextStep = () => {
    if (currentStep === 1 && !state.selectedCoords) {
      setState((prev) => ({
        ...prev,
        Error: "Пожалуйста, выберите место на карте",
      }));
      return;
    }

    if (currentStep === 1 && state.selectedCoords) {
      setCurrentStep(2);
      setState((prev) => ({ ...prev, Error: "" }));
      window.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }

    if (currentStep === 2) {
      setCurrentStep(3);
      setState((prev) => ({ ...prev, Error: "" }));
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  const goToPrevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
      setState((prev) => ({ ...prev, Error: "" }));
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  const handleMapClick = (coords) => {
    setState((prev) => ({ ...prev, selectedCoords: coords, showModal: true }));
  };

  const handleModalSave = () => {
    setState((prev) => ({ ...prev, showModal: false }));
  };

  const handleModalCancel = () => {
    setState((prev) => ({ ...prev, showModal: false, selectedCoords: null }));
  };

  const handleOverlayClick = () => {
    setState((prev) => ({ ...prev, showModal: false }));
  };

  const handleInputChange = (e) => {
    const { id, value, files } = e.target;
    if (id === "description" && textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height =
        textareaRef.current.scrollHeight + "px";
    }
    if (id === "mainPhoto") {
      const file = files[0];
      if (file) {
        setState((prev) => ({
          ...prev,
          mainPhoto: file,
          mainPhotoName: file.name,
        }));
      }
    } else if (id === "img_dedication") {
      const selectedFiles = Array.from(files);
      if (selectedFiles.length > 0) {
        const maxFiles = 10;
        const currentFiles = state.dedicationPhotos || [];
        const currentPreviews = state.img_previews || [];

        if (currentFiles.length + selectedFiles.length > maxFiles) {
          alert(`Можно загрузить не более ${maxFiles} фотографий`);
          return;
        }

        const newPreviews = selectedFiles.map((file) => ({
          url: URL.createObjectURL(file),
          name: file.name,
        }));

        setState((prev) => ({
          ...prev,
          dedicationPhotos: [...currentFiles, ...selectedFiles],
          img_previews: [...currentPreviews, ...newPreviews],
        }));
      }
    } else {
      setState((prev) => ({ ...prev, [id]: value }));
    }
  };

  const handleRemovePhoto = (indexToRemove) => {
    setState((prev) => {
      URL.revokeObjectURL(prev.img_previews[indexToRemove].url);

      return {
        ...prev,
        dedicationPhotos: prev.dedicationPhotos.filter(
          (_, index) => index !== indexToRemove,
        ),
        img_previews: prev.img_previews.filter(
          (_, index) => index !== indexToRemove,
        ),
      };
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const { selectedCoords, description, mainPhoto, dedicationPhotos, promo } =
      state;

    if (!email) {
      setState((prev) => ({
        ...prev,
        Error: "Пожалуйста, укажите email для чека",
      }));
      return;
    }

    if (!selectedCoords) {
      setState((prev) => ({
        ...prev,
        Error: "Пожалуйста, выберите место на карте",
      }));
      return;
    }

    if (!description) {
      setState((prev) => ({ ...prev, Error: "Пожалуйста, добавьте описание" }));
      return;
    }

    const normalizedPromo = promo.trim().toUpperCase();

    const formData = new FormData();

    formData.append("title", state.title || "Дерево");
    formData.append("content", description);
    formData.append("latitude", selectedCoords[0]);
    formData.append("longitude", selectedCoords[1]);
    formData.append("plant_date", state.date || "");
    formData.append("dedicated_to", state.dedication || "");
    formData.append("promo", normalizedPromo || "");

    if (mainPhoto) {
      formData.append("picture", mainPhoto);
    }

    if (state.userInfo && state.userInfo.id) {
      formData.append("owner", state.userInfo.id);
    }

    const userName = getUserName();
    if (userName) {
      formData.append("owner_name", userName);
    }

    formData.append("receipt_email", email);

    if (dedicationPhotos && dedicationPhotos.length > 0) {
      dedicationPhotos.forEach((photo) => {
        formData.append("images", photo);
      });
    }

    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`${config}/api/payments/trees/create/`, {
        method: "POST",
        body: formData,
        headers: token ? { Authorization: `Token ${token}` } : {},
      });

      if (response.ok) {
        const data = await response.json();
        if (data.paid_by_promocode) {
          setState((prev) => ({
            ...prev,
            Error: "",
            showSuccessModal: true,
          }));
        } else if (data.confirmation_url) {
          window.location.href = data.confirmation_url;
        } else {
          setState((prev) => ({
            ...prev,
            Error: "Не удалось получить ссылку для оплаты",
          }));
        }
      } else {
        const data = await response.json();
        const promoErrorMessages = {
          404: "Такого промокода не существует",
          406: "Этот промокод уже использован",
        };
        console.error("Ошибка при отправке:", data);
        setState((prev) => ({
          ...prev,
          Error:
            promoErrorMessages[response.status] ||
            "Ошибка при отправке: " + JSON.stringify(data),
        }));
      }
    } catch (error) {
      console.error("Ошибка сети:", error);
      setState((prev) => ({ ...prev, Error: "Ошибка сети: " + error }));
    }
  };

  const handleSuccessModalClose = () => {
    setState((prev) => ({ ...prev, showSuccessModal: false }));
    navigate("/");
  };

  // Рендер шага 1
  const renderStep1 = () => (
    <>
      <section className={style.step_section}>
        <div className={style.step_title_block}>
          <div className={style.step_title}>
            <span>Шаг 1:</span> Выбери место на карте
          </div>
        </div>
        <div className={style.map_block}>
          <MapCedars
            onMapClick={handleMapClick}
            selectedCoords={state.selectedCoords}
          />
        </div>
      </section>

      {/* Навигация для шага 1 */}
      <div className={style.step_navigation}>
        <div className={style.steps_dots}>
          <div className={`${style.dot} ${style.active_dot}`} />
          <div className={style.dot} />
          <div className={style.dot} />
        </div>
        <div className={style.buttons_container}>
          <button className={`${style.nav_arrow} ${style.disabled}`} disabled>
            <img src="/next-icon.png" alt="Назад" />
          </button>
          <button className={style.next_btn} onClick={goToNextStep}>
            Далее
          </button>
        </div>
      </div>
    </>
  );

  // Рендер шага 2
  const renderStep2 = () => (
    <>
      <section className={style.step_section}>
        <div className={style.step_title_block}>
          <div className={style.step_title}>
            <span>Шаг 2:</span> Добавьте дату посадки и фото
          </div>
        </div>
        <div className={style.form_grid}>
          <div className={style.form_left}>
            <label htmlFor="date">Введите дату посадки</label>
            <input
              type="date"
              id="date"
              value={state.date || ""}
              onChange={handleInputChange}
              className={style.input}
              style={{
                color: state.date ? "#000" : "#b1b1b1",
                WebkitTextFillColor: state.date ? "#000" : "#b1b1b1",
              }}
            />
            <label htmlFor="mainPhoto">Добавьте главную фотографию:</label>
            <label className={style.file_label} htmlFor="mainPhoto">
              <div className={style.file_box}>
                {state.mainPhotoName ? (
                  <div className={style.file_name}>
                    <span className={style.file_icon}>📷</span>
                    <span className={style.file_text}>
                      {state.mainPhotoName}
                    </span>
                  </div>
                ) : (
                  <span className={style.file_plus}>+</span>
                )}
              </div>
              <input
                type="file"
                id="mainPhoto"
                onChange={handleInputChange}
                className={style.file_input}
                accept="image/*,.svg"
              />
            </label>
            <div className={style.file_hint}>
              {state.mainPhoto
                ? "Фото загружено"
                : "Добавьте файлы формата *.png, *.jpeg, *.jpg, *.svg, *.gif, *.webp"}
            </div>
          </div>
        </div>
      </section>

      {/* Навигация для шага 2 */}
      <div className={style.step_navigation}>
        <div className={style.steps_dots}>
          <div
            className={style.dot}
            onClick={() => {
              setCurrentStep(1);
              window.scrollTo({ top: 0, behavior: "smooth" });
            }}
          />
          <div className={`${style.dot} ${style.active_dot}`} />
          <div className={style.dot} />
        </div>
        <div className={style.buttons_container}>
          <button className={style.nav_arrow} onClick={goToPrevStep}>
            <img src="/next-icon.png" alt="Назад" />
          </button>
          <button className={style.next_btn} onClick={goToNextStep}>
            Далее
          </button>
        </div>
      </div>
    </>
  );

  // Рендер шага 3
  const renderStep3 = () => (
    <>
      <form className={style.reg_kedr_form} onSubmit={handleSubmit}>
        <section className={style.step_section}>
          <div className={style.step_title_block}>
            <div className={style.step_title}>
              <span>Шаг 3:</span> Оплатите и отправьте заявку
            </div>
          </div>
          <div className={style.form_grid}>
            <div className={style.form_left}>
              <div className={style.input_group}>
                <label htmlFor="title">Введите название кедра</label>
                <input
                  id="title"
                  value={state.title || ""}
                  onChange={handleInputChange}
                  className={style.input}
                />
              </div>
              <div className={style.input_group}>
                <label htmlFor="dedication">
                  Введите ФИО человека, которому Вы бы хотели посвятить дерево
                </label>
                <input
                  id="dedication"
                  value={state.dedication || ""}
                  onChange={handleInputChange}
                  className={style.input}
                />
              </div>
              <div className={style.input_group}>
                <label htmlFor="promo">Введите промокод</label>
                <input
                  id="promo"
                  value={state.promo || ""}
                  onChange={handleInputChange}
                  className={style.input}
                />
              </div>
            </div>
            <div className={style.form_right}>
              <label htmlFor="description">Описание</label>
              <textarea
                id="description"
                ref={textareaRef}
                value={state.description || ""}
                onChange={handleInputChange}
                required
                className={style.textarea}
                placeholder="Здесь можно добавить биографию или факты из жизни"
              />
              <label htmlFor="img_dedication">
                Добавьте фотографии человека
              </label>
              <label className={style.file_label} htmlFor="img_dedication">
                <div className={style.file_box}>
                  {state.img_previews && state.img_previews.length > 0 ? (
                    <div className={style.photo_list}>
                      {state.img_previews.map((preview, index) => (
                        <div key={index} className={style.photo_item}>
                          <div className={style.photo_preview}>
                            <img
                              src={preview.url}
                              alt={preview.name}
                              className={style.photo_thumbnail}
                            />
                            <span className={style.photo_name}>
                              {preview.name}
                            </span>
                          </div>
                          <button
                            type="button"
                            className={style.remove_photo_btn}
                            onClick={(e) => {
                              e.preventDefault();
                              handleRemovePhoto(index);
                            }}
                          >
                            ✕
                          </button>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className={style.upload_prompt}>
                      <span className={style.file_plus}>+</span>
                    </div>
                  )}
                </div>
              </label>
              <div className={style.file_hint}>
                Добавьте файлы формата *.png, *.jpeg, *.jpg, *.svg, *.gif,
                *.webp
              </div>
              <input
                type="file"
                id="img_dedication"
                onChange={handleInputChange}
                className={style.file_input}
                accept="image/*,.svg"
                multiple
              />
            </div>
          </div>

          {/* Секция оплаты */}
          <div className={style.payment_section}>
            <div className={style.form_grid}>
              <div className={style.form_left}>
                <div className={style.input_group}>
                  <label htmlFor="email">Email для получения чека</label>
                  <input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="your@email.com"
                    className={style.input}
                    required
                  />
                </div>
              </div>
            </div>
          </div>

          {state.Error && <div className={style.error}>{state.Error}</div>}
        </section>
      </form>

      {/* Навигация для шага 3 */}
      <div className={style.step_navigation}>
        <div className={style.steps_dots}>
          <div
            className={style.dot}
            onClick={() => {
              setCurrentStep(1);
              window.scrollTo({ top: 0, behavior: "smooth" });
            }}
          />
          <div
            className={style.dot}
            onClick={() => {
              setCurrentStep(2);
              window.scrollTo({ top: 0, behavior: "smooth" });
            }}
          />
          <div className={`${style.dot} ${style.active_dot}`} />
        </div>
        <div className={style.buttons_container}>
          <button className={style.nav_arrow} onClick={goToPrevStep}>
            <img src="/next-icon.png" alt="Назад" />
          </button>
          <button className={style.next_btn} onClick={handleSubmit}>
            Оплатить
          </button>
        </div>
      </div>
    </>
  );

  return (
    <div className={style.page_wrapper}>
      <div className={style.fixed_header}>
        <button className={style.back_btn} onClick={() => navigate("/")}>
          <span className={style.backArrow}>←</span>
          <span className={style.backText}>Вернуться на главную</span>
        </button>
        <div className={style.user_name}>{getUserName()}</div>
      </div>

      <section className={style.hero_section}>
        <div className={style.hero_overlay}></div>
        <div className={style.hero_text_overlay}>
          <div className={style.memory_label}>
            <span>Дерево</span> – символ вечной памяти
          </div>
          <div className={style.hero_title_block}>
            <div className={style.hero_title}>
              Зарегистрируйте <span className={style.cedr_word}>кедр</span>
              <br />в 3 шага
            </div>
          </div>
        </div>
        <div className={style.hero_trees}></div>
      </section>

      {currentStep === 1 && renderStep1()}
      {currentStep === 2 && renderStep2()}
      {currentStep === 3 && renderStep3()}

      <ModalRegKedr
        isOpen={state.showModal}
        onClose={handleOverlayClick}
        contentClass={style.modalContent}
      >
        <p>Вы уверены, что хотите посадить кедр на этом месте?</p>
        <div className={style.modalButtons}>
          <button onClick={handleModalSave}>Да</button>
          <button onClick={handleModalCancel}>Отмена</button>
        </div>
      </ModalRegKedr>

      <ModalRegKedr
        isOpen={state.showSuccessModal}
        onClose={handleSuccessModalClose}
        contentClass={style.successModalContent}
      >
        <h2>Ваша заявка успешно отправлена!</h2>
        <p>Мы обязательно свяжемся с Вами</p>
        <button onClick={handleSuccessModalClose}>Ок</button>
      </ModalRegKedr>
    </div>
  );
};

export default RegisterKedrPage;

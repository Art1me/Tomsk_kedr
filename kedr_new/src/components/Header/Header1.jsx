import React from "react";
import style from "./Header1.module.css";
import { FiMenu, FiLogIn, FiLogOut } from "react-icons/fi";
import ModalRegKedr from "../PopUp/ModalRegKedr";
import config from "../../config";
import MyCedarIcon from "./MyCedar_mob_button.svg";

class Header1 extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      userInfo: null,
      showLogoutPopup: false,
      showExitPopup: false,
      isBurgerActive: false,
      showBurgerModal: false,
    };
    this.userContainerRef = React.createRef();
    this.contactsButtonRef = React.createRef();
    this.contactsPopupRef = React.createRef();
    this.burgerModalRef = React.createRef();
  }

  componentDidMount() {
    // Проверяем, авторизован ли пользователь
    const token = localStorage.getItem("token");
    if (token) {
      // Загружаем данные пользователя
      this.fetchUserInfo();
    }
    document.addEventListener("mousedown", this.handleClickOutside);
  }

  componentWillUnmount() {
    document.removeEventListener("mousedown", this.handleClickOutside);
  }

  fetchUserInfo = async () => {
    try {
      const response = await fetch(`${config}/api/users/me/`, {
        headers: {
          Authorization: `Token ${localStorage.getItem("token")}`,
        },
      });
      if (response.ok) {
        const data = await response.json();
        this.setState({ userInfo: data });
      } else {
        // Если токен недействителен, удаляем его
        localStorage.removeItem("token");
        this.setState({ userInfo: null });
      }
    } catch (error) {
      console.error("Ошибка загрузки данных пользователя:", error);
      localStorage.removeItem("token");
      this.setState({ userInfo: null });
    }
  };

  handleLogout = () => {
    localStorage.removeItem("token");
    this.setState({
      userInfo: null,
      showLogoutPopup: false,
      showExitPopup: false,
    });
    window.location.reload();
  };

  toggleLogoutPopup = () => {
    this.setState((prevState) => ({
      showLogoutPopup: !prevState.showLogoutPopup,
    }));
  };

  handleClickOutside = (event) => {
    if (
      this.userContainerRef.current &&
      !this.userContainerRef.current.contains(event.target)
    ) {
      this.setState({ showLogoutPopup: false });
    }
  };

  handleExitClick = () => {
    this.setState((prevState) => ({ showExitPopup: !prevState.showExitPopup }));
  };

  toggleMenu = () => {
    this.setState((prevState) => ({
      isBurgerActive: !prevState.isBurgerActive,
      showBurgerModal: !prevState.showBurgerModal,
    }));
  };

  render() {
    const { userInfo, showLogoutPopup, isBurgerActive, showBurgerModal } =
      this.state;

    return (
      <div className={style.header}>
        <div>
          <button
            type="button"
            className={style.button}
            onClick={() => (window.location.href = "/news")}
          >
            Новости
          </button>

          <button
            type="button"
            className={
              style.button + (!userInfo ? " " + style.hiddenButton : "")
            }
            onClick={
              userInfo ? () => (window.location.href = "/my-cedars") : undefined
            }
            style={!userInfo ? { pointerEvents: "none" } : {}}
          >
            Мои кедры
          </button>

          <button
            type="button"
            className={`${style.button_immortal} ${style.invisible}`}
            onClick={this.props.openPopUpImmortal}
          >
            Войти через портал "Бессмертный полк"
          </button>
          {userInfo ? (
            <div className={style.userContainer} ref={this.userContainerRef}>
              <button
                className={style.button}
                onClick={() => (window.location.href = "/lk")}
              >
                Личный Кабинет
              </button>
              {showLogoutPopup && (
                <div className={style.logoutPopup}>
                  <button
                    className={style.logoutButton}
                    onClick={this.handleLogout}
                  >
                    Выйти
                  </button>
                </div>
              )}
            </div>
          ) : (
            <button
              type="button"
              className={style.button}
              onClick={this.props.openPopUpLog}
            >
              Вход/Регистрация
            </button>
          )}
          <FiMenu
            className={`${style.burger_button} ${isBurgerActive ? style.burger_active : ""}`}
            onClick={this.toggleMenu}
          />
          {showBurgerModal && (
            <div className={style.burger_modal} ref={this.burgerModalRef}>
              {userInfo && (
                <button
                  className={style.burger_cedar_button}
                  onClick={() => {
                    window.location.href = "/my-cedars";
                    this.toggleMenu();
                  }}
                  title="Мои кедры"
                >
                  <img
                    src={MyCedarIcon}
                    alt="Мои кедры"
                    className={style.burger_cedar_icon}
                  />
                </button>
              )}
              {userInfo ? (
                <button
                  className={style.burger_modal_button}
                  onClick={this.handleLogout}
                  title="Выйти"
                >
                  <FiLogOut className={style.burger_modal_icon} />
                </button>
              ) : (
                <button
                  className={style.burger_modal_button}
                  onClick={this.props.openPopUpLog}
                  title="Вход/Регистрация"
                >
                  <FiLogIn className={style.burger_modal_icon} />
                </button>
              )}
            </div>
          )}
        </div>
        <ModalRegKedr
          isOpen={this.state.showExitPopup}
          onClose={this.handleExitClick}
          contentClass={style.modalContent}
        >
          <p>Вы уверены, что хотите выйти?</p>
          <div className={style.modalButtons}>
            <button onClick={this.handleLogout}>Да</button>
            <button onClick={this.handleExitClick}>Отмена</button>
          </div>
        </ModalRegKedr>
      </div>
    );
  }
}

export default Header1;

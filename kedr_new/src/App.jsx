import Header1 from "./components/Header/Header1";
import Header2 from "./components/Header/Header2";
import Footer from "./components/footer/footer";
import style from "./css/main.module.css";
import { useState, useEffect } from "react";
import PopUp from "./components/PopUp/PopUp";
import BasicInfo from "./components/BasicInfo";
import LogForm from "./components/Forms/LogForm";
import RegForm from "./components/Forms/RegForm";
import RegFormPartner from "./components/Forms/RegFormPartner";
import unDeathForm from "./components/Forms/unDeathForm";
import HelpInfo from "./components/HelpIfo";
import MapCedars from "./components/MapCedrs";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  useLocation,
  useNavigate,
} from "react-router-dom";
import RegisterKedrPage from "./pages/RegisterKedrPage";
import MyCedarsPage from "./pages/MyCedarsPage";
import ResetPasswordForm from "./components/Forms/ResetPasswordForm";
import ConfirmRegistration from "./pages/ConfrimRegistration";
import AccessChoice from "./components/PopUp/AccessChoice";
import NewsMainPage from "./pages/NewsMainPage";
import CurrentNews from "./pages/CurrentNews";
import MainFooter from "./components/footer/mainfooter";
import CreateNewsPage from "./pages/CreateNewsPage";
import CabinetLayout from "./pages/CabinetLayout";
import CedarGuide from "./pages/CedarGuide";
import EditNewsPage from "./pages/EditNewsPage";
import AdminPanel from "./pages/AdminPanel";
import AdminListCompanies from "./pages/AdminListCompanies";
import UsersRegistry from "./pages/UsersRegistry";

function HomePage() {
  const [AccessActive, setAccessActive] = useState(false);
  const [ShowPopUpAuth, setShowPopUpAuth] = useState(false);
  const [ShowPopUpImmortal, setShowPopUpImmortal] = useState(false);
  const [ShowPopUpHelp, setShowPopUpHelp] = useState(false);
  const [authForm, setAuthForm] = useState("login");
  const [ShowSendRequest, setShowSendRequest] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    if (location.state?.showLoginPopup) {
      setShowPopUpAuth(true);
      setAuthForm("login");
      const { state, ...rest } = location;
      const newState = {
        ...rest,
        state: { ...state, showLoginPopup: undefined },
      };
      navigate(location.pathname, { state: newState.state, replace: true });
    }
  }, [location, navigate]);

  useEffect(() => {
    if (AccessActive) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }

    // Если вдруг пользовтель выкинул фокус какой-нибудь
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [AccessActive]);

  const getFormComponent = () => {
    switch (authForm) {
      case "login":
        return (
          <LogForm
            switchToRegister={() => setAuthForm("register")}
            onResetPassword={() => setAuthForm("resetPassword")}
          />
        );
      case "register":
        return <RegForm switchToLogin={() => setAuthForm("login")} />;
      case "resetPassword":
        return <ResetPasswordForm onClose={() => setAuthForm("login")} />;
      case "registerPartner":
        return <RegFormPartner switchToLogin={() => setAuthForm("login")} />;
      default:
        return null;
    }
  };

  const handleAccessChoice = (choice) => {
    setAccessActive(false);
    if (choice === "login") {
      setShowPopUpAuth(true);
      setAuthForm("login");
    } else if (choice === "register") {
      setShowPopUpAuth(true);
      setAuthForm("register");
    } else if (choice === "registerPartner") {
      setShowPopUpAuth(true);
      setAuthForm("registerPartner");
    }
  };

  const getContentClass = () => {
    switch (authForm) {
      case "login":
      case "register":
        return "LogPopUp";
      case "resetPassword":
        return "resetPassword";
      case "registerPartner":
        return "LogPopUp";
      default:
        return "LogPopUp";
    }
  };

  const handleCloseAuthPopUp = () => {
    setShowPopUpAuth(false);
    setAuthForm("login");
  };

  return (
    <div>
      <div className={style.main}>
        <Header1
          openPopUpImmortal={() => setShowPopUpImmortal(true)}
          openPopUpLog={() => setAccessActive(true)}
        />
        {ShowPopUpAuth && (
          <PopUp
            obj={getFormComponent}
            closePopUp={handleCloseAuthPopUp}
            contentClass={getContentClass()}
            size={
              authForm === "login"
                ? "small"
                : authForm === "registerPartner"
                  ? "normal"
                  : ""
            }
          />
        )}
        {ShowPopUpImmortal && (
          <PopUp
            obj={unDeathForm}
            closePopUp={() => setShowPopUpImmortal(false)}
            contentClass="UnDeathPopUp"
          />
        )}
        <BasicInfo />
        <button
          type="submit"
          className={style.helpcircle}
          onClick={() => setShowPopUpHelp(true)}
        >
          ?
        </button>
        {ShowPopUpHelp && (
          <PopUp
            obj={HelpInfo}
            closePopUp={() => setShowPopUpHelp(false)}
            contentClass="helpPopUp"
            object="HelpText"
          />
        )}
      </div>

      <div className={style.main}>
        <Header2 />
        <div className={style.cedar_guide_banner}>
          <h2 className={style.cedar_guide_title}>Как ухаживать за кедром?</h2>
          <a href="/cedarguide" className={style.cedar_guide_btn}>
            Читайте в нашей статье <span className={style.arrow}>→</span>
          </a>
        </div>
        <div className={style.cont_map}>
          <p className={style.title_map}>Карта зарегистрированных деревьев</p>
          <div className={style.block_map}>
            <MapCedars />
          </div>
        </div>
      </div>
      <div className={style.main}>
        <Footer />
      </div>
      {ShowSendRequest && (
        <PopUp closeSendRequest={() => setShowSendRequest(false)} />
      )}

      {AccessActive && (
        <AccessChoice
          AccessActive={AccessActive}
          setAccessActive={setAccessActive}
          onChoice={handleAccessChoice}
        />
      )}
    </div>
  );
}

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/register-kedr" element={<RegisterKedrPage />} />
        <Route path="/my-cedars" element={<MyCedarsPage />} />
        <Route
          path="/api/users/activate/:uid/:token"
          element={<ConfirmRegistration />}
        />
        <Route path="/lk" element={<CabinetLayout />} />
        <Route path="/news" element={<NewsMainPage />} />
        <Route path="/news/:slug" element={<CurrentNews />} />
        <Route path="/create-news" element={<CreateNewsPage />} />
        <Route path="/cedarguide" element={<CedarGuide />} />
        <Route path="/edit-news/:slug" element={<EditNewsPage />} />
        <Route path="/adminpanel" element={<AdminPanel />} />
        <Route path="/companylist" element={<AdminListCompanies />} />
        <Route path="/users" element={<UsersRegistry />} />
      </Routes>
      <MainFooter />
    </Router>
  );
}

export default App;

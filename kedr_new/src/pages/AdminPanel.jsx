import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "../css/adminpanel.css";
import config from "../config.js";

const HomeIcon = () => (
  <svg
    width="27"
    height="30"
    viewBox="0 0 27 30"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      d="M9.5 28.1667V14.8333H17.5V28.1667M1.5 10.8333L13.5 1.5L25.5 10.8333V25.5C25.5 26.2072 25.219 26.8855 24.719 27.3856C24.2189 27.8857 23.5406 28.1667 22.8333 28.1667H4.16667C3.45942 28.1667 2.78115 27.8857 2.28105 27.3856C1.78095 26.8855 1.5 26.2072 1.5 25.5V10.8333Z"
      stroke="#1E1E1E"
      strokeWidth="3"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

const BuildingIcon = () => (
  <svg
    width="30"
    height="30"
    viewBox="0 0 30 30"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      d="M0 30V6.80542H6.80542V0H23.1946V13.6112H30V30H17.0279V23.1946H12.9721V30H0ZM2.77792 27.2221H6.80542V23.1946H2.77792V27.2221ZM2.77792 20.4167H6.80542V16.3888H2.77792V20.4167ZM2.77792 13.6112H6.80542V9.58333H2.77792V13.6112ZM9.58333 20.4167H13.6113V16.3888H9.58333V20.4167ZM9.58333 13.6112H13.6113V9.58333H9.58333V13.6112ZM9.58333 6.80542H13.6113V2.77792H9.58333V6.80542ZM16.3888 20.4167H20.4167V16.3888H16.3888V20.4167ZM16.3888 13.6112H20.4167V9.58333H16.3888V13.6112ZM16.3888 6.80542H20.4167V2.77792H16.3888V6.80542ZM23.1946 27.2221H27.2221V23.1946H23.1946V27.2221ZM23.1946 20.4167H27.2221V16.3888H23.1946V20.4167Z"
      fill="black"
    />
  </svg>
);

const UsersIcon = () => (
  <svg
    width="32"
    height="16"
    viewBox="0 0 32 16"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      d="M0 16V13.9C0 12.9444 0.488889 12.1667 1.46667 11.5667C2.44444 10.9667 3.73333 10.6667 5.33333 10.6667C5.62222 10.6667 5.9 10.6722 6.16667 10.6833C6.43333 10.6944 6.68889 10.7222 6.93333 10.7667C6.62222 11.2333 6.38889 11.7222 6.23333 12.2333C6.07778 12.7444 6 13.2778 6 13.8333V16H0ZM8 16V13.8333C8 13.1222 8.19444 12.4722 8.58333 11.8833C8.97222 11.2944 9.52222 10.7778 10.2333 10.3333C10.9444 9.88889 11.7944 9.55556 12.7833 9.33333C13.7722 9.11111 14.8444 9 16 9C17.1778 9 18.2611 9.11111 19.25 9.33333C20.2389 9.55556 21.0889 9.88889 21.8 10.3333C22.5111 10.7778 23.0556 11.2944 23.4333 11.8833C23.8111 12.4722 24 13.1222 24 13.8333V16H8ZM26 16V13.8333C26 13.2556 25.9278 12.7111 25.7833 12.2C25.6389 11.6889 25.4222 11.2111 25.1333 10.7667C25.3778 10.7222 25.6278 10.6944 25.8833 10.6833C26.1389 10.6722 26.4 10.6667 26.6667 10.6667C28.2667 10.6667 29.5556 10.9611 30.5333 11.55C31.5111 12.1389 32 12.9222 32 13.9V16H26ZM10.8333 13.3333H21.2C20.9778 12.8889 20.3611 12.5 19.35 12.1667C18.3389 11.8333 17.2222 11.6667 16 11.6667C14.7778 11.6667 13.6611 11.8333 12.65 12.1667C11.6389 12.5 11.0333 12.8889 10.8333 13.3333ZM5.33333 9.33333C4.6 9.33333 3.97222 9.07222 3.45 8.55C2.92778 8.02778 2.66667 7.4 2.66667 6.66667C2.66667 5.91111 2.92778 5.27778 3.45 4.76667C3.97222 4.25556 4.6 4 5.33333 4C6.08889 4 6.72222 4.25556 7.23333 4.76667C7.74444 5.27778 8 5.91111 8 6.66667C8 7.4 7.74444 8.02778 7.23333 8.55C6.72222 9.07222 6.08889 9.33333 5.33333 9.33333ZM26.6667 9.33333C25.9333 9.33333 25.3056 9.07222 24.7833 8.55C24.2611 8.02778 24 7.4 24 6.66667C24 5.91111 24.2611 5.27778 24.7833 4.76667C25.3056 4.25556 25.9333 4 26.6667 4C27.4222 4 28.0556 4.25556 28.5667 4.76667C29.0778 5.27778 29.3333 5.91111 29.3333 6.66667C29.3333 7.4 29.0778 8.02778 28.5667 8.55C28.0556 9.07222 27.4222 9.33333 26.6667 9.33333ZM16 8C14.8889 8 13.9444 7.61111 13.1667 6.83333C12.3889 6.05556 12 5.11111 12 4C12 2.86667 12.3889 1.91667 13.1667 1.15C13.9444 0.383333 14.8889 0 16 0C17.1333 0 18.0833 0.383333 18.85 1.15C19.6167 1.91667 20 2.86667 20 4C20 5.11111 19.6167 6.05556 18.85 6.83333C18.0833 7.61111 17.1333 8 16 8ZM16 5.33333C16.3778 5.33333 16.6944 5.20556 16.95 4.95C17.2056 4.69444 17.3333 4.37778 17.3333 4C17.3333 3.62222 17.2056 3.30556 16.95 3.05C16.6944 2.79444 16.3778 2.66667 16 2.66667C15.6222 2.66667 15.3056 2.79444 15.05 3.05C14.7944 3.30556 14.6667 3.62222 14.6667 4C14.6667 4.37778 14.7944 4.69444 15.05 4.95C15.3056 5.20556 15.6222 5.33333 16 5.33333Z"
      fill="black"
    />
  </svg>
);

const MailIcon = () => (
  <svg
    width="27"
    height="22"
    viewBox="0 0 27 22"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      d="M2.66667 21.3333C1.93333 21.3333 1.30556 21.0722 0.783333 20.55C0.261111 20.0278 0 19.4 0 18.6667V2.66667C0 1.93333 0.261111 1.30556 0.783333 0.783333C1.30556 0.261111 1.93333 0 2.66667 0H24C24.7333 0 25.3611 0.261111 25.8833 0.783333C26.4056 1.30556 26.6667 1.93333 26.6667 2.66667V18.6667C26.6667 19.4 26.4056 20.0278 25.8833 20.55C25.3611 21.0722 24.7333 21.3333 24 21.3333H2.66667ZM13.3333 12L2.66667 5.33333V18.6667H24V5.33333L13.3333 12ZM13.3333 9.33333L24 2.66667H2.66667L13.3333 9.33333ZM2.66667 5.33333V2.66667V18.6667V5.33333Z"
      fill="#1D1B20"
    />
  </svg>
);

const GiftIcon = () => (
  <svg
    width="30"
    height="30"
    viewBox="0 0 30 30"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      d="M25.25 14.5833V27.9167H3.91667V14.5833M14.5833 27.9167V7.91667M14.5833 7.91667H8.58333C7.69928 7.91667 6.85143 7.56548 6.22631 6.94036C5.60119 6.31523 5.25 5.46739 5.25 4.58333C5.25 3.69928 5.60119 2.85143 6.22631 2.22631C6.85143 1.60119 7.69928 1.25 8.58333 1.25C13.25 1.25 14.5833 7.91667 14.5833 7.91667ZM14.5833 7.91667H20.5833C21.4674 7.91667 22.3152 7.56548 22.9404 6.94036C23.5655 6.31523 23.9167 5.46739 23.9167 4.58333C23.9167 3.69928 23.5655 2.85143 22.9404 2.22631C22.3152 1.60119 21.4674 1.25 20.5833 1.25C15.9167 1.25 14.5833 7.91667 14.5833 7.91667ZM1.25 7.91667H27.9167V14.5833H1.25V7.91667Z"
      stroke="#1E1E1E"
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

const AdminPanel = () => {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    companyName: 'ООО "ТОРВЛАД"',
    inn: "00 00 000000 00",
    director: {
      fio: "Чапаев Хасан Хасанович",
      phone: "+7 (903) 000-00-00",
      email: "example@example.ru",
    },
    commandant: {
      fio: "Чапаев Хасан Хасанович",
      phone: "+7 (903) 000-00-00",
      email: "example@example.ru",
    },
    bookkeeper: {
      fio: "Чапаев Хасан Хасанович",
      phone: "+7 (903) 000-00-00",
      email: "example@example.ru",
    },
  });

  const handleChange = (section, field, value) => {
    setFormData((prev) => ({
      ...prev,
      [section]:
        prev[section] && typeof prev[section] === "object"
          ? { ...prev[section], [field]: value }
          : value,
    }));
  };

  const handleSave = async () => {
    const token = localStorage.getItem("token");
    if (!token) {
      alert("Нужно войти под администратором");
      return;
    }

    try {
      const response = await fetch(`${config}/api/admin/companies/`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Token ${token}`,
        },
        body: JSON.stringify({
          name: formData.companyName,
          address: formData.inn,
          inn: formData.inn,
          email: formData.director.email,
          phone_number: formData.director.phone,
          password: "TempPassword123!",
          owner_last_name: formData.director.fio.split(" ")[0] || "",
          owner_first_name: formData.director.fio.split(" ")[1] || "",
          owner_surname: formData.director.fio.split(" ").slice(2).join(" "),
          owner_birthday: "1970-01-01",
          coordinator_fio: formData.commandant.fio,
          coordinator_phone: formData.commandant.phone,
          coordinator_email: formData.commandant.email,
          accountant_fio: formData.bookkeeper.fio,
          accountant_phone: formData.bookkeeper.phone,
          accountant_email: formData.bookkeeper.email,
          is_active: true,
          is_verified: true,
        }),
      });

      if (response.ok) {
        alert("Компания успешно создана!");
        navigate("/companylist");
      } else {
        const data = await response.json();
        alert("Ошибка создания компании: " + JSON.stringify(data));
      }
    } catch (error) {
      console.error(error);
      alert("Ошибка сети при создании компании");
    }
  };

  return (
    <div className="admin-panel-wrapper">
      <header className="header">
        <div className="header-title">Компании</div>
        <div style={{ display: "flex", alignItems: "center", gap: "20px" }}>
          <span>Админ-панель</span>
        </div>
      </header>

      <div className="main-wrapper">
        <aside className="sidebar">
          <div className="sidebar-item">
            <HomeIcon /> <span>На главную</span>
          </div>
          <div className="sidebar-item active">
            <BuildingIcon /> <span>Компании</span>
          </div>
          <div className="sidebar-item" onClick={() => navigate("/users")}>
            <UsersIcon /> <span>Пользователи</span>
          </div>
          <div className="sidebar-item">
            <MailIcon /> <span>Пригласительные</span>
          </div>
          <div className="sidebar-item">
            <GiftIcon /> <span>Подарочные</span>
          </div>
        </aside>

        {/* CONTENT */}
        <main className="content">
          <h1 className="page-title">Добавить новую компанию</h1>

          {/* Общая Информация */}
          <div className="card">
            <div className="card-header">
              <BuildingIcon /> <span>Общая информация</span>
            </div>
            <div className="form-row">
              <div className="form-group">
                <label>Название Компании</label>
                <input
                  type="text"
                  value={formData.companyName}
                  onChange={(e) =>
                    handleChange("companyName", null, e.target.value)
                  }
                />
              </div>
              <div className="form-group">
                <label>ИНН</label>
                <input
                  type="text"
                  value={formData.inn}
                  onChange={(e) => handleChange("inn", null, e.target.value)}
                />
              </div>
            </div>
          </div>

          <div className="people-grid">
            <div className="people-card">
              <div className="card-header">
                <UsersIcon /> <span>Директор</span>
              </div>
              <div className="form-group">
                <label>ФИО</label>
                <input
                  value={formData.director.fio}
                  onChange={(e) =>
                    handleChange("director", "fio", e.target.value)
                  }
                />
              </div>
              <div className="form-group">
                <label>Телефон</label>
                <input
                  value={formData.director.phone}
                  onChange={(e) =>
                    handleChange("director", "phone", e.target.value)
                  }
                />
              </div>
              <div className="form-group">
                <label>Почта</label>
                <input
                  value={formData.director.email}
                  onChange={(e) =>
                    handleChange("director", "email", e.target.value)
                  }
                />
              </div>
            </div>

            <div className="people-card">
              <div className="card-header">
                <UsersIcon /> <span>Координатор</span>
              </div>
              <div className="form-group">
                <label>ФИО</label>
                <input
                  value={formData.commandant.fio}
                  onChange={(e) =>
                    handleChange("commandant", "fio", e.target.value)
                  }
                />
              </div>
              <div className="form-group">
                <label>Телефон</label>
                <input
                  value={formData.commandant.phone}
                  onChange={(e) =>
                    handleChange("commandant", "phone", e.target.value)
                  }
                />
              </div>
              <div className="form-group">
                <label>Почта</label>
                <input
                  value={formData.commandant.email}
                  onChange={(e) =>
                    handleChange("commandant", "email", e.target.value)
                  }
                />
              </div>
            </div>

            <div className="people-card">
              <div className="card-header">
                <UsersIcon /> <span>Бухгалтер</span>
              </div>
              <div className="form-group">
                <label>ФИО</label>
                <input
                  value={formData.bookkeeper.fio}
                  onChange={(e) =>
                    handleChange("bookkeeper", "fio", e.target.value)
                  }
                />
              </div>
              <div className="form-group">
                <label>Телефон</label>
                <input
                  value={formData.bookkeeper.phone}
                  onChange={(e) =>
                    handleChange("bookkeeper", "phone", e.target.value)
                  }
                />
              </div>
              <div className="form-group">
                <label>Почта</label>
                <input
                  value={formData.bookkeeper.email}
                  onChange={(e) =>
                    handleChange("bookkeeper", "email", e.target.value)
                  }
                />
              </div>
            </div>
          </div>

          <div className="actions">
            <button className="btn btn-cancel">Отмена</button>
            <button className="btn btn-save" onClick={handleSave}>
              Создать компанию
            </button>
          </div>
        </main>
      </div>
    </div>
  );
};

export default AdminPanel;

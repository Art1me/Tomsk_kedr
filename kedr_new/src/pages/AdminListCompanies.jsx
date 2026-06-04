import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import "../css/adminlistcompanies.css";
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

const AdminListCompanies = () => {
  const [currentPage, setCurrentPage] = useState(1);
  const [companies, setCompanies] = useState([]);
  const [stats, setStats] = useState(null);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(false);
  const itemsPerPage = 5;
  const navigate = useNavigate();

  const authHeaders = useMemo(() => {
    const token = localStorage.getItem("token");
    return token ? { Authorization: `Token ${token}` } : {};
  }, []);

  const fetchCompanies = async () => {
    const params = new URLSearchParams();
    if (search.trim()) {
      params.set("search", search.trim());
    }

    try {
      setLoading(true);
      const response = await fetch(
        `${config}/api/admin/companies/${params.toString() ? `?${params}` : ""}`,
        { headers: authHeaders },
      );

      if (!response.ok) {
        throw new Error("Не удалось загрузить компании");
      }

      const data = await response.json();
      setCompanies(Array.isArray(data) ? data : data.results || []);
      setCurrentPage(1);
    } catch (error) {
      console.error(error);
      alert(error.message);
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const response = await fetch(`${config}/api/admin/stats/`, {
        headers: authHeaders,
      });
      if (response.ok) {
        setStats(await response.json());
      }
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    fetchCompanies();
    fetchStats();
  }, []);

  const handleDelete = async (companyId) => {
    if (!window.confirm("Удалить компанию?")) {
      return;
    }

    try {
      const response = await fetch(`${config}/api/admin/companies/${companyId}/`, {
        method: "DELETE",
        headers: authHeaders,
      });

      if (!response.ok) {
        throw new Error("Не удалось удалить компанию");
      }

      await fetchCompanies();
      await fetchStats();
    } catch (error) {
      console.error(error);
      alert(error.message);
    }
  };

  const handleConfirm = async (companyId) => {
    try {
      const response = await fetch(`${config}/api/companies/${companyId}/confirm/`, {
        method: "POST",
        headers: authHeaders,
      });

      if (!response.ok) {
        throw new Error("Не удалось подтвердить компанию");
      }

      await fetchCompanies();
      await fetchStats();
    } catch (error) {
      console.error(error);
      alert(error.message);
    }
  };

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentCompanies = companies.slice(
    indexOfFirstItem,
    indexOfLastItem,
  );
  const totalPages = Math.ceil(companies.length / itemsPerPage) || 1;

  const paginate = (pageNumber) => setCurrentPage(pageNumber);
  const nextPage = () => {
    if (currentPage < totalPages) setCurrentPage(currentPage + 1);
  };
  const prevPage = () => {
    if (currentPage > 1) setCurrentPage(currentPage - 1);
  };

  const getPageNumbers = () => {
    const pages = [];
    const maxVisible = 5;
    if (totalPages <= maxVisible) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
    } else {
      pages.push(1);
      if (currentPage > 3) pages.push("...");
      let startPage = Math.max(2, currentPage - 1);
      let endPage = Math.min(totalPages - 1, currentPage + 1);
      if (currentPage <= 3) endPage = 4;
      if (currentPage >= totalPages - 2) startPage = totalPages - 3;
      for (let i = startPage; i <= endPage; i++) {
        if (i !== 1 && i !== totalPages) pages.push(i);
      }
      if (currentPage < totalPages - 2) pages.push("...");
      pages.push(totalPages);
    }
    return pages;
  };

  return (
    <div className="admin-page">
      <header className="top-header">
        <h1 className="header-right">Компании</h1>
        <div className="header-right">
          <span>Админ-панель</span>
        </div>
      </header>

      <div className="admin-layout">
        <aside className="sidebar">
          <ul className="sidebar-menu">
            <li className="sidebar-item" onClick={() => navigate("/")}>
              <div className="icon-placeholder">
                <HomeIcon />
              </div>
              <span>На главную</span>
            </li>
            <li
              className="sidebar-item active"
              onClick={() => navigate("/companylist")}
            >
              <div className="icon-placeholder">
                <BuildingIcon />
              </div>
              <span>Компании</span>
            </li>
            <li className="sidebar-item" onClick={() => navigate("/users")}>
              <div className="icon-placeholder">
                <UsersIcon />
              </div>
              <span>Пользователи</span>
            </li>
            <li className="sidebar-item">
              <div className="icon-placeholder">
                <MailIcon />
              </div>
              <span>Пригласительные</span>
            </li>
            <li className="sidebar-item">
              <div className="icon-placeholder">
                <GiftIcon />
              </div>
              <span>Подарочные</span>
            </li>
          </ul>
        </aside>

        <main className="main-content">
          <div className="page-header">
            <h2 className="page-title">Реестр компаний</h2>
            <button
              className="create-btn"
              onClick={() => navigate("/adminpanel")}
            >
              Создать компанию
            </button>
          </div>

          <div className="stats-container">
            <div className="stat-card">
              <span className="stat-label">Всего компаний</span>
              <div className="stat-value">{stats?.companies_total ?? companies.length}</div>
            </div>
            <div className="stat-card">
              <span className="stat-label">Активные компании</span>
              <div className="stat-value">{stats?.companies_active ?? 0}</div>
            </div>
            <div className="stat-card green">
              <span className="stat-label">Пользователей</span>
              <div className="stat-value">{stats?.users_total ?? 0}</div>
            </div>
          </div>

          <div className="search-container">
            <input
              type="text"
              className="search-input"
              placeholder="Поиск.."
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === "Enter") {
                  fetchCompanies();
                }
              }}
            />
          </div>

          <div className="table-wrapper">
            <table>
              <thead>
                <tr>
                  <th>Название компании</th>
                  <th>ИНН</th>
                  <th>Координатор</th>
                  <th>Статус</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan="5">Загрузка...</td>
                  </tr>
                ) : currentCompanies.length === 0 ? (
                  <tr>
                    <td colSpan="5">Компании не найдены</td>
                  </tr>
                ) : currentCompanies.map((company) => (
                  <tr key={company.id}>
                    <td>
                      <div className="company-name">{company.name}</div>
                      <div className="company-date">
                        Зарегистрирован:{" "}
                        {company.registered_at
                          ? new Date(company.registered_at).toLocaleDateString("ru-RU")
                          : ""}
                      </div>
                    </td>
                    <td>{company.inn || "—"}</td>
                    <td>{company.coordinator_fio || "—"}</td>
                    <td>
                      <span className="status-badge">
                        {company.is_active && company.is_verified ? "Активно" : "Ожидает"}
                      </span>
                    </td>
                    <td>
                      <div className="action-cell">
                        <button
                          className="action-btn green"
                          onClick={() => handleDelete(company.id)}
                          title="Удалить"
                        >
                          🗑
                        </button>
                        <button
                          className="action-btn red"
                          onClick={() => handleConfirm(company.id)}
                          title="Подтвердить"
                        >
                          ✓
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="pagination">
            <button
              className="page-btn"
              onClick={prevPage}
              disabled={currentPage === 1}
            >
              ←
            </button>
            {getPageNumbers().map((num, idx) => (
              <button
                key={idx}
                className={`page-btn ${currentPage === num ? "active" : ""}`}
                onClick={() => (typeof num === "number" ? paginate(num) : null)}
                disabled={typeof num !== "number"}
              >
                {num}
              </button>
            ))}
            <button
              className="page-btn"
              onClick={nextPage}
              disabled={currentPage === totalPages}
            >
              →
            </button>
          </div>
        </main>
      </div>
    </div>
  );
};

export default AdminListCompanies;

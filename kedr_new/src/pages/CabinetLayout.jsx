import UserCabinet from "./UserCabinet";
import PartnerCabinet from "./PartnerCabinet";
import EditorCabinet from "./EditorCabinet";
import { useEffect, useState } from "react";
import config from "../config.js";
const CabinetLayout = () => {
  const [data, setData] = useState(null);

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const token = localStorage.getItem("token");

        if (!token) {
          throw new Error("Токен не найден");
        }

        const response = await fetch(`${config}/api/users/me/`, {
          headers: {
            Authorization: `Token ${token}`,
            "Content-Type": "application/json",
          },
        });

        if (!response.ok) {
          throw new Error("Ошибка загрузки данных пользователя");
        }

        const userData = await response.json();
        setData(userData);
      } catch (error) {
        console.error("Ошибка:", error);
        alert("Не удалось загрузить данные");
      }
    };

    fetchUserData();
  }, []);

  if (data?.simple_profile) {
    if (data.simple_profile.is_editor === true) {
      return <EditorCabinet />;
    } else {
      return <UserCabinet />;
    }
  } else if (data?.partner_profile) {
    return <PartnerCabinet />;
  }
};

export default CabinetLayout;

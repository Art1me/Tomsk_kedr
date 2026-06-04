import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import style from "../css/basicinfo.module.css"
import ModalAlertPortal from "./PopUp/ModalAlertPortal";
import config from "../config";

const BasicInfo = () => {
    const navigate = useNavigate();
    const [count, setCount] = useState(null);
    const [showAuthInfo, setShowAuthInfo] = useState(false);

    useEffect(() => {
        fetch(`${config}/api/trees/`)
            .then(res => res.json())
            .then(data => setCount(Array.isArray(data) ? data.length : 0))
            .catch(() => setCount(0));
    }, []);

    // Функция для склонения слова "дерево"
    function getCedarWord(n) {
        n = Math.abs(n) % 100;
        const n1 = n % 10;
        if (n > 10 && n < 20) return "деревьев";
        if (n1 > 1 && n1 < 5) return "дерева";
        if (n1 === 1) return "дерево";
        return "деревьев";
    }

    const handleRegisterCedar = () => {
        const token = localStorage.getItem("token");
        if (token) {
            navigate('/register-kedr');
        } else {
            setShowAuthInfo(true);
        }
    };

    return(
        <div className={style.container}>
            <main className={style.LeftBlock}>
                <p className={style.CountReg}>
                С нами уже зарегистрировано
                </p>
                <div className={style.CounterTrees}>
                    <p>{count !== null ? count : "..."}</p>
                    <p>{count !== null ? getCedarWord(count) : ""}</p>
                </div>
            </main>
            <main className={style.RightBlock}>
                <div>
                    <p className={style.title}>
                    Томск - <br />
                    столица кедра
                    </p>
                    <button type="submit" className={style.button}
                    onClick={handleRegisterCedar}>
                        Зарегистрировать кедр
                    </button>
                    <p className={style.memoryOf}>
                    <span>Дерево</span>, как символ вечной памяти о Великой Победе
                    </p>
                </div>
            </main>
            {showAuthInfo && (
                <ModalAlertPortal
                    onClose={() => setShowAuthInfo(false)}
                    contentClass="AlertPopUp"
                >
                    Сначала пройдите регистрацию на сайте
                </ModalAlertPortal>
            )}
        </div>
    )
}

export default BasicInfo;

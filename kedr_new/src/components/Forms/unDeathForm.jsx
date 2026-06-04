import style from "../../css/undeath.module.css"
const unDeathForm = (props) => {
        return(
            <div className={style.container}>
                <header>
                    <p>
                    Если у Вас уже есть аккаунт на сайте “Бессмертный полк”, то Вы можете не проходить регистрацию на нашем сайте, а войти по номеру телефона, который привязан к этому аккаунту
                    </p>
                </header>
                <form className={style.form}>
                    <label className={style.lable} htmlFor="login">Номер телефона</label>
                    <input placeholder="+7 (ххх) ххх хх-хх" id="login"
                    className={style.input}/>
                    <label className={style.lable2} htmlFor="full_name">ФИО</label>
                    <input placeholder="Иванов Иван Иванович" id="full_name"
                    className={style.input}/>
                </form>
                <footer className={style.footer}>
                    <button className={style.button}>Войти</button>
                </footer>
            </div>
        )
    }

    export default unDeathForm;
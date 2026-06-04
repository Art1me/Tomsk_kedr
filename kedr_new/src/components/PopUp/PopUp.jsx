import React from "react";
import style from "./popup.module.css";

class PopUp extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            isClosing: false
        };
    }

    handleClose = () => {
        this.setState({ isClosing: true });
        setTimeout(() => {
            this.props.closePopUp();
        }, 300); // Время анимации
    }

    handleOverlayClick = (event) => {
        if (event.target === event.currentTarget) {
            this.handleClose();
        }
    }

    componentDidMount() {
        // Сохраняем текущую позицию скролла
        const scrollY = window.scrollY;
        // Блокируем скролл
        document.body.style.position = 'fixed';
        document.body.style.top = `-${scrollY}px`;
        document.body.style.width = '100%';
    }

    componentWillUnmount() {
        // Восстанавливаем позицию скролла
        const scrollY = document.body.style.top;
        document.body.style.position = '';
        document.body.style.top = '';
        document.body.style.width = '';
        window.scrollTo(0, parseInt(scrollY || '0') * -1);
    }

    render() {
        const { isClosing } = this.state;
        return (
            <div className={`${style.overlay} ${isClosing ? style.closing : ''}`} onClick={this.handleOverlayClick}>
                <div className={`${style.content} ${this.props.size ? style[this.props.size] : ''} ${this.props.contentClass ? style[this.props.contentClass] : ''} ${isClosing ? style.closing : ''}`}>
                    <header className={style.header}>
                        <img 
                            src='/close-icon.png' 
                            alt="закрыть"
                            className={style.close}
                            onClick={this.handleClose}
                        />
                    </header>
                    <main className={style[this.props.object]}><this.props.obj/></main>
                </div>
            </div>
        )
    }
}

export default PopUp;



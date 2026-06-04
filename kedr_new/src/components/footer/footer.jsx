import React, { useRef, useEffect } from "react";
import style from "./footer.module.css";

const partnerLogos = [
    "image 2.png", "image 3.png", "image 4.png",
    "image 5.png", "image 6.png", "image 7.png", "image 8.png"
];

const Footer = () => {
    const marqueeRef = useRef(null);
    const contentRef = useRef(null);
    useEffect(() => {
        const handleResize = () => {
            if (isMobile && /^((?!chrome|android).)*safari/i.test(navigator.userAgent)) {
                document.documentElement.classList.add('safari-mobile');
            } else {
                document.documentElement.classList.remove('safari-mobile');
            }
        };

        const isMobile = window.innerWidth <= 768; // Проверяем один раз для начальной установки
        handleResize(); // Вызываем при монтировании

        window.addEventListener('resize', handleResize); // Обновляем при изменении размера окна
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    const logos = [...partnerLogos, ...partnerLogos];

    return (
        <div className={style.container}>
            <header className={style.header}>Наши <span>зелёные</span> партнёры</header>
            <div className={style.dividerBar}>
                <div className={style.marquee} ref={marqueeRef}>
                    <div className={style.marqueeContent} ref={contentRef}>
                        {logos.map((logo, idx) => (
                            <img
                                key={idx}
                                src={`/logo-partners/${logo}`}
                                alt={`Партнёр ${idx+1}`}
                                className={style.partnerLogo}
                                loading="lazy"
                                draggable="false"
                            />
                        ))}
                    </div>
                </div>
                <div className={style.marqueeFade}></div>
            </div>
            <div className={style.greenLine}></div>
        </div>
    );
};

export default Footer;
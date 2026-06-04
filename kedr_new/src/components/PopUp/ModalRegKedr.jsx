import React, { useEffect } from 'react';
import style from '../../css/regkedr.module.css';

const ModalRegKedr = ({ isOpen, onClose, children, contentClass }) => {
    useEffect(() => {
        if (isOpen) {
            // Сохраняем текущую позицию скролла
            const scrollY = window.scrollY;
            // Блокируем скролл
            document.body.style.position = 'fixed';
            document.body.style.top = `-${scrollY}px`;
            document.body.style.width = '100%';
        }

        return () => {
            if (isOpen) {
                // Восстанавливаем позицию скролла
                const scrollY = document.body.style.top;
                document.body.style.position = '';
                document.body.style.top = '';
                document.body.style.width = '';
                window.scrollTo(0, parseInt(scrollY || '0') * -1);
            }
        };
    }, [isOpen]);

    if (!isOpen) return null;

    return (
        <div className={style.modal} onClick={onClose}>
            <div className={[style.content, contentClass].join(' ')} onClick={e => e.stopPropagation()}>
                {children}
            </div>
        </div>
    );
};

export default ModalRegKedr; 
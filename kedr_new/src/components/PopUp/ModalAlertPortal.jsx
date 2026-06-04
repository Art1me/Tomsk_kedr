import { createPortal } from 'react-dom';
import style from './popup.module.css';

const ModalAlertPortal = ({ children, onClose, contentClass }) => {
  return createPortal(
    <div className={`${style.overlay}`} onClick={onClose}>
      <div 
        className={`${style.content} ${contentClass ? style[contentClass] : ''}`} 
        onClick={e => e.stopPropagation()}
      >
        <header className={style.header}>
          <img 
            src='/close-icon.png' 
            alt="закрыть"
            className={style.close}
            onClick={onClose}
          />
        </header>
        <main className={style.AlertPopUpText}>{children}</main>
      </div>
    </div>,
    document.body
  );
};

export default ModalAlertPortal; 
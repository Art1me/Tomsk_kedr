import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import config from '../config';

const ConfirmRegistration = () => {
  const { uid, token } = useParams();
  const navigate = useNavigate();
  const [message, setMessage] = useState('Подтверждение регистрации...');
  const [isSuccess, setIsSuccess] = useState(false);

  useEffect(() => {
    if (!uid || !token) {
      setMessage('Неверная ссылка подтверждения');
      return;
    }

    let timerId = null;

    const processActivation = async () => {
      try {
        const response = await fetch(`${config}/api/users/activate/${uid}/${token}/`, {
          method: 'GET', 
          headers: {
            'Accept': 'application/json',
          }
        });

        if (response.ok) {
          let successMsg = 'Регистрация успешно подтверждена!';
          if (response.status !== 204) {
            try {
              const data = await response.json();
              if (data && data.detail) {
                successMsg = data.detail;
              }
            } catch (e) {
              console.warn('Не удалось разобрать JSON из успешного ответа активации:', e);
            }
          }
          setMessage(successMsg);
          setIsSuccess(true);
          timerId = setTimeout(() => {
            navigate('/', { state: { showLoginPopup: true } });
          }, 3000);
        } else {
          let errorDetail = 'Ошибка подтверждения.';
          try {
            const errorData = await response.json();
            if (errorData && typeof errorData === 'object') {
                // Пытаемся извлечь сообщение из стандартных полей Djoser или других
                errorDetail = errorData.detail || errorData.message || 
                              (Array.isArray(errorData.uid) && errorData.uid.join(' ')) ||
                              (Array.isArray(errorData.token) && errorData.token.join(' ')) ||
                              Object.values(errorData).flat().join(' ') ||
                              `Ошибка ${response.status}`;
            } else {
                 errorDetail = `Сервер вернул ошибку ${response.status}.`;
            }
          } catch (jsonError) {
            const textResponse = await response.text();
            errorDetail = textResponse || `Ошибка сервера (${response.status}). Попробуйте позже.`;
          }
          throw new Error(errorDetail);
        }
      } catch (error) {
        setMessage(error.message || 'Произошла непредвиденная ошибка при подтверждении.');
        setIsSuccess(false);
      }
    };
    processActivation();

    return () => {
      if (timerId) {
        clearTimeout(timerId);
      }
    };
  }, [uid, token, navigate]);

  return (
    <div style={{ 
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      height: '100vh',
      flexDirection: 'column',
      textAlign: 'center'
    }}>
      <h2>{message}</h2>
      {isSuccess && <p>Вы будете перенаправлены на страницу входа...</p>}
    </div>
  );
};

export default ConfirmRegistration;

const envApiBaseUrl = import.meta.env.VITE_API_BASE_URL?.trim();
const isLocalhost = ['localhost', '127.0.0.1'].includes(window.location.hostname);

const API_BASE_URL = envApiBaseUrl || (isLocalhost ? 'http://localhost:8000' : '');

export default API_BASE_URL;

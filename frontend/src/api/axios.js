import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '/api',
  headers: {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  },
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  if (config.data instanceof FormData) {
    delete config.headers['Content-Type'];
  }

  return config;
});

let redirectingToLogin = false;

api.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error.response?.status;
    const url = error.config?.url || '';
    const skipRedirect = error.config?.skipAuthRedirect;
    const isAuthAttempt = url.includes('/login') || url.includes('/password/set');

    if (status === 401 && !isAuthAttempt && !skipRedirect) {
      localStorage.removeItem('token');
      localStorage.removeItem('user'); // legacy key cleanup

      window.dispatchEvent(new CustomEvent('auth:expired', { detail: { message: 'Votre session a expiré. Veuillez vous reconnecter.' } }))

      if (!window.location.pathname.startsWith('/login') && !redirectingToLogin) {
        redirectingToLogin = true;
        window.location.href = '/login';
      }
    }

    return Promise.reject(error);
  }
);

export default api;

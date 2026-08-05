import axios from 'axios';

// Resolve baseURL dynamically to handle dynamic backend port shifts (e.g. port 3000 -> 3001)
const getDynamicBaseURL = () => {
  const envUrl = import.meta.env.VITE_API_URL || import.meta.env.VITE_API_BASE_URL;
  if (envUrl) return envUrl;

  // Fallback: If we run on localhost, align backend dynamically
  if (typeof window !== 'undefined' && window.location.hostname === 'localhost') {
    // If frontend shifted to 5174, backend likely shifted to 3001
    const backendPort = window.location.port === '5174' ? '3001' : '3000';
    return `http://localhost:${backendPort}/api`;
  }
  return 'http://localhost:3000/api';
};

const baseURL = getDynamicBaseURL();

export const getBackendUrl = () => {
  return baseURL.replace(/\/api$/, '');
};

const api = axios.create({
  baseURL,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

let currentToken = null;
let onUnauthorized = null;

export const setAuthToken = (token) => {
  currentToken = token;
};

export const setUnauthorizedHandler = (handler) => {
  onUnauthorized = handler;
};

// Request Interceptor: Attach Authorization header if token exists
api.interceptors.request.use(
  (config) => {
    if (currentToken) {
      config.headers.Authorization = `Bearer ${currentToken}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response Interceptor: Catch 401 Unauthorized errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      if (onUnauthorized) {
        onUnauthorized();
      }
    }
    return Promise.reject(error);
  }
);

export default api;

import axios from 'axios';

// Resolve baseURL dynamically. Key rule: use window.location.hostname so that
// when Device B opens the app via 192.168.1.5:5173, API calls go to
// 192.168.1.5:3000 — not localhost:3000 (which would target Device B's own machine).
const getDynamicBaseURL = () => {
  const envUrl = import.meta.env.VITE_API_URL || import.meta.env.VITE_API_BASE_URL;
  if (envUrl) return envUrl;

  if (typeof window !== 'undefined') {
    const { hostname, port } = window.location;
    const backendPort = port === '5174' ? '3001' : '3000';
    return `http://${hostname}:${backendPort}/api`;
  }

  return 'http://localhost:3000/api';
};

const baseURL = getDynamicBaseURL();

// Keep getBackendUrl for legacy callers — will be replaced by getImageUrl utility
export const getBackendUrl = () => baseURL.replace(/\/api$/, '');

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

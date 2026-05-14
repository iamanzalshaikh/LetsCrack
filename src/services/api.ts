import axios from 'axios';
import { CLIENT_ENV } from '../config/clientEnv';

const api = axios.create({
  baseURL: CLIENT_ENV.API_URL,
  withCredentials: true, // Send cookies if using them
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor to add Auth token
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Interceptor to handle unauthorized errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      // Potential redirect logic here
    }
    return Promise.reject(error);
  }
);

export default api;

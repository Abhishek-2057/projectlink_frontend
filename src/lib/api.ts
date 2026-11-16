import axios from 'axios';
import { toast } from 'sonner';

export const api = axios.create({
  baseURL: '/api',
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 15000,
});

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('projectlink_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

api.interceptors.response.use(
  (response) => response,
  (error) => {
    const message = error.response?.data?.message || error.message || 'Something went wrong';
    
    // Auto logout on 401 if token was expired
    if (error.response?.status === 401 && localStorage.getItem('projectlink_token')) {
      // Token expired
      localStorage.removeItem('projectlink_token');
      localStorage.removeItem('projectlink_user');
      window.location.href = '/login?expired=true';
    }

    return Promise.reject(error);
  }
);

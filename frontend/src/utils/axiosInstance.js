import axios from 'axios';
import { baseURL } from './api';

const axiosInstance = axios.create({
  baseURL,
});

// Add a request interceptor to always attach the token
axiosInstance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

export default axiosInstance; 
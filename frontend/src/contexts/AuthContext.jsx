import { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';
import axiosInstance from '../utils/axiosInstance';
import { endpoints } from '../utils/api';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      // Set default authorization header
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      axiosInstance.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      // Fetch user data
      axiosInstance.get(endpoints.authMe)
        .then(response => {
          // Ensure user._id is always present
          const user = response.data;
          setUser(user._id ? user : { ...user, _id: user.id });
        })
        .catch(error => {
          console.error('Error fetching user data:', error);
          localStorage.removeItem('token');
          delete axios.defaults.headers.common['Authorization'];
          delete axiosInstance.defaults.headers.common['Authorization'];
        })
        .finally(() => {
          setLoading(false);
        });
    } else {
      setLoading(false);
    }
  }, []);

  const login = async (email, password) => {
    try {
      const response = await axios.post('https://skillkart-backend-i4j5.onrender.com/api/auth/login', {
        email,
        password
      });
      
      const { token, user } = response.data;
      localStorage.setItem('token', token);
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      axiosInstance.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      // Ensure user._id is always present
      setUser(user._id ? user : { ...user, _id: user.id });
      return user;
    } catch (error) {
      throw error.response?.data?.message || 'Error logging in';
    }
  };

  const register = async (email, password, role) => {
    try {
      const response = await axios.post('https://skillkart-backend-i4j5.onrender.com/api/auth/register', {
        email,
        password,
        role
      });
      
      const { token, user } = response.data;
      localStorage.setItem('token', token);
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      axiosInstance.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      // Ensure user._id is always present
      setUser(user._id ? user : { ...user, _id: user.id });
      return user;
    } catch (error) {
      throw error.response?.data?.message || 'Error registering';
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user'); // in case user info is stored
    delete axios.defaults.headers.common['Authorization'];
    delete axiosInstance.defaults.headers.common['Authorization'];
    setUser(null);
    window.location.href = '/login'; // force reload to clear all state
  };

  const value = {
    user,
    login,
    register,
    logout,
    loading
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}; 
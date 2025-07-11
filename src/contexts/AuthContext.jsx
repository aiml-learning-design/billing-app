import { createContext, useContext, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import jwt_decode from 'jwt-decode';

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      const decoded = jwt_decode(token);
      setUser(decoded);
    }
    setLoading(false);
  }, []);

  const login = async (email, password) => {
    try {
      setError(null);
      const response = await api.post('/api/auth/authenticate', { email, password });
      localStorage.setItem('token', response.token);
      setUser(jwt_decode(response.token));
      navigate('/dashboard');
    } catch (error) {
      setError(error.response?.data?.message || 'Login failed');
      throw error;
    }
  };

  const register = async (email, password) => {
    try {
      setError(null);
      const response = await api.post('/api/auth/register', {
        email,
        password,
        userRole: 'USER'
      });
      localStorage.setItem('token', response.token);
      setUser(jwt_decode(response.token));
      navigate('/dashboard');
    } catch (error) {
      setError(error.response?.data?.message || 'Registration failed');
      throw error;
    }
  };

  const loginWithGoogle = async (googleData) => {
    try {
      setError(null);
      const response = await api.post('/api/auth/google', {
        token: googleData.credential
      });
      localStorage.setItem('token', response.token);
      setUser(jwt_decode(response.token));
      navigate('/dashboard');
    } catch (error) {
      setError(error.response?.data?.message || 'Google login failed');
      throw error;
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    setUser(null);
    navigate('/login');
  };

  const value = {
    user,
    loading,
    error,
    login,
    register,
    logout,
    loginWithGoogle,
    setError
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
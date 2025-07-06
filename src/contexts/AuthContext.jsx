import { createContext, useContext, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      api.get('/api/auth/me')
        .then(response => {
          setUser(response.data); // Assuming backend returns user object
        })
        .catch((err) => {
          console.error("Failed to fetch user:", err);
          logout();
        })
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, []);

  const login = async (email, password) => {
    try {
      setError(null);
      const { token, email } = await api.post('http://localhost:8087/api/auth/authenticate', { 
        email, 
        password 
      });
      
      localStorage.setItem('token', token);
      setUser({ email: email }); // Store user data
      navigate('/dashboard');
    } catch (error) {
      setError(error.response?.data?.message || "Login failed");
      throw error;
    }
  };

  const register = async (email, password) => {
    try {
      setError(null);
      const { token, email } = await api.post('http://localhost:8087/api/auth/register', { 
        email, 
        password 
      });
      
      localStorage.setItem('token', token);
      setUser({ email: email });
      navigate('/dashboard');
    } catch (error) {
      setError(error.response?.data?.message || "Registration failed");
      throw error;
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    setUser(null);
    navigate('/login');
  };

  return (
    <AuthContext.Provider value={{ 
      user, 
      loading, 
      error,
      login, 
      register, 
      logout,
      setError // Allow clearing errors from components
    }}>
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
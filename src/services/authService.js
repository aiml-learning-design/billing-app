import api from './api';

export const login = async (email, password) => {
  const response = await api.post('/auth/authenticate', { email, password });
  return response;
};

export const register = async (email, password) => {
  const response = await api.post('/auth/register', { email, password });
  return response;
};

export const getCurrentUser = async (token) => {
  const response = await api.get('/auth/me');
  return response;
};
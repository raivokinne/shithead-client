import { useState, useCallback } from 'react';
import { User } from '@/types';
import { instance } from '@/lib/axios';

interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
}

interface LoginCredentials {
  email: string;
  password: string;
}

interface RegisterCredentials extends LoginCredentials {
  name: string;
  password_confirmation: string;
}

export const useAuth = () => {
  const [state, setState] = useState<AuthState>({
    user: null,
    token: localStorage.getItem('token'),
    isAuthenticated: !!localStorage.getItem('token'),
    isLoading: false,
    error: null
  });

  const login = useCallback(async (credentials: LoginCredentials) => {
    setState(prev => ({ ...prev, isLoading: true, error: null }));
    try {
      const response = await instance.post('/login', credentials);

      if (response.data.success) {
        const token = response.data.token;

        const userResponse = await instance.get('/user', {
          headers: { Authorization: `Bearer ${token}` }
        });

        localStorage.setItem('token', token);

        setState({
          user: userResponse.data,
          token,
          isAuthenticated: true,
          isLoading: false,
          error: null
        });

        return userResponse.data;
      } else {
        throw new Error(response.data.message || 'Login failed');
      }
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || error.message || 'Login failed';
      setState(prev => ({
        ...prev,
        isLoading: false,
        error: errorMessage,
        isAuthenticated: false
      }));
      throw error;
    }
  }, []);

  const register = useCallback(async (credentials: RegisterCredentials) => {
    setState(prev => ({ ...prev, isLoading: true, error: null }));
    try {
      const response = await instance.post('/register', credentials);

      if (response.data.success) {
        const token = response.data.token;

        const userResponse = await instance.get('/user', {
          headers: { Authorization: `Bearer ${token}` }
        });

        localStorage.setItem('token', token);

        setState({
          user: userResponse.data,
          token,
          isAuthenticated: true,
          isLoading: false,
          error: null
        });

        return userResponse.data;
      } else {
        throw new Error('Registration failed');
      }
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || error.message || 'Registration failed';
      setState(prev => ({
        ...prev,
        isLoading: false,
        error: errorMessage,
        isAuthenticated: false
      }));
      throw error;
    }
  }, []);

  const logout = useCallback(async () => {
    setState(prev => ({ ...prev, isLoading: true, error: null }));
    try {
      await instance.post('/logout');

      localStorage.removeItem('token');
      setState({
        user: null,
        token: null,
        isAuthenticated: false,
        isLoading: false,
        error: null
      });
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || error.message || 'Logout failed';
      setState(prev => ({
        ...prev,
        isLoading: false,
        error: errorMessage
      }));
      throw error;
    }
  }, []);

  return {
    ...state,
    login,
    register,
    logout
  };
};

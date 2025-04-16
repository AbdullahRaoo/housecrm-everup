/* eslint-disable react-refresh/only-export-components */

import axios from 'axios';
import { createContext, ReactNode, useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { authApi } from '../services/api';

// Define user type with role information
export interface User {
  id: string;
  name: string;
  email: string;
  isAdmin: boolean;
  role: string;
}

interface AuthContextType {
  isAuthenticated: boolean;
  user: User | null;
  login: (credentials: { email: string; password: string }) => Promise<void>;
  logout: () => Promise<void>;
  token: string | null;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState(() => {
    return localStorage.getItem('isAuthenticated') === 'true';
  });
  const [user, setUser] = useState<User | null>(() => {
    const savedUser = localStorage.getItem('user');
    return savedUser ? JSON.parse(savedUser) : null;
  });
  const [token, setToken] = useState<string | null>(() => {
    return localStorage.getItem('token');
  });
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const location = useLocation();

  // Set up axios interceptor for auth headers
  useEffect(() => {
    axios.interceptors.request.use((config) => {
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      return config;
    });
  }, [token]);

  // Check auth status on mount
  useEffect(() => {
    const checkAuthStatus = async () => {
      // If we have a token, verify it's still valid
      if (token) {
        try {
          setLoading(true);
          const response = await authApi.getProfile(token);
          if (response) {
            setIsAuthenticated(true);
            setUser(response);
            localStorage.setItem('isAuthenticated', 'true');
            localStorage.setItem('user', JSON.stringify(response));
            localStorage.setItem('token', token);
          }
        } catch (error) {
          console.error('Authentication check failed:', error);
          setIsAuthenticated(false);
          setUser(null);
          setToken(null);
          localStorage.removeItem('isAuthenticated');
          localStorage.removeItem('user');
          localStorage.removeItem('token');

          // Only redirect if not already on login page
          if (location.pathname !== '/login') {
            navigate('/login');
          }
        } finally {
          setLoading(false);
        }
      } else {
        setLoading(false);
        if (location.pathname !== '/login') {
          navigate('/login');
        }
      }
    };

    checkAuthStatus();
  }, [navigate, location.pathname, token]);

  const login = async (credentials: { email: string; password: string }) => {
    try {
      const authData = await authApi.login(credentials);

      setIsAuthenticated(true);
      setUser(authData.user);
      setToken(authData.token);

      // Persist auth state
      localStorage.setItem('isAuthenticated', 'true');
      localStorage.setItem('user', JSON.stringify(authData.user));
      localStorage.setItem('token', authData.token);

      const from = location.state?.from?.pathname || '/';
      navigate(from);
    } catch (error) {
      console.error('Login failed:', error);
      throw error;
    }
  };

  const logout = async () => {
    try {
      await axios.post('/api/auth/logout');
    } catch (error) {
      console.error('Logout API call failed:', error);
    } finally {
      // Clear local state and storage
      setIsAuthenticated(false);
      setUser(null);
      setToken(null);
      localStorage.removeItem('isAuthenticated');
      localStorage.removeItem('user');
      localStorage.removeItem('token');
      navigate('/login');
    }
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <AuthContext.Provider value={{ isAuthenticated, user, login, logout, token }}>
      {children}
    </AuthContext.Provider>
  );
}

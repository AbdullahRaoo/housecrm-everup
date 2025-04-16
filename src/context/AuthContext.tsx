/* eslint-disable react-refresh/only-export-components */
/* eslint-disable @typescript-eslint/no-explicit-any */
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
  login: (authData: any) => void;
  logout: () => void;
  token: string | null;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    // Initialize auth state from localStorage on mount
    const auth = localStorage.getItem('auth');
    if (auth) {
      const authData = JSON.parse(auth);
      setIsAuthenticated(true);
      setUser(authData.user);
      setToken(authData.token);

      // Optional: Verify token validity with the server
      verifyToken(authData.token);
    }
  }, []);

  // Function to verify token with the server
  const verifyToken = async (token: string) => {
    try {
      // Get user profile from API
      const userProfile = await authApi.getProfile(token);

      // Update user data with the latest from server
      setUser(userProfile);
    } catch (error) {
      // Token is invalid or expired
      console.error('Token verification failed:', error);
      logout();
    }
  };

  useEffect(() => {
    // Check auth status when component mounts and on storage changes
    const checkAuth = () => {
      const auth = localStorage.getItem('auth');

      if (auth) {
        const authData = JSON.parse(auth);
        setIsAuthenticated(true);
        setUser(authData.user);
        setToken(authData.token);
      } else {
        setIsAuthenticated(false);
        setUser(null);
        setToken(null);

        // If not authenticated and not already on login page, redirect to login
        if (location.pathname !== '/login') {
          navigate('/login');
        }
      }
    };

    checkAuth();

    // Listen for storage changes in other tabs
    window.addEventListener('storage', checkAuth);
    return () => window.removeEventListener('storage', checkAuth);
  }, [navigate, location.pathname]);

  const login = (authData: any) => {
    // Store the authentication data from the server
    const authPayload = {
      token: authData.token,
      user: authData.user
    };

    localStorage.setItem('auth', JSON.stringify(authPayload));
    setIsAuthenticated(true);
    setUser(authData.user);
    setToken(authData.token);

    // Get the redirect path from location state or default to '/'
    const from = location.state?.from?.pathname || '/';
    navigate(from);
  };

  const logout = () => {
    localStorage.removeItem('auth');
    setIsAuthenticated(false);
    setUser(null);
    setToken(null);
    navigate('/login');
  };

  return (
    <AuthContext.Provider value={{ isAuthenticated, user, login, logout, token }}>
      {children}
    </AuthContext.Provider>
  );
}

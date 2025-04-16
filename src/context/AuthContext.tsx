/* eslint-disable react-refresh/only-export-components */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { createContext, ReactNode, useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

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
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    // Initialize auth state from localStorage on mount
    const auth = localStorage.getItem('auth');
    if (auth) {
      const authData = JSON.parse(auth);
      setIsAuthenticated(true);
      setUser(authData.user);
    }
  }, []);

  useEffect(() => {
    // Check auth status when component mounts and on storage changes
    const checkAuth = () => {
      const auth = localStorage.getItem('auth');

      if (auth) {
        const authData = JSON.parse(auth);
        setIsAuthenticated(true);
        setUser(authData.user);
      } else {
        setIsAuthenticated(false);
        setUser(null);

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
    // Create a mock user with admin role for demo purposes
    // In a real app, this would come from your authentication service
    const userData: User = authData.user || {
      id: '1',
      name: 'Admin User',
      email: 'admin@example.com',
      isAdmin: true,
      role: 'admin'
    };

    const authPayload = {
      token: authData.token || 'admin-token',
      user: userData
    };

    localStorage.setItem('auth', JSON.stringify(authPayload));
    setIsAuthenticated(true);
    setUser(userData);

    // Get the redirect path from location state or default to '/'
    const from = location.state?.from?.pathname || '/';
    navigate(from);
  };

  const logout = () => {
    localStorage.removeItem('auth');
    setIsAuthenticated(false);
    setUser(null);
    navigate('/login');
  };

  return (
    <AuthContext.Provider value={{ isAuthenticated, user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

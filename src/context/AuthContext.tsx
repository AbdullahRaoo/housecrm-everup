/* eslint-disable @typescript-eslint/no-explicit-any */
import { createContext, useEffect, useState, ReactNode } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

interface AuthContextType {
  isAuthenticated: boolean;
  login: (authData: any) => void;
  logout: () => void;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState(() => {
    // Initialize auth state from localStorage on mount
    const auth = localStorage.getItem('auth');
    return !!auth;
  });
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    // Check auth status when component mounts and on storage changes
    const checkAuth = () => {
      const auth = localStorage.getItem('auth');
      const isAuth = !!auth;
      setIsAuthenticated(isAuth);

      // If not authenticated and not already on login page, redirect to login
      if (!isAuth && location.pathname !== '/login') {
        navigate('/login');
      }
    };

    checkAuth();

    // Listen for storage changes in other tabs
    window.addEventListener('storage', checkAuth);
    return () => window.removeEventListener('storage', checkAuth);
  }, [navigate, location.pathname]);

  const login = (authData: any) => {
    localStorage.setItem('auth', JSON.stringify(authData));
    setIsAuthenticated(true);

    // Get the redirect path from location state or default to '/'
    const from = location.state?.from?.pathname || '/';
    navigate(from);
  };

  const logout = () => {
    localStorage.removeItem('auth');
    setIsAuthenticated(false);
    navigate('/login');
  };

  return (
    <AuthContext.Provider value={{ isAuthenticated, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

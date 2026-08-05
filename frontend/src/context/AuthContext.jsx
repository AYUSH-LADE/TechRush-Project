import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import api, { setAuthToken, setUnauthorizedHandler } from '../api/axios';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);

  const logout = useCallback(() => {
    setUser(null);
    setToken(null);
    setAuthToken(null);
  }, []);

  const login = useCallback((userData, authToken) => {
    setUser(userData);
    setToken(authToken);
    setAuthToken(authToken);
  }, []);

  useEffect(() => {
    setUnauthorizedHandler(() => {
      logout();
    });
  }, [logout]);

  useEffect(() => {
    const initAuth = async () => {
      try {
        const response = await api.post('/auth/refresh');
        if (response.data && response.data.token) {
          login(response.data.user, response.data.token);
        }
      } catch (error) {
        // Normal if no valid refresh token is present
      } finally {
        setLoading(false);
      }
    };
    initAuth();
  }, [login]);

  const value = {
    user,
    token,
    login,
    logout,
    isAuthenticated: Boolean(token && user),
    isAdmin: Boolean(user && user.role === 'admin'),
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-blue-500/20 border-t-blue-500 rounded-full animate-spin"></div>
      </div>
    );
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export default AuthContext;

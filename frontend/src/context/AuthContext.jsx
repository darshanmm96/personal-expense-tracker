import { createContext, useCallback, useContext, useEffect, useState } from 'react';
import { authAPI, TOKEN_KEY } from '../services/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const clearSession = useCallback(() => {
    localStorage.removeItem(TOKEN_KEY);
    setUser(null);
  }, []);

  useEffect(() => {
    let active = true;

    const loadUser = async () => {
      if (!localStorage.getItem(TOKEN_KEY)) {
        setLoading(false);
        return;
      }
      try {
        const { data } = await authAPI.me();
        if (active) setUser(data.user);
      } catch {
        if (active) clearSession();
      } finally {
        if (active) setLoading(false);
      }
    };

    loadUser();
    window.addEventListener('auth:unauthorized', clearSession);
    return () => {
      active = false;
      window.removeEventListener('auth:unauthorized', clearSession);
    };
  }, [clearSession]);

  const login = async (email, password) => {
    const { data } = await authAPI.login({ email, password });
    localStorage.setItem(TOKEN_KEY, data.token);
    setUser(data.user);
    return data;
  };

  const register = async (payload) => {
    const { data } = await authAPI.register(payload);
    localStorage.setItem(TOKEN_KEY, data.token);
    setUser(data.user);
    return data;
  };

  const logout = async () => {
    try {
      await authAPI.logout();
    } catch {
      // Logout locally even if the API call fails (e.g. offline).
    } finally {
      clearSession();
    }
  };

  const updateProfile = async (payload) => {
    const { data } = await authAPI.updateProfile(payload);
    setUser(data.user);
    return data;
  };

  const changePassword = async (payload) => {
    const { data } = await authAPI.changePassword(payload);
    return data;
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        isAuthenticated: Boolean(user),
        login,
        register,
        logout,
        updateProfile,
        changePassword,
        refreshUser: async () => {
          const { data } = await authAPI.me();
          setUser(data.user);
        },
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used inside AuthProvider');
  return context;
};

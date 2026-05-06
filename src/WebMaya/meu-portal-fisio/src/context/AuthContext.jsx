import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { apiRequest } from '../lib/api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [admin, setAdmin] = useState(() => {
    const stored = localStorage.getItem('maya_admin');
    return stored ? JSON.parse(stored) : null;
  });
  const [token, setToken] = useState(() => localStorage.getItem('maya_token'));
  const [loading, setLoading] = useState(Boolean(localStorage.getItem('maya_token')));

  useEffect(() => {
    async function loadSession() {
      if (!token) {
        setLoading(false);
        return;
      }

      try {
        const me = await apiRequest('/me');
        setAdmin(me);
        localStorage.setItem('maya_admin', JSON.stringify(me));
      } catch (error) {
        localStorage.removeItem('maya_token');
        localStorage.removeItem('maya_admin');
        setToken(null);
        setAdmin(null);
      } finally {
        setLoading(false);
      }
    }

    loadSession();
  }, [token]);

  const value = useMemo(
    () => ({
      admin,
      token,
      loading,
      async login(username, password) {
        const data = await apiRequest('/login', {
          method: 'POST',
          body: JSON.stringify({ username, password }),
        });
        localStorage.setItem('maya_token', data.token);
        localStorage.setItem('maya_admin', JSON.stringify(data.admin));
        setToken(data.token);
        setAdmin(data.admin);
      },
      logout() {
        localStorage.removeItem('maya_token');
        localStorage.removeItem('maya_admin');
        setToken(null);
        setAdmin(null);
      },
      updateAdmin(nextAdmin) {
        setAdmin(nextAdmin);
        localStorage.setItem('maya_admin', JSON.stringify(nextAdmin));
      },
    }),
    [admin, token, loading],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  return useContext(AuthContext);
}

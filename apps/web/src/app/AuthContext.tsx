import { createContext, ReactNode, useContext, useEffect, useState } from 'react';
import { api } from '../lib/api';
import { AuthUser } from '../types/management';

const STORAGE_KEY = 'cactus-restaurant-auth';

interface AuthContextValue {
  token: string | null;
  user: AuthUser | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [token, setToken] = useState<string | null>(null);
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);

    if (!stored) {
      setLoading(false);
      return;
    }

    const parsed = JSON.parse(stored) as { token: string; user: AuthUser };
    setToken(parsed.token);
    setUser(parsed.user);
    setLoading(false);
  }, []);

  function persist(nextToken: string | null, nextUser: AuthUser | null) {
    setToken(nextToken);
    setUser(nextUser);

    if (nextToken && nextUser) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({ token: nextToken, user: nextUser }));
      return;
    }

    localStorage.removeItem(STORAGE_KEY);
  }

  async function login(email: string, password: string) {
    const result = await api.login(email, password);
    persist(result.accessToken, result.user);
  }

  async function refreshUser() {
    if (!token) {
      return;
    }

    const freshUser = await api.me(token);
    persist(token, freshUser);
  }

  function logout() {
    persist(null, null);
  }

  return (
    <AuthContext.Provider value={{ token, user, loading, login, logout, refreshUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }

  return context;
}

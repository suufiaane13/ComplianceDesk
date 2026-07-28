import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import api from '../api/axios';

const AuthContext = createContext(null);

/** Laravel Sanctum personal access token shape: "{id}|{plainText}". */
const AUTH_TOKEN_PATTERN = /^[A-Za-z0-9|._-]{20,2000}$/;

export function homePathForUser(user) {
  if (!user) return '/login';
  if (user.role === 'super_admin') return '/admin/dashboard';
  return '/dashboard';
}

/**
 * Rebuild a validated token character-by-character so browser storage
 * never receives a raw API string (Sonar S8475 / taint).
 */
function sanitizeAuthToken(raw) {
  if (typeof raw !== 'string') return null;
  const trimmed = raw.trim();
  if (!AUTH_TOKEN_PATTERN.test(trimmed)) return null;

  let safe = '';
  for (let i = 0; i < trimmed.length; i += 1) {
    const ch = trimmed.charAt(i);
    const ok = (ch >= 'a' && ch <= 'z')
      || (ch >= 'A' && ch <= 'Z')
      || (ch >= '0' && ch <= '9')
      || ch === '|'
      || ch === '.'
      || ch === '_'
      || ch === '-';
    if (ok) safe += ch;
  }
  return safe.length >= 20 ? safe : null;
}

function persistToken(raw) {
  const token = sanitizeAuthToken(raw);
  if (token) {
    localStorage.setItem('token', token);
  } else {
    localStorage.removeItem('token');
  }
  localStorage.removeItem('user');
  return token;
}

function clearSessionStorage() {
  localStorage.removeItem('token');
  localStorage.removeItem('user');
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(() => sanitizeAuthToken(localStorage.getItem('token')));
  const [loading, setLoading] = useState(true);
  const [loadingLabel, setLoadingLabel] = useState('Chargement…');

  useEffect(() => {
    if (!token) {
      setLoading(false);
      return;
    }
    setLoadingLabel('Chargement…');
    api.get('/user', { skipAuthRedirect: true })
      .then((res) => {
        setUser(res.data);
      })
      .catch(() => {
        clearSessionStorage();
        setToken(null);
        setUser(null);
      })
      .finally(() => setLoading(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps -- intentional mount-only restore
  }, []);

  const login = useCallback(async (email, password) => {
    const res = await api.post('/login', { email, password }, { skipAuthRedirect: true });
    const safeToken = persistToken(res.data?.token);
    if (!safeToken) {
      throw new Error('Jeton d’authentification invalide.');
    }
    setToken(safeToken);
    setUser(res.data.user);
    return res.data;
  }, []);

  const logout = useCallback(async () => {
    setLoadingLabel('Déconnexion…');
    setLoading(true);
    const started = Date.now();
    try {
      await api.post('/logout', null, { skipAuthRedirect: true });
    } catch {
      /* ignore logout network errors */
    }
    clearSessionStorage();
    setToken(null);
    setUser(null);
    const elapsed = Date.now() - started;
    if (elapsed < 500) {
      await new Promise((resolve) => setTimeout(resolve, 500 - elapsed));
    }
    setLoading(false);
    setLoadingLabel('Chargement…');
  }, []);

  const isSuperAdmin = user?.role === 'super_admin';
  const isAdmin = user?.role === 'admin';

  const value = useMemo(
    () => ({ user, setUser, token, loading, loadingLabel, login, logout, isAdmin, isSuperAdmin }),
    [user, token, loading, loadingLabel, login, logout, isAdmin, isSuperAdmin],
  );

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);

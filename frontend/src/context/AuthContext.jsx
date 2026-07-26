import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { roleHasPermission } from '../constants/permissions';

const AuthContext = createContext(null);

// The backend sends `role` as a nested object ({ id, name, description, createdAt }) from
// every endpoint that returns a user (login, /auth/me, /users/profile) — it never flattens it
// to a string for the client (only server-side req.user does that, internally). Normalize here
// so the rest of the app can treat `user.role` as a plain string everywhere.
function normalizeUser(rawUser) {
  if (!rawUser) return null;
  const roleName = typeof rawUser.role === 'string' ? rawUser.role : rawUser.role?.name || null;
  return { ...rawUser, role: roleName };
}

function readStoredUser() {
  try {
    const raw = localStorage.getItem('user');
    return raw ? normalizeUser(JSON.parse(raw)) : null;
  } catch {
    return null;
  }
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(readStoredUser);
  const [token, setToken] = useState(() => localStorage.getItem('token'));

  useEffect(() => {
    // Picks up login/logout that happen in another tab, or via localStorage.clear() on logout.
    function handleStorage(event) {
      if (event && event.key && !['user', 'token', 'refreshToken'].includes(event.key)) return;
      setUser(readStoredUser());
      setToken(localStorage.getItem('token'));
    }
    window.addEventListener('storage', handleStorage);
    return () => window.removeEventListener('storage', handleStorage);
  }, []);

  const refreshUser = useCallback(() => {
    setUser(readStoredUser());
    setToken(localStorage.getItem('token'));
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem('token');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('user');
    setUser(null);
    setToken(null);
  }, []);

  const role = user?.role || null;

  const hasPermission = useCallback((permission) => roleHasPermission(role, permission), [role]);
  const hasRole = useCallback((...names) => names.includes(role), [role]);
  const isPlatformAdmin = role === 'PlatformAdmin';

  const value = useMemo(
    () => ({
      user,
      token,
      role,
      isAuthenticated: !!token,
      isPlatformAdmin,
      hasPermission,
      hasRole,
      logout,
      refreshUser,
    }),
    [user, token, role, isPlatformAdmin, hasPermission, hasRole, logout, refreshUser]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return ctx;
}

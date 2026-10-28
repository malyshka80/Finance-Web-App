// ============================================================
// src/Context/AuthContext.jsx
// Full JWT implementation: login, register, logout,
// automatic token refresh, and persistent sessions.
// ============================================================

import { createContext, useContext, useState, useEffect, useCallback } from 'react';

const AuthContext = createContext(null);

const BASE_URL = import.meta.env.VITE_API_URL || 'https://finance-web-app-backend-al6j.onrender.com/api';

// ── Token helpers (localStorage) ─────────────────────────────

const saveTokens = (access, refresh) => {
  localStorage.setItem('access_token',  access);
  localStorage.setItem('refresh_token', refresh);
};

const clearTokens = () => {
  localStorage.removeItem('access_token');
  localStorage.removeItem('refresh_token');
  localStorage.removeItem('user');
};

const getAccessToken  = () => localStorage.getItem('access_token');
const getRefreshToken = () => localStorage.getItem('refresh_token');

// ── Decode JWT payload (no verification — just reading) ───────
const decodeToken = (token) => {
  try {
    const payload = token.split('.')[1];
    return JSON.parse(atob(payload));
  } catch {
    return null;
  }
};

// ── Check if access token is expired ─────────────────────────
const isTokenExpired = (token) => {
  const decoded = decodeToken(token);
  if (!decoded || !decoded.exp) return true;
  // Add 10s buffer to avoid edge cases
  return decoded.exp * 1000 < Date.now() + 10_000;
};

// ── API call with automatic token refresh ─────────────────────
const authFetch = async (url, options = {}) => {
  let accessToken = getAccessToken();

  // If access token is expired, try to refresh it silently
  if (accessToken && isTokenExpired(accessToken)) {
    const refreshToken = getRefreshToken();
    if (refreshToken) {
      try {
        const refreshRes = await fetch(`${BASE_URL}/auth/refresh`, {
          method:  'POST',
          headers: { 'Content-Type': 'application/json' },
          body:    JSON.stringify({ refresh_token: refreshToken }),
        });
        if (refreshRes.ok) {
          const data = await refreshRes.json();
          localStorage.setItem('access_token', data.access_token);
          accessToken = data.access_token;
        } else {
          // Refresh token is also expired → force logout
          clearTokens();
          window.location.href = '/login';
          return;
        }
      } catch {
        clearTokens();
        window.location.href = '/login';
        return;
      }
    }
  }

  return fetch(`${BASE_URL}${url}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
      ...options.headers,
    },
  });
};

// ── Provider ──────────────────────────────────────────────────

export function AuthProvider({ children }) {
  const [user,    setUser]    = useState(() => {
    // Restore user from localStorage on page reload
    try {
      const saved = localStorage.getItem('user');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });
  const [loading, setLoading] = useState(true); // true while verifying token on mount

  // ── On mount: verify token is still valid ──
  useEffect(() => {
    const verify = async () => {
      const token = getAccessToken();
      if (!token) {
        setLoading(false);
        return;
      }

      try {
        const res = await authFetch('/auth/me');
        if (res && res.ok) {
          const userData = await res.json();
          setUser(userData);
          localStorage.setItem('user', JSON.stringify(userData));
        } else {
          // Token invalid or expired beyond refresh
          clearTokens();
          setUser(null);
        }
      } catch {
        // Network error — keep existing user data from localStorage
      } finally {
        setLoading(false);
      }
    };

    verify();
  }, []);

  // ── Login ──
  const login = useCallback(async (email, password) => {
    const res = await fetch(`${BASE_URL}/auth/login`, {
      method:  'POST',
      headers: { 'Content-Type': 'application/json' },
      body:    JSON.stringify({ email, password }),
    });

    const data = await res.json();

    if (!res.ok) {
      throw new Error(data.error || 'Connexion échouée');
    }

    saveTokens(data.access_token, data.refresh_token);
    localStorage.setItem('user', JSON.stringify(data.user));
    setUser(data.user);

    return data.user;
  }, []);

  // ── Register ──
  const register = useCallback(async (formData) => {
    const res = await fetch(`${BASE_URL}/auth/register`, {
      method:  'POST',
      headers: { 'Content-Type': 'application/json' },
      body:    JSON.stringify(formData),
    });

    const data = await res.json();

    if (!res.ok) {
      throw new Error(data.error || 'Inscription échouée');
    }

    saveTokens(data.access_token, data.refresh_token);
    localStorage.setItem('user', JSON.stringify(data.user));
    setUser(data.user);

    return data.user;
  }, []);

  // ── Logout ──
  const logout = useCallback(async () => {
    try {
      await authFetch('/auth/logout', { method: 'POST' });
    } catch {
      // Ignore network errors on logout
    } finally {
      clearTokens();
      setUser(null);
    }
  }, []);

  // ── Change password ──
  const changePassword = useCallback(async (oldPassword, newPassword) => {
    const res = await authFetch('/auth/change-password', {
      method: 'PATCH',
      body:   JSON.stringify({
        old_password: oldPassword,
        new_password: newPassword,
      }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Erreur changement de mot de passe');
    return data;
  }, []);

  // ── Update local user state (e.g. after profile edit) ──
  const updateUser = useCallback((updates) => {
    setUser(prev => {
      const updated = { ...prev, ...updates };
      localStorage.setItem('user', JSON.stringify(updated));
      return updated;
    });
  }, []);

  return (
    <AuthContext.Provider value={{
      user,
      loading,
      isAuthenticated: !!user,
      login,
      register,
      logout,
      changePassword,
      updateUser,
      authFetch,  // expose for other components that need authenticated requests
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}

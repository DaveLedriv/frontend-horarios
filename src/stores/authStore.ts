// src/stores/authStore.ts
import { create } from 'zustand';
import axios from 'axios';

interface AuthState {
  token: string | null;
  expires_at: number | null;
  roles: string[];
  isAuthenticated: boolean;
  login: (token: string) => void;
  refresh: () => Promise<void>;
  logout: () => void;
}

let logoutTimer: number | undefined;
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';

function parseJwt(token: string): any {
  try {
    return JSON.parse(atob(token.split('.')[1]));
  } catch {
    return null;
  }
}

function extractRoles(payload: any): string[] {
  if (!payload) {
    return [];
  }

  const candidate =
    payload.roles ?? payload.role ?? payload.scopes ?? payload.scope ?? payload.permissions;

  if (Array.isArray(candidate)) {
    return candidate
      .map((role) => (typeof role === 'string' ? role : String(role)))
      .filter((role) => role.trim().length > 0);
  }

  if (typeof candidate === 'string') {
    return candidate
      .split(/[\s,]+/)
      .map((role) => role.trim())
      .filter((role) => role.length > 0);
  }

  return [];
}

function scheduleLogout(expiresAt: number, logout: () => void) {
  if (logoutTimer) {
    clearTimeout(logoutTimer);
  }
  const timeout = expiresAt - Date.now();
  if (timeout > 0) {
    logoutTimer = window.setTimeout(logout, timeout);
  } else {
    logout();
  }
}

export const useAuthStore = create<AuthState>((set, get) => {
  const storedToken = localStorage.getItem('token');
  const storedExpires = localStorage.getItem('expires_at');
  const expiresAt = storedExpires ? parseInt(storedExpires, 10) : null;
  const payload = storedToken ? parseJwt(storedToken) : null;
  const isValid = !!storedToken && !!expiresAt && expiresAt > Date.now();
  const initialRoles = isValid && payload ? extractRoles(payload) : [];

  if (isValid && expiresAt) {
    scheduleLogout(expiresAt, () => get().logout());
  } else {
    localStorage.removeItem('token');
    localStorage.removeItem('expires_at');
  }

  return {
    token: isValid ? storedToken : null,
    expires_at: isValid ? expiresAt : null,
    roles: initialRoles,
    isAuthenticated: isValid,
    login: (token: string) => {
      const payload = parseJwt(token);
      const exp = payload?.exp ? payload.exp * 1000 : Date.now();
      const roles = extractRoles(payload);
      localStorage.setItem('token', token);
      localStorage.setItem('expires_at', String(exp));
      scheduleLogout(exp, () => get().logout());
      set({ token, expires_at: exp, isAuthenticated: true, roles });
    },
    refresh: async () => {
      try {
        const response = await axios.post(`${API_BASE_URL}/auth/refresh`, null, { withCredentials: true });
        const newToken = response.data.access_token;
        if (newToken) {
          get().login(newToken);
        } else {
          throw new Error('No token returned');
        }
      } catch (err) {
        get().logout();
        throw err;
      }
    },
    logout: () => {
      localStorage.removeItem('token');
      localStorage.removeItem('expires_at');
      if (logoutTimer) {
        clearTimeout(logoutTimer);
      }
      set({ token: null, expires_at: null, isAuthenticated: false, roles: [] });
    },
  };
});



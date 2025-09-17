// src/stores/authStore.ts
import { create } from 'zustand';

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

function decodeBase64Url(input: string): string | null {
  try {
    const normalized = input.replace(/-/g, '+').replace(/_/g, '/');
    const paddingNeeded = (4 - (normalized.length % 4)) % 4;
    const padded = normalized + '='.repeat(paddingNeeded);
    return atob(padded);
  } catch {
    return null;
  }
}

function parseJwt(token: string): any {
  try {
    const [, payloadPart] = token.split('.');
    if (!payloadPart) {
      return null;
    }
    const decoded = decodeBase64Url(payloadPart);
    return decoded ? JSON.parse(decoded) : null;
  } catch {
    return null;
  }
}

const rolePrefixRegex = /^(?:role|roles|scope|scopes|permission|permissions|authority|authorities)[\s:/_-]*/i;

function normalizeRoleValue(value: string): string | null {
  const trimmed = value.trim();
  if (!trimmed) {
    return null;
  }

  const lower = trimmed.toLowerCase();
  const withoutPrefix = lower.replace(rolePrefixRegex, '');
  const normalized = withoutPrefix.trim() || lower;

  return normalized || null;
}

function collectRolesFromValue(value: unknown): string[] {
  if (value == null) {
    return [];
  }

  if (typeof value === 'string') {
    return value
      .split(/[\s,]+/)
      .map(normalizeRoleValue)
      .filter((role): role is string => !!role);
  }

  if (typeof value === 'number') {
    const normalized = normalizeRoleValue(String(value));
    return normalized ? [normalized] : [];
  }

  if (Array.isArray(value)) {
    return value.flatMap((item) => collectRolesFromValue(item));
  }

  if (typeof value === 'object') {
    const record = value as Record<string, unknown>;
    const potentialKeys = ['name', 'role', 'authority', 'value', 'permission', 'code', 'id'];
    return potentialKeys.flatMap((key) => collectRolesFromValue(record[key]));
  }

  return [];
}

function extractRoles(payload: any): string[] {
  if (!payload) {
    return [];
  }

  const candidate =
    payload.roles ??
    payload.role ??
    payload.scopes ??
    payload.scope ??
    payload.permissions ??
    payload.authorities;

  const roles = Array.isArray(candidate)
    ? candidate.flatMap((item) => collectRolesFromValue(item))
    : collectRolesFromValue(candidate);

  return Array.from(new Set(roles));
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
      get().logout();
      throw new Error('Refresh token no disponible en el cliente');
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



import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { render, screen, fireEvent, waitFor, cleanup } from '@testing-library/react';
import type { NavigateFunction } from 'react-router-dom';
import Login from './Login';
import { loginUser } from '../services/authService';
import { useAuthStore } from '../stores/authStore';

const navigateMock = vi.fn<Parameters<NavigateFunction>, ReturnType<NavigateFunction>>();

vi.mock('react-router-dom', () => ({
  useNavigate: () => navigateMock,
}));

vi.mock('../services/authService', () => ({
  loginUser: vi.fn(),
}));

vi.mock('../stores/authStore', () => {
  type AuthStoreState = {
    token: string | null;
    expires_at: number | null;
    roles: string[];
    isAuthenticated: boolean;
    login: (token: string) => void;
    refresh: () => Promise<void>;
    logout: () => void;
  };

  const refresh = vi.fn(async () => {});
  let state: AuthStoreState;

  const decodePayload = (token: string) => {
    try {
      const [, payloadPart] = token.split('.');
      if (!payloadPart) {
        return {};
      }
      const normalized = payloadPart.replace(/-/g, '+').replace(/_/g, '/');
      const padding = (4 - (normalized.length % 4)) % 4;
      const base64 = normalized + '='.repeat(padding);
      return JSON.parse(atob(base64));
    } catch {
      return {};
    }
  };

  let loginFn: (token: string) => void;
  let logoutFn: () => void;

  const updateState = (partial: Partial<AuthStoreState>) => {
    state = {
      ...state,
      ...partial,
      login: loginFn,
      refresh,
      logout: logoutFn,
    };
  };

  loginFn = vi.fn((token: string) => {
    const payload = decodePayload(token);
    const rolesData = Array.isArray(payload?.roles)
      ? payload.roles
      : payload?.roles != null
      ? [payload.roles]
      : [];
    const normalizedRoles = rolesData.map((role: unknown) =>
      typeof role === 'string' ? role.toLowerCase() : String(role).toLowerCase(),
    );

    updateState({
      token,
      expires_at: typeof payload?.exp === 'number' ? payload.exp * 1000 : null,
      roles: normalizedRoles,
      isAuthenticated: true,
    });
  });

  logoutFn = vi.fn(() => {
    updateState({
      token: null,
      expires_at: null,
      roles: [],
      isAuthenticated: false,
    });
  });

  state = {
    token: null,
    expires_at: null,
    roles: [],
    isAuthenticated: false,
    login: loginFn,
    refresh,
    logout: logoutFn,
  };

  const getState = () => state;

  const setState = (partial: Partial<AuthStoreState>) => {
    updateState(partial);
    return state;
  };

  const useAuthStoreMock = Object.assign(
    (selector?: (store: AuthStoreState) => unknown) => {
      const currentState = getState();
      return selector ? selector(currentState) : currentState;
    },
    {
      getState,
      setState,
    },
  );

  return { useAuthStore: useAuthStoreMock };
});

function createToken(roles: string[]) {
  const encode = (payload: unknown) =>
    btoa(JSON.stringify(payload))
      .replace(/\+/g, '-')
      .replace(/\//g, '_')
      .replace(/=+$/, '');

  const header = encode({ alg: 'HS256', typ: 'JWT' });
  const payload = encode({
    exp: Math.floor(Date.now() / 1000) + 3600,
    roles,
  });

  return `${header}.${payload}.signature`;
}

function renderLoginPage() {
  render(<Login />);
}

describe('Login navigation', () => {
  const loginUserMock = vi.mocked(loginUser);

  beforeEach(() => {
    navigateMock.mockReset();
    loginUserMock.mockReset();
    localStorage.clear();
    useAuthStore.setState({
      token: null,
      expires_at: null,
      isAuthenticated: false,
      roles: [],
    });
  });

  afterEach(() => {
    useAuthStore.getState().logout();
    cleanup();
  });

  it('redirects admin users to the dashboard', async () => {
    loginUserMock.mockResolvedValue({
      access_token: createToken(['admin']),
      token_type: 'bearer',
    });

    renderLoginPage();

    fireEvent.change(screen.getByLabelText(/usuario/i), {
      target: { value: 'adminUser' },
    });
    fireEvent.change(screen.getByLabelText(/contraseña/i), {
      target: { value: 'password' },
    });
    fireEvent.click(screen.getByRole('button', { name: /iniciar sesión/i }));

    await waitFor(() => {
      expect(navigateMock).toHaveBeenCalledWith('/dashboard');
    });
  });

  it('redirects non-admin users to horarios', async () => {
    loginUserMock.mockResolvedValue({
      access_token: createToken(['user']),
      token_type: 'bearer',
    });

    renderLoginPage();

    fireEvent.change(screen.getByLabelText(/usuario/i), {
      target: { value: 'regularUser' },
    });
    fireEvent.change(screen.getByLabelText(/contraseña/i), {
      target: { value: 'password' },
    });
    fireEvent.click(screen.getByRole('button', { name: /iniciar sesión/i }));

    await waitFor(() => {
      expect(navigateMock).toHaveBeenCalledWith('/horarios');
    });
  });
});

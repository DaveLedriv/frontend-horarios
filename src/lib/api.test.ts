import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import api from './api';
import { useAuthStore } from '../stores/authStore';

const originalLocation = window.location;
const responseInterceptor = (api.interceptors.response as any).handlers[0].rejected as (
  error: unknown,
) => Promise<unknown>;

let replaceSpy: ReturnType<typeof vi.fn>;

beforeEach(() => {
  replaceSpy = vi.fn();
  Object.defineProperty(window, 'location', {
    configurable: true,
    value: {
      assign: vi.fn(),
      reload: vi.fn(),
      replace: replaceSpy,
      href: 'http://localhost/horarios',
      ancestorOrigins: originalLocation.ancestorOrigins,
      origin: 'http://localhost',
      protocol: 'http:',
      host: 'localhost',
      hostname: 'localhost',
      port: '',
      pathname: '/horarios',
      search: '',
      hash: '',
      toString() {
        return this.href;
      },
    } as Location,
  });
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
  Object.defineProperty(window, 'location', {
    configurable: true,
    value: originalLocation,
  });
});

describe('api interceptor 401 handling', () => {
  it('clears the session and redirects to login when the user was authenticated', async () => {
    useAuthStore.setState({
      token: 'test-token',
      expires_at: Date.now() + 60_000,
      isAuthenticated: true,
      roles: ['user'],
    });

    await expect(
      responseInterceptor({
        response: {
          status: 401,
          data: {},
        },
        config: {
          method: 'get',
          url: '/protected',
        },
      }),
    ).rejects.toMatchObject({
      message: 'Tu sesión ha expirado. Vuelve a iniciar sesión.',
      status: 401,
    });

    const state = useAuthStore.getState();
    expect(state.isAuthenticated).toBe(false);
    expect(state.token).toBeNull();
    expect(replaceSpy).toHaveBeenCalledWith('/');
  });

  it('propagates backend errors without redirect when not authenticated', async () => {
    (window.location as Location).pathname = '/';

    await expect(
      responseInterceptor({
        response: {
          status: 401,
          data: { message: 'Credenciales inválidas' },
        },
        config: {
          method: 'post',
          url: '/auth/token',
        },
      }),
    ).rejects.toMatchObject({
      message: 'Credenciales inválidas',
      status: 401,
    });

    expect(useAuthStore.getState().isAuthenticated).toBe(false);
    expect(replaceSpy).not.toHaveBeenCalled();
  });
});

import api from '../lib/api';

export interface LoginCredentials {
  username: string;
  password: string;
}

export interface LoginResponse {
  access_token: string;
  token_type: string;
}

export async function loginUser(credentials: LoginCredentials): Promise<LoginResponse> {
  const params = new URLSearchParams();
  params.append('username', credentials.username);
  params.append('password', credentials.password);

  const response = await api.post('/auth/token', params, {
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
  });

  return response.data;
}

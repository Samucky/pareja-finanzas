import Constants from 'expo-constants';
import type { AuthResponse, Dashboard, User, ExpenseCategory } from '../types';
import { getAccessToken, getRefreshToken, saveTokens } from './authStorage';

const API_URL =
  process.env.EXPO_PUBLIC_API_URL ??
  (Constants.expoConfig?.extra?.apiUrl as string) ??
  'http://192.168.1.100:4000';

async function request<T>(
  path: string,
  options: RequestInit = {},
  retry = true
): Promise<T> {
  const token = await getAccessToken();
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string>),
  };
  if (token) headers.Authorization = `Bearer ${token}`;

  const res = await fetch(`${API_URL}${path}`, { ...options, headers });
  if (res.status === 401 && retry) {
    const refreshed = await refreshAccessToken();
    if (refreshed) return request<T>(path, options, false);
  }
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error((data as { error?: string }).error ?? 'Error de red');
  return data as T;
}

async function refreshAccessToken(): Promise<boolean> {
  const refresh = await getRefreshToken();
  if (!refresh) return false;
  try {
    const data = await fetch(`${API_URL}/api/auth/refresh`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ refreshToken: refresh }),
    }).then((r) => r.json());
    if (!data.accessToken) return false;
    await saveTokens(data.accessToken, data.refreshToken);
    return true;
  } catch {
    return false;
  }
}

export const api = {
  register: (body: { email: string; password: string; displayName: string }) =>
    request<AuthResponse>('/api/auth/register', { method: 'POST', body: JSON.stringify(body) }),

  login: (body: { email: string; password: string }) =>
    request<AuthResponse>('/api/auth/login', { method: 'POST', body: JSON.stringify(body) }),

  me: () => request<User>('/api/auth/me'),

  createCouple: (name?: string) =>
    request<
      AuthResponse & {
        couple: { id: string; name: string; inviteCode: string; inviteExpiresAt?: string };
      }
    >(
      '/api/couples/create',
      { method: 'POST', body: JSON.stringify({ name }) }
    ),

  joinCouple: (code: string) =>
    request<AuthResponse & { couple: { id: string; name: string; inviteCode: string } }>(
      '/api/couples/join',
      { method: 'POST', body: JSON.stringify({ code: code.toUpperCase() }) }
    ),

  getDashboard: () => request<Dashboard>('/api/dashboard'),

  createTransaction: (body: {
    type: 'income' | 'expense';
    amount: number;
    category?: ExpenseCategory;
    note?: string;
    paidBy?: string;
  }) =>
    request<{ transaction: unknown; dashboard: Dashboard }>('/api/transactions', {
      method: 'POST',
      body: JSON.stringify(body),
    }),

  savingsMovement: (body: { type: 'deposit' | 'withdraw'; amount: number; note?: string }) =>
    request<{ movement: unknown; dashboard: Dashboard }>('/api/savings/movement', {
      method: 'POST',
      body: JSON.stringify(body),
    }),
};

export function getApiUrl(): string {
  return API_URL;
}

import type { User, GameSession, SessionPlayer, Transaction, AnalyticsData } from './types';

const API_URL = import.meta.env.VITE_API_URL || '';

class ApiError extends Error {
  constructor(public status: number, message: string) {
    super(message);
    this.name = 'ApiError';
  }
}

async function fetchApi<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const token = localStorage.getItem('token');
  
  const response = await fetch(`${API_URL}/api${endpoint}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(token && { Authorization: `Bearer ${token}` }),
      ...options.headers,
    },
  });

  const data = await response.json();

  if (!response.ok) {
    throw new ApiError(response.status, data.error || 'Something went wrong');
  }

  return data;
}

// Auth API
export const authApi = {
  register: (email: string, username: string, password: string) =>
    fetchApi<{ token: string; user: User }>('/auth/register', {
      method: 'POST',
      body: JSON.stringify({ email, username, password }),
    }),

  login: (email: string, password: string) =>
    fetchApi<{ token: string; user: User }>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    }),

  getMe: () =>
    fetchApi<{ user: User }>('/auth/me'),

  updateProfile: (data: { username?: string; avatar_url?: string }) =>
    fetchApi<{ user: User }>('/auth/profile', {
      method: 'PUT',
      body: JSON.stringify(data),
    }),
};

// Sessions API
export const sessionsApi = {
  getAll: () =>
    fetchApi<{ sessions: GameSession[] }>('/sessions'),

  getById: (id: string) =>
    fetchApi<{ session: GameSession; players: SessionPlayer[] }>(`/sessions/${id}`),

  create: (name: string) =>
    fetchApi<{ session: GameSession }>('/sessions', {
      method: 'POST',
      body: JSON.stringify({ name }),
    }),

  join: (joinCode: string) =>
    fetchApi<{ session: GameSession }>('/sessions/join', {
      method: 'POST',
      body: JSON.stringify({ joinCode }),
    }),

  close: (id: string) =>
    fetchApi<void>(`/sessions/${id}/close`, {
      method: 'POST',
    }),

  transferAdmin: (id: string, newAdminId: string) =>
    fetchApi<void>(`/sessions/${id}/transfer-admin`, {
      method: 'POST',
      body: JSON.stringify({ newAdminId }),
    }),
};

// Transactions API
export const transactionsApi = {
  requestBuyIn: (sessionId: string, amount: number) =>
    fetchApi<{ transaction: Transaction }>('/transactions/buyin', {
      method: 'POST',
      body: JSON.stringify({ sessionId, amount }),
    }),

  approve: (id: string) =>
    fetchApi<void>(`/transactions/${id}/approve`, {
      method: 'POST',
    }),

  reject: (id: string) =>
    fetchApi<void>(`/transactions/${id}/reject`, {
      method: 'POST',
    }),

  cashOut: (sessionId: string, amount: number) =>
    fetchApi<{ profit: number }>('/transactions/cashout', {
      method: 'POST',
      body: JSON.stringify({ sessionId, amount }),
    }),

  getPending: (sessionId: string) =>
    fetchApi<{ transactions: Transaction[] }>(`/transactions/session/${sessionId}/pending`),

  getMyTransactions: () =>
    fetchApi<{ transactions: Transaction[] }>('/transactions/my-transactions'),

  getAnalytics: () =>
    fetchApi<AnalyticsData>('/transactions/analytics'),
};

export { ApiError };

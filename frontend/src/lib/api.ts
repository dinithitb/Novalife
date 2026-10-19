const API_BASE = (import.meta as any).env?.VITE_API_URL || 'http://localhost:3000';
const TOKEN_KEY = 'novalife_token';

type HttpMethod = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';

async function request<T>(path: string, method: HttpMethod, body?: unknown): Promise<T> {
  const token = localStorage.getItem(TOKEN_KEY);

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const res = await fetch(`${API_BASE}${path}`, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  });

  // If the server returns 401, token is invalid — clear it so user gets redirected
  if (res.status === 401) {
    localStorage.removeItem(TOKEN_KEY);
    window.location.href = '/login';
    throw new Error('Session expired. Please log in again.');
  }

  if (!res.ok) {
    let message = `Request failed (${res.status})`;
    try {
      const data = await res.json();
      message = data?.error || data?.message || message;
    } catch {
      // ignore
    }
    throw new Error(message);
  }

  // 204 No Content
  if (res.status === 204) return undefined as T;

  return res.json() as Promise<T>;
}

export const api = {
  get: <T,>(path: string) => request<T>(path, 'GET'),
  post: <T,>(path: string, body?: unknown) => request<T>(path, 'POST', body),
  put: <T,>(path: string, body?: unknown) => request<T>(path, 'PUT', body),
  patch: <T,>(path: string, body?: unknown) => request<T>(path, 'PATCH', body),
  del: <T,>(path: string) => request<T>(path, 'DELETE'),
};

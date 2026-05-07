'use client';

const TOKEN_KEY = 'fb-gpswox-token';

export function setToken(t: string) {
  localStorage.setItem(TOKEN_KEY, t);
}

export function getToken(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem(TOKEN_KEY);
}

export function clearToken() {
  localStorage.removeItem(TOKEN_KEY);
}

export async function api<T = unknown>(
  path: string,
  init?: RequestInit,
): Promise<T> {
  const headers = new Headers(init?.headers);
  const token = getToken();
  if (token) headers.set('authorization', `Bearer ${token}`);
  if (init?.body && !headers.has('content-type')) {
    headers.set('content-type', 'application/json');
  }
  const res = await fetch(`/api${path}`, { ...init, headers });
  // 401 on an authenticated call means the session expired — bounce to login.
  // 401 on an unauthenticated call (e.g. login itself) is just a failure to surface.
  if (res.status === 401 && token) {
    clearToken();
    if (typeof window !== 'undefined') window.location.href = '/login';
    throw new Error('unauthorized');
  }
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.error ?? `HTTP ${res.status}`);
  }
  return res.json() as Promise<T>;
}

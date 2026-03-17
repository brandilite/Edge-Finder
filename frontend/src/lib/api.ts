const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

export class ApiError extends Error {
  status: number;
  constructor(message: string, status: number) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
  }
}

async function fetchApi<T>(path: string, options?: RequestInit): Promise<T> {
  const url = `${API_URL}/api${path}`;
  const res = await fetch(url, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options?.headers,
    },
  });

  if (!res.ok) {
    const errorBody = await res.text().catch(() => 'Unknown error');
    throw new ApiError(`API error ${res.status}: ${errorBody}`, res.status);
  }

  return res.json() as Promise<T>;
}

export function apiGet<T>(path: string): Promise<T> {
  return fetchApi<T>(path, { method: 'GET' });
}

export function apiPost<T>(path: string, body: unknown): Promise<T> {
  return fetchApi<T>(path, {
    method: 'POST',
    body: JSON.stringify(body),
  });
}

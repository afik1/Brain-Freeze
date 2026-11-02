/**
 * Lightweight API client.
 *
 * Base URL is configured via the VITE_API_URL environment variable.
 * All requests are made with fetch. Errors from the API are thrown
 * as plain Error objects with the API's error message attached.
 */

const BASE_URL = import.meta.env.VITE_API_URL ?? "http://localhost:3001";

interface ApiErrorBody {
  error: { code: string; message: string };
}

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${BASE_URL}${path}`, {
    headers: { "Content-Type": "application/json" },
    ...init,
  });

  if (!res.ok) {
    const body = (await res.json().catch(() => null)) as ApiErrorBody | null;
    const message = body?.error?.message ?? `HTTP ${res.status}`;
    const err = new Error(message) as Error & { code?: string; status?: number };
    err.code = body?.error?.code;
    err.status = res.status;
    throw err;
  }

  return res.json() as Promise<T>;
}

export const api = {
  get<T>(path: string): Promise<T> {
    return request<T>(path);
  },
  post<T>(path: string, body: unknown): Promise<T> {
    return request<T>(path, {
      method: "POST",
      body: JSON.stringify(body),
    });
  },
};

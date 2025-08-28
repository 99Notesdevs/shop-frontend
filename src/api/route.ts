import { env } from "../config/env";

const BASE_URL = env.API;

const defaultHeaders: HeadersInit = {
  "Content-Type": "application/json",
  "x-auth-type": "Admin"
};

async function request<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const res = await fetch(`${BASE_URL}${endpoint}`, {
    ...options,
    credentials: "include",
    headers: {
      ...defaultHeaders,
      ...(options.headers || {}),
    },
  });

  if (!res.ok) {
    const error = await res.text();
    throw new Error(error || res.statusText);
  }
  
  // For 204 No Content responses (common with DELETE), return empty object as T
  if (res.status === 204) {
    return {} as T;
  }
  
  // Only try to parse as JSON if there's content
  const text = await res.text();
  return text ? (JSON.parse(text) as T) : ({} as T);
}

export const api = {
  get: <T>(endpoint: string, headers?: HeadersInit) =>
    request<T>(endpoint, { method: "GET", headers }),

  post: <T>(endpoint: string, body?: unknown, headers?: HeadersInit) =>
    request<T>(endpoint, {
      method: "POST",
      body: JSON.stringify(body),
      headers,
    }),

  put: <T>(endpoint: string, body?: unknown, headers?: HeadersInit) =>
    request<T>(endpoint, {
      method: "PUT",
      body: JSON.stringify(body),
      headers,
    }),

  delete: <T>(endpoint: string, headers?: HeadersInit) =>
    request<T>(endpoint, { method: "DELETE", body: "", headers }),
};

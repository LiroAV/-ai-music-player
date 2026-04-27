const API_URL = process.env['NEXT_PUBLIC_API_URL'] ?? 'http://localhost:3001'

async function request<T>(path: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${API_URL}/api${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options?.headers,
    },
  })

  if (!res.ok) {
    const error = await res.json().catch(() => ({ message: res.statusText }))
    throw new Error(error.message ?? 'API error')
  }

  return res.json() as Promise<T>
}

export const api = {
  get: <T>(path: string, token?: string) =>
    request<T>(path, token ? { headers: { Authorization: `Bearer ${token}` } } : undefined),

  post: <T>(path: string, body: unknown, token?: string) =>
    request<T>(path, {
      method: 'POST',
      body: JSON.stringify(body),
      headers: token ? { Authorization: `Bearer ${token}` } : undefined,
    }),

  delete: <T>(path: string, token?: string) =>
    request<T>(path, {
      method: 'DELETE',
      headers: token ? { Authorization: `Bearer ${token}` } : undefined,
    }),
}

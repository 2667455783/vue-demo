export function parseBody<T = Record<string, unknown>>(data: unknown): T {
  if (typeof data === 'string') {
    try {
      return JSON.parse(data) as T
    } catch {
      return {} as T
    }
  }
  return (data ?? {}) as T
}

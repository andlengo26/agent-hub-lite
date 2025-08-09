/**
 * Safely parse a JSON string. Returns null on failure.
 */
export function safeParseJSON<T = any>(raw: string | null): T | null {
  if (!raw) return null;
  try {
    return JSON.parse(raw) as T;
  } catch {
    return null;
  }
}

const DEFAULT_TIMEOUT_MS = 6000;

export type HttpResult<T> = { reached: true; status: number; data: T } | { reached: false };

// "reached: false" means a network error or timeout — we never got a
// response at all. "reached: true" means the server answered, whatever the
// status code; callers interpret status themselves (e.g. openFDA uses a
// real HTTP 404 to mean "no matching label", not a failure).
export async function fetchJson<T>(url: string, timeoutMs = DEFAULT_TIMEOUT_MS): Promise<HttpResult<T>> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const response = await fetch(url, { signal: controller.signal });
    const data = (await response.json()) as T;
    return { reached: true, status: response.status, data };
  } catch {
    return { reached: false };
  } finally {
    clearTimeout(timer);
  }
}

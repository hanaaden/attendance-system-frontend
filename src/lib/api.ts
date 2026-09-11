const BASE_URL = import.meta.env.VITE_API_URL;

if (!BASE_URL) {
  // Surfaced in the console rather than thrown, so the login screen can
  // still render a friendly message.
  console.warn(
    'VITE_API_URL is not set. Copy .env.example to .env and paste your Apps Script /exec URL.'
  );
}

export interface ApiResult<T = Record<string, unknown>> {
  status: 'success' | 'error';
  message?: string;
  [key: string]: unknown;
}

type Params = Record<string, string | number | undefined | null>;

function toQueryString(params: Params): string {
  const search = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') {
      search.set(key, String(value));
    }
  });
  return search.toString();
}

async function request<T>(url: string, init?: RequestInit): Promise<T> {
  let response: Response;
  try {
    response = await fetch(url, init);
  } catch (err) {
    throw new Error(
      'Could not reach the attendance server. Check VITE_API_URL and your connection.'
    );
  }

  const data = (await response.json()) as ApiResult<T>;

  if (data.status === 'error') {
    throw new Error(data.message || 'The server rejected the request.');
  }

  return data as T;
}

/**
 * GET requests map 1:1 to the `action` switch in doGet().
 */
export function apiGet<T>(action: string, params: Params = {}): Promise<T> {
  const qs = toQueryString({ action, ...params });
  return request<T>(`${BASE_URL}?${qs}`);
}

/**
 * POST requests map to the `action` switch in doPost(). The payload is sent
 * as a application/x-www-form-urlencoded body (payload=<json>), which
 * Apps Script parses via e.parameter.payload and which browsers treat as a
 * "simple request" — no CORS preflight, so no extra deployment config needed.
 */
export function apiPost<T>(
  action: string,
  payload: Record<string, unknown> = {}
): Promise<T> {
  const body = new URLSearchParams({
    action,
    payload: JSON.stringify(payload)
  });

  return request<T>(`${BASE_URL}?action=${action}`, {
    method: 'POST',
    body
  });
}

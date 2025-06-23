/**
 * Gets the base URL for API requests.
 * - In development: points to the local backend (e.g., http://localhost:3001)
 * - In production: uses the frontend's origin (e.g., https://example.com)
 */
export const getApiBaseUrl = (): string => {
  return process.env.NODE_ENV === "development"
    ? "http://localhost:3001"
    : window.location.origin;
};

/**
 * Returns a full absolute URL for API requests (e.g., for redirects like Google OAuth).
 * - In development: prepends `/api` to the path
 * - In production: assumes your backend is already served under `/api`
 *
 * @param path - API path (e.g., "/auth/google" or "auth/google")
 * @returns Fully-qualified URL (e.g., "http://localhost:3001/api/auth/google")
 */
export const getFullApiUrl = (path: string): string => {
  const normalizedPath = path.startsWith("/") ? path : `/${path}`;
  const base = getApiBaseUrl();

  return process.env.NODE_ENV === "development"
    ? `${base}/api${normalizedPath}`
    : `${base}${normalizedPath}`; // already assumed to be under /api
};

/**
 * Returns a relative URL for use in fetch, axios, etc.
 * Always prepends `/api`, regardless of environment.
 *
 * Example:
 *   getRelativeApiUrl("/auth/refresh") => "/api/auth/refresh"
 *
 * @param path - API path (e.g., "/auth/refresh" or "auth/refresh")
 * @returns Relative API path
 */
export const getRelativeApiUrl = (path: string): string => {
  const normalizedPath = path.startsWith("/") ? path : `/${path}`;
  return `/api${normalizedPath}`;
};

/**
 * Returns the WebSocket URL for GraphQL subscriptions or other sockets.
 * - Uses REACT_APP_WS_URL if defined (e.g., wss://yourdomain.com/api)
 * - In development: defaults to ws://localhost:3001/api
 * - In production: assumes wss://yourdomain.com/api
 *
 * @returns Full WebSocket URL
 */
export const getWebSocketUrl = (): string => {
  if (process.env.REACT_APP_WS_URL) return process.env.REACT_APP_WS_URL;

  const protocol = window.location.protocol === "https:" ? "wss:" : "ws:";
  const host =
    process.env.NODE_ENV === "development"
      ? "localhost:3001"
      : window.location.host;

  return `${protocol}//${host}/api`;
};

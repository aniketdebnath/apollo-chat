/**
 * Gets the base URL for API requests that require full URLs (like redirects)
 * In development, this points to the backend server
 * In production, it uses the current origin (assuming frontend and backend are on the same domain)
 */
export const getApiBaseUrl = (): string => {
  return process.env.NODE_ENV === "development"
    ? "http://localhost:3001"
    : window.location.origin;
};

/**
 * Gets the full URL for an API endpoint that requires a complete URL (like redirects)
 * @param path - The API path (should start with /)
 */
export const getFullApiUrl = (path: string): string => {
  return `${getApiBaseUrl()}${path.startsWith("/") ? path : `/${path}`}`;
};

/**
 * Gets the relative URL for an API endpoint that works with the proxy in development
 * @param path - The API path (should start with /)
 */
export const getRelativeApiUrl = (path: string): string => {
  return `/api${path.startsWith("/") ? path : `/${path}`}`;
};

// Track if a refresh is already in progress
let isRefreshing = false;
let refreshPromise: Promise<boolean> | null = null;

/**
 * Attempts to refresh the access token using the refresh token cookie
 * @returns Promise that resolves to true if refresh was successful, false otherwise
 */
export const refreshAccessToken = async (): Promise<boolean> => {
  // If already refreshing, return the existing promise
  if (isRefreshing) {
    return refreshPromise!;
  }

  isRefreshing = true;

  // Create a new promise for this refresh attempt
  refreshPromise = new Promise<boolean>(async (resolve) => {
    try {
      const response = await fetch("/api/auth/refresh", {
        method: "POST",
        credentials: "include", // Important: include cookies
        headers: {
          "Content-Type": "application/json",
        },
      });

      // Reset the refreshing state
      isRefreshing = false;

      // Return true if refresh was successful
      resolve(response.ok);
    } catch (error) {
      isRefreshing = false;
      resolve(false);
    }
  });

  return refreshPromise;
};

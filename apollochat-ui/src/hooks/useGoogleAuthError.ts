import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import { snackVar } from "../constants/snack";

/**
 * Hook to check for Google OAuth error parameters in the URL
 * and display appropriate error messages
 */
export const useGoogleAuthError = () => {
  const [error, setError] = useState<string | null>(null);
  const location = useLocation();

  useEffect(() => {
    // Parse query parameters from URL
    const params = new URLSearchParams(location.search);
    const errorParam = params.get("error");

    if (errorParam) {
      let errorMessage = "Authentication failed";

      // Handle specific error cases
      switch (errorParam) {
        case "no_user":
          errorMessage = "No user information received from Google";
          break;
        case "authentication_failed":
          errorMessage = "Google authentication failed";
          break;
        default:
          errorMessage = `Authentication error: ${errorParam}`;
      }

      setError(errorMessage);

      // Show error in snackbar
      snackVar({
        message: errorMessage,
        type: "error",
      });

      // Clean up the URL by removing the error parameter
      const cleanUrl = location.pathname;
      window.history.replaceState({}, document.title, cleanUrl);
    }
  }, [location]);

  return { error };
};

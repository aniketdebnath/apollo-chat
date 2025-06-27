import { useState } from "react";
import client from "../constants/apollo-client";
import { UNKNOWN_ERROR_MESSAGE } from "../constants/error";
import { authenticatedVar } from "../constants/authenticated";
import { getRelativeApiUrl } from "../utils/api-url";

interface LoginRequest {
  email: string;
  password: string;
}

const useLogin = () => {
  const [error, setError] = useState<string>();

  const login = async (request: LoginRequest) => {
    try {
      // Make sure we're using the correct API URL
      const loginUrl = getRelativeApiUrl("/auth/login");

      const res = await fetch(loginUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(request),
        credentials: "include",
      });

      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        if (res.status === 401) {
          setError("Credentials are not valid.");
        } else {
          setError(data.message || UNKNOWN_ERROR_MESSAGE);
        }
        return;
      }

      // Clear any previous errors
      setError("");

      // Set authenticated state
      authenticatedVar(true);

      // Refetch active queries to update the UI
      await client.refetchQueries({ include: "active" });
    } catch (error) {
      setError(error instanceof Error ? error.message : UNKNOWN_ERROR_MESSAGE);
    }
  };

  // Special function for demo login
  const demoLogin = async () => {
    try {
      // Use the special demo login endpoint
      const demoLoginUrl = getRelativeApiUrl("/auth/demo-login");

      const res = await fetch(demoLoginUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
      });

      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        setError(data.message || UNKNOWN_ERROR_MESSAGE);
        return;
      }

      // Clear any previous errors
      setError("");

      // Set authenticated state
      authenticatedVar(true);

      // Refetch active queries to update the UI
      await client.refetchQueries({ include: "active" });
    } catch (error) {
      setError(error instanceof Error ? error.message : UNKNOWN_ERROR_MESSAGE);
    }
  };

  return { login, demoLogin, error };
};

export { useLogin };

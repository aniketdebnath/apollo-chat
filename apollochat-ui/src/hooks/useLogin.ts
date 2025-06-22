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
      console.log("Attempting login with:", request.email);

      // Make sure we're using the correct API URL
      const loginUrl = getRelativeApiUrl("/auth/login");
      console.log("Login URL:", loginUrl);

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
        console.error("Login failed:", res.status, data);
        if (res.status === 401) {
          setError("Credentials are not valid.");
        } else {
          setError(data.message || UNKNOWN_ERROR_MESSAGE);
        }
        return;
      }

      console.log("Login successful");

      // Clear any previous errors
      setError("");

      // Set authenticated state
      authenticatedVar(true);

      // Refetch active queries to update the UI
      await client.refetchQueries({ include: "active" });
    } catch (error) {
      console.error("Login error:", error);
      setError(error instanceof Error ? error.message : UNKNOWN_ERROR_MESSAGE);
    }
  };

  // Special function for demo login
  const demoLogin = async () => {
    try {
      console.log("Attempting demo login");

      // Use the special demo login endpoint
      const demoLoginUrl = getRelativeApiUrl("/auth/demo-login");
      console.log("Demo Login URL:", demoLoginUrl);

      const res = await fetch(demoLoginUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
      });

      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        console.error("Demo login failed:", res.status, data);
        setError(data.message || UNKNOWN_ERROR_MESSAGE);
        return;
      }

      console.log("Demo login successful");

      // Clear any previous errors
      setError("");

      // Set authenticated state
      authenticatedVar(true);

      // Refetch active queries to update the UI
      await client.refetchQueries({ include: "active" });
    } catch (error) {
      console.error("Demo login error:", error);
      setError(error instanceof Error ? error.message : UNKNOWN_ERROR_MESSAGE);
    }
  };

  return { login, demoLogin, error };
};

export { useLogin };

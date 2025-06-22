import { useState } from "react";
import client from "../constants/apollo-client";
import { UNKNOWN_ERROR_MESSAGE } from "../constants/error";
import { authenticatedVar } from "../constants/authenticated";

interface LoginRequest {
  email: string;
  password: string;
}

const useLogin = () => {
  const [error, setError] = useState<string>();

  const login = async (request: LoginRequest) => {
    try {
      const res = await fetch(`/api/auth/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(request),
        credentials: "include",
      });

      if (!res.ok) {
        if (res.status === 401) {
          setError("Credentials are not valid.");
        } else {
          setError(UNKNOWN_ERROR_MESSAGE);
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
      setError(UNKNOWN_ERROR_MESSAGE);
    }
  };

  return { login, error };
};

export { useLogin };

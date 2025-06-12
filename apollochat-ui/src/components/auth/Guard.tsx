import { useEffect } from "react";
import { authenticatedVar } from "../../constants/authenticated";
import { excludedRoutes } from "../../constants/excluded-routes";
import { useGetMe } from "../../hooks/useGetMe";
import { snackVar } from "../../constants/snack";
import { UNKNOWN_ERROR_SNACK_MESSAGE } from "../../constants/error";
import { usePath } from "../../hooks/usePath";

interface GuardProps {
  children: JSX.Element;
}

const Guard = ({ children }: GuardProps) => {
  const { data: user, error } = useGetMe();
  const { path } = usePath();

  useEffect(() => {
    if (user) {
      authenticatedVar(true);
    }
  }, [user]);

  useEffect(() => {
    // Only show error messages for network errors, not auth errors
    if (error?.networkError && !isAuthError(error)) {
      snackVar(UNKNOWN_ERROR_SNACK_MESSAGE);
    }
  }, [error]);

  return <>{excludedRoutes.includes(path) ? children : user && children}</>;
};

// Helper to check if an error is an authentication error
const isAuthError = (error: any) => {
  return error?.graphQLErrors?.some(
    (graphQLError: any) =>
      graphQLError.extensions?.originalError?.statusCode === 401
  );
};

export default Guard;

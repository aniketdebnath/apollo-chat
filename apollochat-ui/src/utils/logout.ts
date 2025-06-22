import router from "../components/Routes";
import client from "../constants/apollo-client";
import { authenticatedVar } from "../constants/authenticated";

const onLogout = async () => {
  try {
    // Call the logout endpoint to clear cookies
    await fetch(`/api/auth/logout`, {
      method: "POST",
      credentials: "include",
    });
  } catch (error) {
    // Silent fail - we'll still logout on the client side
  } finally {
    // Always update local state regardless of API call success
    authenticatedVar(false);
    router.navigate("/login");
    client.resetStore();
  }
};

export { onLogout };

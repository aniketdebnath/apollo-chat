import { authenticatedVar } from "../constants/authenticated";
import client from "../constants/apollo-client";
import router from "../components/Routes";
import { getRelativeApiUrl } from "../utils/api-url";

const useLogoutAll = () => {
  const logoutAll = async () => {
    try {
      const res = await fetch(getRelativeApiUrl("/auth/logout-all"), {
        method: "POST",
        credentials: "include", // Important: include cookies
      });

      if (!res.ok) {
        throw new Error("Error logging out from all devices");
      }

      // Update authentication state
      authenticatedVar(false);

      // Reset Apollo store
      await client.resetStore();

      // Redirect to login page
      router.navigate("/login");
    } catch (error) {
      console.error("Error logging out from all devices:", error);
      throw error;
    }
  };

  return { logoutAll };
};

export { useLogoutAll };

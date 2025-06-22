import { getRelativeApiUrl } from "../utils/api-url";

const useLogout = () => {
  const logout = async () => {
    const res = await fetch(getRelativeApiUrl("/auth/logout"), {
      method: "POST",
      credentials: "include",
    });
    if (!res.ok) {
      throw new Error("Error logging out");
    }
  };
  return { logout };
};

export { useLogout };

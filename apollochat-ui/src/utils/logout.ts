import router from "../components/Routes";
import client from "../constants/apollo-client";
import { authenticatedVar } from "../constants/authenticated";

const onLogout = () => {
  authenticatedVar(false);
  router.navigate("/login");
  client.resetStore();
};

export { onLogout };

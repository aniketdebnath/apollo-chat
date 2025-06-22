import { useCallback, useState } from "react";
import { snackVar } from "../constants/snack";
import { UNKNOWN_ERROR_SNACK_MESSAGE } from "../constants/error";
import { getRelativeApiUrl } from "../utils/api-url";

const useCountChats = () => {
  const [chatsCount, setchatsCount] = useState<number | undefined>();
  const countChats = useCallback(async () => {
    const response = await fetch(getRelativeApiUrl("/chats/count"));
    if (!response.ok) {
      snackVar(UNKNOWN_ERROR_SNACK_MESSAGE);
      return;
    }
    setchatsCount(parseInt(await response.text()));
  }, []);
  return { chatsCount, countChats };
};

export { useCountChats };

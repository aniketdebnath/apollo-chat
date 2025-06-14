import { useCallback, useState } from "react";
import { API_URL } from "../constants/urls";
import { snackVar } from "../constants/snack";
import { UNKNOWN_ERROR_SNACK_MESSAGE } from "../constants/error";

const useCountChats = () => {
  const [chatsCount, setchatsCount] = useState<number | undefined>();
  const countChats = useCallback(async () => {
    const response = await fetch(`${API_URL}/chats/count`);
    if (!response.ok) {
      snackVar(UNKNOWN_ERROR_SNACK_MESSAGE);
      return;
    }
    setchatsCount(parseInt(await response.text()));
  }, []);
  return { chatsCount, countChats };
};

export { useCountChats };

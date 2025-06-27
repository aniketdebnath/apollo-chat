import { useCallback, useState } from "react";
import { snackVar } from "../constants/snack";
import { UNKNOWN_ERROR_SNACK_MESSAGE } from "../constants/error";
import { getRelativeApiUrl } from "../utils/api-url";

const useCountMessages = (chatId: string) => {
  const [messagesCount, setMessagesCount] = useState<number | undefined>();
  const countMessages = useCallback(async () => {
    try {
      if (!chatId) {
        return;
      }

      const response = await fetch(
        getRelativeApiUrl(`/messages/count?chatId=${chatId}`)
      );
      if (!response.ok) {
        
        snackVar(UNKNOWN_ERROR_SNACK_MESSAGE);
        return;
      }

      const text = await response.text();

      // Handle empty or whitespace-only responses
      if (!text || text.trim() === "") {
        setMessagesCount(0);
        return;
      }

      try {
        const data = JSON.parse(text);
        // If the backend returns undefined or null for a chat with no messages
        if (!data) {
          setMessagesCount(0);
        } else {
          setMessagesCount(data.messages || 0);
        }
      } catch (parseError) {
        
        // Set count to 0 instead of showing an error
        setMessagesCount(0);
      }
    } catch (error) {
      
      // Set count to 0 instead of showing an error
      setMessagesCount(0);
    }
  }, [chatId]);

  return { messagesCount, countMessages };
};

export { useCountMessages };


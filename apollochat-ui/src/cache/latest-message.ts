import { ApolloCache } from "@apollo/client";
import { Chat, Message } from "../gql/graphql";
import { getChatsDocument } from "../hooks/useGetChats";
import { sortChats } from "../utils/chat-sorting";

// Use a large limit to effectively fetch all chats
const FETCH_ALL_CHATS_LIMIT = 1000;

// Helper function to sort chats with pinned chats first, then by latest message date
// Removed local sortChats function and using the imported one

export const updateLatestMessage = (
  cache: ApolloCache<any>,
  message: Message
) => {
  try {
    const variables = {
      skip: 0,
      limit: FETCH_ALL_CHATS_LIMIT,
    };

    const queryResult = cache.readQuery({
      query: getChatsDocument,
      variables,
    });

    if (!queryResult?.chats) return;

    const chats = [...queryResult.chats];
    const cachedChatIndex = chats.findIndex(
      (chat) => chat._id === message.chatId
    );

    if (cachedChatIndex === -1) {
      return;
    }

    const cachedChat = chats[cachedChatIndex];
    const cachedChatCopy = { ...cachedChat };
    cachedChatCopy.latestMessage = message;
    chats[cachedChatIndex] = cachedChatCopy;

    // Sort chats to maintain proper order with pinned chats first
    const sortedChats = sortChats(chats);

    cache.writeQuery({
      query: getChatsDocument,
      variables,
      data: {
        chats: sortedChats,
      },
    });
  } catch (error) {
    console.error("Error updating latest message:", error);
  }
};

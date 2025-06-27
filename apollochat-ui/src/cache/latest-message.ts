import { ApolloCache } from "@apollo/client";
import { Message } from "../gql/graphql";
import { readChatsFromCache, writeSortedChatsToCache } from "./utils";

/**
 * Updates the latest message in a chat when a new message is received
 * @param cache - Apollo cache instance
 * @param message - The new message to set as latest
 */
export const updateLatestMessage = (
  cache: ApolloCache<any>,
  message: Message
) => {
  try {
    // Read chats from cache
    const chats = readChatsFromCache(cache);
    if (!chats) return;

    // Find the chat to update
    const cachedChatIndex = chats.findIndex(
      (chat) => chat._id === message.chatId
    );

    if (cachedChatIndex === -1) {
      return;
    }

    // Update the latest message
    const updatedChats = [...chats];
    const cachedChat = updatedChats[cachedChatIndex];
    const cachedChatCopy = { ...cachedChat };
    cachedChatCopy.latestMessage = message;
    updatedChats[cachedChatIndex] = cachedChatCopy;

    // Write sorted chats back to cache
    writeSortedChatsToCache(cache, updatedChats);
  } catch (error) {
    
  }
};


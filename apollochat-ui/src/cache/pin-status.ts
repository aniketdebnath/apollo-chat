import { ApolloCache } from "@apollo/client";
import { readChatsFromCache, writeSortedChatsToCache } from "./utils";

/**
 * Updates the pin status of a chat and re-sorts the chat list
 * @param cache - Apollo cache instance
 * @param chatId - ID of the chat to update
 * @param isPinned - New pin status
 */
export const updateChatPinStatus = (
  cache: ApolloCache<any>,
  chatId: string,
  isPinned: boolean
) => {
  try {
    // Read chats from cache
    const chats = readChatsFromCache(cache);
    if (!chats) return;

    // Find the chat to update
    const chatIndex = chats.findIndex((chat) => chat._id === chatId);
    if (chatIndex === -1) return;

    // Update the pin status of the chat
    const updatedChats = [...chats];
    const updatedChat = { ...updatedChats[chatIndex], isPinned };
    updatedChats[chatIndex] = updatedChat;

    // Write sorted chats back to cache
    writeSortedChatsToCache(cache, updatedChats);
  } catch (error) {
    console.error("Error updating chat pin status:", error);
  }
};

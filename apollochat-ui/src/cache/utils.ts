import { ApolloCache } from "@apollo/client";
import { Chat } from "../gql/graphql";
import { getChatsDocument } from "../hooks/useGetChats";
import { sortChats } from "../utils/chat-sorting";

/**
 * Consolidated utility function to write sorted chats to the Apollo cache
 * @param cache - Apollo cache instance
 * @param updatedChats - Array of chats to be sorted and written to cache
 */
export const writeSortedChatsToCache = (
  cache: ApolloCache<any>,
  updatedChats: Chat[]
) => {
  try {
    // Sort chats to maintain proper order with pinned chats first
    const sortedChats = sortChats(updatedChats);

    // Write the sorted chats back to the cache without pagination parameters
    cache.writeQuery({
      query: getChatsDocument,
      data: {
        chats: sortedChats,
      },
    });
  } catch (error) {
    console.error("Error writing sorted chats to cache:", error);
  }
};

/**
 * Reads chats from the Apollo cache
 * @param cache - Apollo cache instance
 * @returns Array of chats or undefined if not found
 */
export const readChatsFromCache = (
  cache: ApolloCache<any>
): Chat[] | undefined => {
  try {
    const queryResult = cache.readQuery({
      query: getChatsDocument,
    });
    return queryResult?.chats;
  } catch (error) {
    console.error("Error reading chats from cache:", error);
    return undefined;
  }
};

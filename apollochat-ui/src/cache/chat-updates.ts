import { ApolloCache } from "@apollo/client";
import { Chat } from "../gql/graphql";
import { readChatsFromCache, writeSortedChatsToCache } from "./utils";
import { GET_PUBLIC_CHATS } from "../hooks/useGetPublicChats";
import { ChatType } from "../constants/chatTypes";

/**
 * Updates the cache when a new chat is added
 * @param cache - Apollo cache instance
 * @param chat - The newly added chat
 */
export const updateChatAdded = (cache: ApolloCache<any>, chat: Chat) => {
  try {
    // Read chats from cache
    const chats = readChatsFromCache(cache);
    if (!chats) return;

    // Check if chat already exists in cache
    const chatExists = chats.some((c) => c._id === chat._id);
    if (chatExists) return;

    // Add the new chat to the existing chats
    const updatedChats = [...chats, chat];

    // Write sorted chats back to cache
    writeSortedChatsToCache(cache, updatedChats);

    // Update public chats cache if this is a public or open chat
    if (chat.type === ChatType.PUBLIC || chat.type === ChatType.OPEN) {
      try {
        // Read public chats from cache
        const publicChatsData = cache.readQuery<{ publicChats: Chat[] }>({
          query: GET_PUBLIC_CHATS,
        });

        if (publicChatsData && publicChatsData.publicChats) {
          const publicChats = publicChatsData.publicChats;

          // Check if chat already exists in public chats cache
          const chatExistsInPublic = publicChats.some(
            (c: Chat) => c._id === chat._id
          );
          if (chatExistsInPublic) return;

          // Add the new chat to public chats
          cache.writeQuery({
            query: GET_PUBLIC_CHATS,
            data: {
              publicChats: [...publicChats, chat],
            },
          });
        }
      } catch (error) {
        console.error("Error updating public chats cache:", error);
      }
    }
  } catch (error) {
    console.error("Error updating chat added:", error);
  }
};

/**
 * Updates the cache when a chat is deleted
 * @param cache - Apollo cache instance
 * @param chatId - The ID of the deleted chat
 */
export const updateChatDeleted = (cache: ApolloCache<any>, chatId: string) => {
  try {
    // Read chats from cache
    const chats = readChatsFromCache(cache);
    if (!chats) return;

    // Remove the deleted chat from the cache
    const updatedChats = chats.filter((c) => c._id !== chatId);

    // Write sorted chats back to cache
    writeSortedChatsToCache(cache, updatedChats);

    // Also update public chats cache
    try {
      const publicChatsData = cache.readQuery<{ publicChats: Chat[] }>({
        query: GET_PUBLIC_CHATS,
      });

      if (publicChatsData && publicChatsData.publicChats) {
        const publicChats = publicChatsData.publicChats;

        // Remove the deleted chat from public chats
        const updatedPublicChats = publicChats.filter(
          (c: Chat) => c._id !== chatId
        );

        // Write updated public chats to cache
        cache.writeQuery({
          query: GET_PUBLIC_CHATS,
          data: {
            publicChats: updatedPublicChats,
          },
        });
      }
    } catch (error) {
      console.error(
        "Error updating public chats cache for deleted chat:",
        error
      );
    }
  } catch (error) {
    console.error("Error updating chat deleted:", error);
  }
};

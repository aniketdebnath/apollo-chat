import { ApolloCache } from "@apollo/client";
import { Chat } from "../gql/graphql";
import { getChatsDocument } from "../hooks/useGetChats";

// Use a large limit to effectively fetch all chats
const FETCH_ALL_CHATS_LIMIT = 1000;

// Helper function to sort chats with pinned chats first, then by latest message date
const sortChats = (chats: Chat[]): Chat[] => {
  return [...chats].sort((a, b) => {
    // Sort by isPinned first (true values first)
    if (a.isPinned && !b.isPinned) return -1;
    if (!a.isPinned && b.isPinned) return 1;

    // Then sort by latest message date (newest first)
    const aDate = a.latestMessage?.createdAt
      ? new Date(a.latestMessage.createdAt).getTime()
      : 0;
    const bDate = b.latestMessage?.createdAt
      ? new Date(b.latestMessage.createdAt).getTime()
      : 0;
    return bDate - aDate;
  });
};

export const updateChatPinStatus = (
  cache: ApolloCache<any>,
  chatId: string,
  isPinned: boolean
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
    const chatIndex = chats.findIndex((chat) => chat._id === chatId);

    if (chatIndex === -1) {
      return;
    }

    // Update the pin status of the chat
    const updatedChat = { ...chats[chatIndex], isPinned };
    chats[chatIndex] = updatedChat;

    // Sort chats to maintain proper order with pinned chats first
    const sortedChats = sortChats(chats);

    // Write the sorted chats back to the cache
    cache.writeQuery({
      query: getChatsDocument,
      variables,
      data: {
        chats: sortedChats,
      },
    });
  } catch (error) {
    console.error("Error updating chat pin status:", error);
  }
};

import { Chat } from "../gql/graphql";

/**
 * Sorts chats with pinned chats first, then by latest message date
 * Handles edge cases like chats without messages
 *
 * @param chats - Array of Chat objects to sort
 * @returns Sorted array of Chat objects
 */
export const sortChats = (chats: Chat[]): Chat[] => {
  return [...chats].sort((a, b) => {
    // Sort by isPinned first (pinned chats at the top)
    if (a.isPinned && !b.isPinned) return -1;
    if (!a.isPinned && b.isPinned) return 1;

    // For chats with the same pin status, sort by latest message
    // Explicit check: chats without messages go to the bottom
    if (!a.latestMessage && b.latestMessage) return 1; // A to bottom
    if (a.latestMessage && !b.latestMessage) return -1; // B to bottom

    // If both have messages or both don't have messages
    if (!a.latestMessage && !b.latestMessage) {
      // For chats without messages, sort by ID (oldest first)
      return a._id < b._id ? -1 : 1;
    }

    // For chats with messages, newest messages first
    const timeA = new Date(a.latestMessage?.createdAt).getTime();
    const timeB = new Date(b.latestMessage?.createdAt).getTime();
    return timeB - timeA; // Newest messages at top
  });
};

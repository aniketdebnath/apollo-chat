import { ApolloCache } from "@apollo/client";
import { Message } from "../gql/graphql";
import { getMessagesDocument } from "../hooks/useGetMessages";
import { PAGE_SIZE } from "../constants/page-size";

/**
 * Updates the messages cache when a new message is received
 * Prevents duplicate messages from being added
 * @param cache - Apollo cache instance
 * @param message - The new message to add
 */
export const updateMessages = (cache: ApolloCache<any>, message: Message) => {
  try {
    const messagesQueryOptions = {
      query: getMessagesDocument,
      variables: {
        chatId: message.chatId,
        skip: 0,
        limit: PAGE_SIZE,
      },
    };

    const messagesData = cache.readQuery({ ...messagesQueryOptions });
    const existingMessages = messagesData?.messages || [];

    // Check if the message already exists in the cache
    const isDuplicate = existingMessages.some((m) => m._id === message._id);

    // Only add the message if it's not a duplicate
    if (!isDuplicate) {
      cache.writeQuery({
        ...messagesQueryOptions,
        data: {
          messages: [...existingMessages, message],
        },
      });
    }
  } catch (error) {
    console.error("Error updating messages cache:", error);
  }
};

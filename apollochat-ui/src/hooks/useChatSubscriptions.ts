import { useSubscription } from "@apollo/client";
import { graphql } from "../gql";
import { updateChatAdded, updateChatDeleted } from "../cache/chat-updates";
import { DocumentNode } from "graphql";

// Define the chat added subscription document
const chatAddedDocument = graphql(`
  subscription ChatAdded {
    chatAdded {
      ...ChatFragment
    }
  }
`) as unknown as DocumentNode;

// Define the chat deleted subscription document
const chatDeletedDocument = graphql(`
  subscription ChatDeleted {
    chatDeleted {
      _id
    }
  }
`) as unknown as DocumentNode;

/**
 * Hook that subscribes to chat added and chat deleted events
 * Updates the Apollo cache accordingly
 */
export const useChatSubscriptions = () => {
  // Subscribe to chat added events
  const chatAddedSubscription = useSubscription(chatAddedDocument, {
    onData: ({ client, data }) => {
      try {
        if (data?.data?.chatAdded) {
          updateChatAdded(client.cache, data.data.chatAdded);
        }
      } catch (error) {
        console.error("Error in chatAdded subscription handler:", error);
      }
    },
    onError: (error) => {
      console.error("Chat added subscription error:", error);
    },
  });

  // Subscribe to chat deleted events
  const chatDeletedSubscription = useSubscription(chatDeletedDocument, {
    onData: ({ client, data }) => {
      try {
        if (data?.data?.chatDeleted) {
          updateChatDeleted(client.cache, data.data.chatDeleted._id);
        }
      } catch (error) {
        console.error("Error in chatDeleted subscription handler:", error);
      }
    },
    onError: (error) => {
      console.error("Chat deleted subscription error:", error);
    },
  });

  return {
    chatAddedLoading: chatAddedSubscription.loading,
    chatAddedError: chatAddedSubscription.error,
    chatDeletedLoading: chatDeletedSubscription.loading,
    chatDeletedError: chatDeletedSubscription.error,
  };
};

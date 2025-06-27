import { useSubscription, useApolloClient } from "@apollo/client";
import { graphql } from "../gql";
import { updateChatAdded, updateChatDeleted } from "../cache/chat-updates";
import { DocumentNode } from "graphql";
import { useEffect, useState } from "react";

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
  // Get Apollo client instance
  const client = useApolloClient();

  // Store subscription references for cleanup
  const [chatAddedSubRef, setChatAddedSubRef] = useState<{
    unsubscribe: () => void;
  } | null>(null);
  const [chatDeletedSubRef, setChatDeletedSubRef] = useState<{
    unsubscribe: () => void;
  } | null>(null);

  // Setup chat added subscription with proper cleanup
  useEffect(() => {
    // Create new subscription
    const subscription = client
      .subscribe({
        query: chatAddedDocument,
      })
      .subscribe({
        next: ({ data }) => {
          try {
            if (data?.chatAdded) {
              updateChatAdded(client.cache, data.chatAdded);
            }
          } catch (error) {
            
          }
        },
        error: (error) => {
          
        },
      });

    // Store reference
    setChatAddedSubRef(subscription);

    // Cleanup on unmount
    return () => {
      if (subscription) {
        subscription.unsubscribe();
      }
    };
  }, [client]);

  // Setup chat deleted subscription with proper cleanup
  useEffect(() => {
    // Create new subscription
    const subscription = client
      .subscribe({
        query: chatDeletedDocument,
      })
      .subscribe({
        next: ({ data }) => {
          try {
            if (data?.chatDeleted) {
              updateChatDeleted(client.cache, data.chatDeleted._id);
            }
          } catch (error) {
            
          }
        },
        error: (error) => {
          
        },
      });

    // Store reference
    setChatDeletedSubRef(subscription);

    // Cleanup on unmount
    return () => {
      if (subscription) {
        subscription.unsubscribe();
      }
    };
  }, [client]);

  // For backward compatibility, return a similar structure to previous implementation
  return {
    chatAddedLoading: false,
    chatAddedError: null,
    chatDeletedLoading: false,
    chatDeletedError: null,
  };
};


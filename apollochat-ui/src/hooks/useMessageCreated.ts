import { useSubscription, useApolloClient } from "@apollo/client";
import { graphql } from "../gql";
import { SubscriptionMessageCreatedArgs } from "../gql/graphql";
import { updateMessages } from "../cache/messages";
import { updateLatestMessage } from "../cache/latest-message";
import { useEffect, useRef, useState } from "react";

const messageCreatedDocument = graphql(`
  subscription messageCreated($chatIds: [String!]!) {
    messageCreated(chatIds: $chatIds) {
      ...MessageFragment
    }
  }
`);

export const useMessageCreated = (
  variables: SubscriptionMessageCreatedArgs
) => {
  // Get Apollo client instance
  const client = useApolloClient();

  // Only subscribe if we have chat IDs
  const skip = !variables.chatIds || variables.chatIds.length === 0;

  // Store subscription reference for cleanup
  const [subscriptionRef, setSubscriptionRef] = useState<{
    unsubscribe: () => void;
  } | null>(null);

  // Track previous chat IDs to detect changes
  const prevChatIdsRef = useRef<string[]>([]);

  // Setup subscription with proper cleanup
  useEffect(() => {
    // Skip if no chat IDs
    if (skip) return;

    // Convert chat IDs to string for comparison
    const currentChatIdsStr = JSON.stringify(variables.chatIds);
    const prevChatIdsStr = JSON.stringify(prevChatIdsRef.current);

    // Clean up previous subscription if chat IDs changed
    if (subscriptionRef && currentChatIdsStr !== prevChatIdsStr) {
      console.log("Chat IDs changed, cleaning up previous subscription");
      subscriptionRef.unsubscribe();
    }

    // Create new subscription
    console.log(
      `Creating message subscription for chats: ${variables.chatIds.join(", ")}`
    );
    const subscription = client
      .subscribe({
        query: messageCreatedDocument,
        variables,
      })
      .subscribe({
        next: ({ data }) => {
          try {
            if (data?.messageCreated) {
              updateMessages(client.cache, data.messageCreated);
              updateLatestMessage(client.cache, data.messageCreated);
            }
          } catch (error) {
            console.error("Error in messageCreated handler:", error);
          }
        },
        error: (error) => {
          console.error("Subscription error:", error);
        },
      });

    // Store reference and update previous chat IDs
    setSubscriptionRef(subscription);
    prevChatIdsRef.current = [...variables.chatIds];

    // Cleanup on unmount or variables change
    return () => {
      if (subscription) {
        console.log(
          `Cleaning up message subscription for chats: ${variables.chatIds.join(
            ", "
          )}`
        );
        subscription.unsubscribe();
      }
    };
  }, [skip, JSON.stringify(variables.chatIds), client]);

  // For backward compatibility, return a similar structure to useSubscription
  return {
    loading: false,
    data: null,
    error: null,
  };
};

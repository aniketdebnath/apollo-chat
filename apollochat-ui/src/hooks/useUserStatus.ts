import { useSubscription, useApolloClient } from "@apollo/client";
import { graphql } from "../gql";
import { DocumentNode } from "graphql";
import { useEffect, useRef, useState } from "react";

export const USER_STATUS_SUBSCRIPTION = graphql(`
  subscription UserStatusChanged($userIds: [String!]!) {
    userStatusChanged(userIds: $userIds) {
      ...UserFragment
    }
  }
`) as unknown as DocumentNode;

export const useUserStatus = (userIds: string[]) => {
  // Get Apollo client instance
  const client = useApolloClient();

  // Only subscribe if we have user IDs
  const skip = !userIds || userIds.length === 0;

  // Store subscription reference for cleanup
  const [subscriptionRef, setSubscriptionRef] = useState<{
    unsubscribe: () => void;
  } | null>(null);

  // Track previous user IDs to detect changes
  const prevUserIdsRef = useRef<string[]>([]);

  // Setup subscription with proper cleanup
  useEffect(() => {
    // Skip if no user IDs
    if (skip) return;

    // Convert user IDs to string for comparison
    const currentUserIdsStr = JSON.stringify(userIds);
    const prevUserIdsStr = JSON.stringify(prevUserIdsRef.current);

    // Clean up previous subscription if user IDs changed
    if (subscriptionRef && currentUserIdsStr !== prevUserIdsStr) {
      subscriptionRef.unsubscribe();
    }

    // Create new subscription
    const subscription = client
      .subscribe({
        query: USER_STATUS_SUBSCRIPTION,
        variables: { userIds },
      })
      .subscribe({
        next: ({ data }) => {
          try {
            if (data?.userStatusChanged) {
              // Data will be automatically updated in the cache
            }
          } catch (error) {}
        },
        error: (error) => {},
      });

    // Store reference and update previous user IDs
    setSubscriptionRef(subscription);
    prevUserIdsRef.current = [...userIds];

    // Cleanup on unmount or variables change
    return () => {
      if (subscription) {
        subscription.unsubscribe();
      }
    };
  }, [skip, JSON.stringify(userIds), client]);

  // For backward compatibility, return a similar structure to useSubscription
  return {
    loading: false,
    data: null,
    error: null,
  };
};

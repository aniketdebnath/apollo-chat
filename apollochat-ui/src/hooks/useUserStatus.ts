import { useSubscription } from "@apollo/client";
import { graphql } from "../gql";
import { DocumentNode } from "graphql";

export const USER_STATUS_SUBSCRIPTION = graphql(`
  subscription UserStatusChanged($userIds: [String!]!) {
    userStatusChanged(userIds: $userIds) {
      ...UserFragment
    }
  }
`) as unknown as DocumentNode;

export const useUserStatus = (userIds: string[]) => {
  return useSubscription(USER_STATUS_SUBSCRIPTION, {
    variables: { userIds },
    skip: !userIds.length,
    onData: ({ data }) => {
      if (data.data?.userStatusChanged) {
        // Data will be automatically updated in the cache
        console.log("User status changed:", data.data.userStatusChanged);
      }
    },
  });
};

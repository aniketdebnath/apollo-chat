import { useQuery } from "@apollo/client";
import { graphql } from "../gql";
import { DocumentNode } from "graphql";

export const GET_BANNED_USERS = graphql(`
  query ChatBannedUsers($chatId: String!) {
    chatBannedUsers(chatId: $chatId) {
      user {
        _id
        username
        imageUrl
      }
      until
      reason
    }
  }
`) as unknown as DocumentNode;

export const useGetBannedUsers = (chatId: string) => {
  const { data, loading, error, refetch } = useQuery(GET_BANNED_USERS, {
    variables: { chatId },
    fetchPolicy: "network-only", // Don't use cache for this query
    skip: !chatId,
  });

  return {
    bannedUsers: data?.chatBannedUsers || [],
    loading,
    error,
    refetch,
  };
};

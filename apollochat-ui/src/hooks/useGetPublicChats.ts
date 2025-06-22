import { useQuery } from "@apollo/client";
import { graphql } from "../gql";
import { DocumentNode } from "graphql";
import { ChatFragment } from "../fragments/chat.fragment";

export const GET_PUBLIC_CHATS = graphql(`
  query GetPublicChats {
    publicChats {
      ...ChatFragment
    }
  }
`) as unknown as DocumentNode;

/**
 * Hook to get all public and open chats for the explore page
 * Now excludes chats where the user is already a member or creator
 * Uses cache-and-network fetch policy to work with subscriptions
 */
export const useGetPublicChats = () => {
  const { data, loading, error, refetch } = useQuery(GET_PUBLIC_CHATS, {
    fetchPolicy: "cache-and-network", // Show cached data while fetching fresh data
    // This ensures we get real-time updates from the cache when subscriptions trigger
    notifyOnNetworkStatusChange: true,
  });

  return {
    publicChats: data?.publicChats || [],
    loading,
    error,
    refetch,
  };
};

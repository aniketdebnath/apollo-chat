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
 */
export const useGetPublicChats = () => {
  const { data, loading, error, refetch } = useQuery(GET_PUBLIC_CHATS, {
    fetchPolicy: "network-only", // Don't cache this query to ensure we always get fresh data
  });

  return {
    publicChats: data?.publicChats || [],
    loading,
    error,
    refetch,
  };
};

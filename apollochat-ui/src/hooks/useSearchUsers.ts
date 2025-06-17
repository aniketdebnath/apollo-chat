import { graphql } from "../gql";
import { useQuery } from "@apollo/client";

export const SEARCH_USERS = graphql(`
  query SearchUsers($searchTerm: String!, $limit: Int) {
    searchUsers(searchTerm: $searchTerm, limit: $limit) {
      ...UserFragment
    }
  }
`);

export const useSearchUsers = (searchTerm: string, limit: number = 10) => {
  const { data, loading, error } = useQuery(SEARCH_USERS, {
    variables: { searchTerm, limit },
    skip: !searchTerm || searchTerm.length < 2,
    fetchPolicy: "network-only",
  });

  return {
    users: data?.searchUsers || [],
    loading,
    error,
  };
};

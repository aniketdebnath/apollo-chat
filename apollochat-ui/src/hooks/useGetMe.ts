import { useQuery } from "@apollo/client";
import { graphql } from "../gql";

const getMeDocument = graphql(`
  query Me {
    me {
      ...UserFragment
    }
  }
`);

const useGetMe = () => {
  return useQuery(getMeDocument, {
    fetchPolicy: "cache-and-network",
    // Don't show error UI for authentication errors
    errorPolicy: "ignore",
  });
};

export { useGetMe };

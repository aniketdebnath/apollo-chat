import { useQuery } from "@apollo/client";
import { graphql } from "../gql";
import { QueryChatsArgs } from "../gql/graphql";

export const getChatsDocument = graphql(`
  query Chats($skip: Int!, $limit: Int!) {
    chats(skip: $skip, limit: $limit) {
      ...ChatFragment
    }
  }
`);

const useGetChats = (variables: QueryChatsArgs) => {
  // Skip the query if any required variables are missing or undefined
  const skipQuery = variables.skip === undefined || !variables.limit;

  const result = useQuery(getChatsDocument, {
    variables,
    skip: skipQuery,
  });

  // Add protection to fetchMore to ensure valid variables
  const safeFetchMore = (options: any) => {
    if (!options.variables)
      return Promise.reject(new Error("No variables provided"));
    if (options.variables.skip === undefined)
      return Promise.reject(new Error("Skip is required"));
    if (!options.variables.limit)
      return Promise.reject(new Error("Limit is required"));

    return result.fetchMore(options);
  };

  return {
    ...result,
    fetchMore: safeFetchMore,
  };
};

export { useGetChats };

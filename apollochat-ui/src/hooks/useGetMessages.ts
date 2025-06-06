import { useQuery } from "@apollo/client";
import { graphql } from "../gql";
import { MessagesQueryVariables } from "../gql/graphql";

export const getMessagesDocument = graphql(`
  query Messages($chatId: String!, $skip: Int!, $limit: Int!) {
    messages(chatId: $chatId, skip: $skip, limit: $limit) {
      ...MessageFragment
    }
  }
`);

const useGetMessages = (variables: MessagesQueryVariables) => {
  // Skip the query if any required variables are missing or undefined
  const skipQuery =
    !variables.chatId || variables.skip === undefined || !variables.limit;

  const result = useQuery(getMessagesDocument, {
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
    if (!options.variables.chatId) options.variables.chatId = variables.chatId;

    return result.fetchMore(options);
  };

  return {
    ...result,
    fetchMore: safeFetchMore,
  };
};

export { useGetMessages };

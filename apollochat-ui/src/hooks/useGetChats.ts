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

// Set a very large limit to effectively fetch all chats at once
const FETCH_ALL_CHATS_LIMIT = 1000;

// Set polling interval (in ms) to regularly check for new chats
const POLLING_INTERVAL = 5000; // 5 seconds

const useGetChats = () => {
  const result = useQuery(getChatsDocument, {
    variables: {
      skip: 0,
      limit: FETCH_ALL_CHATS_LIMIT,
    },
    fetchPolicy: "cache-and-network",
    pollInterval: POLLING_INTERVAL, // Automatically refetch every 5 seconds
  });

  return result;
};

export { useGetChats };

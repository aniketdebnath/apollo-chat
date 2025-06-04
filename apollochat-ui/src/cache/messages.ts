import { ApolloCache } from "@apollo/client";
import { Message } from "../gql/graphql";
import { getMessagesDocument } from "../hooks/useGetMessages";

export const updateMessages = (cache: ApolloCache<any>, message: Message) => {
  const messages = cache.readQuery({
    query: getMessagesDocument,
    variables: {
      chatId: message.chatId,
    },
  });

  cache.writeQuery({
    query: getMessagesDocument,
    variables: {
      chatId: message.chatId,
    },
    data: {
      messages: (messages?.messages || []).concat(message),
    },
  });
};

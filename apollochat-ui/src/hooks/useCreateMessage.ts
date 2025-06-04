import { useMutation } from "@apollo/client";
import { graphql } from "../gql";
import { getMessagesDocument } from "./useGetMessages";

const createMessageDocument = graphql(`
  mutation CreateMessage($createMessageInput: CreateMessageInput!) {
    createMessage(createMessageInput: $createMessageInput) {
      ...MessageFragment
    }
  }
`);

const useCreateMessage = (chatId: string) => {
  return useMutation(createMessageDocument, {
    update(cache, { data }) {
      const messages = cache.readQuery({
        query: getMessagesDocument,
        variables: {
          chatId,
        },
      });
      if (!messages || !data?.createMessage) {
        return;
      }
      cache.writeQuery({
        query: getMessagesDocument,
        variables: {
          chatId,
        },
        data: {
          messages: messages.messages.concat(data?.createMessage),
        },
      });
    },
  });
};

export { useCreateMessage };

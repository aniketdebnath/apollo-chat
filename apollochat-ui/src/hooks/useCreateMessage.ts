import { useMutation } from "@apollo/client";
import { graphql } from "../gql";
import { updateMessages } from "../cache/messages";
import { updateLatestMessage } from "../cache/latest-message";

const createMessageDocument = graphql(`
  mutation CreateMessage($createMessageInput: CreateMessageInput!) {
    createMessage(createMessageInput: $createMessageInput) {
      ...MessageFragment
    }
  }
`);

const useCreateMessage = () => {
  return useMutation(createMessageDocument, {
    update(cache, { data }) {
      try {
        if (data?.createMessage) {
          updateMessages(cache, data.createMessage);
          updateLatestMessage(cache, data.createMessage);
        }
      } catch (error) {
        console.error("Error updating cache after message creation:", error);
      }
    },
    onError: (error) => {
      console.error("Error creating message:", error);
    },
  });
};

export { useCreateMessage };

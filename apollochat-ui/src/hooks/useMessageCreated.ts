import { useSubscription } from "@apollo/client";
import { graphql } from "../gql";
import { SubscriptionMessageCreatedArgs } from "../gql/graphql";
import { updateMessages } from "../cache/messages";
import { updateLatestMessage } from "../cache/latest-message";

const messageCreatedDocument = graphql(`
  subscription messageCreated($chatIds: [String!]!) {
    messageCreated(chatIds: $chatIds) {
      ...MessageFragment
    }
  }
`);

export const useMessageCreated = (
  variables: SubscriptionMessageCreatedArgs
) => {
  // Only subscribe if we have chat IDs
  const skip = !variables.chatIds || variables.chatIds.length === 0;

  return useSubscription(messageCreatedDocument, {
    variables,
    skip,
    onData: ({ client, data }) => {
      try {
        if (data?.data) {
          updateMessages(client.cache, data.data.messageCreated);
          updateLatestMessage(client.cache, data.data.messageCreated);
        }
      } catch (error) {
        console.error("Error in messageCreated subscription handler:", error);
      }
    },
    onError: (error) => {
      console.error("Subscription error:", error);
    },
  });
};

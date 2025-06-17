import { useMutation } from "@apollo/client";
import { graphql } from "../gql";
import { DocumentNode } from "graphql";

export const UNPIN_CHAT = graphql(`
  mutation UnpinChat($chatPinInput: ChatPinInput!) {
    unpinChat(chatPinInput: $chatPinInput) {
      _id
      name
      isPinned
    }
  }
`) as unknown as DocumentNode;

export const useUnpinChat = () => {
  const [unpinChatMutation] = useMutation(UNPIN_CHAT);

  const unpinChat = async (chatId: string) => {
    const { data } = await unpinChatMutation({
      variables: {
        chatPinInput: {
          chatId,
        },
      },
      update: (cache, { data }) => {
        if (data?.unpinChat) {
          // Update cache to reflect the unpinned status
          cache.modify({
            id: cache.identify(data.unpinChat),
            fields: {
              isPinned: () => false,
            },
          });
        }
      },
    });
    return data?.unpinChat;
  };

  return { unpinChat };
};

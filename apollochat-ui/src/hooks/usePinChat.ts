import { useMutation } from "@apollo/client";
import { graphql } from "../gql";
import { DocumentNode } from "graphql";

export const PIN_CHAT = graphql(`
  mutation PinChat($chatPinInput: ChatPinInput!) {
    pinChat(chatPinInput: $chatPinInput) {
      _id
      name
      isPinned
    }
  }
`) as unknown as DocumentNode;

export const usePinChat = () => {
  const [pinChatMutation] = useMutation(PIN_CHAT);

  const pinChat = async (chatId: string) => {
    const { data } = await pinChatMutation({
      variables: {
        chatPinInput: {
          chatId,
        },
      },
      update: (cache, { data }) => {
        if (data?.pinChat) {
          // Update cache to reflect the pinned status
          cache.modify({
            id: cache.identify(data.pinChat),
            fields: {
              isPinned: () => true,
            },
          });
        }
      },
    });
    return data?.pinChat;
  };

  return { pinChat };
};

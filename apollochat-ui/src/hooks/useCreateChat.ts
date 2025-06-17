import { graphql } from "../gql";
import { useMutation } from "@apollo/client";
import { ChatType } from "../constants/chatTypes";
import { ChatFragment } from "../fragments/chat.fragment";

export const CREATE_CHAT = graphql(`
  mutation CreateChat($createChatInput: CreateChatInput!) {
    createChat(createChatInput: $createChatInput) {
      ...ChatFragment
    }
  }
`);

export const useCreateChat = () => {
  const [createChatMutation, { loading, error }] = useMutation(CREATE_CHAT, {
    update(cache, { data }) {
      if (data?.createChat) {
        cache.modify({
          fields: {
            chats(existingChats = []) {
              const newChatRef = cache.writeFragment({
                data: data.createChat,
                fragment: ChatFragment,
                fragmentName: "ChatFragment",
              });
              // Always place new chats at the beginning to ensure consistent behavior
              return [newChatRef, ...existingChats];
            },
          },
        });
      }
    },
  });

  const createChat = async (
    name: string,
    type: ChatType = ChatType.PRIVATE,
    memberIds: string[] = []
  ) => {
    try {
      const { data } = await createChatMutation({
        variables: {
          createChatInput: {
            name,
            type,
            memberIds,
          },
        },
      });
      return data?.createChat;
    } catch (err) {
      console.error("Error creating chat:", err);
      throw err;
    }
  };

  return {
    createChat,
    loading,
    error,
  };
};

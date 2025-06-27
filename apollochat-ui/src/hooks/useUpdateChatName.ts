import { useMutation } from "@apollo/client";
import { graphql } from "../gql";
import { DocumentNode } from "graphql";
import { snackVar } from "../constants/snack";

export const UPDATE_CHAT_NAME = graphql(`
  mutation UpdateChat($updateChatInput: UpdateChatInput!) {
    updateChat(updateChatInput: $updateChatInput) {
      _id
      name
      type
      creator {
        _id
        username
      }
    }
  }
`) as unknown as DocumentNode;

export const useUpdateChatName = () => {
  const [updateChatNameMutation, { loading }] = useMutation(UPDATE_CHAT_NAME, {
    onError: (error) => {
      snackVar({
        message: `Error: ${error.message}`,
        type: "error",
      });
    },
  });

  const updateChatName = async (chatId: string, name: string) => {
    try {
      const { data } = await updateChatNameMutation({
        variables: {
          updateChatInput: {
            chatId,
            name,
          },
        },
        update: (cache, { data }) => {
          if (data?.updateChat) {
            // Update the chat name in the cache
            cache.modify({
              id: cache.identify(data.updateChat),
              fields: {
                name: () => name,
              },
            });
          }
        },
      });

      snackVar({
        message: "Chat name updated successfully",
        type: "success",
      });

      return data?.updateChat;
    } catch (error) {
      
      throw error;
    }
  };

  return { updateChatName, loading };
};


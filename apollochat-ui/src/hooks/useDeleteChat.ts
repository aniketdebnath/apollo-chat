import { useMutation } from "@apollo/client";
import { graphql } from "../gql";
import { DocumentNode } from "graphql";
import { snackVar } from "../constants/snack";
import { useNavigate } from "react-router-dom";
import { Reference } from "@apollo/client";

export const DELETE_CHAT = graphql(`
  mutation RemoveChat($chatId: String!) {
    removeChat(chatId: $chatId) {
      _id
      name
      type
    }
  }
`) as unknown as DocumentNode;

export const useDeleteChat = () => {
  const navigate = useNavigate();
  const [deleteChatMutation, { loading }] = useMutation(DELETE_CHAT, {
    onError: (error) => {
      snackVar({
        message: `Error: ${error.message}`,
        type: "error",
      });
    },
  });

  const deleteChat = async (chatId: string) => {
    try {
      const { data } = await deleteChatMutation({
        variables: {
          chatId,
        },
        update: (cache) => {
          // Remove the chat from the cache
          cache.modify({
            fields: {
              chats(existingChats = [], { readField }) {
                return existingChats.filter(
                  (chatRef: Reference) => readField("_id", chatRef) !== chatId
                );
              },
            },
          });
        },
      });

      // Navigate to home after successful deletion
      navigate("/");

      return data?.removeChat;
    } catch (error) {
      console.error("Error deleting chat:", error);
      throw error;
    }
  };

  return { deleteChat, loading };
};

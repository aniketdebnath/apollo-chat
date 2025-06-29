import { graphql } from "../gql";
import { useMutation } from "@apollo/client";
import { DocumentNode } from "graphql";
import { snackVar } from "../constants/snack";

export const ADD_CHAT_MEMBER = graphql(`
  mutation AddChatMember($chatMemberInput: ChatMemberInput!) {
    addChatMember(chatMemberInput: $chatMemberInput) {
      _id
      name
      members {
        _id
        username
        imageUrl
        status
      }
    }
  }
`) as unknown as DocumentNode;

export const useAddChatMember = () => {
  const [addMemberMutation, { loading, error }] = useMutation(ADD_CHAT_MEMBER);

  const addMember = async (chatId: string, userId: string) => {
    try {
      const { data } = await addMemberMutation({
        variables: {
          chatMemberInput: {
            chatId,
            userId,
          },
        },
      });

      return data?.addChatMember;
    } catch (err: any) {
      // Handle specific error messages
      if (err.message?.includes("banned from the chat")) {
        snackVar({
          message: "Cannot add user: This user is banned from the chat",
          type: "error",
        });
      } else {
        snackVar({
          message: `Error: ${err.message}`,
          type: "error",
        });
      }
      throw err;
    }
  };

  return {
    addMember,
    loading,
    error,
  };
};

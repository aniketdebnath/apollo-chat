import { useMutation } from "@apollo/client";
import { graphql } from "../gql";
import { DocumentNode } from "graphql";
import { snackVar } from "../constants/snack";

export const UNBAN_CHAT_USER = graphql(`
  mutation UnbanChatUser($chatUnbanInput: ChatUnbanInput!) {
    unbanChatUser(chatUnbanInput: $chatUnbanInput) {
      _id
      name
      bannedUsers {
        user {
          ...UserFragment
        }
        until
        reason
      }
    }
  }
`) as unknown as DocumentNode;

export const useUnbanUser = () => {
  const [unbanUserMutation, { loading, error }] = useMutation(UNBAN_CHAT_USER, {
    onError: (error) => {
      snackVar({
        message: `Error: ${error.message}`,
        type: "error",
      });
    },
  });

  const unbanUser = async (chatId: string, userId: string) => {
    try {
      const { data } = await unbanUserMutation({
        variables: {
          chatUnbanInput: {
            chatId,
            userId,
          },
        },
      });

      snackVar({
        message: "User unbanned successfully",
        type: "success",
      });

      return data?.unbanChatUser;
    } catch (err) {
      throw err;
    }
  };

  return {
    unbanUser,
    loading,
    error,
  };
};

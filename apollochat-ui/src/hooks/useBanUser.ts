import { useMutation } from "@apollo/client";
import { graphql } from "../gql";
import { DocumentNode } from "graphql";
import { snackVar } from "../constants/snack";
import { BanDuration } from "../constants/banDuration";

export const BAN_CHAT_USER = graphql(`
  mutation BanChatUser($chatBanInput: ChatBanInput!) {
    banChatUser(chatBanInput: $chatBanInput) {
      _id
      name
      members {
        ...UserFragment
      }
    }
  }
`) as unknown as DocumentNode;

export const useBanUser = () => {
  const [banUserMutation, { loading, error }] = useMutation(BAN_CHAT_USER, {
    onError: (error) => {
      snackVar({
        message: `Error: ${error.message}`,
        type: "error",
      });
    },
    // No need for manual update function - Apollo will update the cache
    // automatically based on the returned data that includes both
    // the updated members list and banned users
  });

  const banUser = async (
    chatId: string,
    userId: string,
    duration: BanDuration,
    reason?: string
  ) => {
    try {
      const { data } = await banUserMutation({
        variables: {
          chatBanInput: {
            chatId,
            userId,
            duration,
            reason: reason || "No reason provided",
          },
        },
      });

      snackVar({
        message: "User banned successfully",
        type: "success",
      });

      return data?.banChatUser;
    } catch (err) {
      throw err;
    }
  };

  return {
    banUser,
    loading,
    error,
  };
};

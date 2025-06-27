import { useMutation } from "@apollo/client";
import { graphql } from "../gql";
import { DocumentNode } from "graphql";
import { snackVar } from "../constants/snack";

const removeChatMemberDocument = graphql(`
  mutation RemoveChatMember($chatMemberInput: ChatMemberInput!) {
    removeChatMember(chatMemberInput: $chatMemberInput) {
      _id
      name
      members {
        ...UserFragment
      }
    }
  }
`) as unknown as DocumentNode;

export const useRemoveChatMember = () => {
  const [removeChatMemberMutation, { loading }] = useMutation(
    removeChatMemberDocument,
    {
      onError: (error) => {
        snackVar({
          message: `Error: ${error.message}`,
          type: "error",
        });
      },
    }
  );

  const removeChatMember = async (
    chatId: string,
    userId: string,
    isCurrentUser = false
  ) => {
    try {
      const { data } = await removeChatMemberMutation({
        variables: {
          chatMemberInput: {
            chatId,
            userId,
          },
        },
        update: (cache) => {
          // If the user is removing themselves, we don't need to update the cache
          // as they'll be redirected away from the chat
          if (isCurrentUser) return;

          // For other cases, the cache will be updated automatically
          // based on the returned data
        },
      });

      return data?.removeChatMember;
    } catch (error) {
      
      throw error;
    }
  };

  return { removeChatMember, loading };
};


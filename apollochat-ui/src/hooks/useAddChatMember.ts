import { graphql } from "../gql";
import { useMutation } from "@apollo/client";

export const ADD_CHAT_MEMBER = graphql(`
  mutation AddChatMember($chatMemberInput: ChatMemberInput!) {
    addChatMember(chatMemberInput: $chatMemberInput) {
      ...ChatFragment
    }
  }
`);

export const useAddChatMember = () => {
  const [addChatMember, { loading, error }] = useMutation(ADD_CHAT_MEMBER);

  const addMember = async (chatId: string, userId: string) => {
    try {
      const { data } = await addChatMember({
        variables: {
          chatMemberInput: {
            chatId,
            userId,
          },
        },
      });
      return data?.addChatMember;
    } catch (err) {
      
      throw err;
    }
  };

  return {
    addMember,
    loading,
    error,
  };
};


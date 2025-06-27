import { graphql } from "../gql";
import { useMutation } from "@apollo/client";
import { ChatType } from "../constants/chatTypes";
import { DocumentNode } from "graphql";

export const CREATE_CHAT = graphql(`
  mutation CreateChat($createChatInput: CreateChatInput!) {
    createChat(createChatInput: $createChatInput) {
      ...ChatFragment
    }
  }
`) as unknown as DocumentNode;

export const useCreateChat = () => {
  const [createChatMutation, { loading, error }] = useMutation(CREATE_CHAT);

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
      
      throw err;
    }
  };

  return {
    createChat,
    loading,
    error,
  };
};


import { graphql } from "../gql";
import { useMutation } from "@apollo/client";
import { DocumentNode } from "graphql";
import { getChatsDocument } from "./useGetChats";
import { GET_PUBLIC_CHATS } from "./useGetPublicChats";

export const JOIN_CHAT = graphql(`
  mutation JoinChat($chatId: String!) {
    joinChat(chatId: $chatId) {
      ...ChatFragment
    }
  }
`) as unknown as DocumentNode;

export const useJoinChat = () => {
  const [joinChatMutation, { loading, error }] = useMutation(JOIN_CHAT, {
    refetchQueries: [
      { query: getChatsDocument, variables: { skip: 0, limit: 1000 } },
      { query: GET_PUBLIC_CHATS },
    ],
  });

  const joinChat = async (chatId: string) => {
    try {
      const { data } = await joinChatMutation({
        variables: { chatId },
      });
      return data?.joinChat;
    } catch (err) {
      
      throw err;
    }
  };

  return {
    joinChat,
    loading,
    error,
  };
};


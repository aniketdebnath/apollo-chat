import { useMutation } from "@apollo/client";
import { graphql } from "../gql";
import { useNavigate } from "react-router-dom";
import { DocumentNode } from "graphql";

const REMOVE_CHAT = graphql(`
  mutation RemoveChat($chatId: String!) {
    removeChat(chatId: $chatId) {
      _id
    }
  }
`) as unknown as DocumentNode;

export const useDeleteChat = () => {
  const navigate = useNavigate();
  const [removeChat, { loading, error }] = useMutation(REMOVE_CHAT);

  const deleteChat = async (chatId: string) => {
    try {
      const { data } = await removeChat({
        variables: { chatId },
      });
      // Navigate to home after successful deletion
      navigate("/");
      return data?.removeChat;
    } catch (err) {
      
      throw err;
    }
  };

  return {
    deleteChat,
    loading,
    error,
  };
};


import { ApolloCache } from "@apollo/client";
import { Message } from "../gql/graphql";
import { getChatsDocument } from "../hooks/useGetChats";
import { PAGE_SIZE } from "../constants/page-size";

export const updateLatestMessage = (
  cache: ApolloCache<any>,
  message: Message
) => {
  try {
    const variables = {
      skip: 0,
      limit: PAGE_SIZE,
    };

    const queryResult = cache.readQuery({
      query: getChatsDocument,
      variables,
    });

    if (!queryResult?.chats) return;

    const chats = [...queryResult.chats];
    const cachedChatIndex = chats.findIndex(
      (chat) => chat._id === message.chatId
    );

    if (cachedChatIndex === -1) {
      return;
    }

    const cachedChat = chats[cachedChatIndex];
    const cachedChatCopy = { ...cachedChat };
    cachedChatCopy.latestMessage = message;
    chats[cachedChatIndex] = cachedChatCopy;

    cache.writeQuery({
      query: getChatsDocument,
      variables,
      data: {
        chats,
      },
    });
  } catch (error) {
    console.error("Error updating latest message:", error);
  }
};

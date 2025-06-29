import { useParams } from "react-router-dom";
import { useGetChat } from "../../hooks/useGetChat";
import { Paper, alpha, useTheme } from "@mui/material";

import { useCreateMessage } from "../../hooks/useCreateMessage";
import { useEffect, useRef, useState, useCallback, useMemo } from "react";
import { useGetMessages } from "../../hooks/useGetMessages";
import { PAGE_SIZE } from "../../constants/page-size";
import { useCountMessages } from "../../hooks/useCountMessages";
import InfiniteScrollComponent from "react-infinite-scroller";
import { usePinChat } from "../../hooks/usePinChat";
import { useUnpinChat } from "../../hooks/useUnpinChat";
import { snackVar } from "../../constants/snack";

import { useUserStatus } from "../../hooks/useUserStatus";
import { useGetMe } from "../../hooks/useGetMe";
import { ChatInfo } from "./ChatInfo";
import ChatHeader from "./chat-components/ChatHeader";
import MessageInput from "./chat-components/MessageInput";
import MessageList from "./chat-components/MessageList";

const InfiniteScroll = InfiniteScrollComponent as any;

// Function to get a consistent color based on string input
const stringToColor = (string: string) => {
  let hash = 0;
  for (let i = 0; i < string.length; i++) {
    hash = string.charCodeAt(i) + ((hash << 5) - hash);
  }
  const colors = [
    "#6C63FF", // primary
    "#FF6584", // secondary
    "#00B8A9", // success
    "#0084FF", // info
    "#FFAF20", // warning
  ];
  const index = Math.abs(hash) % colors.length;
  return colors[index];
};

const Chat = () => {
  const params = useParams();
  const chatId = params._id!;
  const { data, loading: chatLoading } = useGetChat({ _id: chatId });
  const [createMessage, { loading: sendingMessage }] = useCreateMessage();
  const { pinChat } = usePinChat();
  const { unpinChat } = useUnpinChat();
  const [isPinning, setIsPinning] = useState(false);
  const theme = useTheme();
  const [showChatInfo, setShowChatInfo] = useState(false);
  const { data: currentUser } = useGetMe();
  const divRef = useRef<HTMLDivElement | null>(null);

  const {
    data: messages,
    fetchMore,
    loading: messagesLoading,
  } = useGetMessages({
    chatId,
    skip: 0,
    limit: PAGE_SIZE,
  });

  const { messagesCount, countMessages } = useCountMessages(chatId);
  const isLoading = chatLoading || messagesLoading;

  const scrollToBottom = () =>
    divRef.current?.scrollIntoView({ behavior: "smooth" });

  useEffect(() => {
    countMessages();
  }, [countMessages]);

  useEffect(() => {
    if (messages?.messages && messages.messages.length <= PAGE_SIZE) {
      scrollToBottom();
    }
  }, [messages]);

  const handleCreateMessage = async (message: string) => {
    await createMessage({
      variables: { createMessageInput: { content: message, chatId } },
    });
    scrollToBottom();
  };

  const handleLoadMore = useCallback(() => {
    if (!messages?.messages?.length || messagesLoading) return;

    if (
      messagesCount !== undefined &&
      messages.messages.length >= messagesCount
    )
      return;

    setTimeout(() => {
      fetchMore({
        variables: {
          chatId,
          skip: messages.messages.length,
          limit: PAGE_SIZE,
        },
      }).catch((error) => {
        // Handle error
      });
    }, 0);
  }, [messages?.messages, messagesLoading, messagesCount, fetchMore, chatId]);

  // Sort messages in chronological order (oldest first)
  const sortedMessages = useMemo(() => {
    if (!messages?.messages) return [];
    return [...messages.messages].sort(
      (a, b) =>
        new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
    );
  }, [messages?.messages]);

  // Check if a message is from the current user
  const isCurrentUser = (messageUserId: string) => {
    return messageUserId === currentUser?.me?._id;
  };

  // Toggle between chat messages and chat info
  const toggleChatInfo = () => {
    setShowChatInfo(!showChatInfo);
  };

  const handlePinToggle = async () => {
    if (isPinning || !data?.chat) return;

    setIsPinning(true);
    try {
      if (data.chat.isPinned) {
        await unpinChat(chatId);
        snackVar({
          message: `Unpinned ${data.chat.name || "chat"}`,
          type: "success",
        });
      } else {
        await pinChat(chatId);
        snackVar({
          message: `Pinned ${data.chat.name || "chat"}`,
          type: "success",
        });
      }
    } catch (error) {
      snackVar({
        message: "Failed to update pin status",
        type: "error",
      });
    } finally {
      setIsPinning(false);
    }
  };

  // Get unique user IDs from messages for status subscription
  const userIds = useMemo(() => {
    const ids = new Set<string>();

    // Add the latest message user if available
    if (data?.chat?.latestMessage?.user?._id) {
      ids.add(data.chat.latestMessage.user._id);
    }

    // Add all message senders
    if (messages?.messages) {
      messages.messages.forEach((message) => {
        if (message.user._id) {
          ids.add(message.user._id);
        }
      });
    }

    return Array.from(ids);
  }, [data?.chat?.latestMessage, messages?.messages]);

  // Subscribe to status updates for all users in this chat
  useUserStatus(userIds);

  return (
    <Paper
      elevation={0}
      sx={{
        display: "flex",
        flexDirection: "column",
        height: "100%",
        borderRadius: 3,
        overflow: "hidden",
        backgroundColor: alpha(theme.palette.background.paper, 0.8),
        border: "1px solid",
        borderColor: "divider",
      }}>
      {/* Chat Header */}
      <ChatHeader
        data={data}
        chatLoading={chatLoading}
        isPinning={isPinning}
        showChatInfo={showChatInfo}
        toggleChatInfo={toggleChatInfo}
        handlePinToggle={handlePinToggle}
      />

      {/* Chat Content - Show either messages or chat info */}
      {showChatInfo && data?.chat ? (
        <ChatInfo
          chat={data.chat}
          currentUserId={currentUser?.me?._id || ""}
          onBack={toggleChatInfo}
        />
      ) : (
        <>
          {/* Messages Container */}
          <MessageList
            messages={sortedMessages}
            isLoading={isLoading}
            messagesCount={messagesCount}
            handleLoadMore={handleLoadMore}
            isCurrentUser={isCurrentUser}
          />

          {/* Message Input */}
          <MessageInput
            onSendMessage={handleCreateMessage}
            sendingMessage={sendingMessage}
          />
        </>
      )}
    </Paper>
  );
};

export default Chat;

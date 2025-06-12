import { useLocation, useParams } from "react-router-dom";
import { useGetChat } from "../../hooks/useGetChat";
import {
  Avatar,
  Box,
  CircularProgress,
  Divider,
  IconButton,
  InputBase,
  Paper,
  Stack,
  Typography,
  alpha,
  useTheme,
} from "@mui/material";
import SendIcon from "@mui/icons-material/Send";
import { useCreateMessage } from "../../hooks/useCreateMessage";
import { useEffect, useRef, useState, useCallback } from "react";
import { useGetMessages } from "../../hooks/useGetMessages";
import { PAGE_SIZE } from "../../constants/page-size";
import { useCountMessages } from "../../hooks/useCountMessages";
import InfiniteScrollComponent from "react-infinite-scroller";
// @ts-ignore
import { formatDistanceToNowStrict } from "date-fns";

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

// Function to create avatar props based on name
const getAvatarProps = (name: string) => {
  return {
    sx: {
      bgcolor: stringToColor(name),
    },
    children: `${name.split(" ")[0][0]}${
      name.split(" ").length > 1 ? name.split(" ")[1][0] : ""
    }`.toUpperCase(),
  };
};

const Chat = () => {
  const params = useParams();
  const [message, setMessage] = useState("");
  const chatId = params._id!;
  const { data, loading: chatLoading } = useGetChat({ _id: chatId });
  const [createMessage, { loading: sendingMessage }] = useCreateMessage();
  const theme = useTheme();

  const {
    data: messages,
    fetchMore,
    loading: messagesLoading,
  } = useGetMessages({
    chatId,
    skip: 0,
    limit: PAGE_SIZE,
  });

  const divRef = useRef<HTMLDivElement | null>(null);
  const messagesContainerRef = useRef<HTMLDivElement | null>(null);
  const location = useLocation();
  const { messagesCount, countMessages } = useCountMessages(chatId);
  const isLoading = chatLoading || messagesLoading;

  const scrollToBottom = () =>
    divRef.current?.scrollIntoView({ behavior: "smooth" });

  useEffect(() => {
    countMessages();
  }, [countMessages]);

  useEffect(() => {
    if (messages?.messages && messages.messages.length <= PAGE_SIZE) {
      setMessage("");
      scrollToBottom();
    }
  }, [location.pathname, messages]);

  const handleCreateMessage = async () => {
    if (!message.trim()) return; // Prevent sending empty messages

    await createMessage({
      variables: { createMessageInput: { content: message, chatId } },
    });
    setMessage("");
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
        console.error("Error loading more messages:", error);
      });
    }, 0);
  }, [messages?.messages, messagesLoading, messagesCount, fetchMore, chatId]);

  // Format a date for display
  const formatMessageDate = (date: string) => {
    const messageDate = new Date(date);
    const today = new Date();

    // If it's today, just show the time
    if (messageDate.toDateString() === today.toDateString()) {
      return messageDate.toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      });
    }

    // If it's within the last week, show relative time
    const distanceToNow = formatDistanceToNowStrict(messageDate, {
      addSuffix: true,
    });
    if (distanceToNow.includes("day") && parseInt(distanceToNow) <= 7) {
      return distanceToNow;
    }

    // Otherwise show the date
    return messageDate.toLocaleDateString();
  };

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
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          px: 3,
          py: 2,
          borderBottom: "1px solid",
          borderColor: "divider",
          backgroundColor: alpha(theme.palette.background.paper, 0.5),
        }}>
        {chatLoading ? (
          <CircularProgress size={24} />
        ) : (
          <>
            {data?.chat.latestMessage?.user.imageUrl ? (
              <Avatar
                src={data.chat.latestMessage.user.imageUrl}
                sx={{ mr: 2 }}
              />
            ) : (
              <Avatar
                {...getAvatarProps(data?.chat.name || "Chat")}
                sx={{ mr: 2 }}
              />
            )}
            <Typography
              variant="h6"
              fontWeight={600}>
              {data?.chat.name}
            </Typography>
          </>
        )}
      </Box>

      {/* Messages Container */}
      <Box
        sx={{
          flex: 1,
          overflow: "auto",
          p: 2,
          backgroundColor: alpha(theme.palette.background.default, 0.5),
          "&::-webkit-scrollbar": {
            width: "6px",
          },
          "&::-webkit-scrollbar-thumb": {
            backgroundColor: alpha(theme.palette.primary.main, 0.2),
            borderRadius: "3px",
          },
          "&::-webkit-scrollbar-track": {
            backgroundColor: "transparent",
          },
        }}
        id="messages-container"
        ref={messagesContainerRef}>
        {isLoading ? (
          <Box sx={{ display: "flex", justifyContent: "center", p: 4 }}>
            <CircularProgress />
          </Box>
        ) : messages?.messages?.length === 0 ? (
          <Box sx={{ p: 4, textAlign: "center" }}>
            <Typography color="text.secondary">
              No messages yet. Start the conversation!
            </Typography>
          </Box>
        ) : (
          <InfiniteScroll
            pageStart={0}
            isReverse={true}
            loadMore={handleLoadMore}
            hasMore={
              messages && messagesCount
                ? messages.messages.length < messagesCount
                : false
            }
            useWindow={false}
            getScrollParent={() =>
              document.getElementById("messages-container")
            }
            threshold={100}
            loader={
              <Box
                sx={{ display: "flex", justifyContent: "center", p: 2 }}
                key="loader">
                <CircularProgress size={24} />
              </Box>
            }>
            {messages &&
              [...messages.messages]
                .sort(
                  (messageA, messageB) =>
                    new Date(messageA.createdAt).getTime() -
                    new Date(messageB.createdAt).getTime()
                )
                .map((message, index, array) => {
                  // Check if this is a new day compared to previous message
                  const showDateDivider =
                    index === 0 ||
                    new Date(message.createdAt).toDateString() !==
                      new Date(array[index - 1].createdAt).toDateString();

                  return (
                    <Box key={message._id}>
                      {showDateDivider && (
                        <Box
                          sx={{
                            display: "flex",
                            justifyContent: "center",
                            my: 2,
                            position: "relative",
                          }}>
                          <Divider
                            sx={{
                              position: "absolute",
                              width: "100%",
                              top: "50%",
                            }}
                          />
                          <Typography
                            variant="caption"
                            sx={{
                              bgcolor: "background.paper",
                              px: 2,
                              py: 0.5,
                              borderRadius: 1,
                              position: "relative",
                              zIndex: 1,
                            }}>
                            {new Date(message.createdAt).toLocaleDateString(
                              undefined,
                              {
                                weekday: "long",
                                month: "short",
                                day: "numeric",
                                year: "numeric",
                              }
                            )}
                          </Typography>
                        </Box>
                      )}

                      <Box
                        sx={{
                          display: "flex",
                          alignItems: "flex-start",
                          mb: 2,
                          px: 1,
                        }}>
                        {/* Avatar */}
                        <Box sx={{ mr: 2, mt: 0.5 }}>
                          {message.user.imageUrl ? (
                            <Avatar
                              src={message.user.imageUrl}
                              sx={{ width: 40, height: 40 }}
                            />
                          ) : (
                            <Avatar
                              {...getAvatarProps(message.user.username)}
                              sx={{ width: 40, height: 40 }}
                            />
                          )}
                        </Box>

                        {/* Message content */}
                        <Box sx={{ maxWidth: "80%" }}>
                          <Typography
                            variant="subtitle2"
                            color="text.secondary"
                            sx={{ mb: 0.5 }}>
                            {message.user.username}
                          </Typography>

                          <Paper
                            elevation={0}
                            sx={{
                              p: 2,
                              borderRadius: 2.5,
                              backgroundColor: alpha(
                                theme.palette.primary.main,
                                0.1
                              ),
                              color: "text.primary",
                            }}>
                            <Typography variant="body1">
                              {message.content}
                            </Typography>
                          </Paper>

                          <Typography
                            variant="caption"
                            color="text.secondary"
                            sx={{ display: "block", mt: 0.5, ml: 1 }}>
                            {formatMessageDate(message.createdAt)}
                          </Typography>
                        </Box>
                      </Box>
                    </Box>
                  );
                })}
            <div ref={divRef}></div>
          </InfiniteScroll>
        )}
      </Box>

      {/* Message Input */}
      <Box sx={{ p: 2, borderTop: "1px solid", borderColor: "divider" }}>
        <Paper
          elevation={0}
          sx={{
            p: "2px 4px",
            display: "flex",
            alignItems: "center",
            width: "100%",
            borderRadius: 3,
            backgroundColor: alpha(theme.palette.background.paper, 0.8),
            border: "1px solid",
            borderColor: "divider",
            "&:hover": {
              borderColor: theme.palette.primary.main,
            },
            transition: "all 0.2s ease",
          }}>
          <InputBase
            sx={{
              ml: 2,
              flex: 1,
              color: "text.primary",
              fontSize: "0.95rem",
            }}
            onChange={(event) => setMessage(event.target.value)}
            value={message}
            placeholder="Type a message..."
            onKeyDown={async (event) => {
              if (event.key === "Enter" && !event.shiftKey) {
                event.preventDefault();
                await handleCreateMessage();
              }
            }}
            multiline
            maxRows={4}
          />
          <IconButton
            onClick={handleCreateMessage}
            color="primary"
            disabled={sendingMessage || !message.trim()}
            sx={{
              p: "10px",
              borderRadius: 2,
              transition: "all 0.2s ease",
              mr: 0.5,
              "&:hover": {
                backgroundColor: alpha(theme.palette.primary.main, 0.1),
              },
            }}>
            {sendingMessage ? <CircularProgress size={24} /> : <SendIcon />}
          </IconButton>
        </Paper>
      </Box>
    </Paper>
  );
};

export default Chat;

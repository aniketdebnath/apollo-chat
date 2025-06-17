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
  Tooltip,
} from "@mui/material";
import SendIcon from "@mui/icons-material/Send";
import PushPinIcon from "@mui/icons-material/PushPin";
import PushPinOutlinedIcon from "@mui/icons-material/PushPinOutlined";
import { useCreateMessage } from "../../hooks/useCreateMessage";
import { useEffect, useRef, useState, useCallback } from "react";
import { useGetMessages } from "../../hooks/useGetMessages";
import { PAGE_SIZE } from "../../constants/page-size";
import { useCountMessages } from "../../hooks/useCountMessages";
import InfiniteScrollComponent from "react-infinite-scroller";
import { usePinChat } from "../../hooks/usePinChat";
import { useUnpinChat } from "../../hooks/useUnpinChat";
import { snackVar } from "../../constants/snack";
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
  const { pinChat } = usePinChat();
  const { unpinChat } = useUnpinChat();
  const [isPinning, setIsPinning] = useState(false);
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
      console.error("Error toggling pin status:", error);
      snackVar({
        message: "Failed to update pin status",
        type: "error",
      });
    } finally {
      setIsPinning(false);
    }
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
          justifyContent: "space-between",
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
            <Box sx={{ display: "flex", alignItems: "center" }}>
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
            </Box>
            {isPinning ? (
              <CircularProgress size={20} />
            ) : (
              <Tooltip title={data?.chat.isPinned ? "Unpin chat" : "Pin chat"}>
                <span>
                  <IconButton
                    onClick={handlePinToggle}
                    disabled={isPinning}
                    size="small"
                    sx={{
                      color: data?.chat.isPinned
                        ? "primary.main"
                        : "text.secondary",
                      "&:hover": {
                        backgroundColor: alpha(theme.palette.primary.main, 0.1),
                      },
                    }}>
                    {data?.chat.isPinned ? (
                      <PushPinIcon fontSize="small" />
                    ) : (
                      <PushPinOutlinedIcon fontSize="small" />
                    )}
                  </IconButton>
                </span>
              </Tooltip>
            )}
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
            <div style={{ display: "flex", flexDirection: "column-reverse" }}>
              {messages?.messages.map((message, index, array) => {
                // Check if this message is from a different day than the previous one
                const showDateDivider =
                  index === array.length - 1 ||
                  new Date(message.createdAt).toDateString() !==
                    new Date(array[index + 1].createdAt).toDateString();

                return (
                  <div key={message._id}>
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
                          {new Date(message.createdAt).toLocaleDateString()}
                        </Typography>
                      </Box>
                    )}
                    <Box
                      sx={{
                        display: "flex",
                        mb: 2,
                        alignItems: "flex-start",
                      }}>
                      <Avatar
                        src={message.user.imageUrl || ""}
                        {...(!message.user.imageUrl
                          ? getAvatarProps(message.user.username)
                          : {})}
                        sx={{ mr: 2, mt: 0.5 }}
                      />
                      <Box>
                        <Box
                          sx={{
                            display: "flex",
                            alignItems: "center",
                            mb: 0.5,
                          }}>
                          <Typography
                            variant="subtitle2"
                            color="text.secondary">
                            {message.user.username}
                          </Typography>
                        </Box>
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
                          <Typography>{message.content}</Typography>
                        </Paper>
                        <Typography
                          variant="caption"
                          color="text.secondary"
                          sx={{ mt: 0.5, display: "block" }}>
                          {formatMessageDate(message.createdAt)}
                        </Typography>
                      </Box>
                    </Box>
                  </div>
                );
              })}
            </div>
          </InfiniteScroll>
        )}
        <div ref={divRef} />
      </Box>

      {/* Message Input */}
      <Box sx={{ p: 2 }}>
        <Paper
          elevation={0}
          sx={{
            p: "8px 16px",
            display: "flex",
            alignItems: "center",
            borderRadius: 3,
            border: "1px solid",
            borderColor: "divider",
            backgroundColor: alpha(theme.palette.background.paper, 0.8),
            "&:hover": {
              borderColor: theme.palette.primary.main,
            },
            transition: "all 0.2s ease",
          }}>
          <InputBase
            sx={{ ml: 1, flex: 1 }}
            placeholder="Type a message..."
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyPress={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                handleCreateMessage();
              }
            }}
            multiline
            maxRows={4}
          />
          <IconButton
            sx={{
              p: "10px",
              color: theme.palette.primary.main,
              "&:disabled": {
                color: alpha(theme.palette.primary.main, 0.5),
              },
            }}
            disabled={!message.trim() || sendingMessage}
            onClick={handleCreateMessage}>
            {sendingMessage ? (
              <CircularProgress
                size={24}
                color="inherit"
              />
            ) : (
              <SendIcon />
            )}
          </IconButton>
        </Paper>
      </Box>
    </Paper>
  );
};

export default Chat;

import React, { useRef } from "react";
import {
  Box,
  CircularProgress,
  Typography,
  alpha,
  useTheme,
} from "@mui/material";
import InfiniteScrollComponent from "react-infinite-scroller";
import { Message } from "../../../gql/graphql";
import MessageItem from "./MessageItem";
import DateDivider from "./DateDivider";

interface MessageListProps {
  messages: Message[];
  isLoading: boolean;
  messagesCount: number | undefined;
  handleLoadMore: () => void;
  isCurrentUser: (userId: string) => boolean;
  isSmallScreen?: boolean;
}

const InfiniteScroll = InfiniteScrollComponent as any;

const MessageList: React.FC<MessageListProps> = ({
  messages,
  isLoading,
  messagesCount,
  handleLoadMore,
  isCurrentUser,
  isSmallScreen = false,
}) => {
  const theme = useTheme();
  const divRef = useRef<HTMLDivElement | null>(null);
  const messagesContainerRef = useRef<HTMLDivElement | null>(null);

  return (
    <Box
      sx={{
        flex: 1,
        overflow: "auto",
        p: isSmallScreen ? 1.5 : 2,
        backgroundColor: alpha(theme.palette.background.default, 0.5),
        "&::-webkit-scrollbar": {
          width: isSmallScreen ? "4px" : "6px",
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
        <Box
          sx={{
            display: "flex",
            justifyContent: "center",
            p: isSmallScreen ? 3 : 4,
          }}>
          <CircularProgress size={isSmallScreen ? 20 : 24} />
        </Box>
      ) : messages.length === 0 ? (
        <Box sx={{ p: isSmallScreen ? 3 : 4, textAlign: "center" }}>
          <Typography
            color="text.secondary"
            variant={isSmallScreen ? "body2" : "body1"}>
            No messages yet. Start the conversation!
          </Typography>
        </Box>
      ) : (
        <Box sx={{ display: "flex", flexDirection: "column" }}>
          <InfiniteScroll
            pageStart={0}
            loadMore={handleLoadMore}
            hasMore={
              messages && messagesCount
                ? messages.length < messagesCount
                : false
            }
            useWindow={false}
            getScrollParent={() =>
              document.getElementById("messages-container")
            }
            threshold={100}
            isReverse={false}
            loader={
              <Box
                sx={{
                  display: "flex",
                  justifyContent: "center",
                  p: isSmallScreen ? 1 : 2,
                }}
                key="loader">
                <CircularProgress size={isSmallScreen ? 20 : 24} />
              </Box>
            }>
            {messages.map((message, index) => {
              // Check if we need to show a date divider
              const showDateDivider =
                index === 0 ||
                new Date(message.createdAt).toDateString() !==
                  new Date(messages[index - 1].createdAt).toDateString();

              return (
                <div key={message._id}>
                  {showDateDivider && (
                    <DateDivider
                      date={message.createdAt}
                      isSmallScreen={isSmallScreen}
                    />
                  )}
                  <MessageItem
                    message={message}
                    isCurrentUser={isCurrentUser(message.user._id)}
                    isSmallScreen={isSmallScreen}
                  />
                </div>
              );
            })}
          </InfiniteScroll>
          <div ref={divRef} />
        </Box>
      )}
    </Box>
  );
};

export default MessageList;

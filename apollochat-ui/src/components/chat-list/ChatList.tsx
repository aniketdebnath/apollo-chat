import {
  Box,
  Divider,
  Paper,
  Typography,
  alpha,
  useTheme,
} from "@mui/material";
import { useEffect, useState } from "react";
import { useGetChats } from "../../hooks/useGetChats";
import { usePath } from "../../hooks/usePath";
import { useMessageCreated } from "../../hooks/useMessageCreated";
import ChatListItem from "./chat-list-item/ChatListItem";
import ChatListHeader from "./chat-list-header/ChatListHeader";
import ChatListAdd from "./chat-list-add/ChatListAdd";

export const ChatList = () => {
  const [chatListAddVisible, setChatListAddVisible] = useState(false);
  const [selectedChatId, setSelectedChatId] = useState("");
  const { data, loading } = useGetChats();
  const { path } = usePath();
  const theme = useTheme();

  useMessageCreated({
    chatIds: data?.chats.map((chat: any) => chat._id) || [],
  });

  useEffect(() => {
    const pathSplit = path.split("chats/");
    if (pathSplit.length === 2) {
      setSelectedChatId(pathSplit[1]);
    }
  }, [path]);

  return (
    <>
      <ChatListAdd
        open={chatListAddVisible}
        handleClose={() => setChatListAddVisible(false)}
      />
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
        <ChatListHeader handleAddChat={() => setChatListAddVisible(true)} />
        <Divider />
        <Box
          sx={{
            flex: 1,
            overflow: "auto",
            p: 1,
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
          id="chat-list-container">
          {loading ? (
            <Box sx={{ p: 3, textAlign: "center" }}>
              <Typography
                variant="body2"
                color="text.secondary">
                Loading conversations...
              </Typography>
            </Box>
          ) : data?.chats && data.chats.length > 0 ? (
            [...data.chats]
              .sort((chatA, chatB) => {
                // First, sort by pinned status (pinned chats at the top)
                if (chatA.isPinned && !chatB.isPinned) return -1;
                if (!chatA.isPinned && chatB.isPinned) return 1;

                // For chats with the same pin status, sort by latest message
                // Explicit check: chats without messages go to the bottom
                if (!chatA.latestMessage && chatB.latestMessage) return 1; // A to bottom
                if (chatA.latestMessage && !chatB.latestMessage) return -1; // B to bottom

                // If both have messages or both don't have messages
                if (!chatA.latestMessage && !chatB.latestMessage) {
                  // For chats without messages, sort by ID (oldest first)
                  return chatA._id < chatB._id ? -1 : 1;
                }

                // For chats with messages, newest messages first
                const timeA = new Date(
                  chatA.latestMessage?.createdAt
                ).getTime();
                const timeB = new Date(
                  chatB.latestMessage?.createdAt
                ).getTime();
                return timeB - timeA; // Newest messages at top
              })
              .map((chat) => (
                <ChatListItem
                  key={chat._id}
                  chat={chat}
                  selected={chat._id === selectedChatId}
                />
              ))
          ) : (
            <Box sx={{ p: 3, textAlign: "center" }}>
              <Typography
                variant="body2"
                color="text.secondary">
                No conversations yet
              </Typography>
              <Typography
                variant="body2"
                color="primary"
                sx={{ mt: 1, cursor: "pointer" }}
                onClick={() => setChatListAddVisible(true)}>
                Start a new chat
              </Typography>
            </Box>
          )}
        </Box>
      </Paper>
    </>
  );
};

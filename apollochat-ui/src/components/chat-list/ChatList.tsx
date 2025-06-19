import {
  Box,
  Divider,
  Paper,
  Typography,
  alpha,
  useTheme,
} from "@mui/material";
import { useEffect, useState, useMemo } from "react";
import { useGetChats } from "../../hooks/useGetChats";
import { usePath } from "../../hooks/usePath";
import { useMessageCreated } from "../../hooks/useMessageCreated";
import ChatListItem from "./chat-list-item/ChatListItem";
import ChatListHeader from "./chat-list-header/ChatListHeader";
import ChatListAdd from "./chat-list-add/ChatListAdd";
import { useUserStatus } from "../../hooks/useUserStatus";
import { sortChats } from "../../utils/chat-sorting";

export const ChatList = () => {
  const [chatListAddVisible, setChatListAddVisible] = useState(false);
  const [selectedChatId, setSelectedChatId] = useState("");
  const { data, loading } = useGetChats();
  const { path } = usePath();
  const theme = useTheme();

  useMessageCreated({
    chatIds: data?.chats.map((chat: any) => chat._id) || [],
  });

  // Get unique user IDs from latest messages for status subscription
  const userIds = useMemo(() => {
    const ids = new Set<string>();

    if (data?.chats) {
      data.chats.forEach((chat) => {
        if (chat.latestMessage?.user?._id) {
          ids.add(chat.latestMessage.user._id);
        }
      });
    }

    return Array.from(ids);
  }, [data?.chats]);

  // Subscribe to status updates for all users with latest messages
  useUserStatus(userIds);

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
            sortChats([...data.chats]).map((chat) => (
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

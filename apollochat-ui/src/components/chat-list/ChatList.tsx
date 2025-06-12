import { Box, Divider, Stack } from "@mui/material";
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
      <Stack>
        <ChatListHeader handleAddChat={() => setChatListAddVisible(true)} />
        <Divider />
        <Box
          sx={{
            width: "100%",
            bgcolor: "background.paper",
            maxHeight: "80vh",
            overflow: "auto",
            "&::-webkit-scrollbar": {
              display: "none",
            },
            // Hide scrollbar in Firefox
            scrollbarWidth: "none", // Firefox
            msOverflowStyle: "none", // IE and Edge
          }}
          id="chat-list-container">
          {loading ? (
            <div>Loading chats...</div>
          ) : (
            data?.chats &&
            [...data.chats]
              .sort((chatA, chatB) => {
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
          )}
        </Box>
      </Stack>
    </>
  );
};

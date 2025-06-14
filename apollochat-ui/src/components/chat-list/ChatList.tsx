import { Box, Divider, Stack } from "@mui/material";
import { useEffect, useState } from "react";
import InfiniteScrollComponent from "react-infinite-scroller";
import { useGetChats } from "../../hooks/useGetChats";
import { usePath } from "../../hooks/usePath";
import { useMessageCreated } from "../../hooks/useMessageCreated";
import { PAGE_SIZE } from "../../constants/page-size";
import { useCountChats } from "../../hooks/useCountChats";
import ChatListItem from "./chat-list-item/ChatListItem";
import ChatListHeader from "./chat-list-header/ChatListHeader";
import ChatListAdd from "./chat-list-add/ChatListAdd";
const InfiniteScroll = InfiniteScrollComponent as any;

export const ChatList = () => {
  const [chatListAddVisible, setChatListAddVisible] = useState(false);
  const [selectedChatId, setSelectedChatId] = useState("");
  const { data, fetchMore } = useGetChats({
    skip: 0,
    limit: PAGE_SIZE,
  });
  const { path } = usePath();
  const { chatsCount, countChats } = useCountChats();
  useEffect(() => {
    countChats();
  }, [countChats]);
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
          }}>
          <InfiniteScroll
            pageStart={0}
            loadMore={() =>
              fetchMore({
                variables: {
                  skip: data?.chats.length,
                  limit: PAGE_SIZE,
                },
              })
            }
            hasMore={
              data?.chats && chatsCount ? data.chats.length < chatsCount : false
            }
            useWindow={false}>
            {data?.chats ? (
              [...data.chats]
                .sort((chatA, chatB) => {
                  if (!chatA.latestMessage) {
                    return -1;
                  }
                  return (
                    new Date(chatA.latestMessage?.createdAt).getTime() -
                    new Date(chatB.latestMessage?.createdAt).getTime()
                  );
                })
                .map((chat) => (
                  <ChatListItem
                    key={chat._id}
                    chat={chat}
                    selected={chat._id === selectedChatId}
                  />
                ))
                .reverse()
            ) : (
              <div>Loading chats...</div>
            )}
          </InfiniteScroll>
        </Box>
      </Stack>
    </>
  );
};

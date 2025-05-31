import List from "@mui/material/List";
import ChatListItem from "./ChatListItem";
import { Divider, Stack } from "@mui/material";
import ChatListHeader from "./chat-list-header/ChatListHeader";
import { useState } from "react";
import ChatListAdd from "./chat-list-add/ChatListAdd";

export const ChatList = () => {
  const [chatListAddVisible, setChatListAddVisible] = useState(false);
  return (
    <>
      <ChatListAdd
        open={chatListAddVisible}
        handleClose={() => setChatListAddVisible(false)}
      />
      <Stack>
        <ChatListHeader handleAddChat={() => setChatListAddVisible(true)} />
        <Divider />
        <List
          sx={{
            width: "100%",
            maxWidth: 360,
            bgcolor: "background.paper",
            maxHeight: "80vh",
            overflow: "auto",
          }}>
          <ChatListItem />
          <ChatListItem />
          <ChatListItem />
          <ChatListItem />
          <ChatListItem />
          <ChatListItem />
          <ChatListItem />
          <ChatListItem />
          <ChatListItem />
          <ChatListItem />
          <ChatListItem />
          <ChatListItem />
          <ChatListItem />
        </List>
      </Stack>
    </>
  );
};

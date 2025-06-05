import {
  Avatar,
  Divider,
  ListItem,
  ListItemAvatar,
  ListItemButton,
  ListItemText,
  Typography,
} from "@mui/material";
import router from "../Routes";
import { Chat } from "../../gql/graphql";

interface ChatListProps {
  chat: Chat;
  selected: boolean;
}

const ChatListItem = ({ chat, selected }: ChatListProps) => {
  return (
    <>
      <ListItem
        alignItems="flex-start"
        disablePadding>
        <ListItemButton
          onClick={() => router.navigate(`/chats/${chat._id}`)}
          selected={selected}>
          <ListItemAvatar>
            <Avatar
              alt="Remy Sharp"
              src="/static/images/avatar/1.jpg"
            />
          </ListItemAvatar>
          <ListItemText
            primary={chat.name}
            secondary={
              <>
                <Typography
                  component="span"
                  variant="body2"
                  sx={{ color: "text.primary", display: "inline" }}>
                  {chat.latestMessage?.user.username || ""}
                </Typography>
                {" " + (chat.latestMessage?.content || "")}
              </>
            }
          />
        </ListItemButton>
      </ListItem>
      <Divider
        variant="inset"
        component="li"
      />
    </>
  );
};
export default ChatListItem;

import {
  Avatar,
  Box,
  ListItem,
  ListItemAvatar,
  ListItemButton,
  ListItemText,
  Typography,
  alpha,
  useTheme,
} from "@mui/material";
import router from "../../Routes";
import { Chat } from "../../../gql/graphql";
import "./ChatListItem.css";
import { formatDistanceToNowStrict } from "date-fns";

interface ChatListProps {
  chat: Chat;
  selected: boolean;
}

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

const ChatListItem = ({ chat, selected }: ChatListProps) => {
  const theme = useTheme();
  const hasLatestMessage = !!chat.latestMessage;
  const avatarImageUrl = chat.latestMessage?.user.imageUrl;

  let timeAgo = "";
  if (hasLatestMessage) {
    try {
      timeAgo = formatDistanceToNowStrict(
        new Date(chat.latestMessage!.createdAt),
        {
          addSuffix: true,
        }
      );
    } catch (error) {
      console.error("Error formatting date:", error);
      timeAgo = "";
    }
  }

  return (
    <ListItem
      disablePadding
      sx={{
        mb: 0.5,
        overflow: "hidden",
      }}>
      <ListItemButton
        onClick={() => router.navigate(`/chats/${chat._id}`)}
        selected={selected}
        sx={{
          borderRadius: 2,
          py: 1,
          px: 1.5,
          "&.Mui-selected": {
            backgroundColor: alpha(theme.palette.primary.main, 0.15),
            "&:hover": {
              backgroundColor: alpha(theme.palette.primary.main, 0.25),
            },
          },
        }}>
        <ListItemAvatar>
          {avatarImageUrl ? (
            <Avatar
              alt={chat.name || ""}
              src={avatarImageUrl}
            />
          ) : (
            <Avatar {...getAvatarProps(chat.name || "Chat")} />
          )}
        </ListItemAvatar>
        <ListItemText
          primary={
            <Box
              sx={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
              }}>
              <Typography
                variant="body1"
                fontWeight={hasLatestMessage ? 500 : 400}
                noWrap>
                {chat.name}
              </Typography>
              {hasLatestMessage && (
                <Typography
                  variant="caption"
                  color="text.secondary"
                  sx={{ flexShrink: 0, ml: 1 }}>
                  {timeAgo}
                </Typography>
              )}
            </Box>
          }
          secondary={
            <Box
              component="span"
              sx={{
                display: "flex",
                flexDirection: "row",
                alignItems: "center",
                gap: "0.25rem",
              }}>
              {hasLatestMessage && (
                <>
                  <Typography
                    component="span"
                    variant="body2"
                    sx={{
                      color: "text.secondary",
                      fontWeight: 500,
                    }}
                    noWrap>
                    {chat.latestMessage?.user.username}:
                  </Typography>
                  <Typography
                    component="span"
                    variant="body2"
                    color="text.secondary"
                    className="content"
                    noWrap>
                    {chat.latestMessage?.content}
                  </Typography>
                </>
              )}
            </Box>
          }
        />
      </ListItemButton>
    </ListItem>
  );
};
export default ChatListItem;

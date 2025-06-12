import {
  Box,
  Typography,
  Paper,
  alpha,
  useTheme,
  Divider,
  IconButton,
  ListItem,
  ListItemButton,
  ListItemAvatar,
  ListItemText,
  Avatar,
} from "@mui/material";
import { Add as AddIcon } from "@mui/icons-material";
import { mockChats } from "./mockData";
import { formatDistanceToNowStrict } from "date-fns";

// Mock Chat interface
interface DemoChat {
  _id: string;
  name: string;
  latestMessage?: {
    _id: string;
    content: string;
    createdAt: string;
    chatId: string;
    user: {
      _id: string;
      username: string;
      email: string;
      imageUrl: string;
    };
  };
}

interface DemoChatListItemProps {
  chat: DemoChat;
  selected: boolean;
}

// Function to get a consistent color based on string input
const stringToColor = (string: string): string => {
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
const getAvatarProps = (
  name: string
): { sx: { bgcolor: string }; children: string } => {
  return {
    sx: {
      bgcolor: stringToColor(name),
    },
    children: `${name.split(" ")[0][0]}${
      name.split(" ").length > 1 ? name.split(" ")[1][0] : ""
    }`.toUpperCase(),
  };
};

const DemoChatListItem = ({ chat, selected }: DemoChatListItemProps) => {
  const theme = useTheme();
  const hasLatestMessage = !!chat.latestMessage;

  let timeAgo = "";
  if (hasLatestMessage && chat.latestMessage) {
    try {
      timeAgo = formatDistanceToNowStrict(
        new Date(chat.latestMessage.createdAt),
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
        selected={selected}
        sx={{
          borderRadius: 2,
          py: 1,
          px: 1.5,
          cursor: "default",
          pointerEvents: "none",
          "&.Mui-selected": {
            backgroundColor: alpha(theme.palette.primary.main, 0.15),
            "&:hover": {
              backgroundColor: alpha(theme.palette.primary.main, 0.25),
            },
          },
        }}>
        <ListItemAvatar>
          <Avatar {...getAvatarProps(chat.name || "Chat")} />
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
                color="text.primary"
                noWrap>
                {chat.name}
              </Typography>
              {hasLatestMessage && chat.latestMessage && (
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
              {hasLatestMessage && chat.latestMessage && (
                <>
                  <Typography
                    component="span"
                    variant="body2"
                    sx={{
                      color: "text.secondary",
                      fontWeight: 500,
                    }}
                    noWrap>
                    {chat.latestMessage.user.username}:
                  </Typography>
                  <Typography
                    component="span"
                    variant="body2"
                    color="text.secondary"
                    noWrap>
                    {chat.latestMessage.content}
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

const DemoChatList = () => {
  const theme = useTheme();

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
      {/* Chat List Header */}
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          px: 2,
          py: 1.5,
          borderTopLeftRadius: 12,
          borderTopRightRadius: 12,
          backgroundColor: alpha(theme.palette.background.paper, 0.5),
        }}>
        <Typography
          variant="h6"
          fontWeight={600}>
          Conversations
        </Typography>

        <Box sx={{ display: "flex", gap: 1 }}>
          <IconButton
            size="small"
            color="primary"
            sx={{
              bgcolor: alpha(theme.palette.primary.main, 0.1),
              "&:hover": {
                bgcolor: alpha(theme.palette.primary.main, 0.1),
              },
              borderRadius: 1.5,
              cursor: "default",
              pointerEvents: "none",
            }}>
            <AddIcon fontSize="small" />
          </IconButton>
        </Box>
      </Box>

      <Divider />

      {/* Chat List Content */}
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
        {mockChats.map((chat) => (
          <DemoChatListItem
            key={chat._id}
            chat={chat}
            selected={chat._id === "demo-chat-1"}
          />
        ))}
      </Box>
    </Paper>
  );
};

export default DemoChatList;

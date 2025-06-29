import React from "react";
import {
  Box,
  Typography,
  IconButton,
  CircularProgress,
  Tooltip,
  alpha,
  useTheme,
} from "@mui/material";
import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined";
import PushPinIcon from "@mui/icons-material/PushPin";
import PushPinOutlinedIcon from "@mui/icons-material/PushPinOutlined";
import { Chat } from "../../../gql/graphql";
import { UserAvatar } from "../../common/UserAvatar";
import { UserStatus } from "../../../constants/userStatus";
import { Avatar } from "@mui/material";

interface ChatHeaderProps {
  data: { chat: Chat } | undefined;
  chatLoading: boolean;
  isPinning: boolean;
  showChatInfo: boolean;
  toggleChatInfo: () => void;
  handlePinToggle: () => void;
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

const ChatHeader: React.FC<ChatHeaderProps> = ({
  data,
  chatLoading,
  isPinning,
  showChatInfo,
  toggleChatInfo,
  handlePinToggle,
}) => {
  const theme = useTheme();

  return (
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
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              cursor: "pointer",
            }}
            onClick={toggleChatInfo}>
            {data?.chat.latestMessage ? (
              <Box
                sx={{
                  position: "relative",
                  "& .MuiBadge-badge": {
                    right: 3,
                    bottom: 3,
                  },
                }}>
                <UserAvatar
                  username={data.chat.latestMessage.user.username}
                  imageUrl={data.chat.latestMessage.user.imageUrl}
                  status={
                    data.chat.latestMessage.user.status as unknown as UserStatus
                  }
                  showStatus={true}
                  size="medium"
                  sx={{ mr: 0.5 }}
                />
              </Box>
            ) : (
              <Avatar
                {...getAvatarProps(data?.chat.name || "Chat")}
                sx={{ mr: 2 }}
              />
            )}
            <Typography
              variant="h6"
              fontWeight={600}
              sx={{ ml: 1 }}>
              {data?.chat.name}
            </Typography>
          </Box>
          <Box sx={{ display: "flex" }}>
            <Tooltip title="Chat info">
              <IconButton
                onClick={toggleChatInfo}
                size="small"
                sx={{
                  color: showChatInfo ? "primary.main" : "text.secondary",
                  mr: 1,
                  "&:hover": {
                    backgroundColor: alpha(theme.palette.primary.main, 0.1),
                  },
                }}>
                <InfoOutlinedIcon fontSize="small" />
              </IconButton>
            </Tooltip>

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
          </Box>
        </>
      )}
    </Box>
  );
};

export default ChatHeader;

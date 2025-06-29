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
  isSmallScreen?: boolean;
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
  isSmallScreen = false,
}) => {
  const theme = useTheme();

  // Function to truncate chat name
  const truncateName = (
    name: string | undefined | null,
    maxLength: number = 25
  ) => {
    if (!name) return "Unnamed Chat";
    return name.length > maxLength
      ? `${name.substring(0, maxLength)}...`
      : name;
  };

  return (
    <Box
      sx={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        px: isSmallScreen ? 2 : 3,
        py: isSmallScreen ? 1.5 : 2,
        borderBottom: "1px solid",
        borderColor: "divider",
        backgroundColor: alpha(theme.palette.background.paper, 0.5),
      }}>
      {chatLoading ? (
        <CircularProgress size={isSmallScreen ? 20 : 24} />
      ) : (
        <>
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              cursor: "pointer",
              minWidth: 0, // Allow content to shrink
              flexGrow: 1,
              mr: 1,
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
                  flexShrink: 0, // Prevent avatar from shrinking
                }}>
                <UserAvatar
                  username={data.chat.latestMessage.user.username}
                  imageUrl={data.chat.latestMessage.user.imageUrl}
                  status={
                    data.chat.latestMessage.user.status as unknown as UserStatus
                  }
                  showStatus={true}
                  size={isSmallScreen ? "small" : "medium"}
                  sx={{ mr: 0.5 }}
                />
              </Box>
            ) : (
              <Avatar
                {...getAvatarProps(data?.chat.name || "Chat")}
                sx={{
                  mr: isSmallScreen ? 1 : 2,
                  width: isSmallScreen ? 32 : 40,
                  height: isSmallScreen ? 32 : 40,
                  flexShrink: 0, // Prevent avatar from shrinking
                }}
              />
            )}
            <Typography
              variant={isSmallScreen ? "subtitle1" : "h6"}
              fontWeight={600}
              sx={{
                ml: isSmallScreen ? 0.5 : 1,
                overflow: "hidden",
                textOverflow: "ellipsis",
                whiteSpace: "nowrap",
              }}>
              {truncateName(data?.chat.name, isSmallScreen ? 20 : 25)}
            </Typography>
          </Box>
          <Box sx={{ display: "flex", flexShrink: 0 }}>
            <Tooltip title="Chat info">
              <IconButton
                onClick={toggleChatInfo}
                size={isSmallScreen ? "small" : "medium"}
                sx={{
                  color: showChatInfo ? "primary.main" : "text.secondary",
                  mr: isSmallScreen ? 0.5 : 1,
                  "&:hover": {
                    backgroundColor: alpha(theme.palette.primary.main, 0.1),
                  },
                }}>
                <InfoOutlinedIcon
                  fontSize={isSmallScreen ? "small" : "medium"}
                />
              </IconButton>
            </Tooltip>

            {isPinning ? (
              <CircularProgress size={isSmallScreen ? 16 : 20} />
            ) : (
              <Tooltip title={data?.chat.isPinned ? "Unpin chat" : "Pin chat"}>
                <span>
                  <IconButton
                    onClick={handlePinToggle}
                    disabled={isPinning}
                    size={isSmallScreen ? "small" : "medium"}
                    sx={{
                      color: data?.chat.isPinned
                        ? "primary.main"
                        : "text.secondary",
                      "&:hover": {
                        backgroundColor: alpha(theme.palette.primary.main, 0.1),
                      },
                    }}>
                    {data?.chat.isPinned ? (
                      <PushPinIcon
                        fontSize={isSmallScreen ? "small" : "medium"}
                      />
                    ) : (
                      <PushPinOutlinedIcon
                        fontSize={isSmallScreen ? "small" : "medium"}
                      />
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

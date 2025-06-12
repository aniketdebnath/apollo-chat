import {
  Box,
  Typography,
  Paper,
  alpha,
  useTheme,
  Avatar,
  InputBase,
  IconButton,
  Divider,
} from "@mui/material";
import { Send as SendIcon } from "@mui/icons-material";
import { useState } from "react";
import { mockMessages } from "./mockData";

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

// Format message time
const formatMessageTime = (dateString: string): string => {
  const date = new Date(dateString);
  return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
};

interface MessageProps {
  message: {
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
  showTimeDivider?: boolean;
}

const DemoMessage = ({ message, showTimeDivider }: MessageProps) => {
  const theme = useTheme();

  return (
    <>
      {showTimeDivider && (
        <Box
          sx={{
            display: "flex",
            justifyContent: "center",
            my: 2,
            position: "relative",
          }}>
          <Divider
            sx={{
              position: "absolute",
              width: "100%",
              top: "50%",
            }}
          />
          <Typography
            variant="caption"
            sx={{
              bgcolor: "background.paper",
              px: 2,
              py: 0.5,
              borderRadius: 1,
              position: "relative",
              zIndex: 1,
            }}>
            Today at{" "}
            {new Date(Date.now() - 10 * 60000).toLocaleTimeString([], {
              hour: "2-digit",
              minute: "2-digit",
            })}
          </Typography>
        </Box>
      )}
      <Box
        sx={{
          display: "flex",
          alignItems: "flex-start",
          mb: 2,
          px: 1,
        }}>
        {/* Avatar */}
        <Box sx={{ mr: 2, mt: 0.5 }}>
          <Avatar
            {...getAvatarProps(message.user.username)}
            sx={{ width: 40, height: 40 }}
          />
        </Box>

        {/* Message content */}
        <Box sx={{ maxWidth: "80%" }}>
          <Typography
            variant="subtitle2"
            color="text.secondary"
            sx={{ mb: 0.5 }}>
            {message.user.username}
          </Typography>

          <Paper
            elevation={0}
            sx={{
              p: 2,
              borderRadius: 2.5,
              backgroundColor: alpha(theme.palette.primary.main, 0.1),
              color: "text.primary",
            }}>
            <Typography variant="body1">{message.content}</Typography>
          </Paper>

          <Typography
            variant="caption"
            color="text.secondary"
            sx={{ display: "block", mt: 0.5, ml: 1 }}>
            {formatMessageTime(message.createdAt)}
          </Typography>
        </Box>
      </Box>
    </>
  );
};

const DemoChatArea = () => {
  const theme = useTheme();
  const [messageInput, setMessageInput] = useState("");

  // Set a specific fixed date for the demo: Thursday, Jun 12, 2025
  const demoDate = new Date(2025, 5, 12); // Note: Month is 0-indexed, so 5 = June

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
      {/* Chat Header */}
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          px: 3,
          py: 2,
          borderBottom: "1px solid",
          borderColor: "divider",
          backgroundColor: alpha(theme.palette.background.paper, 0.5),
        }}>
        <Avatar
          {...getAvatarProps("Product Team")}
          sx={{ mr: 2 }}
        />
        <Typography
          variant="h6"
          fontWeight={600}>
          Product Team
        </Typography>
      </Box>

      {/* Messages Container */}
      <Box
        sx={{
          flex: 1,
          overflow: "auto",
          p: 2,
          backgroundColor: alpha(theme.palette.background.default, 0.5),
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
        id="messages-container">
        {/* Date Divider */}
        <Box
          sx={{
            display: "flex",
            justifyContent: "center",
            my: 2,
            position: "relative",
          }}>
          <Divider
            sx={{
              position: "absolute",
              width: "100%",
              top: "50%",
            }}
          />
          <Typography
            variant="caption"
            sx={{
              bgcolor: "background.paper",
              px: 2,
              py: 0.5,
              borderRadius: 1,
              position: "relative",
              zIndex: 1,
            }}>
            {demoDate.toLocaleDateString(undefined, {
              weekday: "long",
              month: "short",
              day: "numeric",
              year: "numeric",
            })}
          </Typography>
        </Box>

        {mockMessages.map((message, index) => (
          <DemoMessage
            key={message._id}
            message={message}
            showTimeDivider={message._id === "demo-msg-6"}
          />
        ))}
      </Box>

      {/* Message Input */}
      <Box sx={{ p: 2, borderTop: "1px solid", borderColor: "divider" }}>
        <Paper
          elevation={0}
          sx={{
            p: "2px 4px",
            display: "flex",
            alignItems: "center",
            width: "100%",
            borderRadius: 3,
            backgroundColor: alpha(theme.palette.background.paper, 0.8),
            border: "1px solid",
            borderColor: "divider",
            "&:hover": {
              borderColor: theme.palette.primary.main,
            },
            transition: "all 0.2s ease",
          }}>
          <InputBase
            sx={{
              ml: 2,
              flex: 1,
              color: "text.primary",
              fontSize: "0.95rem",
              opacity: 1,
              "& .MuiInputBase-input": {
                cursor: "default",
              },
            }}
            onChange={(e) => setMessageInput(e.target.value)}
            value={messageInput}
            placeholder="Type a message..."
            readOnly
            multiline
            maxRows={4}
          />
          <IconButton
            color="primary"
            sx={{
              p: "10px",
              borderRadius: 2,
              transition: "all 0.2s ease",
              mr: 0.5,
              cursor: "default",
              pointerEvents: "none",
              "&:hover": {
                backgroundColor: "transparent",
              },
            }}>
            <SendIcon />
          </IconButton>
        </Paper>
      </Box>
    </Paper>
  );
};

export default DemoChatArea;

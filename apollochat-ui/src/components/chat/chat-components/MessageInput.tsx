import React, { useState } from "react";
import {
  Box,
  Paper,
  InputBase,
  IconButton,
  CircularProgress,
  alpha,
  useTheme,
} from "@mui/material";
import SendIcon from "@mui/icons-material/Send";

interface MessageInputProps {
  onSendMessage: (message: string) => Promise<void>;
  sendingMessage: boolean;
  isSmallScreen?: boolean;
}

const MessageInput: React.FC<MessageInputProps> = ({
  onSendMessage,
  sendingMessage,
  isSmallScreen = false,
}) => {
  const [message, setMessage] = useState("");
  const theme = useTheme();

  const handleCreateMessage = async () => {
    if (!message.trim()) return; // Prevent sending empty messages

    await onSendMessage(message);
    setMessage("");
  };

  return (
    <Box sx={{ p: isSmallScreen ? 1.5 : 2 }}>
      <Paper
        elevation={0}
        sx={{
          p: isSmallScreen ? "6px 12px" : "8px 16px",
          display: "flex",
          alignItems: "center",
          borderRadius: isSmallScreen ? 2 : 3,
          border: "1px solid",
          borderColor: "divider",
          backgroundColor: alpha(theme.palette.background.paper, 0.8),
          "&:hover": {
            borderColor: theme.palette.primary.main,
          },
          transition: "all 0.2s ease",
        }}>
        <InputBase
          sx={{
            ml: isSmallScreen ? 0.5 : 1,
            flex: 1,
            fontSize: isSmallScreen ? "0.875rem" : "1rem",
          }}
          placeholder="Type a message..."
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          onKeyPress={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              handleCreateMessage();
            }
          }}
          multiline
          maxRows={isSmallScreen ? 3 : 4}
        />
        <IconButton
          sx={{
            p: isSmallScreen ? "8px" : "10px",
            color: theme.palette.primary.main,
            "&:disabled": {
              color: alpha(theme.palette.primary.main, 0.5),
            },
          }}
          disabled={!message.trim() || sendingMessage}
          onClick={handleCreateMessage}>
          {sendingMessage ? (
            <CircularProgress
              size={isSmallScreen ? 20 : 24}
              color="inherit"
            />
          ) : (
            <SendIcon fontSize={isSmallScreen ? "small" : "medium"} />
          )}
        </IconButton>
      </Paper>
    </Box>
  );
};

export default MessageInput;

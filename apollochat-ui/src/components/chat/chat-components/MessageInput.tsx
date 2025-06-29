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
}

const MessageInput: React.FC<MessageInputProps> = ({
  onSendMessage,
  sendingMessage,
}) => {
  const [message, setMessage] = useState("");
  const theme = useTheme();

  const handleCreateMessage = async () => {
    if (!message.trim()) return; // Prevent sending empty messages

    await onSendMessage(message);
    setMessage("");
  };

  return (
    <Box sx={{ p: 2 }}>
      <Paper
        elevation={0}
        sx={{
          p: "8px 16px",
          display: "flex",
          alignItems: "center",
          borderRadius: 3,
          border: "1px solid",
          borderColor: "divider",
          backgroundColor: alpha(theme.palette.background.paper, 0.8),
          "&:hover": {
            borderColor: theme.palette.primary.main,
          },
          transition: "all 0.2s ease",
        }}>
        <InputBase
          sx={{ ml: 1, flex: 1 }}
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
          maxRows={4}
        />
        <IconButton
          sx={{
            p: "10px",
            color: theme.palette.primary.main,
            "&:disabled": {
              color: alpha(theme.palette.primary.main, 0.5),
            },
          }}
          disabled={!message.trim() || sendingMessage}
          onClick={handleCreateMessage}>
          {sendingMessage ? (
            <CircularProgress
              size={24}
              color="inherit"
            />
          ) : (
            <SendIcon />
          )}
        </IconButton>
      </Paper>
    </Box>
  );
};

export default MessageInput;

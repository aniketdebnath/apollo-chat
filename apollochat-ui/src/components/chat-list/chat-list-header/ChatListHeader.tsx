import AddIcon from "@mui/icons-material/Add";
import {
  Box,
  IconButton,
  Typography,
  alpha,
  useTheme,
  Paper,
} from "@mui/material";
import { useState } from "react";

interface ChatListHeaderProps {
  handleAddChat: () => void;
}

const ChatListHeader = ({ handleAddChat }: ChatListHeaderProps) => {
  const theme = useTheme();

  return (
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
          onClick={handleAddChat}
          color="primary"
          sx={{
            bgcolor: alpha(theme.palette.primary.main, 0.1),
            "&:hover": {
              bgcolor: alpha(theme.palette.primary.main, 0.2),
            },
            borderRadius: 1.5,
          }}>
          <AddIcon fontSize="small" />
        </IconButton>
      </Box>
    </Box>
  );
};

export default ChatListHeader;

import React from "react";
import { Box, Typography, IconButton, alpha, useTheme } from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";

interface ChatInfoHeaderProps {
  onBack: () => void;
  isSmallScreen?: boolean;
}

const ChatInfoHeader: React.FC<ChatInfoHeaderProps> = ({
  onBack,
  isSmallScreen = false,
}) => {
  const theme = useTheme();

  return (
    <Box
      sx={{
        display: "flex",
        alignItems: "center",
        px: isSmallScreen ? 2 : 3,
        py: isSmallScreen ? 1.5 : 2,
        backgroundColor: alpha(theme.palette.background.paper, 0.5),
        backdropFilter: "blur(8px)",
        boxShadow: "0 2px 8px rgba(0, 0, 0, 0.06)",
      }}>
      <IconButton
        onClick={onBack}
        sx={{
          mr: isSmallScreen ? 1.5 : 2,
          color: theme.palette.text.secondary,
          "&:hover": {
            backgroundColor: alpha(theme.palette.primary.main, 0.1),
            color: theme.palette.primary.main,
          },
          transition: "all 0.2s ease",
        }}
        size={isSmallScreen ? "small" : "medium"}>
        <ArrowBackIcon fontSize={isSmallScreen ? "small" : "medium"} />
      </IconButton>
      <Typography
        variant={isSmallScreen ? "subtitle1" : "h6"}
        fontWeight={600}>
        Chat Info
      </Typography>
    </Box>
  );
};

export default ChatInfoHeader;

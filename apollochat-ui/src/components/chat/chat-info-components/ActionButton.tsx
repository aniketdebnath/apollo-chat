import React from "react";
import { Button, alpha, useTheme } from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import ExitToAppIcon from "@mui/icons-material/ExitToApp";
import CircularProgress from "@mui/material/CircularProgress";

interface ActionButtonProps {
  isCreator: boolean;
  isLoading: boolean;
  onClick: () => void;
  isSmallScreen?: boolean;
}

const ActionButton: React.FC<ActionButtonProps> = ({
  isCreator,
  isLoading,
  onClick,
  isSmallScreen = false,
}) => {
  const theme = useTheme();

  return isCreator ? (
    <Button
      fullWidth
      variant="outlined"
      color="error"
      startIcon={<DeleteIcon fontSize={isSmallScreen ? "small" : "medium"} />}
      onClick={onClick}
      sx={{
        py: isSmallScreen ? 1 : 1.2,
        borderRadius: 2,
        fontWeight: 600,
        textTransform: "none",
        borderWidth: isSmallScreen ? 1 : 1.5,
        fontSize: isSmallScreen ? "0.875rem" : "inherit",
        "&:hover": {
          borderWidth: isSmallScreen ? 1 : 1.5,
          backgroundColor: alpha(theme.palette.error.main, 0.05),
        },
        transition: "all 0.2s ease",
      }}>
      {isLoading ? (
        <CircularProgress size={isSmallScreen ? 20 : 24} />
      ) : (
        "Delete Chat"
      )}
    </Button>
  ) : (
    <Button
      fullWidth
      variant="outlined"
      color="error"
      startIcon={
        <ExitToAppIcon fontSize={isSmallScreen ? "small" : "medium"} />
      }
      onClick={onClick}
      sx={{
        py: isSmallScreen ? 1 : 1.2,
        borderRadius: 2,
        fontWeight: 600,
        textTransform: "none",
        borderWidth: isSmallScreen ? 1 : 1.5,
        fontSize: isSmallScreen ? "0.875rem" : "inherit",
        "&:hover": {
          borderWidth: isSmallScreen ? 1 : 1.5,
          backgroundColor: alpha(theme.palette.error.main, 0.05),
        },
        transition: "all 0.2s ease",
      }}>
      {isLoading ? (
        <CircularProgress size={isSmallScreen ? 20 : 24} />
      ) : (
        "Leave Chat"
      )}
    </Button>
  );
};

export default ActionButton;

import React from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Typography,
  Button,
  CircularProgress,
  alpha,
  useTheme,
} from "@mui/material";

interface ConfirmDialogProps {
  open: boolean;
  title: string;
  content: string;
  confirmText: string;
  isLoading: boolean;
  onClose: () => void;
  onConfirm: () => void;
  isSmallScreen?: boolean;
}

const ConfirmDialog: React.FC<ConfirmDialogProps> = ({
  open,
  title,
  content,
  confirmText,
  isLoading,
  onClose,
  onConfirm,
  isSmallScreen = false,
}) => {
  const theme = useTheme();

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="xs"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: isSmallScreen ? 2 : 3,
          backgroundImage: `linear-gradient(135deg, ${alpha(
            theme.palette.background.paper,
            0.95
          )}, ${alpha(theme.palette.background.paper, 0.85)})`,
          backdropFilter: "blur(10px)",
          boxShadow: "0 8px 32px rgba(0, 0, 0, 0.2)",
        },
      }}>
      <DialogTitle
        sx={{
          fontWeight: 600,
          pt: isSmallScreen ? 2 : 3,
          pb: isSmallScreen ? 1 : 2,
          px: isSmallScreen ? 2 : 3,
          fontSize: isSmallScreen ? "1.1rem" : "1.25rem",
        }}>
        {title}
      </DialogTitle>
      <DialogContent
        sx={{
          px: isSmallScreen ? 2 : 3,
          py: isSmallScreen ? 1 : 2,
        }}>
        <Typography variant={isSmallScreen ? "body2" : "body1"}>
          {content}
        </Typography>
      </DialogContent>
      <DialogActions
        sx={{
          px: isSmallScreen ? 2 : 3,
          pb: isSmallScreen ? 2 : 3,
          pt: isSmallScreen ? 1 : 2,
        }}>
        <Button
          onClick={onClose}
          sx={{
            fontWeight: 500,
            textTransform: "none",
            borderRadius: 2,
            px: isSmallScreen ? 1.5 : 2,
            fontSize: isSmallScreen ? "0.875rem" : "inherit",
          }}>
          Cancel
        </Button>
        <Button
          color="error"
          variant="contained"
          onClick={onConfirm}
          disabled={isLoading}
          sx={{
            fontWeight: 600,
            textTransform: "none",
            borderRadius: 2,
            px: isSmallScreen ? 1.5 : 2,
            fontSize: isSmallScreen ? "0.875rem" : "inherit",
            boxShadow: "none",
            "&:hover": {
              boxShadow: "0 4px 12px rgba(255, 101, 132, 0.2)",
            },
          }}>
          {isLoading ? (
            <CircularProgress size={isSmallScreen ? 20 : 24} />
          ) : (
            confirmText
          )}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default ConfirmDialog;

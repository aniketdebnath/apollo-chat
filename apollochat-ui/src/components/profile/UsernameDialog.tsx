import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  IconButton,
  Alert,
  CircularProgress,
} from "@mui/material";
import { Close } from "@mui/icons-material";
import { useState, useEffect } from "react";

interface UsernameDialogProps {
  open: boolean;
  onClose: () => void;
  onUpdate: (username: string) => Promise<void>;
  currentUsername: string;
  loading: boolean;
}

export const UsernameDialog = ({
  open,
  onClose,
  onUpdate,
  currentUsername,
  loading,
}: UsernameDialogProps) => {
  const [username, setUsername] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    if (open) {
      setUsername(currentUsername);
      setError("");
    }
  }, [open, currentUsername]);

  const handleUpdate = async () => {
    if (!username || username.trim() === "") {
      setError("Username cannot be empty");
      return;
    }

    if (username === currentUsername) {
      onClose();
      return;
    }

    try {
      await onUpdate(username);
    } catch (error) {
      setError(
        error instanceof Error ? error.message : "Failed to update username"
      );
    }
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      fullWidth
      maxWidth="xs">
      <DialogTitle>
        Update Username
        <IconButton
          aria-label="close"
          onClick={onClose}
          sx={{
            position: "absolute",
            right: 8,
            top: 8,
          }}>
          <Close />
        </IconButton>
      </DialogTitle>
      <DialogContent>
        {error && (
          <Alert
            severity="error"
            sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}
        <TextField
          autoFocus
          margin="dense"
          label="New Username"
          type="text"
          fullWidth
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          variant="outlined"
          error={!!error}
        />
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button
          onClick={handleUpdate}
          variant="contained"
          disabled={loading || !username}>
          {loading ? <CircularProgress size={24} /> : "Update"}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

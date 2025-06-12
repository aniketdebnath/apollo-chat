import {
  Box,
  Button,
  Modal,
  Stack,
  TextField,
  Typography,
  Paper,
  IconButton,
  InputAdornment,
  alpha,
  useTheme,
  CircularProgress,
} from "@mui/material";
import { useState } from "react";

import { useCreateChat } from "../../../hooks/useCreateChat";
import { UNKNOWN_ERROR_MESSAGE } from "../../../constants/error";
import router from "../../Routes";
import CloseIcon from "@mui/icons-material/Close";
import ChatIcon from "@mui/icons-material/Chat";

interface ChatListAddProps {
  open: boolean;
  handleClose: () => void;
}

const ChatListAdd = ({ open, handleClose }: ChatListAddProps) => {
  const [error, setError] = useState("");
  const [name, setName] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const theme = useTheme();

  const onClose = () => {
    setError("");
    setName("");
    setIsSubmitting(false);
    handleClose();
  };

  const [createChat] = useCreateChat();

  const handleCreateChat = async () => {
    if (!name.trim()) {
      setError("Chat name is required.");
      return;
    }

    setIsSubmitting(true);

    try {
      const chat = await createChat({
        variables: {
          createChatInput: { name: name.trim() },
        },
      });
      onClose();
      router.navigate(`/chats/${chat.data?.createChat._id}`);
    } catch (error) {
      setError(UNKNOWN_ERROR_MESSAGE);
      setIsSubmitting(false);
    }
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      aria-labelledby="create-chat-modal">
      <Paper
        elevation={4}
        sx={{
          position: "absolute",
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          width: { xs: "90%", sm: 400 },
          backgroundColor: alpha(theme.palette.background.paper, 0.95),
          borderRadius: 3,
          p: 3,
          border: "1px solid",
          borderColor: "divider",
          outline: "none",
          maxWidth: "95vw",
          backdropFilter: "blur(10px)",
        }}>
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            mb: 3,
          }}>
          <Typography
            variant="h5"
            fontWeight={600}
            id="create-chat-modal">
            Create New Chat
          </Typography>
          <IconButton
            onClick={onClose}
            size="small">
            <CloseIcon fontSize="small" />
          </IconButton>
        </Box>

        <Stack spacing={3}>
          <TextField
            label="Chat Name"
            variant="outlined"
            value={name}
            onChange={(e) => setName(e.target.value)}
            error={!!error}
            helperText={error}
            fullWidth
            autoFocus
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <ChatIcon color="action" />
                </InputAdornment>
              ),
            }}
            sx={{
              "& .MuiOutlinedInput-root": {
                borderRadius: 2,
              },
            }}
          />

          <Button
            variant="contained"
            color="primary"
            onClick={handleCreateChat}
            disabled={isSubmitting || !name.trim()}
            sx={{
              py: 1.5,
              borderRadius: 2,
              textTransform: "none",
              fontWeight: 600,
            }}>
            {isSubmitting ? (
              <CircularProgress
                size={24}
                color="inherit"
              />
            ) : (
              "Create Chat"
            )}
          </Button>
        </Stack>
      </Paper>
    </Modal>
  );
};

export default ChatListAdd;

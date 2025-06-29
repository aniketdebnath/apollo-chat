import React, { useState } from "react";
import {
  Box,
  Typography,
  Avatar,
  Card,
  CardContent,
  Chip,
  TextField,
  Button,
  CircularProgress,
  IconButton,
  Tooltip,
  Stack,
  alpha,
  useTheme,
} from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import LockIcon from "@mui/icons-material/Lock";
import PublicIcon from "@mui/icons-material/Public";
import PersonIcon from "@mui/icons-material/Person";
import { Chat } from "../../../gql/graphql";
import { ChatType, chatTypeLabels } from "../../../constants/chatTypes";

interface ChatDetailsCardProps {
  chat: Chat;
  isCreator: boolean;
  isPrivateChat: boolean;
  updateChatName: (chatId: string, name: string) => Promise<void>;
  updatingChatName: boolean;
}

const ChatDetailsCard: React.FC<ChatDetailsCardProps> = ({
  chat,
  isCreator,
  isPrivateChat,
  updateChatName,
  updatingChatName,
}) => {
  const theme = useTheme();
  const [isEditingName, setIsEditingName] = useState(false);
  const [newChatName, setNewChatName] = useState(chat.name || "");

  const handleUpdateChatName = async () => {
    if (!newChatName.trim() || newChatName === chat.name) {
      setIsEditingName(false);
      setNewChatName(chat.name || "");
      return;
    }

    try {
      await updateChatName(chat._id, newChatName);
      setIsEditingName(false);
    } catch (error) {
      // Error is handled in the hook
    }
  };

  return (
    <Card
      elevation={0}
      sx={{
        mb: 3,
        borderRadius: 2.5,
        backgroundColor: alpha(theme.palette.background.default, 0.4),
        backdropFilter: "blur(8px)",
        transition: "all 0.3s ease",
        "&:hover": {
          transform: "translateY(-2px)",
          boxShadow: "0 8px 24px rgba(0, 0, 0, 0.12)",
        },
      }}>
      <CardContent sx={{ p: 2.5 }}>
        <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
          <Avatar
            sx={{
              width: 56,
              height: 56,
              mr: 2,
              backgroundColor: alpha(theme.palette.primary.main, 0.15),
              color: theme.palette.primary.main,
            }}>
            {isPrivateChat ? <LockIcon /> : <PublicIcon />}
          </Avatar>
          <Box sx={{ flex: 1 }}>
            {isEditingName ? (
              <Box sx={{ display: "flex", alignItems: "center", mb: 0.5 }}>
                <TextField
                  fullWidth
                  variant="outlined"
                  size="small"
                  value={newChatName}
                  onChange={(e) => setNewChatName(e.target.value)}
                  autoFocus
                  sx={{
                    mr: 1,
                    "& .MuiOutlinedInput-root": {
                      borderRadius: 2,
                    },
                  }}
                />
                <Button
                  variant="contained"
                  size="small"
                  onClick={handleUpdateChatName}
                  disabled={updatingChatName}
                  sx={{
                    minWidth: "auto",
                    borderRadius: 2,
                    textTransform: "none",
                  }}>
                  {updatingChatName ? (
                    <CircularProgress
                      size={20}
                      color="inherit"
                    />
                  ) : (
                    "Save"
                  )}
                </Button>
                <Button
                  variant="text"
                  size="small"
                  onClick={() => {
                    setIsEditingName(false);
                    setNewChatName(chat.name || "");
                  }}
                  sx={{
                    ml: 1,
                    minWidth: "auto",
                    color: "text.secondary",
                  }}>
                  Cancel
                </Button>
              </Box>
            ) : (
              <Box sx={{ display: "flex", alignItems: "center", mb: 0.5 }}>
                <Typography
                  variant="h6"
                  fontWeight={600}
                  sx={{ mr: 1 }}>
                  {chat.name || "Unnamed Chat"}
                </Typography>
                {isCreator && (
                  <Tooltip title="Edit chat name">
                    <IconButton
                      size="small"
                      onClick={() => setIsEditingName(true)}
                      sx={{
                        color: theme.palette.text.secondary,
                        "&:hover": {
                          color: theme.palette.primary.main,
                          backgroundColor: alpha(
                            theme.palette.primary.main,
                            0.1
                          ),
                        },
                      }}>
                      <EditIcon fontSize="small" />
                    </IconButton>
                  </Tooltip>
                )}
              </Box>
            )}

            <Stack
              direction="row"
              spacing={1}
              alignItems="center">
              <Chip
                icon={
                  chat.type === ChatType.PRIVATE ? (
                    <LockIcon fontSize="small" />
                  ) : (
                    <PublicIcon fontSize="small" />
                  )
                }
                label={
                  chatTypeLabels[chat.type as keyof typeof chatTypeLabels] ||
                  chat.type
                }
                size="small"
                color={chat.type === ChatType.PRIVATE ? "default" : "primary"}
                sx={{
                  borderRadius: 4,
                  height: 24,
                  "& .MuiChip-label": { px: 1 },
                }}
              />

              {!isPrivateChat && (
                <Typography
                  variant="caption"
                  color="text.secondary">
                  Anyone can join
                </Typography>
              )}
            </Stack>
          </Box>
        </Box>

        <Typography
          variant="body2"
          color="text.secondary"
          sx={{
            display: "flex",
            alignItems: "center",
            mt: 1,
          }}>
          <PersonIcon
            fontSize="small"
            sx={{ mr: 0.5, opacity: 0.7 }}
          />
          Created by: {chat.creator?.username || "Unknown"}
        </Typography>
      </CardContent>
    </Card>
  );
};

export default ChatDetailsCard;

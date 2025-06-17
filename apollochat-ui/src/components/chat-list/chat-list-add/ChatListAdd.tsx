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
  ToggleButtonGroup,
  ToggleButton,
  Tooltip,
  Avatar,
  Chip,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  Divider,
  FormHelperText,
} from "@mui/material";
import { useState, useEffect } from "react";

import { useCreateChat } from "../../../hooks/useCreateChat";
import { useSearchUsers } from "../../../hooks/useSearchUsers";
import { UNKNOWN_ERROR_MESSAGE } from "../../../constants/error";
import router from "../../Routes";
import CloseIcon from "@mui/icons-material/Close";
import ChatIcon from "@mui/icons-material/Chat";
import LockIcon from "@mui/icons-material/Lock";
import GroupIcon from "@mui/icons-material/Group";
import PublicIcon from "@mui/icons-material/Public";
import SearchIcon from "@mui/icons-material/Search";
import PersonAddIcon from "@mui/icons-material/PersonAdd";
import { ChatType, CHAT_TYPE_OPTIONS } from "../../../constants/chatTypes";
import { User } from "../../../gql/graphql";
import { debounce } from "lodash";

interface ChatListAddProps {
  open: boolean;
  handleClose: () => void;
}

const ChatListAdd = ({ open, handleClose }: ChatListAddProps) => {
  const [error, setError] = useState("");
  const [name, setName] = useState("");
  const [chatType, setChatType] = useState<ChatType>(ChatType.PRIVATE);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedUsers, setSelectedUsers] = useState<User[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const theme = useTheme();

  // Debounced search term for API calls
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState("");

  // Set up debounced search
  useEffect(() => {
    const handler = debounce(() => {
      setDebouncedSearchTerm(searchTerm);
    }, 300);

    handler();
    return () => {
      handler.cancel();
    };
  }, [searchTerm]);

  // Search users hook
  const { users, loading: searchLoading } = useSearchUsers(debouncedSearchTerm);

  // Filter out already selected users
  const filteredUsers = users.filter(
    (user) =>
      !selectedUsers.some((selectedUser) => selectedUser._id === user._id)
  );

  const onClose = () => {
    setError("");
    setName("");
    setChatType(ChatType.PRIVATE);
    setSearchTerm("");
    setSelectedUsers([]);
    setIsSubmitting(false);
    handleClose();
  };

  const { createChat, loading: createLoading } = useCreateChat();

  const handleCreateChat = async () => {
    if (!name.trim()) {
      setError("Chat name is required.");
      return;
    }

    setIsSubmitting(true);

    try {
      // Get member IDs for private chats
      const memberIds =
        chatType === ChatType.PRIVATE
          ? selectedUsers.map((user) => user._id)
          : [];

      const result = await createChat(name.trim(), chatType, memberIds);

      if (result) {
        onClose();
        router.navigate(`/chats/${result._id}`);
      }
    } catch (error) {
      setError(UNKNOWN_ERROR_MESSAGE);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChatTypeChange = (
    _event: React.MouseEvent<HTMLElement>,
    newType: ChatType | null
  ) => {
    if (newType !== null) {
      setChatType(newType);
    }
  };

  const handleAddUser = (user: User) => {
    setSelectedUsers([...selectedUsers, user]);
    setSearchTerm("");
  };

  const handleRemoveUser = (userId: string) => {
    setSelectedUsers(selectedUsers.filter((user) => user._id !== userId));
  };

  const getTypeIcon = (type: ChatType) => {
    switch (type) {
      case ChatType.PRIVATE:
        return <LockIcon fontSize="small" />;
      case ChatType.PUBLIC:
        return <GroupIcon fontSize="small" />;
      case ChatType.OPEN:
        return <PublicIcon fontSize="small" />;
      default:
        return <ChatIcon fontSize="small" />;
    }
  };

  // Find the selected chat type option
  const selectedTypeOption = CHAT_TYPE_OPTIONS.find(
    (option) => option.value === chatType
  );

  return (
    <Modal
      open={open}
      onClose={onClose}
      aria-labelledby="create-chat-modal">
      <Paper
        elevation={6}
        sx={{
          position: "absolute",
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          width: { xs: "90%", sm: 480 },
          backgroundColor: alpha(theme.palette.background.paper, 0.95),
          borderRadius: 3,
          border: "1px solid",
          borderColor: "divider",
          outline: "none",
          maxWidth: "95vw",
          maxHeight: "90vh",
          overflow: "auto",
          backdropFilter: "blur(10px)",
          boxShadow: `0 8px 32px ${alpha(theme.palette.common.black, 0.2)}`,
        }}>
        {/* Header */}
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            p: 3,
            pb: 2,
            borderBottom: "1px solid",
            borderColor: "divider",
            backgroundColor: alpha(theme.palette.background.default, 0.3),
            borderTopLeftRadius: 3,
            borderTopRightRadius: 3,
          }}>
          <Typography
            variant="h5"
            fontWeight={600}
            id="create-chat-modal"
            sx={{
              background: `linear-gradient(90deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
              backgroundClip: "text",
              color: "transparent",
              display: "inline",
            }}>
            Create New Chat
          </Typography>
          <IconButton
            onClick={onClose}
            size="small"
            sx={{
              backgroundColor: alpha(theme.palette.background.paper, 0.5),
              "&:hover": {
                backgroundColor: alpha(theme.palette.background.paper, 0.8),
              },
            }}>
            <CloseIcon fontSize="small" />
          </IconButton>
        </Box>

        {/* Content */}
        <Stack
          spacing={3}
          sx={{ p: 3 }}>
          {/* Chat Name Field */}
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
                transition: "all 0.2s ease",
                "&:hover": {
                  borderColor: theme.palette.primary.main,
                },
                "&.Mui-focused": {
                  boxShadow: `0 0 0 2px ${alpha(
                    theme.palette.primary.main,
                    0.2
                  )}`,
                },
              },
            }}
          />

          {/* Chat Type Selection */}
          <Box>
            <Typography
              variant="subtitle2"
              color="text.secondary"
              gutterBottom
              sx={{ mb: 1, fontWeight: 500 }}>
              Chat Type
            </Typography>
            <ToggleButtonGroup
              value={chatType}
              exclusive
              onChange={handleChatTypeChange}
              aria-label="chat type"
              fullWidth
              sx={{
                "& .MuiToggleButton-root": {
                  borderRadius: 2,
                  py: 1.2,
                  textTransform: "none",
                  fontWeight: 500,
                  borderColor: alpha(theme.palette.divider, 0.8),
                  "&.Mui-selected": {
                    backgroundColor: alpha(theme.palette.primary.main, 0.15),
                    "&:hover": {
                      backgroundColor: alpha(theme.palette.primary.main, 0.25),
                    },
                  },
                  "&:hover": {
                    backgroundColor: alpha(theme.palette.background.paper, 0.8),
                  },
                },
              }}>
              {CHAT_TYPE_OPTIONS.map((option) => (
                <ToggleButton
                  key={option.value}
                  value={option.value}
                  aria-label={option.label}>
                  <Tooltip
                    title={option.description}
                    arrow>
                    <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                      {getTypeIcon(option.value)}
                      <span>{option.label}</span>
                    </Box>
                  </Tooltip>
                </ToggleButton>
              ))}
            </ToggleButtonGroup>
            {selectedTypeOption && (
              <FormHelperText
                sx={{
                  mt: 1,
                  px: 1,
                  color: alpha(theme.palette.text.secondary, 0.8),
                }}>
                {selectedTypeOption.description}
              </FormHelperText>
            )}
          </Box>

          {/* Member Selection for Private Chats */}
          {chatType === ChatType.PRIVATE && (
            <Box>
              <Typography
                variant="subtitle2"
                color="text.secondary"
                gutterBottom
                sx={{ mb: 1, fontWeight: 500 }}>
                Add Members
              </Typography>

              {/* Selected Users Chips */}
              {selectedUsers.length > 0 && (
                <Box sx={{ mb: 2, display: "flex", flexWrap: "wrap", gap: 1 }}>
                  {selectedUsers.map((user) => (
                    <Chip
                      key={user._id}
                      avatar={
                        <Avatar
                          src={user.imageUrl || undefined}
                          sx={{
                            bgcolor: !user.imageUrl
                              ? `${theme.palette.primary.main}`
                              : undefined,
                          }}>
                          {user.username?.[0]?.toUpperCase() ||
                            user.email?.[0]?.toUpperCase()}
                        </Avatar>
                      }
                      label={user.username || user.email}
                      onDelete={() => handleRemoveUser(user._id)}
                      sx={{
                        borderRadius: 2,
                        bgcolor: alpha(theme.palette.background.paper, 0.6),
                        "& .MuiChip-deleteIcon": {
                          color: alpha(theme.palette.error.main, 0.7),
                          "&:hover": {
                            color: theme.palette.error.main,
                          },
                        },
                      }}
                    />
                  ))}
                </Box>
              )}

              {/* User Search Field */}
              <TextField
                label="Search users by email"
                placeholder="Type to search..."
                variant="outlined"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                fullWidth
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchIcon color="action" />
                    </InputAdornment>
                  ),
                  endAdornment: searchLoading && (
                    <InputAdornment position="end">
                      <CircularProgress size={20} />
                    </InputAdornment>
                  ),
                }}
                sx={{
                  "& .MuiOutlinedInput-root": {
                    borderRadius: 2,
                    transition: "all 0.2s ease",
                    "&:hover": {
                      borderColor: theme.palette.primary.main,
                    },
                    "&.Mui-focused": {
                      boxShadow: `0 0 0 2px ${alpha(
                        theme.palette.primary.main,
                        0.2
                      )}`,
                    },
                  },
                }}
              />

              {/* Search Results */}
              {debouncedSearchTerm && filteredUsers.length > 0 && (
                <Paper
                  elevation={3}
                  sx={{
                    mt: 1.5,
                    maxHeight: 200,
                    overflow: "auto",
                    borderRadius: 2,
                    border: "1px solid",
                    borderColor: alpha(theme.palette.divider, 0.6),
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
                  }}>
                  <List
                    dense
                    disablePadding>
                    {filteredUsers.map((user) => (
                      <Box key={user._id}>
                        <ListItem
                          button
                          onClick={() => handleAddUser(user)}
                          sx={{
                            py: 1,
                            transition: "all 0.2s ease",
                            "&:hover": {
                              backgroundColor: alpha(
                                theme.palette.primary.main,
                                0.1
                              ),
                            },
                          }}>
                          <ListItemAvatar>
                            <Avatar
                              src={user.imageUrl || undefined}
                              sx={{
                                bgcolor: !user.imageUrl
                                  ? `${theme.palette.primary.main}`
                                  : undefined,
                              }}>
                              {user.username?.[0]?.toUpperCase() ||
                                user.email?.[0]?.toUpperCase()}
                            </Avatar>
                          </ListItemAvatar>
                          <ListItemText
                            primary={
                              <Typography
                                variant="body2"
                                fontWeight={500}>
                                {user.username || "User"}
                              </Typography>
                            }
                            secondary={
                              <Typography
                                variant="caption"
                                color="text.secondary">
                                {user.email}
                              </Typography>
                            }
                          />
                          <IconButton
                            size="small"
                            color="primary"
                            sx={{
                              backgroundColor: alpha(
                                theme.palette.primary.main,
                                0.1
                              ),
                              "&:hover": {
                                backgroundColor: alpha(
                                  theme.palette.primary.main,
                                  0.2
                                ),
                              },
                            }}>
                            <PersonAddIcon fontSize="small" />
                          </IconButton>
                        </ListItem>
                        <Divider component="li" />
                      </Box>
                    ))}
                  </List>
                </Paper>
              )}

              {/* No Results Message */}
              {debouncedSearchTerm &&
                filteredUsers.length === 0 &&
                !searchLoading && (
                  <Typography
                    variant="body2"
                    color="text.secondary"
                    sx={{
                      mt: 2,
                      textAlign: "center",
                      py: 2,
                      backgroundColor: alpha(
                        theme.palette.background.default,
                        0.4
                      ),
                      borderRadius: 2,
                    }}>
                    No users found. Try a different search term.
                  </Typography>
                )}
            </Box>
          )}

          {/* Create Button */}
          <Button
            variant="contained"
            color="primary"
            onClick={handleCreateChat}
            disabled={
              isSubmitting ||
              !name.trim() ||
              (chatType === ChatType.PRIVATE && selectedUsers.length === 0)
            }
            sx={{
              py: 1.5,
              mt: 1,
              borderRadius: 2,
              textTransform: "none",
              fontWeight: 600,
              backgroundImage: `linear-gradient(to right, ${theme.palette.primary.main}, ${theme.palette.primary.dark})`,
              boxShadow: `0 4px 12px ${alpha(theme.palette.primary.main, 0.3)}`,
              transition: "all 0.3s ease",
              "&:hover": {
                boxShadow: `0 6px 16px ${alpha(
                  theme.palette.primary.main,
                  0.4
                )}`,
                transform: "translateY(-2px)",
              },
              "&:active": {
                transform: "translateY(0)",
              },
              "&.Mui-disabled": {
                background: alpha(theme.palette.action.disabledBackground, 0.8),
              },
            }}>
            {isSubmitting || createLoading ? (
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

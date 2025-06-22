import React, { useState } from "react";
import {
  Box,
  Typography,
  IconButton,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  Divider,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Paper,
  useTheme,
  alpha,
  Tooltip,
  CircularProgress,
  Chip,
  Avatar,
  Card,
  CardContent,
  Stack,
  TextField,
  Autocomplete,
} from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import DeleteIcon from "@mui/icons-material/Delete";
import ExitToAppIcon from "@mui/icons-material/ExitToApp";
import LockIcon from "@mui/icons-material/Lock";
import PublicIcon from "@mui/icons-material/Public";
import PeopleIcon from "@mui/icons-material/People";
import PersonIcon from "@mui/icons-material/Person";
import EditIcon from "@mui/icons-material/Edit";
import AddIcon from "@mui/icons-material/Add";
import { UserAvatar } from "../common/UserAvatar";
import { Chat, User } from "../../gql/graphql";
import { UserStatus } from "../../constants/userStatus";
import { ChatType, chatTypeLabels } from "../../constants/chatTypes";
import { useRemoveChatMember } from "../../hooks/useRemoveChatMember";
import { snackVar } from "../../constants/snack";
import { useNavigate } from "react-router-dom";
import { useDeleteChat } from "../../hooks/useDeleteChat";
import { useUpdateChatName } from "../../hooks/useUpdateChatName";
import { useSearchUsers } from "../../hooks/useSearchUsers";
import { useAddChatMember } from "../../hooks/useAddChatMember";

interface ChatInfoProps {
  chat: Chat;
  currentUserId: string;
  onBack: () => void;
}

export const ChatInfo: React.FC<ChatInfoProps> = ({
  chat,
  currentUserId,
  onBack,
}) => {
  const theme = useTheme();
  const navigate = useNavigate();
  const [confirmLeaveOpen, setConfirmLeaveOpen] = useState(false);
  const [confirmDeleteOpen, setConfirmDeleteOpen] = useState(false);
  const [memberToRemove, setMemberToRemove] = useState<User | null>(null);
  const [confirmRemoveOpen, setConfirmRemoveOpen] = useState(false);
  const [isEditingName, setIsEditingName] = useState(false);
  const [newChatName, setNewChatName] = useState(chat.name || "");
  const [isAddingMember, setIsAddingMember] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const { removeChatMember, loading: removingMember } = useRemoveChatMember();
  const { deleteChat, loading: deletingChat } = useDeleteChat();
  const { updateChatName, loading: updatingChatName } = useUpdateChatName();
  const { users: searchResults, loading: searching } =
    useSearchUsers(searchTerm);
  const { addMember: addChatMember, loading: addingMember } =
    useAddChatMember();
  const searchTimeoutRef = React.useRef<NodeJS.Timeout>();

  const handleLeaveChat = async () => {
    try {
      await removeChatMember(chat._id, currentUserId, true);
      snackVar({
        message: "You left the chat",
        type: "success",
      });
      navigate("/");
    } catch (error) {
      // Error is handled in the hook
    }
  };

  const handleAddMember = async () => {
    if (!selectedUser) return;

    try {
      await addChatMember(chat._id, selectedUser._id);
      snackVar({
        message: `Added ${selectedUser.username} to the chat`,
        type: "success",
      });
      setIsAddingMember(false);
      setSearchTerm("");
      setSelectedUser(null);
    } catch (error) {
      // Error is handled in the hook
    }
  };

  const handleRemoveMember = async () => {
    if (!memberToRemove) return;

    try {
      await removeChatMember(chat._id, memberToRemove._id);
      snackVar({
        message: `Removed ${memberToRemove.username || "member"} from the chat`,
        type: "success",
      });
      setConfirmRemoveOpen(false);
    } catch (error) {
      // Error is handled in the hook
    }
  };

  const handleDeleteChat = async () => {
    try {
      await deleteChat(chat._id);
      // Navigation is handled in the hook
      snackVar({
        message: "Chat deleted successfully",
        type: "success",
      });
    } catch (error) {
      // Error is handled in the hook
    }
  };

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

  const debouncedSearch = (term: string) => {
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }
    searchTimeoutRef.current = setTimeout(() => {
      setSearchTerm(term);
    }, 300);
  };

  const openRemoveConfirm = (member: User) => {
    setMemberToRemove(member);
    setConfirmRemoveOpen(true);
  };

  const isCreator = chat.creator?._id === currentUserId;
  const isPrivateChat = chat.type === ChatType.PRIVATE;

  const existingMemberIds = React.useMemo(
    () => chat.members.map((m) => m._id),
    [chat.members]
  );
  const filteredSearchResults = React.useMemo(
    () => searchResults.filter((u) => !existingMemberIds.includes(u._id)),
    [searchResults, existingMemberIds]
  );

  // Sort members: online first, then away, then dnd, then offline
  const sortedMembers = [...(chat.members || [])].sort((a, b) => {
    const statusOrder = {
      [UserStatus.ONLINE]: 0,
      [UserStatus.AWAY]: 1,
      [UserStatus.DND]: 2,
      [UserStatus.OFFLINE]: 3,
    };

    const aStatus = (a.status as unknown as UserStatus) || UserStatus.OFFLINE;
    const bStatus = (b.status as unknown as UserStatus) || UserStatus.OFFLINE;

    return statusOrder[aStatus] - statusOrder[bStatus];
  });

  return (
    <Paper
      elevation={0}
      sx={{
        display: "flex",
        flexDirection: "column",
        height: "100%",
        borderRadius: 3,
        overflow: "hidden",
        backgroundColor: alpha(theme.palette.background.paper, 0.8),
        backdropFilter: "blur(10px)",
        boxShadow: "0 4px 20px rgba(0, 0, 0, 0.08)",
      }}>
      {/* Chat Info Header */}
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          px: 3,
          py: 2,
          backgroundColor: alpha(theme.palette.background.paper, 0.5),
          backdropFilter: "blur(8px)",
          boxShadow: "0 2px 8px rgba(0, 0, 0, 0.06)",
        }}>
        <IconButton
          onClick={onBack}
          sx={{
            mr: 2,
            color: theme.palette.text.secondary,
            "&:hover": {
              backgroundColor: alpha(theme.palette.primary.main, 0.1),
              color: theme.palette.primary.main,
            },
            transition: "all 0.2s ease",
          }}
          size="small">
          <ArrowBackIcon />
        </IconButton>
        <Typography
          variant="h6"
          fontWeight={600}>
          Chat Info
        </Typography>
      </Box>

      {/* Chat Info Content */}
      <Box
        sx={{
          flex: 1,
          overflow: "auto",
          p: 3,
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
        {/* Chat Details Card */}
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
                      chatTypeLabels[
                        chat.type as keyof typeof chatTypeLabels
                      ] || chat.type
                    }
                    size="small"
                    color={
                      chat.type === ChatType.PRIVATE ? "default" : "primary"
                    }
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

        {/* Members Section */}
        <Box sx={{ mt: 4 }}>
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              mb: 2.5,
            }}>
            <PeopleIcon
              sx={{
                mr: 1.5,
                color: theme.palette.primary.main,
                opacity: 0.8,
              }}
            />
            <Typography
              variant="h6"
              fontWeight={600}>
              Members ({sortedMembers.length})
            </Typography>
            {isCreator && isPrivateChat && (
              <Tooltip title="Add Member">
                <IconButton
                  onClick={() => setIsAddingMember((prev) => !prev)}
                  size="small"
                  sx={{ ml: "auto" }}>
                  <AddIcon />
                </IconButton>
              </Tooltip>
            )}
          </Box>

          {isAddingMember && (
            <Card
              sx={{
                mb: 2,
                p: 2,
                borderRadius: 2.5,
                backgroundColor: alpha(theme.palette.background.default, 0.4),
              }}>
              <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                <Autocomplete
                  fullWidth
                  options={filteredSearchResults}
                  getOptionLabel={(option) => option.username}
                  isOptionEqualToValue={(option, value) =>
                    option._id === value._id
                  }
                  onChange={(e, value) => setSelectedUser(value)}
                  onInputChange={(e, newInputValue) =>
                    debouncedSearch(newInputValue)
                  }
                  loading={searching}
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      label="Search users to add"
                      size="small"
                      InputProps={{
                        ...params.InputProps,
                        endAdornment: (
                          <>
                            {searching ? (
                              <CircularProgress
                                color="inherit"
                                size={20}
                              />
                            ) : null}
                            {params.InputProps.endAdornment}
                          </>
                        ),
                      }}
                    />
                  )}
                  renderOption={(props, option) => (
                    <Box
                      component="li"
                      {...props}
                      key={option._id}>
                      <UserAvatar
                        username={option.username}
                        imageUrl={option.imageUrl}
                        sx={{ mr: 1.5 }}
                      />
                      {option.username}
                    </Box>
                  )}
                />
                <Button
                  variant="contained"
                  onClick={handleAddMember}
                  disabled={!selectedUser || addingMember}>
                  {addingMember ? (
                    <CircularProgress
                      size={24}
                      color="inherit"
                    />
                  ) : (
                    "Add"
                  )}
                </Button>
              </Box>
            </Card>
          )}

          <List
            disablePadding
            sx={{
              backgroundColor: alpha(theme.palette.background.default, 0.3),
              borderRadius: 3,
              p: 1,
            }}>
            {sortedMembers.map((member) => (
              <ListItem
                key={member._id}
                sx={{
                  borderRadius: 2,
                  mb: 0.5,
                  transition: "all 0.2s ease",
                  "&:hover": {
                    backgroundColor: alpha(theme.palette.primary.main, 0.08),
                    transform: "translateX(4px)",
                  },
                }}
                secondaryAction={
                  // Only show remove button for private chats or if user is creator
                  isCreator && member._id !== currentUserId && isPrivateChat ? (
                    <Tooltip title="Remove member">
                      <IconButton
                        edge="end"
                        size="small"
                        sx={{
                          color: theme.palette.text.secondary,
                          "&:hover": {
                            color: theme.palette.error.main,
                            backgroundColor: alpha(
                              theme.palette.error.main,
                              0.1
                            ),
                          },
                          transition: "all 0.2s ease",
                        }}
                        onClick={() => openRemoveConfirm(member)}>
                        <DeleteIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                  ) : null
                }>
                <ListItemAvatar>
                  <UserAvatar
                    username={member.username}
                    imageUrl={member.imageUrl}
                    status={member.status as unknown as UserStatus}
                    showStatus={true}
                    sx={{ mr: 0.5 }}
                  />
                </ListItemAvatar>
                <ListItemText
                  primary={
                    <Typography fontWeight={500}>
                      {member.username}
                      {member._id === currentUserId && (
                        <Typography
                          component="span"
                          variant="caption"
                          sx={{
                            ml: 1,
                            px: 1,
                            py: 0.2,
                            borderRadius: 1,
                            backgroundColor: alpha(
                              theme.palette.info.main,
                              0.1
                            ),
                            color: theme.palette.info.main,
                          }}>
                          You
                        </Typography>
                      )}
                      {member._id === chat.creator?._id && (
                        <Typography
                          component="span"
                          variant="caption"
                          sx={{
                            ml: 1,
                            px: 1,
                            py: 0.2,
                            borderRadius: 1,
                            backgroundColor: alpha(
                              theme.palette.secondary.main,
                              0.1
                            ),
                            color: theme.palette.secondary.main,
                          }}>
                          Creator
                        </Typography>
                      )}
                    </Typography>
                  }
                />
              </ListItem>
            ))}
          </List>
        </Box>
      </Box>

      {/* Action Buttons */}
      <Box
        sx={{
          p: 3,
          background: `linear-gradient(to top, ${alpha(
            theme.palette.background.paper,
            0.9
          )}, ${alpha(theme.palette.background.paper, 0.5)})`,
          backdropFilter: "blur(8px)",
        }}>
        {isCreator ? (
          <Button
            fullWidth
            variant="outlined"
            color="error"
            startIcon={<DeleteIcon />}
            onClick={() => setConfirmDeleteOpen(true)}
            sx={{
              py: 1.2,
              borderRadius: 2,
              fontWeight: 600,
              textTransform: "none",
              borderWidth: 1.5,
              "&:hover": {
                borderWidth: 1.5,
                backgroundColor: alpha(theme.palette.error.main, 0.05),
              },
              transition: "all 0.2s ease",
            }}>
            Delete Chat
          </Button>
        ) : (
          <Button
            fullWidth
            variant="outlined"
            color="error"
            startIcon={<ExitToAppIcon />}
            onClick={() => setConfirmLeaveOpen(true)}
            sx={{
              py: 1.2,
              borderRadius: 2,
              fontWeight: 600,
              textTransform: "none",
              borderWidth: 1.5,
              "&:hover": {
                borderWidth: 1.5,
                backgroundColor: alpha(theme.palette.error.main, 0.05),
              },
              transition: "all 0.2s ease",
            }}>
            Leave Chat
          </Button>
        )}
      </Box>

      {/* Leave Chat Confirmation Dialog */}
      <Dialog
        open={confirmLeaveOpen}
        onClose={() => setConfirmLeaveOpen(false)}
        maxWidth="xs"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: 3,
            backgroundImage: `linear-gradient(135deg, ${alpha(
              theme.palette.background.paper,
              0.95
            )}, ${alpha(theme.palette.background.paper, 0.85)})`,
            backdropFilter: "blur(10px)",
            boxShadow: "0 8px 32px rgba(0, 0, 0, 0.2)",
          },
        }}>
        <DialogTitle sx={{ fontWeight: 600 }}>Leave Chat?</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to leave this chat?
            {isPrivateChat && " You'll need to be added again to rejoin."}
          </Typography>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 3 }}>
          <Button
            onClick={() => setConfirmLeaveOpen(false)}
            sx={{
              fontWeight: 500,
              textTransform: "none",
              borderRadius: 2,
              px: 2,
            }}>
            Cancel
          </Button>
          <Button
            color="error"
            variant="contained"
            onClick={handleLeaveChat}
            disabled={removingMember}
            sx={{
              fontWeight: 600,
              textTransform: "none",
              borderRadius: 2,
              px: 2,
              boxShadow: "none",
              "&:hover": {
                boxShadow: "0 4px 12px rgba(255, 101, 132, 0.2)",
              },
            }}>
            {removingMember ? <CircularProgress size={24} /> : "Leave"}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete Chat Confirmation Dialog */}
      <Dialog
        open={confirmDeleteOpen}
        onClose={() => setConfirmDeleteOpen(false)}
        maxWidth="xs"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: 3,
            backgroundImage: `linear-gradient(135deg, ${alpha(
              theme.palette.background.paper,
              0.95
            )}, ${alpha(theme.palette.background.paper, 0.85)})`,
            backdropFilter: "blur(10px)",
            boxShadow: "0 8px 32px rgba(0, 0, 0, 0.2)",
          },
        }}>
        <DialogTitle sx={{ fontWeight: 600 }}>Delete Chat?</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to delete this chat? This action cannot be
            undone and all messages will be permanently lost.
          </Typography>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 3 }}>
          <Button
            onClick={() => setConfirmDeleteOpen(false)}
            sx={{
              fontWeight: 500,
              textTransform: "none",
              borderRadius: 2,
              px: 2,
            }}>
            Cancel
          </Button>
          <Button
            color="error"
            variant="contained"
            onClick={handleDeleteChat}
            disabled={deletingChat}
            sx={{
              fontWeight: 600,
              textTransform: "none",
              borderRadius: 2,
              px: 2,
              boxShadow: "none",
              "&:hover": {
                boxShadow: "0 4px 12px rgba(255, 101, 132, 0.2)",
              },
            }}>
            {deletingChat ? <CircularProgress size={24} /> : "Delete"}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Remove Member Confirmation Dialog */}
      <Dialog
        open={confirmRemoveOpen}
        onClose={() => setConfirmRemoveOpen(false)}
        maxWidth="xs"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: 3,
            backgroundImage: `linear-gradient(135deg, ${alpha(
              theme.palette.background.paper,
              0.95
            )}, ${alpha(theme.palette.background.paper, 0.85)})`,
            backdropFilter: "blur(10px)",
            boxShadow: "0 8px 32px rgba(0, 0, 0, 0.2)",
          },
        }}>
        <DialogTitle sx={{ fontWeight: 600 }}>Remove Member?</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to remove {memberToRemove?.username} from this
            chat?
            {!isPrivateChat &&
              " Note that they can rejoin this chat since it's public."}
          </Typography>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 3 }}>
          <Button
            onClick={() => setConfirmRemoveOpen(false)}
            sx={{
              fontWeight: 500,
              textTransform: "none",
              borderRadius: 2,
              px: 2,
            }}>
            Cancel
          </Button>
          <Button
            color="error"
            variant="contained"
            onClick={handleRemoveMember}
            disabled={removingMember}
            sx={{
              fontWeight: 600,
              textTransform: "none",
              borderRadius: 2,
              px: 2,
              boxShadow: "none",
              "&:hover": {
                boxShadow: "0 4px 12px rgba(255, 101, 132, 0.2)",
              },
            }}>
            {removingMember ? <CircularProgress size={24} /> : "Remove"}
          </Button>
        </DialogActions>
      </Dialog>
    </Paper>
  );
};

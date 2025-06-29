import React, { useState, useEffect } from "react";
import {
  Box,
  IconButton,
  Paper,
  useTheme,
  alpha,
  Tooltip,
  Tabs,
  Tab,
} from "@mui/material";

import AddIcon from "@mui/icons-material/Add";

import { Chat, User } from "../../gql/graphql";

import { ChatType } from "../../constants/chatTypes";
import { useRemoveChatMember } from "../../hooks/useRemoveChatMember";
import { snackVar } from "../../constants/snack";
import { useNavigate } from "react-router-dom";
import { useDeleteChat } from "../../hooks/useDeleteChat";
import { useUpdateChatName } from "../../hooks/useUpdateChatName";
import { useSearchUsers } from "../../hooks/useSearchUsers";
import { useAddChatMember } from "../../hooks/useAddChatMember";
import { useBanUser } from "../../hooks/useBanUser";
import { useUnbanUser } from "../../hooks/useUnbanUser";
import { useGetBannedUsers } from "../../hooks/useGetBannedUsers";
import { BanDuration } from "../../constants/banDuration";

// Import our components
import ChatInfoHeader from "./chat-info-components/ChatInfoHeader";
import ChatDetailsCard from "./chat-info-components/ChatDetailsCard";
import MembersList from "./chat-info-components/MembersList";
import AddMemberForm from "./chat-info-components/AddMemberForm";
import ActionButton from "./chat-info-components/ActionButton";
import ConfirmDialog from "./chat-info-components/ConfirmDialog";
import BannedUsersList from "./chat-info-components/BannedUsersList";
import BanUserDialog from "./chat-info-components/BanUserDialog";

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
  const [isAddingMember, setIsAddingMember] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [tabValue, setTabValue] = useState(0);
  const [memberToBan, setMemberToBan] = useState<User | null>(null);
  const [banDialogOpen, setBanDialogOpen] = useState(false);

  // Define isCreator here before it's used in useEffect
  const isCreator = chat.creator?._id === currentUserId;
  const isPrivateChat = chat.type === ChatType.PRIVATE;

  // Hooks
  const { removeChatMember, loading: removingMember } = useRemoveChatMember();
  const { deleteChat, loading: deletingChat } = useDeleteChat();
  const { updateChatName, loading: updatingChatName } = useUpdateChatName();
  const { users: searchResults, loading: searching } =
    useSearchUsers(searchTerm);
  const { addMember: addChatMember, loading: addingMember } =
    useAddChatMember();
  const { banUser, loading: banningUser } = useBanUser();
  const { unbanUser, loading: unbanningUser } = useUnbanUser();
  const {
    bannedUsers,
    loading: loadingBannedUsers,
    refetch: refetchBannedUsers,
  } = useGetBannedUsers(chat._id);

  // Fetch banned users when tab changes to banned users
  useEffect(() => {
    if (tabValue === 1 && isCreator) {
      refetchBannedUsers();
    }
  }, [tabValue, refetchBannedUsers, isCreator]);

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

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

  const handleAddMember = async (selectedUser: User | null) => {
    if (!selectedUser) return;

    try {
      const result = await addChatMember(chat._id, selectedUser._id);

      // Only show success message if we actually got a result back
      if (result) {
        snackVar({
          message: `Added ${selectedUser.username} to the chat`,
          type: "success",
        });
        setIsAddingMember(false);
        setSearchTerm("");
      }
    } catch (error) {
      // Let the error propagate to the AddMemberForm component
      throw error;
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

  const handleBanUser = async (
    userId: string,
    duration: BanDuration,
    reason: string
  ) => {
    try {
      await banUser(chat._id, userId, duration, reason);
      setBanDialogOpen(false);

      // Refresh both the members list and banned users list
      if (tabValue === 1) {
        refetchBannedUsers();
      }

      // Force refetch the chat to update the members list
      window.location.reload();
    } catch (error) {
      // Error is handled in the hook
    }
  };

  const handleUnbanUser = async (userId: string) => {
    try {
      await unbanUser(chat._id, userId);
      // Refresh the banned users list
      refetchBannedUsers();
    } catch (error) {
      // Error is handled in the hook
    }
  };

  const openRemoveConfirm = (member: User) => {
    setMemberToRemove(member);
    setConfirmRemoveOpen(true);
  };

  const openBanDialog = (member: User) => {
    setMemberToBan(member);
    setBanDialogOpen(true);
  };

  const existingMemberIds = React.useMemo(
    () => chat.members.map((m) => m._id),
    [chat.members]
  );

  const filteredSearchResults = React.useMemo(
    () => searchResults.filter((u) => !existingMemberIds.includes(u._id)),
    [searchResults, existingMemberIds]
  );

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
      <ChatInfoHeader onBack={onBack} />

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
        <ChatDetailsCard
          chat={chat}
          isCreator={isCreator}
          isPrivateChat={isPrivateChat}
          updateChatName={updateChatName}
          updatingChatName={updatingChatName}
        />

        {/* Tabs for Members and Banned Users */}
        {isCreator && (
          <Tabs
            value={tabValue}
            onChange={handleTabChange}
            sx={{
              mb: 2,
              "& .MuiTabs-indicator": {
                backgroundColor: theme.palette.primary.main,
              },
              "& .MuiTab-root": {
                textTransform: "none",
                fontWeight: 600,
                minWidth: 100,
              },
            }}>
            <Tab label="Members" />
            <Tab label="Banned Users" />
          </Tabs>
        )}

        {/* Members Tab */}
        {(tabValue === 0 || !isCreator) && (
          <Box sx={{ position: "relative" }}>
            {isCreator && isPrivateChat && (
              <Tooltip title="Add Member">
                <IconButton
                  onClick={() => setIsAddingMember((prev) => !prev)}
                  size="small"
                  sx={{ position: "absolute", right: 0, top: 4, zIndex: 2 }}>
                  <AddIcon />
                </IconButton>
              </Tooltip>
            )}

            {isAddingMember && (
              <AddMemberForm
                searchResults={filteredSearchResults}
                searching={searching}
                addingMember={addingMember}
                onSearch={setSearchTerm}
                onAddMember={handleAddMember}
              />
            )}

            <MembersList
              members={chat.members}
              currentUserId={currentUserId}
              creatorId={chat.creator?._id}
              isCreator={isCreator}
              isPrivateChat={isPrivateChat}
              onRemoveMember={openRemoveConfirm}
              onBanMember={isCreator ? openBanDialog : undefined}
            />
          </Box>
        )}

        {/* Banned Users Tab */}
        {tabValue === 1 && isCreator && (
          <BannedUsersList
            bannedUsers={bannedUsers}
            isLoading={loadingBannedUsers}
            onUnban={handleUnbanUser}
          />
        )}
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
        <ActionButton
          isCreator={isCreator}
          isLoading={isCreator ? deletingChat : removingMember}
          onClick={() =>
            isCreator ? setConfirmDeleteOpen(true) : setConfirmLeaveOpen(true)
          }
        />
      </Box>

      {/* Leave Chat Confirmation Dialog */}
      <ConfirmDialog
        open={confirmLeaveOpen}
        title="Leave Chat?"
        content={`Are you sure you want to leave this chat?${
          isPrivateChat ? " You'll need to be added again to rejoin." : ""
        }`}
        confirmText="Leave"
        isLoading={removingMember}
        onClose={() => setConfirmLeaveOpen(false)}
        onConfirm={handleLeaveChat}
      />

      {/* Delete Chat Confirmation Dialog */}
      <ConfirmDialog
        open={confirmDeleteOpen}
        title="Delete Chat?"
        content="Are you sure you want to delete this chat? This action cannot be undone and all messages will be permanently lost."
        confirmText="Delete"
        isLoading={deletingChat}
        onClose={() => setConfirmDeleteOpen(false)}
        onConfirm={handleDeleteChat}
      />

      {/* Remove Member Confirmation Dialog */}
      <ConfirmDialog
        open={confirmRemoveOpen}
        title="Remove Member?"
        content={`Are you sure you want to remove ${
          memberToRemove?.username
        } from this chat?${
          !isPrivateChat
            ? " Note that they can rejoin this chat since it's public."
            : ""
        }`}
        confirmText="Remove"
        isLoading={removingMember}
        onClose={() => setConfirmRemoveOpen(false)}
        onConfirm={handleRemoveMember}
      />

      {/* Ban User Dialog */}
      <BanUserDialog
        open={banDialogOpen}
        user={memberToBan}
        onClose={() => setBanDialogOpen(false)}
        onBan={handleBanUser}
        isLoading={banningUser}
      />
    </Paper>
  );
};

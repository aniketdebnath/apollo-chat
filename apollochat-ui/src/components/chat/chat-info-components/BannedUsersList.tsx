import React from "react";
import {
  Box,
  Typography,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  IconButton,
  Tooltip,
  alpha,
  useTheme,
  Chip,
} from "@mui/material";
import BlockIcon from "@mui/icons-material/Block";
import RestoreIcon from "@mui/icons-material/Restore";
import { UserAvatar } from "../../common/UserAvatar";
import { BannedUser } from "../../../gql/graphql";
import { format } from "date-fns";

interface BannedUsersListProps {
  bannedUsers: BannedUser[];
  isLoading: boolean;
  onUnban: (userId: string) => void;
}

const BannedUsersList: React.FC<BannedUsersListProps> = ({
  bannedUsers,
  isLoading,
  onUnban,
}) => {
  const theme = useTheme();

  if (bannedUsers.length === 0) {
    return (
      <Box sx={{ mt: 4 }}>
        <Box sx={{ display: "flex", alignItems: "center", mb: 2.5 }}>
          <BlockIcon
            sx={{ mr: 1.5, color: theme.palette.error.main, opacity: 0.8 }}
          />
          <Typography
            variant="h6"
            fontWeight={600}>
            Banned Users (0)
          </Typography>
        </Box>
        <Typography
          color="text.secondary"
          sx={{ ml: 1 }}>
          No banned users
        </Typography>
      </Box>
    );
  }

  const formatBanDate = (until: string | null) => {
    if (!until) return "Permanent";
    return `Until ${format(new Date(until), "MMM d, yyyy")}`;
  };

  return (
    <Box sx={{ mt: 4 }}>
      <Box sx={{ display: "flex", alignItems: "center", mb: 2.5 }}>
        <BlockIcon
          sx={{ mr: 1.5, color: theme.palette.error.main, opacity: 0.8 }}
        />
        <Typography
          variant="h6"
          fontWeight={600}>
          Banned Users ({bannedUsers.length})
        </Typography>
      </Box>

      <List
        disablePadding
        sx={{
          backgroundColor: alpha(theme.palette.background.default, 0.3),
          borderRadius: 3,
          p: 1,
        }}>
        {bannedUsers.map((bannedUser) => (
          <ListItem
            key={bannedUser.user._id}
            sx={{
              borderRadius: 2,
              mb: 0.5,
              transition: "all 0.2s ease",
              "&:hover": {
                backgroundColor: alpha(theme.palette.error.main, 0.05),
                transform: "translateX(4px)",
              },
            }}
            secondaryAction={
              <Tooltip title="Unban user">
                <IconButton
                  edge="end"
                  size="small"
                  onClick={() => onUnban(bannedUser.user._id)}
                  sx={{
                    color: theme.palette.text.secondary,
                    "&:hover": {
                      color: theme.palette.primary.main,
                      backgroundColor: alpha(theme.palette.primary.main, 0.1),
                    },
                    transition: "all 0.2s ease",
                  }}>
                  <RestoreIcon fontSize="small" />
                </IconButton>
              </Tooltip>
            }>
            <ListItemAvatar>
              <UserAvatar
                username={bannedUser.user.username}
                imageUrl={bannedUser.user.imageUrl}
                sx={{ mr: 0.5 }}
              />
            </ListItemAvatar>
            <ListItemText
              primary={
                <Box sx={{ display: "flex", alignItems: "center" }}>
                  <Typography
                    fontWeight={500}
                    sx={{ mr: 1 }}>
                    {bannedUser.user.username}
                  </Typography>
                  <Chip
                    label={formatBanDate(bannedUser.until)}
                    size="small"
                    color={!bannedUser.until ? "error" : "default"}
                    sx={{
                      height: 20,
                      fontSize: "0.7rem",
                      "& .MuiChip-label": { px: 1 },
                    }}
                  />
                </Box>
              }
              secondary={
                <Typography
                  variant="caption"
                  color="text.secondary">
                  {bannedUser.reason}
                </Typography>
              }
            />
          </ListItem>
        ))}
      </List>
    </Box>
  );
};

export default BannedUsersList;

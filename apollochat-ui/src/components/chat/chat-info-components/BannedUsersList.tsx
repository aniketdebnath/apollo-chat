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
  isSmallScreen?: boolean;
}

const BannedUsersList: React.FC<BannedUsersListProps> = ({
  bannedUsers,
  isLoading,
  onUnban,
  isSmallScreen = false,
}) => {
  const theme = useTheme();

  if (bannedUsers.length === 0) {
    return (
      <Box sx={{ mt: isSmallScreen ? 3 : 4 }}>
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            mb: isSmallScreen ? 2 : 2.5,
          }}>
          <BlockIcon
            sx={{
              mr: isSmallScreen ? 1 : 1.5,
              color: theme.palette.error.main,
              opacity: 0.8,
              fontSize: isSmallScreen ? "1.25rem" : "1.5rem",
            }}
          />
          <Typography
            variant={isSmallScreen ? "subtitle1" : "h6"}
            fontWeight={600}>
            Banned Users (0)
          </Typography>
        </Box>
        <Typography
          color="text.secondary"
          sx={{
            ml: isSmallScreen ? 0.5 : 1,
            fontSize: isSmallScreen ? "0.875rem" : "inherit",
          }}>
          No banned users
        </Typography>
      </Box>
    );
  }

  const formatBanDate = (until: string | null) => {
    if (!until) return "Permanent";
    return `Until ${format(
      new Date(until),
      isSmallScreen ? "MMM d" : "MMM d, yyyy"
    )}`;
  };

  return (
    <Box sx={{ mt: isSmallScreen ? 3 : 4 }}>
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          mb: isSmallScreen ? 2 : 2.5,
        }}>
        <BlockIcon
          sx={{
            mr: isSmallScreen ? 1 : 1.5,
            color: theme.palette.error.main,
            opacity: 0.8,
            fontSize: isSmallScreen ? "1.25rem" : "1.5rem",
          }}
        />
        <Typography
          variant={isSmallScreen ? "subtitle1" : "h6"}
          fontWeight={600}>
          Banned Users ({bannedUsers.length})
        </Typography>
      </Box>

      <List
        disablePadding
        sx={{
          backgroundColor: alpha(theme.palette.background.default, 0.3),
          borderRadius: isSmallScreen ? 2 : 3,
          p: isSmallScreen ? 0.75 : 1,
        }}>
        {bannedUsers.map((bannedUser) => (
          <ListItem
            key={bannedUser.user._id}
            sx={{
              borderRadius: isSmallScreen ? 1.5 : 2,
              mb: isSmallScreen ? 0.3 : 0.5,
              py: isSmallScreen ? 0.75 : 1,
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
                  size={isSmallScreen ? "small" : "medium"}
                  onClick={() => onUnban(bannedUser.user._id)}
                  sx={{
                    color: theme.palette.text.secondary,
                    "&:hover": {
                      color: theme.palette.primary.main,
                      backgroundColor: alpha(theme.palette.primary.main, 0.1),
                    },
                    transition: "all 0.2s ease",
                  }}>
                  <RestoreIcon fontSize={isSmallScreen ? "small" : "medium"} />
                </IconButton>
              </Tooltip>
            }>
            <ListItemAvatar>
              <UserAvatar
                username={bannedUser.user.username}
                imageUrl={bannedUser.user.imageUrl}
                size={isSmallScreen ? "small" : "medium"}
                sx={{ mr: 0.5 }}
              />
            </ListItemAvatar>
            <ListItemText
              primary={
                <Box sx={{ display: "flex", alignItems: "center" }}>
                  <Typography
                    fontWeight={500}
                    sx={{
                      mr: 1,
                      fontSize: isSmallScreen ? "0.875rem" : "inherit",
                    }}>
                    {bannedUser.user.username}
                  </Typography>
                  <Chip
                    label={formatBanDate(bannedUser.until)}
                    size="small"
                    color={!bannedUser.until ? "error" : "default"}
                    sx={{
                      height: isSmallScreen ? 18 : 20,
                      fontSize: isSmallScreen ? "0.65rem" : "0.7rem",
                      "& .MuiChip-label": { px: isSmallScreen ? 0.75 : 1 },
                    }}
                  />
                </Box>
              }
              secondary={
                <Typography
                  variant="caption"
                  color="text.secondary"
                  sx={{ fontSize: isSmallScreen ? "0.7rem" : "0.75rem" }}>
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

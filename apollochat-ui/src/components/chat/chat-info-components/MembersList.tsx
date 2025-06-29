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
  Menu,
  MenuItem,
  ListItemIcon,
  Divider,
} from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import PeopleIcon from "@mui/icons-material/People";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import BlockIcon from "@mui/icons-material/Block";
import { UserAvatar } from "../../common/UserAvatar";
import { User } from "../../../gql/graphql";
import { UserStatus } from "../../../constants/userStatus";

interface MembersListProps {
  members: User[];
  currentUserId: string;
  creatorId?: string;
  isCreator: boolean;
  isPrivateChat: boolean;
  onRemoveMember: (member: User) => void;
  onBanMember?: (member: User) => void;
  isSmallScreen?: boolean;
}

const MembersList: React.FC<MembersListProps> = ({
  members,
  currentUserId,
  creatorId,
  isCreator,
  isPrivateChat,
  onRemoveMember,
  onBanMember,
  isSmallScreen = false,
}) => {
  const theme = useTheme();
  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
  const [selectedMember, setSelectedMember] = React.useState<User | null>(null);
  const open = Boolean(anchorEl);

  const handleMenuOpen = (
    event: React.MouseEvent<HTMLElement>,
    member: User
  ) => {
    setAnchorEl(event.currentTarget);
    setSelectedMember(member);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    setSelectedMember(null);
  };

  const handleRemove = () => {
    if (selectedMember) {
      onRemoveMember(selectedMember);
      handleMenuClose();
    }
  };

  const handleBan = () => {
    if (selectedMember && onBanMember) {
      onBanMember(selectedMember);
      handleMenuClose();
    }
  };

  // Sort members: online first, then away, then dnd, then offline
  const sortedMembers = [...members].sort((a, b) => {
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
    <Box sx={{ mt: isSmallScreen ? 3 : 4 }}>
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          mb: isSmallScreen ? 2 : 2.5,
        }}>
        <PeopleIcon
          sx={{
            mr: isSmallScreen ? 1 : 1.5,
            color: theme.palette.primary.main,
            opacity: 0.8,
            fontSize: isSmallScreen ? "1.25rem" : "1.5rem",
          }}
        />
        <Typography
          variant={isSmallScreen ? "subtitle1" : "h6"}
          fontWeight={600}>
          Members ({sortedMembers.length})
        </Typography>
      </Box>

      <List
        disablePadding
        sx={{
          backgroundColor: alpha(theme.palette.background.default, 0.3),
          borderRadius: isSmallScreen ? 2 : 3,
          p: isSmallScreen ? 0.75 : 1,
        }}>
        {sortedMembers.map((member) => (
          <ListItem
            key={member._id}
            sx={{
              borderRadius: isSmallScreen ? 1.5 : 2,
              mb: isSmallScreen ? 0.3 : 0.5,
              py: isSmallScreen ? 0.75 : 1,
              transition: "all 0.2s ease",
              "&:hover": {
                backgroundColor: alpha(theme.palette.primary.main, 0.08),
                transform: "translateX(4px)",
              },
            }}
            secondaryAction={
              isCreator && member._id !== currentUserId ? (
                <Tooltip title="Member options">
                  <IconButton
                    edge="end"
                    size="small"
                    onClick={(e) => handleMenuOpen(e, member)}
                    sx={{
                      color: theme.palette.text.secondary,
                      "&:hover": {
                        color: theme.palette.primary.main,
                        backgroundColor: alpha(theme.palette.primary.main, 0.1),
                      },
                      transition: "all 0.2s ease",
                    }}>
                    <MoreVertIcon
                      fontSize={isSmallScreen ? "small" : "medium"}
                    />
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
                size={isSmallScreen ? "small" : "medium"}
                sx={{ mr: 0.5 }}
              />
            </ListItemAvatar>
            <ListItemText
              primary={
                <Typography
                  fontWeight={500}
                  fontSize={isSmallScreen ? "0.875rem" : "inherit"}>
                  {member.username}
                  {member._id === currentUserId && (
                    <Typography
                      component="span"
                      variant="caption"
                      sx={{
                        ml: isSmallScreen ? 0.5 : 1,
                        px: isSmallScreen ? 0.75 : 1,
                        py: 0.2,
                        borderRadius: 1,
                        backgroundColor: alpha(theme.palette.info.main, 0.1),
                        color: theme.palette.info.main,
                        fontSize: isSmallScreen ? "0.65rem" : "0.75rem",
                      }}>
                      You
                    </Typography>
                  )}
                  {member._id === creatorId && (
                    <Typography
                      component="span"
                      variant="caption"
                      sx={{
                        ml: isSmallScreen ? 0.5 : 1,
                        px: isSmallScreen ? 0.75 : 1,
                        py: 0.2,
                        borderRadius: 1,
                        backgroundColor: alpha(
                          theme.palette.secondary.main,
                          0.1
                        ),
                        color: theme.palette.secondary.main,
                        fontSize: isSmallScreen ? "0.65rem" : "0.75rem",
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

      <Menu
        anchorEl={anchorEl}
        open={open}
        onClose={handleMenuClose}
        anchorOrigin={{
          vertical: "bottom",
          horizontal: "right",
        }}
        transformOrigin={{
          vertical: "top",
          horizontal: "right",
        }}
        PaperProps={{
          elevation: 3,
          sx: {
            overflow: "visible",
            borderRadius: isSmallScreen ? 1.5 : 2,
            mt: 1.5,
            width: isSmallScreen ? 180 : 200,
            "&:before": {
              content: '""',
              display: "block",
              position: "absolute",
              top: 0,
              right: 14,
              width: 10,
              height: 10,
              bgcolor: "background.paper",
              transform: "translateY(-50%) rotate(45deg)",
              zIndex: 0,
            },
            "& .MuiMenuItem-root": {
              px: isSmallScreen ? 1.5 : 2,
              py: isSmallScreen ? 1.25 : 1.5,
              borderRadius: 1,
              mx: 0.5,
              my: 0.25,
              typography: "body2",
              fontWeight: 500,
              fontSize: isSmallScreen ? "0.875rem" : "inherit",
              transition: "all 0.15s ease",
            },
          },
        }}>
        <Box sx={{ px: isSmallScreen ? 1.5 : 2, py: isSmallScreen ? 0.75 : 1 }}>
          <Typography
            variant="subtitle2"
            fontWeight={600}
            sx={{
              opacity: 0.7,
              fontSize: isSmallScreen ? "0.8rem" : "0.875rem",
            }}>
            {selectedMember?.username}
          </Typography>
        </Box>
        <Divider sx={{ my: 0.5 }} />
        <MenuItem onClick={handleRemove}>
          <ListItemIcon>
            <DeleteIcon
              fontSize="small"
              color="error"
            />
          </ListItemIcon>
          <ListItemText primary="Remove" />
        </MenuItem>
        {onBanMember && isPrivateChat && (
          <MenuItem onClick={handleBan}>
            <ListItemIcon>
              <BlockIcon
                fontSize="small"
                color="error"
              />
            </ListItemIcon>
            <ListItemText primary="Ban" />
          </MenuItem>
        )}
      </Menu>
    </Box>
  );
};

export default MembersList;

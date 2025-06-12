import {
  Avatar,
  Box,
  IconButton,
  Menu,
  MenuItem,
  Tooltip,
  Typography,
  Divider,
  ListItemIcon,
  alpha,
  useTheme,
} from "@mui/material";
import { useState } from "react";
import { useLogout } from "../../hooks/useLogout";
import { onLogout } from "../../utils/logout";
import { snackVar } from "../../constants/snack";
import { UNKNOWN_ERROR_SNACK_MESSAGE } from "../../constants/error";
import router from "../Routes";
import PersonOutlineIcon from "@mui/icons-material/PersonOutline";
import LogoutIcon from "@mui/icons-material/Logout";
import { useGetMe } from "../../hooks/useGetMe";

// Function to create avatar props based on username
const getAvatarProps = (username: string) => {
  // Create a simple hash for the string
  let hash = 0;
  for (let i = 0; i < username.length; i++) {
    hash = username.charCodeAt(i) + ((hash << 5) - hash);
  }

  // Generate a color based on the hash
  const colors = [
    "#6C63FF", // primary
    "#FF6584", // secondary
    "#00B8A9", // success
    "#0084FF", // info
    "#FFAF20", // warning
  ];
  const colorIndex = Math.abs(hash) % colors.length;

  return {
    sx: {
      bgcolor: colors[colorIndex],
      width: 36,
      height: 36,
      border: "2px solid",
      borderColor: "background.paper",
    },
    children: username ? username.substring(0, 1).toUpperCase() : "U",
  };
};

const UserSettings = () => {
  const [anchorElUser, setAnchorElUser] = useState<null | HTMLElement>(null);
  const { logout } = useLogout();
  const { data: userData } = useGetMe();
  const theme = useTheme();

  const handleOpenUserMenu = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorElUser(event.currentTarget);
  };

  const handleCloseUserMenu = () => {
    setAnchorElUser(null);
  };

  const username = userData?.me?.username || "User";
  const avatarUrl = userData?.me?.imageUrl;

  return (
    <Box sx={{ ml: 1 }}>
      <Tooltip title="Account settings">
        <IconButton
          onClick={handleOpenUserMenu}
          size="small"
          sx={{
            p: 0.5,
            border: "2px solid",
            borderColor: alpha(theme.palette.primary.main, 0.2),
            transition: "all 0.2s ease-in-out",
            "&:hover": {
              borderColor: alpha(theme.palette.primary.main, 0.5),
            },
          }}>
          {avatarUrl ? (
            <Avatar
              alt={username}
              src={avatarUrl}
              sx={{ width: 32, height: 32 }}
            />
          ) : (
            <Avatar {...getAvatarProps(username)} />
          )}
        </IconButton>
      </Tooltip>
      <Menu
        anchorEl={anchorElUser}
        id="account-menu"
        open={Boolean(anchorElUser)}
        onClose={handleCloseUserMenu}
        onClick={handleCloseUserMenu}
        PaperProps={{
          elevation: 2,
          sx: {
            overflow: "visible",
            filter: "drop-shadow(0px 2px 8px rgba(0,0,0,0.32))",
            mt: 1.5,
            width: 200,
            borderRadius: 2,
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
          },
        }}
        transformOrigin={{ horizontal: "right", vertical: "top" }}
        anchorOrigin={{ horizontal: "right", vertical: "bottom" }}>
        <Box sx={{ px: 2, py: 1 }}>
          <Typography
            variant="subtitle1"
            fontWeight={600}
            noWrap>
            {username}
          </Typography>
          <Typography
            variant="body2"
            color="text.secondary"
            noWrap>
            {userData?.me?.email || ""}
          </Typography>
        </Box>

        <Divider />

        <MenuItem
          onClick={() => router.navigate("/profile")}
          sx={{ py: 1.5 }}>
          <ListItemIcon>
            <PersonOutlineIcon fontSize="small" />
          </ListItemIcon>
          <Typography variant="body2">Profile</Typography>
        </MenuItem>

        <MenuItem
          onClick={async () => {
            try {
              await logout();
              onLogout();
              handleCloseUserMenu();
            } catch (error) {
              snackVar(UNKNOWN_ERROR_SNACK_MESSAGE);
            }
          }}
          sx={{ py: 1.5 }}>
          <ListItemIcon>
            <LogoutIcon fontSize="small" />
          </ListItemIcon>
          <Typography variant="body2">Logout</Typography>
        </MenuItem>
      </Menu>
    </Box>
  );
};

export default UserSettings;

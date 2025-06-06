import {
  Avatar,
  Box,
  IconButton,
  Menu,
  MenuItem,
  Tooltip,
  Typography,
} from "@mui/material";
import { useState } from "react";
import { useLogout } from "../../hooks/useLogout";
import { onLogout } from "../../utils/logout";
import { snackVar } from "../../constants/snack";
import { UNKNOWN_ERROR_SNACK_MESSAGE } from "../../constants/error";
import router from "../Routes";

const UserSettings = () => {
  const [anchorElUser, setAnchorElUser] = useState<null | HTMLElement>(null);
  const { logout } = useLogout();
  const handleOpenUserMenu = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorElUser(event.currentTarget);
  };

  const handleCloseUserMenu = () => {
    setAnchorElUser(null);
  };
  return (
    <Box sx={{ flexGrow: 0 }}>
      <Tooltip title="Open settings">
        <IconButton
          onClick={handleOpenUserMenu}
          sx={{ p: 0 }}>
          <Avatar
            alt="Remy Sharp"
            src=""
          />
        </IconButton>
      </Tooltip>
      <Menu
        sx={{ mt: "45px" }}
        id="menu-appbar"
        anchorEl={anchorElUser}
        anchorOrigin={{
          vertical: "top",
          horizontal: "right",
        }}
        keepMounted
        transformOrigin={{
          vertical: "top",
          horizontal: "right",
        }}
        open={Boolean(anchorElUser)}
        onClose={async () => {
          handleCloseUserMenu();
        }}>
        <MenuItem
          key="profile"
          onClick={() => router.navigate("/profile")}>
          <Typography textAlign="center">Profile</Typography>
        </MenuItem>
        <MenuItem
          key="logout"
          onClick={async () => {
            try {
              await logout();
              onLogout();
              handleCloseUserMenu();
            } catch (error) {
              snackVar(UNKNOWN_ERROR_SNACK_MESSAGE);
            }
          }}>
          <Typography sx={{ textAlign: "center" }}>Logout</Typography>
        </MenuItem>
      </Menu>
    </Box>
  );
};
export default UserSettings;

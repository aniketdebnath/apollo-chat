import React, { useState, useEffect } from "react";
import {
  AppBar,
  Toolbar,
  Container,
  IconButton,
  Box,
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemText,
  Divider,
  useTheme,
  useMediaQuery,
  Badge,
  Tooltip,
  alpha,
  Typography,
  Avatar,
  ListItemIcon,
} from "@mui/material";
import MenuIcon from "@mui/icons-material/Menu";
import CloseIcon from "@mui/icons-material/Close";
import ChatIcon from "@mui/icons-material/Chat";
import ExploreIcon from "@mui/icons-material/ExploreOutlined";
import NotificationsIcon from "@mui/icons-material/NotificationsOutlined";
import StarIcon from "@mui/icons-material/StarOutline";
import AccountCircleIcon from "@mui/icons-material/AccountCircle";
import HomeIcon from "@mui/icons-material/Home";
import LogoutIcon from "@mui/icons-material/Logout";
import Logo from "./Logo";
import MobileLogo from "./mobile/MobileLogo";
import Navigation from "./Navigation";
import UserSettings from "./UserSettings";
import { useReactiveVar } from "@apollo/client";
import { authenticatedVar } from "../../constants/authenticated";
import { Pages } from "../../interfaces/pages.interface";
import { ChatList } from "../chat-list/ChatList";
import router from "../Routes";
import { usePath } from "../../hooks/usePath";
import DemoChatList from "../demo/DemoChatList";
import { useLogout } from "../../hooks/useLogout";
import { onLogout } from "../../utils/logout";
import { snackVar } from "../../constants/snack";
import { UNKNOWN_ERROR_SNACK_MESSAGE } from "../../constants/error";
import { useGetMe } from "../../hooks/useGetMe";
import { StatusSelector } from "../status/StatusSelector";
import { UserStatus } from "../../constants/userStatus";

const pages: Pages[] = [
  {
    title: "Home",
    path: "/",
  },
  {
    title: "Explore",
    path: "/explore",
  },
  {
    title: "Favorites",
    path: "/favorites",
  },
  {
    title: "Notifications",
    path: "/notifications",
  },
];

const unauthenticatedPages: Pages[] = [
  {
    title: "Login",
    path: "/login",
  },
  {
    title: "Signup",
    path: "/signup",
  },
];

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

const Header = () => {
  const authenticated = useReactiveVar(authenticatedVar);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));
  const [chatDrawerOpen, setChatDrawerOpen] = useState(false);
  const [navDrawerOpen, setNavDrawerOpen] = useState(false);
  const { path } = usePath();
  const isDemoPage = path === "/demo";
  const { logout } = useLogout();
  const { data: userData } = useGetMe();

  // Add event listener for chat selection
  useEffect(() => {
    const handleChatSelected = () => {
      if (isMobile) {
        setChatDrawerOpen(false);
      }
    };

    window.addEventListener("chatSelected", handleChatSelected);

    return () => {
      window.removeEventListener("chatSelected", handleChatSelected);
    };
  }, [isMobile]);

  const toggleChatDrawer = () => {
    setChatDrawerOpen(!chatDrawerOpen);
  };

  const toggleNavDrawer = () => {
    setNavDrawerOpen(!navDrawerOpen);
  };

  const handleNavigation = (path: string) => {
    router.navigate(path);
    setChatDrawerOpen(false);
    setNavDrawerOpen(false);
  };

  const handleLogout = async () => {
    try {
      await logout();
      onLogout();
      setNavDrawerOpen(false);
    } catch (error) {
      snackVar(UNKNOWN_ERROR_SNACK_MESSAGE);
    }
  };

  const username = userData?.me?.username || "User";
  const avatarUrl = userData?.me?.imageUrl;
  const userStatus =
    (userData?.me?.status as unknown as UserStatus) || UserStatus.OFFLINE;

  return (
    <>
      <AppBar
        position="sticky"
        elevation={0}
        sx={{
          zIndex: (theme) => theme.zIndex.drawer + 1,
          background: "transparent",
          backdropFilter: "blur(10px)",
          borderBottom: "1px solid",
          borderColor: "divider",
          boxShadow: "0 4px 20px rgba(0, 0, 0, 0.08)",
        }}>
        <Container maxWidth="xl">
          <Toolbar
            disableGutters
            sx={{
              minHeight: { xs: 64, md: 70 },
              justifyContent: "space-between",
            }}>
            {/* Left side - Logo and desktop navigation */}
            <Box sx={{ display: "flex", alignItems: "center" }}>
              {isMobile ? (
                <Box sx={{ display: "flex", alignItems: "center" }}>
                  {(authenticated || isDemoPage) && (
                    <Tooltip title="Chats">
                      <IconButton
                        onClick={toggleChatDrawer}
                        color="primary"
                        sx={{
                          borderRadius: 2,
                          mr: 1,
                          bgcolor: (theme) =>
                            alpha(theme.palette.primary.main, 0.1),
                          "&:hover": {
                            bgcolor: (theme) =>
                              alpha(theme.palette.primary.main, 0.2),
                          },
                        }}>
                        <Badge
                          color="secondary"
                          variant="dot">
                          <ChatIcon />
                        </Badge>
                      </IconButton>
                    </Tooltip>
                  )}
                  <MobileLogo />
                </Box>
              ) : (
                <>
                  <Logo />
                  <Navigation
                    pages={authenticated ? pages : unauthenticatedPages}
                  />
                </>
              )}
            </Box>

            {/* Right side - Actions */}
            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
              {isMobile && (
                <Tooltip title="Menu">
                  <IconButton
                    onClick={toggleNavDrawer}
                    color="primary"
                    sx={{
                      borderRadius: 2,
                      bgcolor: (theme) =>
                        alpha(theme.palette.primary.main, 0.1),
                      "&:hover": {
                        bgcolor: (theme) =>
                          alpha(theme.palette.primary.main, 0.2),
                      },
                    }}>
                    <MenuIcon />
                  </IconButton>
                </Tooltip>
              )}

              {!isMobile && authenticated && <UserSettings />}
            </Box>
          </Toolbar>
        </Container>
      </AppBar>

      {/* Mobile drawer for chats */}
      <Drawer
        anchor="left"
        open={chatDrawerOpen && (authenticated || isDemoPage)}
        onClose={toggleChatDrawer}
        sx={{
          "& .MuiDrawer-paper": {
            width: "85%",
            maxWidth: 360,
            boxSizing: "border-box",
            borderRight: "1px solid",
            borderColor: "divider",
            backgroundImage:
              "linear-gradient(to bottom, rgba(35,35,35,1), rgba(25,25,25,1))",
          },
        }}>
        <Toolbar
          sx={{
            minHeight: 64,
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            borderBottom: "1px solid",
            borderColor: "divider",
            px: 2,
          }}>
          <Typography
            variant="h6"
            fontWeight={600}
            sx={{
              backgroundImage: "linear-gradient(90deg, #6C63FF, #FF6584)",
              backgroundClip: "text",
              color: "transparent",
            }}>
            Chats
          </Typography>
          <IconButton
            onClick={toggleChatDrawer}
            edge="end">
            <CloseIcon />
          </IconButton>
        </Toolbar>
        <Box sx={{ overflow: "auto", height: "calc(100% - 64px)" }}>
          {isDemoPage ? <DemoChatList /> : <ChatList />}
        </Box>
      </Drawer>

      {/* Mobile drawer for navigation */}
      <Drawer
        anchor="right"
        open={navDrawerOpen}
        onClose={toggleNavDrawer}
        sx={{
          "& .MuiDrawer-paper": {
            width: 280,
            backgroundImage:
              "linear-gradient(to bottom, rgba(35,35,35,1), rgba(25,25,25,1))",
          },
        }}>
        <Toolbar
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            borderBottom: "1px solid",
            borderColor: "divider",
            px: 2,
          }}>
          <Typography
            variant="h6"
            fontWeight={600}
            sx={{
              backgroundImage: "linear-gradient(90deg, #6C63FF, #FF6584)",
              backgroundClip: "text",
              color: "transparent",
            }}>
            {authenticated ? "Menu" : "Apollo Chat"}
          </Typography>
          <IconButton
            onClick={toggleNavDrawer}
            edge="end">
            <CloseIcon />
          </IconButton>
        </Toolbar>

        {authenticated && (
          <Box
            sx={{
              px: 2,
              py: 2,
              display: "flex",
              alignItems: "center",
              borderBottom: "1px solid",
              borderColor: "divider",
            }}>
            <Box sx={{ mr: 2 }}>
              {avatarUrl ? (
                <Avatar
                  alt={username}
                  src={avatarUrl}
                  sx={{
                    width: 40,
                    height: 40,
                    border: "2px solid",
                    borderColor: alpha(theme.palette.primary.main, 0.3),
                  }}
                />
              ) : (
                <Avatar {...getAvatarProps(username)} />
              )}
            </Box>
            <Box>
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
          </Box>
        )}

        {authenticated && (
          <Box
            sx={{
              px: 2,
              py: 1.5,
              borderBottom: "1px solid",
              borderColor: "divider",
            }}>
            <StatusSelector currentStatus={userStatus} />
          </Box>
        )}

        <List sx={{ flexGrow: 1 }}>
          {authenticated ? (
            <>
              {/* Home */}
              <ListItem disablePadding>
                <ListItemButton
                  onClick={() => handleNavigation("/")}
                  sx={{ py: 1.5 }}>
                  <Box sx={{ mr: 2, color: "primary.main" }}>
                    <HomeIcon fontSize="small" />
                  </Box>
                  <ListItemText primary="Home" />
                </ListItemButton>
              </ListItem>
              <Divider />

              {/* Explore */}
              <ListItem disablePadding>
                <ListItemButton
                  onClick={() => handleNavigation("/explore")}
                  sx={{ py: 1.5 }}>
                  <Box sx={{ mr: 2, color: "primary.main" }}>
                    <ExploreIcon fontSize="small" />
                  </Box>
                  <ListItemText primary="Explore" />
                </ListItemButton>
              </ListItem>
              <Divider />

              {/* Favorites */}
              <ListItem disablePadding>
                <ListItemButton
                  onClick={() => handleNavigation("/favorites")}
                  sx={{ py: 1.5 }}>
                  <Box sx={{ mr: 2, color: "primary.main" }}>
                    <StarIcon fontSize="small" />
                  </Box>
                  <ListItemText primary="Favorites" />
                </ListItemButton>
              </ListItem>
              <Divider />

              {/* Notifications */}
              <ListItem disablePadding>
                <ListItemButton
                  onClick={() => handleNavigation("/notifications")}
                  sx={{ py: 1.5 }}>
                  <Box sx={{ mr: 2, color: "primary.main" }}>
                    <NotificationsIcon fontSize="small" />
                  </Box>
                  <ListItemText primary="Notifications" />
                </ListItemButton>
              </ListItem>
              <Divider />

              {/* Profile */}
              <ListItem disablePadding>
                <ListItemButton
                  onClick={() => handleNavigation("/profile")}
                  sx={{ py: 1.5 }}>
                  <Box sx={{ mr: 2, color: "primary.main" }}>
                    <AccountCircleIcon fontSize="small" />
                  </Box>
                  <ListItemText primary="Profile" />
                </ListItemButton>
              </ListItem>
              <Divider />
            </>
          ) : (
            // Unauthenticated navigation
            unauthenticatedPages.map((page) => (
              <React.Fragment key={page.path}>
                <ListItem disablePadding>
                  <ListItemButton
                    onClick={() => handleNavigation(page.path)}
                    sx={{ py: 1.5 }}>
                    <ListItemText primary={page.title} />
                  </ListItemButton>
                </ListItem>
                <Divider />
              </React.Fragment>
            ))
          )}
        </List>

        {authenticated && (
          <Box sx={{ mt: "auto" }}>
            <Divider />
            <ListItem disablePadding>
              <ListItemButton
                onClick={handleLogout}
                sx={{ py: 2, color: theme.palette.error.main }}>
                <ListItemIcon sx={{ color: "inherit" }}>
                  <LogoutIcon fontSize="small" />
                </ListItemIcon>
                <ListItemText primary="Logout" />
              </ListItemButton>
            </ListItem>
          </Box>
        )}
      </Drawer>
    </>
  );
};

export default Header;

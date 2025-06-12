import React, { useState } from "react";
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
} from "@mui/material";
import MenuIcon from "@mui/icons-material/Menu";
import CloseIcon from "@mui/icons-material/Close";
import ChatIcon from "@mui/icons-material/Chat";
import ExploreIcon from "@mui/icons-material/ExploreOutlined";
import NotificationsIcon from "@mui/icons-material/NotificationsOutlined";
import StarIcon from "@mui/icons-material/StarOutline";
import AccountCircleIcon from "@mui/icons-material/AccountCircle";
import HomeIcon from "@mui/icons-material/Home";
import Logo from "./Logo";
import MobileLogo from "./mobile/MobileLogo";
import Navigation from "./Navigation";
import UserSettings from "./UserSettings";
import { useReactiveVar } from "@apollo/client";
import { authenticatedVar } from "../../constants/authenticated";
import { Pages } from "../../interfaces/pages.interface";
import { ChatList } from "../chat-list/ChatList";
import router from "../Routes";

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

const Header = () => {
  const authenticated = useReactiveVar(authenticatedVar);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));
  const [chatDrawerOpen, setChatDrawerOpen] = useState(false);
  const [navDrawerOpen, setNavDrawerOpen] = useState(false);

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
                  {authenticated && (
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
        open={chatDrawerOpen && authenticated}
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
          <ChatList />
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

        <List>
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
      </Drawer>
    </>
  );
};

export default Header;

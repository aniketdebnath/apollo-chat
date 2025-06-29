import {
  Container,
  Box,
  Typography,
  Button,
  Paper,
  Grid,
  useTheme,
  alpha,
  Card,
  CardContent,
  CardActionArea,
} from "@mui/material";
import { useNavigate } from "react-router-dom";
import { useGetMe } from "../../hooks/useGetMe";
import { useReactiveVar } from "@apollo/client";
import { authenticatedVar } from "../../constants/authenticated";
import {
  ChatBubbleOutline,
  Person,
  AddCircleOutline,
  ExploreOutlined,
  NotificationsOutlined,
  StarOutlined,
} from "@mui/icons-material";
import { useGetChats } from "../../hooks/useGetChats";
import { useState } from "react";
import ChatListAdd from "../chat-list/chat-list-add/ChatListAdd";
import { useResponsive } from "../../hooks/useResponsive";

const Home = () => {
  const navigate = useNavigate();
  const theme = useTheme();
  const authenticated = useReactiveVar(authenticatedVar);
  const { data: userData } = useGetMe();
  const { data: chatsData } = useGetChats();
  const [chatAddVisible, setChatAddVisible] = useState(false);
  const { isXs, isSm, isMd } = useResponsive();

  const handleAddChat = () => {
    setChatAddVisible(true);
  };

  // Create a scrollable container component
  const ScrollableContainer = ({ children }: { children: React.ReactNode }) => (
    <Box
      sx={{
        height: "100%",
        width: "100%",
        overflowY: "auto",
        overflowX: "hidden",
        position: "absolute",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        WebkitOverflowScrolling: "touch", // For smoother scrolling on iOS
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
      {children}
    </Box>
  );

  if (!authenticated) {
    return (
      <Box
        sx={{
          position: "relative",
          height: "calc(100vh - 64px)",
          overflow: "hidden",
        }}>
        <ScrollableContainer>
          <Box
            sx={{
              minHeight: "calc(100vh - 64px)",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              backgroundImage:
                "radial-gradient(circle at 30% 30%, rgba(108, 99, 255, 0.15) 0%, transparent 70%), radial-gradient(circle at 70% 70%, rgba(255, 101, 132, 0.15) 0%, transparent 70%)",
              textAlign: "center",
              p: isXs ? 2 : 3,
              py: isXs ? 6 : 8,
            }}>
            <Box sx={{ maxWidth: 700, width: "100%" }}>
              <Typography
                variant="h2"
                fontWeight={800}
                sx={{
                  mb: isXs ? 1.5 : 2,
                  backgroundImage: "linear-gradient(90deg, #6C63FF, #FF6584)",
                  backgroundClip: "text",
                  color: "transparent",
                  fontSize: { xs: "2.5rem", sm: "3.5rem", md: "4rem" },
                }}>
                Welcome to Apollo Chat
              </Typography>

              <Typography
                variant={isXs ? "subtitle1" : "h6"}
                color="text.secondary"
                sx={{ mb: isXs ? 3 : 4 }}>
                A modern chat application built with React, Material UI, and
                Apollo GraphQL
              </Typography>

              <Grid
                container
                spacing={isXs ? 2 : 3}
                justifyContent="center"
                sx={{ mb: isXs ? 3 : 4 }}>
                <Grid
                  item
                  xs={12}
                  md={4}>
                  <Paper
                    elevation={0}
                    sx={{
                      p: isXs ? 2 : 3,
                      height: "100%",
                      borderRadius: isXs ? 2 : 3,
                      border: "1px solid",
                      borderColor: "divider",
                      backgroundColor: alpha(
                        theme.palette.background.paper,
                        0.7
                      ),
                    }}>
                    <ChatBubbleOutline
                      color="primary"
                      fontSize={isXs ? "medium" : "large"}
                      sx={{ mb: isXs ? 1.5 : 2 }}
                    />
                    <Typography
                      variant={isXs ? "subtitle1" : "h6"}
                      gutterBottom>
                      Real-time Messaging
                    </Typography>
                    <Typography
                      variant={isXs ? "caption" : "body2"}
                      color="text.secondary">
                      Instant message delivery with a modern interface
                    </Typography>
                  </Paper>
                </Grid>

                <Grid
                  item
                  xs={12}
                  md={4}>
                  <Paper
                    elevation={0}
                    sx={{
                      p: isXs ? 2 : 3,
                      height: "100%",
                      borderRadius: isXs ? 2 : 3,
                      border: "1px solid",
                      borderColor: "divider",
                      backgroundColor: alpha(
                        theme.palette.background.paper,
                        0.7
                      ),
                    }}>
                    <Person
                      color="secondary"
                      fontSize={isXs ? "medium" : "large"}
                      sx={{ mb: isXs ? 1.5 : 2 }}
                    />
                    <Typography
                      variant={isXs ? "subtitle1" : "h6"}
                      gutterBottom>
                      User Profiles
                    </Typography>
                    <Typography
                      variant={isXs ? "caption" : "body2"}
                      color="text.secondary">
                      Personalize your experience with custom avatars
                    </Typography>
                  </Paper>
                </Grid>
              </Grid>

              <Box
                sx={{
                  display: "flex",
                  gap: isXs ? 1 : 2,
                  justifyContent: "center",
                }}>
                <Button
                  variant="contained"
                  size={isXs ? "medium" : "large"}
                  onClick={() => navigate("/login")}
                  sx={{
                    borderRadius: isXs ? 1.5 : 2,
                    px: isXs ? 3 : 4,
                    py: isXs ? 1 : 1.5,
                    textTransform: "none",
                    fontWeight: 600,
                    fontSize: isXs ? "0.875rem" : "1rem",
                  }}>
                  Sign In
                </Button>

                <Button
                  variant="outlined"
                  size={isXs ? "medium" : "large"}
                  onClick={() => navigate("/signup")}
                  sx={{
                    borderRadius: isXs ? 1.5 : 2,
                    px: isXs ? 3 : 4,
                    py: isXs ? 1 : 1.5,
                    textTransform: "none",
                    fontWeight: 600,
                    fontSize: isXs ? "0.875rem" : "1rem",
                  }}>
                  Create Account
                </Button>
              </Box>
            </Box>
          </Box>
        </ScrollableContainer>
      </Box>
    );
  }

  // Authenticated home view
  return (
    <>
      <ChatListAdd
        open={chatAddVisible}
        handleClose={() => setChatAddVisible(false)}
      />
      <Box
        sx={{
          position: "relative",
          height: "calc(100vh - 64px)",
          overflow: "hidden",
        }}>
        <ScrollableContainer>
          <Container maxWidth="lg">
            <Box sx={{ py: isXs ? 4 : 6, px: isXs ? 1 : 2 }}>
              <Box sx={{ mb: isXs ? 3 : 4 }}>
                <Typography
                  variant={isXs ? "h5" : "h4"}
                  fontWeight={700}
                  gutterBottom>
                  Welcome back, {userData?.me?.username || "User"}!
                </Typography>
                <Typography
                  variant={isXs ? "body2" : "body1"}
                  color="text.secondary">
                  Check your recent chats or start a new conversation
                </Typography>
              </Box>

              <Grid
                container
                spacing={isXs ? 2 : 3}>
                <Grid
                  item
                  xs={12}
                  md={8}>
                  <Paper
                    elevation={0}
                    sx={{
                      p: isXs ? 2 : 3,
                      borderRadius: isXs ? 2 : 3,
                      border: "1px solid",
                      borderColor: "divider",
                      mb: isXs ? 2 : 3,
                    }}>
                    <Typography
                      variant={isXs ? "subtitle1" : "h6"}
                      fontWeight={600}
                      sx={{ mb: isXs ? 1.5 : 2 }}>
                      Recent Chats
                    </Typography>

                    {chatsData?.chats?.length === 0 ? (
                      <Box sx={{ textAlign: "center", py: isXs ? 3 : 4 }}>
                        <ChatBubbleOutline
                          sx={{
                            fontSize: isXs ? 36 : 48,
                            color: "text.disabled",
                            mb: isXs ? 1.5 : 2,
                          }}
                        />
                        <Typography
                          color="text.secondary"
                          variant={isXs ? "body2" : "body1"}>
                          You don't have any chats yet
                        </Typography>
                        <Button
                          variant="outlined"
                          color="primary"
                          onClick={handleAddChat}
                          startIcon={<AddCircleOutline />}
                          size={isXs ? "small" : "medium"}
                          sx={{
                            mt: isXs ? 1.5 : 2,
                            borderRadius: isXs ? 1.5 : 2,
                            textTransform: "none",
                          }}>
                          Start a Chat
                        </Button>
                      </Box>
                    ) : (
                      <Grid
                        container
                        spacing={isXs ? 1 : 2}>
                        {chatsData?.chats?.slice(0, 3).map((chat) => (
                          <Grid
                            item
                            xs={12}
                            sm={6}
                            md={4}
                            key={chat._id}>
                            <Card
                              elevation={0}
                              sx={{
                                borderRadius: isXs ? 1.5 : 2,
                                border: "1px solid",
                                borderColor: "divider",
                                transition: "all 0.2s",
                                "&:hover": {
                                  borderColor: "primary.main",
                                  transform: "translateY(-3px)",
                                  boxShadow: theme.shadows[3],
                                },
                              }}>
                              <CardActionArea
                                onClick={() => navigate(`/chats/${chat._id}`)}
                                sx={{ p: isXs ? 1.5 : 2 }}>
                                <CardContent sx={{ p: isXs ? 0.5 : 1 }}>
                                  <Typography
                                    variant={isXs ? "subtitle1" : "h6"}
                                    noWrap>
                                    {chat.name}
                                  </Typography>
                                  <Typography
                                    variant={isXs ? "caption" : "body2"}
                                    color="text.secondary"
                                    noWrap>
                                    {chat.latestMessage?.content ||
                                      "No messages yet"}
                                  </Typography>
                                </CardContent>
                              </CardActionArea>
                            </Card>
                          </Grid>
                        ))}
                      </Grid>
                    )}
                  </Paper>

                  <Paper
                    elevation={0}
                    sx={{
                      p: isXs ? 2 : 3,
                      borderRadius: isXs ? 2 : 3,
                      border: "1px solid",
                      borderColor: "divider",
                      backgroundColor: alpha(
                        theme.palette.background.paper,
                        0.7
                      ),
                    }}>
                    <Box
                      sx={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        mb: isXs ? 1.5 : 2,
                      }}>
                      <Typography
                        variant={isXs ? "subtitle1" : "h6"}
                        fontWeight={600}>
                        Start a New Chat
                      </Typography>
                      <Button
                        variant="contained"
                        startIcon={<AddCircleOutline />}
                        size={isXs ? "small" : "medium"}
                        onClick={handleAddChat}
                        sx={{
                          borderRadius: isXs ? 1.5 : 2,
                          textTransform: "none",
                          fontWeight: 500,
                        }}>
                        Create
                      </Button>
                    </Box>
                    <Typography
                      color="text.secondary"
                      variant={isXs ? "body2" : "body1"}>
                      Start a new conversation with friends and colleagues
                    </Typography>
                  </Paper>
                </Grid>

                <Grid
                  item
                  xs={12}
                  md={4}>
                  <Paper
                    elevation={0}
                    sx={{
                      p: isXs ? 2 : 3,
                      borderRadius: isXs ? 2 : 3,
                      border: "1px solid",
                      borderColor: "divider",
                      backgroundImage: `linear-gradient(135deg, ${alpha(
                        theme.palette.primary.main,
                        0.1
                      )}, ${alpha(theme.palette.secondary.main, 0.1)})`,
                    }}>
                    <Typography
                      variant={isXs ? "subtitle1" : "h6"}
                      fontWeight={600}
                      sx={{ mb: isXs ? 2 : 3 }}>
                      Your Profile
                    </Typography>

                    <Box sx={{ textAlign: "center", mb: isXs ? 2 : 3 }}>
                      <Button
                        variant="outlined"
                        onClick={() => navigate("/profile")}
                        startIcon={<Person />}
                        size={isXs ? "small" : "medium"}
                        sx={{
                          borderRadius: isXs ? 1.5 : 2,
                          textTransform: "none",
                          fontWeight: 500,
                        }}>
                        View Profile
                      </Button>
                    </Box>

                    <Typography
                      variant={isXs ? "caption" : "body2"}
                      color="text.secondary"
                      sx={{ mb: isXs ? 2 : 3 }}>
                      Update your profile picture and manage your account
                      settings
                    </Typography>

                    {/* Quick Navigation Links */}
                    <Box sx={{ mt: isXs ? 3 : 4 }}>
                      <Typography
                        variant={isXs ? "body2" : "subtitle2"}
                        fontWeight={600}
                        sx={{ mb: isXs ? 1.5 : 2 }}>
                        Quick Links
                      </Typography>

                      <Grid
                        container
                        spacing={isXs ? 1 : 2}>
                        <Grid
                          item
                          xs={6}>
                          <Paper
                            elevation={0}
                            sx={{
                              p: isXs ? 1 : 1.5,
                              borderRadius: isXs ? 1.5 : 2,
                              textAlign: "center",
                              border: "1px solid",
                              borderColor: "divider",
                              cursor: "pointer",
                              transition: "all 0.2s ease",
                              "&:hover": {
                                backgroundColor: alpha(
                                  theme.palette.primary.main,
                                  0.05
                                ),
                                transform: "translateY(-2px)",
                              },
                            }}
                            onClick={() => navigate("/explore")}>
                            <ExploreOutlined
                              color="primary"
                              sx={{ mb: 0.5, fontSize: isXs ? 18 : 24 }}
                            />
                            <Typography
                              variant="body2"
                              fontWeight={500}
                              noWrap
                              sx={{
                                overflow: "hidden",
                                textOverflow: "ellipsis",
                                fontSize: { xs: "0.75rem", sm: "0.875rem" },
                              }}>
                              Explore
                            </Typography>
                          </Paper>
                        </Grid>
                        <Grid
                          item
                          xs={6}>
                          <Paper
                            elevation={0}
                            sx={{
                              p: isXs ? 1 : 1.5,
                              borderRadius: isXs ? 1.5 : 2,
                              textAlign: "center",
                              border: "1px solid",
                              borderColor: "divider",
                              cursor: "pointer",
                              transition: "all 0.2s ease",
                              "&:hover": {
                                backgroundColor: alpha(
                                  theme.palette.primary.main,
                                  0.05
                                ),
                                transform: "translateY(-2px)",
                              },
                            }}
                            onClick={() => navigate("/notifications")}>
                            <NotificationsOutlined
                              color="primary"
                              sx={{ mb: 0.5, fontSize: isXs ? 18 : 24 }}
                            />
                            <Typography
                              variant="body2"
                              fontWeight={500}
                              noWrap
                              sx={{
                                overflow: "hidden",
                                textOverflow: "ellipsis",
                                fontSize: { xs: "0.75rem", sm: "0.875rem" },
                              }}>
                              Notifications
                            </Typography>
                          </Paper>
                        </Grid>
                        <Grid
                          item
                          xs={6}>
                          <Paper
                            elevation={0}
                            sx={{
                              p: isXs ? 1 : 1.5,
                              borderRadius: isXs ? 1.5 : 2,
                              textAlign: "center",
                              border: "1px solid",
                              borderColor: "divider",
                              cursor: "pointer",
                              transition: "all 0.2s ease",
                              "&:hover": {
                                backgroundColor: alpha(
                                  theme.palette.primary.main,
                                  0.05
                                ),
                                transform: "translateY(-2px)",
                              },
                            }}
                            onClick={() => navigate("/favorites")}>
                            <StarOutlined
                              color="primary"
                              sx={{ mb: 0.5, fontSize: isXs ? 18 : 24 }}
                            />
                            <Typography
                              variant="body2"
                              fontWeight={500}
                              noWrap
                              sx={{
                                overflow: "hidden",
                                textOverflow: "ellipsis",
                                fontSize: { xs: "0.75rem", sm: "0.875rem" },
                              }}>
                              Favorites
                            </Typography>
                          </Paper>
                        </Grid>
                        <Grid
                          item
                          xs={6}>
                          <Paper
                            elevation={0}
                            sx={{
                              p: isXs ? 1 : 1.5,
                              borderRadius: isXs ? 1.5 : 2,
                              textAlign: "center",
                              border: "1px solid",
                              borderColor: "divider",
                              cursor: "pointer",
                              transition: "all 0.2s ease",
                              "&:hover": {
                                backgroundColor: alpha(
                                  theme.palette.primary.main,
                                  0.05
                                ),
                                transform: "translateY(-2px)",
                              },
                            }}
                            onClick={handleAddChat}>
                            <AddCircleOutline
                              color="primary"
                              sx={{ mb: 0.5, fontSize: isXs ? 18 : 24 }}
                            />
                            <Typography
                              variant="body2"
                              fontWeight={500}
                              noWrap
                              sx={{
                                overflow: "hidden",
                                textOverflow: "ellipsis",
                                fontSize: { xs: "0.75rem", sm: "0.875rem" },
                              }}>
                              New Chat
                            </Typography>
                          </Paper>
                        </Grid>
                      </Grid>
                    </Box>
                  </Paper>
                </Grid>
              </Grid>
            </Box>
          </Container>
        </ScrollableContainer>
      </Box>
    </>
  );
};

export default Home;

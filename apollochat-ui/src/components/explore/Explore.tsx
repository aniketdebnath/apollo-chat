import {
  Box,
  Typography,
  Container,
  Paper,
  alpha,
  useTheme,
  Grid,
  Avatar,
  Button,
  Chip,
  Divider,
  CircularProgress,
  IconButton,
  Tooltip,
  Alert,
  Collapse,
} from "@mui/material";
import { useGetPublicChats } from "../../hooks/useGetPublicChats";
import { useJoinChat } from "../../hooks/useJoinChat";
import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { formatDistanceToNowStrict } from "date-fns";
import LockIcon from "@mui/icons-material/Lock";
import PublicIcon from "@mui/icons-material/Public";
import RefreshIcon from "@mui/icons-material/Refresh";
import CloseIcon from "@mui/icons-material/Close";
import {
  ChatType,
  chatTypeDescriptions,
  chatTypeLabels,
} from "../../constants/chatTypes";
import { stringToColor } from "../../utils/avatar";
import { Chat } from "../../gql/graphql";
import { snackVar } from "../../constants/snack";
import { useChatSubscriptions } from "../../hooks/useChatSubscriptions";
import { useResponsive } from "../../hooks/useResponsive";

const Explore = () => {
  const { publicChats, loading, error, refetch } = useGetPublicChats();
  const { joinChat, loading: joinLoading } = useJoinChat();
  const [joiningChatId, setJoiningChatId] = useState<string | null>(null);
  const [showNewChatAlert, setShowNewChatAlert] = useState(false);
  const theme = useTheme();
  const navigate = useNavigate();
  const prevChatsCountRef = useRef(0);
  const { isXs } = useResponsive();

  // Subscribe to chat added/deleted events
  useChatSubscriptions();

  // Check if new chats have been added
  useEffect(() => {
    if (
      !loading &&
      publicChats.length > prevChatsCountRef.current &&
      prevChatsCountRef.current > 0
    ) {
      // New chats have been added
      setShowNewChatAlert(true);
    }
    prevChatsCountRef.current = publicChats.length;
  }, [publicChats.length, loading]);

  const handleJoinChat = async (chatId: string) => {
    try {
      setJoiningChatId(chatId);
      const result = await joinChat(chatId);
      if (result?._id) {
        snackVar({
          message: `Successfully joined ${result.name || "chat"}`,
          type: "success",
        });
        await refetch();
        navigate(`/chats/${result._id}`);
      }
    } catch (error) {
      snackVar({
        message: "Failed to join chat. Please try again.",
        type: "error",
      });
      await refetch();
    } finally {
      setJoiningChatId(null);
    }
  };

  const getChatTypeIcon = (type: string) => {
    switch (type) {
      case ChatType.PRIVATE:
        return <LockIcon fontSize="small" />;
      case ChatType.PUBLIC:
      case ChatType.OPEN:
        return <PublicIcon fontSize="small" />;
      default:
        return <PublicIcon fontSize="small" />;
    }
  };

  // Function to truncate chat name
  const truncateName = (
    name: string | null | undefined,
    maxLength: number = 25
  ) => {
    if (!name) return "Unnamed Chat";
    return name.length > maxLength
      ? `${name.substring(0, maxLength)}...`
      : name;
  };

  return (
    <Container
      maxWidth="md"
      sx={{ py: isXs ? 2 : 3 }}>
      <Paper
        elevation={0}
        sx={{
          p: isXs ? 2 : 3,
          borderRadius: 3,
          border: "1px solid",
          borderColor: "divider",
          backgroundColor: alpha(theme.palette.background.paper, 0.8),
          mb: isXs ? 2 : 3,
        }}>
        <Typography
          variant={isXs ? "h6" : "h5"}
          gutterBottom
          sx={{
            fontWeight: 600,
            backgroundImage: "linear-gradient(90deg, #6C63FF, #FF6584)",
            backgroundClip: "text",
            color: "transparent",
            display: "inline-block",
          }}>
          Explore Public Chats
        </Typography>
        <Typography
          variant={isXs ? "body2" : "body1"}
          color="text.secondary"
          sx={{ mb: isXs ? 1 : 2 }}>
          Discover and join public conversations from the Apollo Chat community
        </Typography>
        <Typography
          variant="caption"
          color="text.secondary"
          sx={{
            display: "flex",
            alignItems: "center",
            gap: 0.5,
          }}>
          <Box
            component="span"
            sx={{
              width: isXs ? 6 : 8,
              height: isXs ? 6 : 8,
              borderRadius: "50%",
              backgroundColor: theme.palette.success.main,
              display: "inline-block",
            }}
          />
          Real-time updates enabled
        </Typography>
      </Paper>

      <Collapse
        in={showNewChatAlert}
        sx={{ mb: 2 }}>
        <Alert
          severity="info"
          action={
            <IconButton
              aria-label="close"
              color="inherit"
              size="small"
              onClick={() => {
                setShowNewChatAlert(false);
              }}>
              <CloseIcon fontSize="inherit" />
            </IconButton>
          }
          sx={{
            borderRadius: 2,
            backgroundColor: alpha(theme.palette.info.main, 0.1),
            color: theme.palette.info.main,
          }}>
          New public chats are available!
        </Alert>
      </Collapse>

      {loading ? (
        <Box
          sx={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            py: 8,
          }}>
          <CircularProgress />
        </Box>
      ) : error ? (
        <Paper
          elevation={0}
          sx={{
            p: 3,
            borderRadius: 3,
            textAlign: "center",
            border: "1px solid",
            borderColor: alpha(theme.palette.error.main, 0.3),
            backgroundColor: alpha(theme.palette.error.main, 0.05),
          }}>
          <Typography
            color="error"
            sx={{ mb: 2 }}>
            Error loading public chats
          </Typography>
          <Button
            variant="outlined"
            color="primary"
            onClick={() => refetch()}
            size="small">
            Retry
          </Button>
        </Paper>
      ) : publicChats.length === 0 ? (
        <Paper
          elevation={0}
          sx={{
            p: isXs ? 3 : 4,
            borderRadius: 3,
            textAlign: "center",
            border: "1px solid",
            borderColor: "divider",
            backgroundColor: alpha(theme.palette.background.paper, 0.8),
          }}>
          <Box
            component="img"
            src="https://illustrations.popsy.co/amber/taking-notes.svg"
            alt="No public chats"
            sx={{
              width: "100%",
              maxWidth: isXs ? 200 : 300,
              height: "auto",
              mb: isXs ? 2 : 3,
              mx: "auto",
            }}
          />
          <Typography
            variant={isXs ? "subtitle1" : "h6"}
            gutterBottom>
            No public chats available
          </Typography>
          <Typography
            variant={isXs ? "body2" : "body1"}
            color="text.secondary"
            sx={{ mb: isXs ? 2 : 3 }}>
            There are no public or open chats to join at the moment.
          </Typography>
        </Paper>
      ) : (
        <>
          <Box
            sx={{
              display: "flex",
              justifyContent: "flex-end",
              mb: isXs ? 1 : 2,
            }}>
            <Button
              startIcon={<RefreshIcon fontSize={isXs ? "small" : "medium"} />}
              onClick={() => refetch()}
              size={isXs ? "small" : "medium"}
              sx={{
                borderRadius: 2,
                textTransform: "none",
                fontSize: isXs ? "0.75rem" : "inherit",
              }}>
              Refresh
            </Button>
          </Box>
          <Grid
            container
            spacing={isXs ? 1 : 2}>
            {publicChats.map((chat: Chat) => (
              <Grid
                item
                xs={12}
                key={chat._id}
                sx={{
                  animation: "fadeIn 0.5s ease-in-out",
                  "@keyframes fadeIn": {
                    "0%": {
                      opacity: 0,
                      transform: "translateY(10px)",
                    },
                    "100%": {
                      opacity: 1,
                      transform: "translateY(0)",
                    },
                  },
                }}>
                <Paper
                  elevation={0}
                  sx={{
                    p: isXs ? 2 : 3,
                    borderRadius: 3,
                    border: "1px solid",
                    borderColor: "divider",
                    backgroundColor: alpha(theme.palette.background.paper, 0.8),
                    transition: "all 0.2s ease",
                    "&:hover": {
                      backgroundColor: alpha(theme.palette.background.paper, 1),
                      boxShadow: `0 4px 20px ${alpha(
                        theme.palette.common.black,
                        0.1
                      )}`,
                      transform: "translateY(-2px)",
                    },
                  }}>
                  <Box
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      mb: isXs ? 1 : 2,
                      flexWrap: "nowrap",
                    }}>
                    <Box
                      sx={{
                        display: "flex",
                        alignItems: "center",
                        gap: isXs ? 1 : 2,
                        minWidth: 0,
                        flexGrow: 1,
                        mr: isXs ? 1 : 2,
                      }}>
                      <Avatar
                        sx={{
                          bgcolor: stringToColor(chat.name || "Chat"),
                          width: isXs ? 36 : 48,
                          height: isXs ? 36 : 48,
                          flexShrink: 0,
                        }}>
                        {(chat.name?.[0] || "C").toUpperCase()}
                      </Avatar>
                      <Box sx={{ minWidth: 0 }}>
                        <Tooltip title={chat.name || "Unnamed Chat"}>
                          <Typography
                            variant={isXs ? "subtitle1" : "h6"}
                            fontWeight={600}
                            sx={{
                              overflow: "hidden",
                              textOverflow: "ellipsis",
                              whiteSpace: "nowrap",
                            }}>
                            {truncateName(chat.name, isXs ? 20 : 25)}
                          </Typography>
                        </Tooltip>
                        <Box
                          sx={{
                            display: "flex",
                            alignItems: "center",
                            gap: 1,
                            flexWrap: isXs ? "wrap" : "nowrap",
                          }}>
                          <Tooltip
                            title={
                              chatTypeDescriptions[chat.type as ChatType] || ""
                            }>
                            <Chip
                              icon={getChatTypeIcon(chat.type)}
                              label={
                                chatTypeLabels[chat.type as ChatType] ||
                                chat.type.charAt(0).toUpperCase() +
                                  chat.type.slice(1)
                              }
                              size="small"
                              color="primary"
                              variant="outlined"
                              sx={{
                                borderRadius: 1,
                                height: isXs ? 20 : 24,
                                "& .MuiChip-label": {
                                  fontSize: isXs ? "0.65rem" : "0.75rem",
                                  px: isXs ? 0.5 : 1,
                                },
                                "& .MuiChip-icon": {
                                  fontSize: isXs ? "0.75rem" : "1rem",
                                  ml: isXs ? 0.5 : 0.75,
                                },
                              }}
                            />
                          </Tooltip>
                          <Typography
                            variant="caption"
                            color="text.secondary"
                            sx={{
                              fontSize: isXs ? "0.65rem" : "0.75rem",
                            }}>
                            {chat.members.length} member
                            {chat.members.length !== 1 ? "s" : ""}
                          </Typography>
                        </Box>
                      </Box>
                    </Box>
                    <Button
                      variant="contained"
                      color="primary"
                      onClick={() => handleJoinChat(chat._id)}
                      disabled={joinLoading && joiningChatId === chat._id}
                      sx={{
                        borderRadius: 2,
                        textTransform: "none",
                        px: isXs ? 1 : 2,
                        py: isXs ? 0.5 : 1,
                        fontWeight: 600,
                        fontSize: isXs ? "0.75rem" : "inherit",
                        whiteSpace: "nowrap",
                        flexShrink: 0,
                        minWidth: isXs ? "auto" : "100px",
                        height: isXs ? 32 : "auto",
                      }}>
                      {joinLoading && joiningChatId === chat._id ? (
                        <CircularProgress
                          size={isXs ? 16 : 20}
                          color="inherit"
                        />
                      ) : (
                        "Join Chat"
                      )}
                    </Button>
                  </Box>

                  {chat.latestMessage && (
                    <>
                      <Divider sx={{ my: isXs ? 1 : 2 }} />
                      <Box>
                        <Box
                          sx={{
                            display: "flex",
                            alignItems: "center",
                            gap: isXs ? 0.5 : 1,
                            mb: isXs ? 0.25 : 0.5,
                          }}>
                          <Avatar
                            src={chat.latestMessage.user.imageUrl || undefined}
                            sx={{
                              width: isXs ? 20 : 24,
                              height: isXs ? 20 : 24,
                              bgcolor: !chat.latestMessage.user.imageUrl
                                ? stringToColor(
                                    chat.latestMessage.user.username
                                  )
                                : undefined,
                            }}>
                            {chat.latestMessage.user.username[0].toUpperCase()}
                          </Avatar>
                          <Typography
                            variant={isXs ? "caption" : "subtitle2"}
                            fontWeight={500}
                            color="text.primary">
                            {chat.latestMessage.user.username}
                          </Typography>
                          <Typography
                            variant="caption"
                            color="text.secondary"
                            sx={{
                              ml: "auto",
                              fontSize: isXs ? "0.65rem" : "0.75rem",
                            }}>
                            {formatDistanceToNowStrict(
                              new Date(chat.latestMessage.createdAt),
                              { addSuffix: true }
                            )}
                          </Typography>
                        </Box>
                        <Typography
                          variant={isXs ? "caption" : "body2"}
                          color="text.secondary"
                          sx={{
                            ml: isXs ? 3 : 4,
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                            display: "-webkit-box",
                            WebkitLineClamp: 1,
                            WebkitBoxOrient: "vertical",
                          }}>
                          {chat.latestMessage.content}
                        </Typography>
                      </Box>
                    </>
                  )}

                  {chat.creator && (
                    <Box
                      sx={{
                        display: "flex",
                        alignItems: "center",
                        gap: isXs ? 0.5 : 1,
                        mt: isXs ? 1 : 2,
                      }}>
                      <Typography
                        variant="caption"
                        color="text.secondary"
                        sx={{
                          fontSize: isXs ? "0.65rem" : "0.75rem",
                        }}>
                        Created by
                      </Typography>
                      <Avatar
                        src={chat.creator.imageUrl || undefined}
                        sx={{
                          width: isXs ? 16 : 20,
                          height: isXs ? 16 : 20,
                          bgcolor: !chat.creator.imageUrl
                            ? stringToColor(chat.creator.username)
                            : undefined,
                        }}>
                        {chat.creator.username[0].toUpperCase()}
                      </Avatar>
                      <Typography
                        variant="caption"
                        fontWeight={500}
                        sx={{
                          fontSize: isXs ? "0.65rem" : "0.75rem",
                        }}>
                        {chat.creator.username}
                      </Typography>
                    </Box>
                  )}
                </Paper>
              </Grid>
            ))}
          </Grid>
        </>
      )}
    </Container>
  );
};

export default Explore;

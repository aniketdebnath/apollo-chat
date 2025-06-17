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
} from "@mui/material";
import { useGetPublicChats } from "../../hooks/useGetPublicChats";
import { useJoinChat } from "../../hooks/useJoinChat";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { formatDistanceToNowStrict } from "date-fns";
import LockIcon from "@mui/icons-material/Lock";
import GroupIcon from "@mui/icons-material/Group";
import PublicIcon from "@mui/icons-material/Public";
import { ChatType, chatTypeDescriptions } from "../../constants/chatTypes";
import { stringToColor } from "../../utils/avatar";
import { Chat } from "../../gql/graphql";
import { snackVar } from "../../constants/snack";

const Explore = () => {
  const { publicChats, loading, error, refetch } = useGetPublicChats();
  const { joinChat, loading: joinLoading } = useJoinChat();
  const [joiningChatId, setJoiningChatId] = useState<string | null>(null);
  const theme = useTheme();
  const navigate = useNavigate();

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
      console.error("Error joining chat:", error);
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
        return <GroupIcon fontSize="small" />;
      case ChatType.OPEN:
        return <PublicIcon fontSize="small" />;
      default:
        return <GroupIcon fontSize="small" />;
    }
  };

  return (
    <Container
      maxWidth="md"
      sx={{ py: 3 }}>
      <Paper
        elevation={0}
        sx={{
          p: 3,
          borderRadius: 3,
          border: "1px solid",
          borderColor: "divider",
          backgroundColor: alpha(theme.palette.background.paper, 0.8),
          mb: 3,
        }}>
        <Typography
          variant="h5"
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
          variant="body1"
          color="text.secondary"
          sx={{ mb: 2 }}>
          Discover and join public conversations from the Apollo Chat community
        </Typography>
      </Paper>

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
            p: 4,
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
              maxWidth: 300,
              height: "auto",
              mb: 3,
              mx: "auto",
            }}
          />
          <Typography
            variant="h6"
            gutterBottom>
            No public chats available
          </Typography>
          <Typography
            color="text.secondary"
            sx={{ mb: 3 }}>
            There are no public or open chats to join at the moment.
          </Typography>
        </Paper>
      ) : (
        <Grid
          container
          spacing={2}>
          {publicChats.map((chat: Chat) => (
            <Grid
              item
              xs={12}
              key={chat._id}>
              <Paper
                elevation={0}
                sx={{
                  p: 3,
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
                    mb: 2,
                  }}>
                  <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                    <Avatar
                      sx={{
                        bgcolor: stringToColor(chat.name || "Chat"),
                        width: 48,
                        height: 48,
                      }}>
                      {(chat.name?.[0] || "C").toUpperCase()}
                    </Avatar>
                    <Box>
                      <Typography
                        variant="h6"
                        fontWeight={600}>
                        {chat.name || "Unnamed Chat"}
                      </Typography>
                      <Box
                        sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                        <Tooltip
                          title={
                            chatTypeDescriptions[chat.type as ChatType] || ""
                          }>
                          <Chip
                            icon={getChatTypeIcon(chat.type)}
                            label={
                              chat.type.charAt(0).toUpperCase() +
                              chat.type.slice(1)
                            }
                            size="small"
                            color={
                              chat.type === ChatType.OPEN
                                ? "success"
                                : "primary"
                            }
                            variant="outlined"
                            sx={{ borderRadius: 1 }}
                          />
                        </Tooltip>
                        <Typography
                          variant="caption"
                          color="text.secondary">
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
                      px: 2,
                      py: 1,
                      fontWeight: 600,
                    }}>
                    {joinLoading && joiningChatId === chat._id ? (
                      <CircularProgress
                        size={24}
                        color="inherit"
                      />
                    ) : (
                      "Join Chat"
                    )}
                  </Button>
                </Box>

                {chat.latestMessage && (
                  <>
                    <Divider sx={{ my: 2 }} />
                    <Box>
                      <Box
                        sx={{
                          display: "flex",
                          alignItems: "center",
                          gap: 1,
                          mb: 0.5,
                        }}>
                        <Avatar
                          src={chat.latestMessage.user.imageUrl || undefined}
                          sx={{
                            width: 24,
                            height: 24,
                            bgcolor: !chat.latestMessage.user.imageUrl
                              ? stringToColor(chat.latestMessage.user.username)
                              : undefined,
                          }}>
                          {chat.latestMessage.user.username[0].toUpperCase()}
                        </Avatar>
                        <Typography
                          variant="subtitle2"
                          fontWeight={500}
                          color="text.primary">
                          {chat.latestMessage.user.username}
                        </Typography>
                        <Typography
                          variant="caption"
                          color="text.secondary"
                          sx={{ ml: "auto" }}>
                          {formatDistanceToNowStrict(
                            new Date(chat.latestMessage.createdAt),
                            { addSuffix: true }
                          )}
                        </Typography>
                      </Box>
                      <Typography
                        variant="body2"
                        color="text.secondary"
                        sx={{
                          ml: 4,
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
                      gap: 1,
                      mt: 2,
                    }}>
                    <Typography
                      variant="caption"
                      color="text.secondary">
                      Created by
                    </Typography>
                    <Avatar
                      src={chat.creator.imageUrl || undefined}
                      sx={{
                        width: 20,
                        height: 20,
                        bgcolor: !chat.creator.imageUrl
                          ? stringToColor(chat.creator.username)
                          : undefined,
                      }}>
                      {chat.creator.username[0].toUpperCase()}
                    </Avatar>
                    <Typography
                      variant="caption"
                      fontWeight={500}>
                      {chat.creator.username}
                    </Typography>
                  </Box>
                )}
              </Paper>
            </Grid>
          ))}
        </Grid>
      )}
    </Container>
  );
};

export default Explore;

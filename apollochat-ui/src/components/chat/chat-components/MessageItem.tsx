import React from "react";
import { Box, Paper, Typography, alpha, useTheme } from "@mui/material";
import { UserAvatar } from "../../common/UserAvatar";
import { UserStatus } from "../../../constants/userStatus";
import { Message } from "../../../gql/graphql";

interface MessageItemProps {
  message: Message;
  isCurrentUser: boolean;
}

const MessageItem: React.FC<MessageItemProps> = ({
  message,
  isCurrentUser,
}) => {
  const theme = useTheme();

  // Format a date for display
  const formatMessageTime = (date: string) => {
    return new Date(date).toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: isCurrentUser ? "row-reverse" : "row",
        mb: 2,
        px: 1,
      }}>
      {!isCurrentUser && (
        <Box
          sx={{
            position: "relative",
            "& .MuiBadge-badge": {
              right: 3,
              bottom: 3,
            },
          }}>
          <UserAvatar
            username={message.user.username}
            imageUrl={message.user.imageUrl}
            status={message.user.status as unknown as UserStatus}
            showStatus={true}
            size="medium"
            sx={{ mt: 0.5 }}
          />
        </Box>
      )}

      <Box
        sx={{
          maxWidth: "70%",
          display: "flex",
          flexDirection: "column",
          alignItems: isCurrentUser ? "flex-end" : "flex-start",
        }}>
        {!isCurrentUser && (
          <Typography
            variant="caption"
            sx={{
              ml: 1,
              mb: 0.5,
              color: theme.palette.text.secondary,
              fontWeight: 500,
            }}>
            {message.user.username}
          </Typography>
        )}

        <Box sx={{ position: "relative" }}>
          <Paper
            elevation={0}
            sx={{
              ml: 1,
              p: 1.5,
              borderRadius: isCurrentUser
                ? "18px 4px 18px 18px"
                : "4px 18px 18px 18px",
              backgroundColor: isCurrentUser
                ? alpha(theme.palette.primary.main, 0.15)
                : alpha(theme.palette.background.paper, 0.7),
              color: isCurrentUser
                ? theme.palette.primary.dark
                : theme.palette.text.primary,
              border: "1px solid",
              borderColor: isCurrentUser
                ? alpha(theme.palette.primary.main, 0.2)
                : theme.palette.divider,
              backdropFilter: "blur(10px)",
              boxShadow: `0 1px 3px ${alpha(theme.palette.common.black, 0.05)}`,
            }}>
            <Typography
              variant="body1"
              sx={{
                whiteSpace: "pre-wrap",
                wordBreak: "break-word",
              }}>
              {message.content}
            </Typography>
          </Paper>

          <Typography
            variant="caption"
            sx={{
              display: "block",
              textAlign: isCurrentUser ? "right" : "left",
              color: alpha(theme.palette.text.secondary, 0.7),
              mt: 0.5,
              mx: 0.5,
              fontSize: "0.7rem",
            }}>
            {formatMessageTime(message.createdAt)}
          </Typography>
        </Box>
      </Box>

      {isCurrentUser && (
        <Box
          sx={{
            position: "relative",
            "& .MuiBadge-badge": {
              right: 3,
              bottom: 3,
            },
          }}>
          <UserAvatar
            username={message.user.username}
            imageUrl={message.user.imageUrl}
            status={message.user.status as unknown as UserStatus}
            showStatus={true}
            size="medium"
            sx={{ mt: 0.5 }}
          />
        </Box>
      )}
    </Box>
  );
};

export default MessageItem;

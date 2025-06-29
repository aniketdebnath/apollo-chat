import React from "react";
import { Box, Paper, Typography, alpha, useTheme } from "@mui/material";
import { UserAvatar } from "../../common/UserAvatar";
import { UserStatus } from "../../../constants/userStatus";
import { Message } from "../../../gql/graphql";

interface MessageItemProps {
  message: Message;
  isCurrentUser: boolean;
  isSmallScreen?: boolean;
}

const MessageItem: React.FC<MessageItemProps> = ({
  message,
  isCurrentUser,
  isSmallScreen = false,
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
        mb: isSmallScreen ? 1.5 : 2,
        px: isSmallScreen ? 0.5 : 1,
      }}>
      {!isCurrentUser && (
        <Box
          sx={{
            position: "relative",
            "& .MuiBadge-badge": {
              right: isSmallScreen ? 2 : 3,
              bottom: isSmallScreen ? 2 : 3,
            },
          }}>
          <UserAvatar
            username={message.user.username}
            imageUrl={message.user.imageUrl}
            status={message.user.status as unknown as UserStatus}
            showStatus={true}
            size={isSmallScreen ? "small" : "medium"}
            sx={{ mt: 0.5 }}
          />
        </Box>
      )}

      <Box
        sx={{
          maxWidth: isSmallScreen ? "75%" : "70%",
          display: "flex",
          flexDirection: "column",
          alignItems: isCurrentUser ? "flex-end" : "flex-start",
        }}>
        {!isCurrentUser && (
          <Typography
            variant="caption"
            sx={{
              ml: isSmallScreen ? 0.5 : 1,
              mb: isSmallScreen ? 0.3 : 0.5,
              color: theme.palette.text.secondary,
              fontWeight: 500,
              fontSize: isSmallScreen ? "0.65rem" : "0.75rem",
            }}>
            {message.user.username}
          </Typography>
        )}

        <Box sx={{ position: "relative" }}>
          <Paper
            elevation={0}
            sx={{
              ml: isSmallScreen ? 0.5 : 1,
              p: isSmallScreen ? 1.2 : 1.5,
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
              variant={isSmallScreen ? "body2" : "body1"}
              sx={{
                whiteSpace: "pre-wrap",
                wordBreak: "break-word",
                fontSize: isSmallScreen ? "0.875rem" : "inherit",
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
              mt: isSmallScreen ? 0.3 : 0.5,
              mx: isSmallScreen ? 0.3 : 0.5,
              fontSize: isSmallScreen ? "0.65rem" : "0.7rem",
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
              right: isSmallScreen ? 2 : 3,
              bottom: isSmallScreen ? 2 : 3,
            },
          }}>
          <UserAvatar
            username={message.user.username}
            imageUrl={message.user.imageUrl}
            status={message.user.status as unknown as UserStatus}
            showStatus={true}
            size={isSmallScreen ? "small" : "medium"}
            sx={{ mt: 0.5 }}
          />
        </Box>
      )}
    </Box>
  );
};

export default MessageItem;

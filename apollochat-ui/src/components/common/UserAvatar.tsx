import React from "react";
import { Avatar, Badge, Box, SxProps, Theme } from "@mui/material";
import { StatusIndicator } from "../status/StatusIndicator";
import { UserStatus } from "../../constants/userStatus";

interface UserAvatarProps {
  username: string;
  imageUrl?: string | null;
  status?: UserStatus;
  showStatus?: boolean;
  size?: "small" | "medium" | "large";
  sx?: SxProps<Theme>;
}

// Function to get a consistent color based on string input
const stringToColor = (string: string) => {
  let hash = 0;
  for (let i = 0; i < string.length; i++) {
    hash = string.charCodeAt(i) + ((hash << 5) - hash);
  }
  const colors = [
    "#6C63FF", // primary
    "#FF6584", // secondary
    "#00B8A9", // success
    "#0084FF", // info
    "#FFAF20", // warning
  ];
  const index = Math.abs(hash) % colors.length;
  return colors[index];
};

// Function to create avatar props based on name
const getAvatarProps = (name: string) => {
  return {
    sx: {
      bgcolor: stringToColor(name),
    },
    children: `${name.split(" ")[0][0]}${
      name.split(" ").length > 1 ? name.split(" ")[1][0] : ""
    }`.toUpperCase(),
  };
};

export const UserAvatar: React.FC<UserAvatarProps> = ({
  username,
  imageUrl,
  status,
  showStatus = false,
  size = "medium",
  sx = {},
}) => {
  const sizeMap = {
    small: { avatar: 32, badge: 8 },
    medium: { avatar: 40, badge: 10 },
    large: { avatar: 48, badge: 12 },
  };

  const avatarSize = sizeMap[size].avatar;

  const avatar = (
    <Avatar
      src={imageUrl || undefined}
      {...(!imageUrl ? getAvatarProps(username) : {})}
      sx={{ width: avatarSize, height: avatarSize, ...sx }}
    />
  );

  if (showStatus && status) {
    return (
      <Badge
        overlap="circular"
        anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
        badgeContent={
          <Box
            sx={{
              backgroundColor: "white",
              borderRadius: "50%",
              display: "flex",
              padding: "2px",
            }}>
            <StatusIndicator
              status={status}
              size={size === "large" ? "medium" : "small"}
              withTooltip={false}
            />
          </Box>
        }>
        {avatar}
      </Badge>
    );
  }

  return avatar;
};

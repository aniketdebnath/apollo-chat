import React from "react";
import { Box, Tooltip } from "@mui/material";
import {
  UserStatus,
  userStatusColors,
  userStatusLabels,
} from "../../constants/userStatus";

interface StatusIndicatorProps {
  status: UserStatus;
  size?: "small" | "medium" | "large";
  withTooltip?: boolean;
}

const getSizeProps = (size: "small" | "medium" | "large") => {
  switch (size) {
    case "small":
      return { width: 8, height: 8 };
    case "large":
      return { width: 14, height: 14 };
    default:
      return { width: 10, height: 10 };
  }
};

export const StatusIndicator: React.FC<StatusIndicatorProps> = ({
  status,
  size = "medium",
  withTooltip = true,
}) => {
  const sizeProps = getSizeProps(size);

  const indicator = (
    <Box
      sx={{
        ...sizeProps,
        bgcolor:
          userStatusColors[status] || userStatusColors[UserStatus.OFFLINE],
        borderRadius: "50%",
        boxShadow: "0 0 0 2px #fff",
        display: "inline-block",
      }}
    />
  );

  if (withTooltip) {
    return (
      <Tooltip
        title={userStatusLabels[status] || "Unknown"}
        arrow>
        {indicator}
      </Tooltip>
    );
  }

  return indicator;
};

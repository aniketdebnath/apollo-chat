import React from "react";
import { Box, Typography } from "@mui/material";

interface DateDividerProps {
  date: string;
  isSmallScreen?: boolean;
}

const DateDivider: React.FC<DateDividerProps> = ({
  date,
  isSmallScreen = false,
}) => {
  return (
    <Box
      sx={{
        display: "flex",
        justifyContent: "center",
        position: "relative",
        my: isSmallScreen ? 2 : 3,
        "&::before": {
          content: '""',
          position: "absolute",
          top: "50%",
          left: 0,
          right: 0,
          height: "1px",
          backgroundColor: "divider",
          zIndex: 0,
        },
      }}>
      <Typography
        variant="caption"
        sx={{
          bgcolor: "background.paper",
          px: isSmallScreen ? 1.5 : 2,
          py: isSmallScreen ? 0.3 : 0.5,
          borderRadius: 1,
          position: "relative",
          zIndex: 1,
          fontSize: isSmallScreen ? "0.7rem" : "0.75rem",
        }}>
        {new Date(date).toLocaleDateString(undefined, {
          weekday: isSmallScreen ? "short" : "long",
          year: "numeric",
          month: isSmallScreen ? "short" : "long",
          day: "numeric",
        })}
      </Typography>
    </Box>
  );
};

export default DateDivider;

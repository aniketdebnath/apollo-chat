import React from "react";
import { Box, Typography } from "@mui/material";

interface DateDividerProps {
  date: string;
}

const DateDivider: React.FC<DateDividerProps> = ({ date }) => {
  return (
    <Box
      sx={{
        display: "flex",
        justifyContent: "center",
        position: "relative",
        my: 3,
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
          px: 2,
          py: 0.5,
          borderRadius: 1,
          position: "relative",
          zIndex: 1,
        }}>
        {new Date(date).toLocaleDateString(undefined, {
          weekday: "long",
          year: "numeric",
          month: "long",
          day: "numeric",
        })}
      </Typography>
    </Box>
  );
};

export default DateDivider;

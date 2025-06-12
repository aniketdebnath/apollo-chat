import { Box, Typography, useTheme } from "@mui/material";
import ChatBubbleOutlineRoundedIcon from "@mui/icons-material/ChatBubbleOutlineRounded";
import router from "../Routes";

const Logo = () => {
  const theme = useTheme();

  return (
    <Box
      sx={{
        display: { xs: "none", md: "flex" },
        alignItems: "center",
        cursor: "pointer",
        gap: 1,
      }}
      onClick={() => router.navigate("/")}>
      <ChatBubbleOutlineRoundedIcon
        sx={{
          color: theme.palette.primary.main,
          fontSize: 28,
        }}
      />
      <Typography
        variant="h5"
        component="span"
        sx={{
          fontFamily: "'Poppins', sans-serif",
          fontWeight: 700,
          letterSpacing: ".05rem",
          color: "inherit",
          textDecoration: "none",
          background: `linear-gradient(120deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
          WebkitBackgroundClip: "text",
          WebkitTextFillColor: "transparent",
        }}>
        APOLLO
        <Box
          component="span"
          sx={{
            color: theme.palette.text.secondary,
            WebkitTextFillColor: theme.palette.text.secondary,
            fontWeight: 300,
            ml: 0.5,
          }}>
          CHAT
        </Box>
      </Typography>
    </Box>
  );
};

export default Logo;

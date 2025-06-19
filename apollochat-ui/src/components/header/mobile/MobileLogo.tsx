import { Box, Typography, useTheme } from "@mui/material";
import router from "../../Routes";

const MobileLogo = () => {
  const theme = useTheme();

  return (
    <Box
      sx={{
        display: { xs: "flex", md: "none" },
        alignItems: "center",
        cursor: "pointer",
        gap: 0.5,
      }}
      onClick={() => router.navigate("/")}>
      <Typography
        variant="h6"
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

export default MobileLogo;

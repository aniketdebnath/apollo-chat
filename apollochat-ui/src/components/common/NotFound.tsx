import React from "react";
import {
  Box,
  Button,
  Container,
  Typography,
  useTheme,
  useMediaQuery,
} from "@mui/material";
import { Link, useNavigate } from "react-router-dom";

const NotFound: React.FC = () => {
  const theme = useTheme();
  const navigate = useNavigate();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const isMedium = useMediaQuery(theme.breakpoints.between("sm", "md"));

  return (
    <Container
      maxWidth="md"
      sx={{
        py: { xs: 4, sm: 6, md: 8 },
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        minHeight: "calc(100vh - 200px)",
      }}>
      <Box
        sx={{
          width: "100%",
          maxWidth: 500,
          mx: "auto",
          textAlign: "center",
        }}>
        <Typography
          variant="h4"
          gutterBottom
          sx={{
            backgroundImage: "linear-gradient(90deg, #6C63FF, #FF6584)",
            backgroundClip: "text",
            color: "transparent",
            display: "inline-block",
            fontWeight: 700,
            mb: { xs: 2, sm: 3, md: 4 },
            fontSize: { xs: "1.75rem", sm: "2rem", md: "2.25rem" },
          }}>
          404 - Page Not Found
        </Typography>

        <Box
          component="img"
          src="https://illustrations.popsy.co/amber/digital-nomad.svg"
          alt="Page not found"
          sx={{
            width: "100%",
            maxWidth: { xs: 280, sm: 350, md: 400 },
            height: "auto",
            mb: { xs: 2, sm: 3, md: 4 },
            mt: 1,
          }}
        />

        <Typography
          variant="body1"
          color="text.secondary"
          sx={{
            mb: { xs: 3, md: 4 },
            mx: "auto",
            fontSize: { xs: "0.9rem", sm: "1rem" },
          }}>
          The page you're looking for doesn't exist or has been moved.
        </Typography>

        <Box sx={{ mt: 2 }}>
          <Button
            component={Link}
            to="/"
            variant="contained"
            color="primary"
            size={isMobile ? "medium" : "large"}
            sx={{ mr: 2, px: { xs: 3, md: 4 } }}>
            Go to Home
          </Button>

          <Button
            variant="outlined"
            size={isMobile ? "medium" : "large"}
            onClick={() => navigate(-1)}
            sx={{ px: { xs: 3, md: 4 } }}>
            Go Back
          </Button>
        </Box>
      </Box>
    </Container>
  );
};

export default NotFound;

import React from "react";
import {
  Box,
  Button,
  Container,
  Typography,
  alpha,
  useTheme,
  useMediaQuery,
} from "@mui/material";
import {
  Link,
  useNavigate,
  useRouteError,
  isRouteErrorResponse,
} from "react-router-dom";
import { snackVar } from "../../constants/snack";

const RouteErrorElement: React.FC = () => {
  const error = useRouteError();
  const theme = useTheme();
  const navigate = useNavigate();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  let errorMessage = "An unexpected error occurred";
  let statusCode = 500;
  let errorTitle = "Something went wrong";
  let errorImage = "https://illustrations.popsy.co/amber/digital-nomad.svg";

  // Show error in snackbar
  React.useEffect(() => {
    snackVar({
      message: isRouteErrorResponse(error)
        ? `${error.status} ${error.statusText}`
        : error instanceof Error
        ? error.message
        : "An unexpected error occurred",
      type: "error",
    });
  }, [error]);

  // Handle different types of errors
  if (isRouteErrorResponse(error)) {
    statusCode = error.status;
    errorMessage = error.data?.message || error.statusText;

    if (error.status === 404) {
      errorTitle = "404 - Page Not Found";
      errorMessage = "This page does not exist or has been moved.";
    } else if (error.status === 401) {
      errorTitle = "401 - Unauthorized";
      errorMessage = "You need to be logged in to access this page.";
    } else if (error.status === 403) {
      errorTitle = "403 - Forbidden";
      errorMessage = "Access to this resource is forbidden.";
    }
  } else if (error instanceof Error) {
    errorMessage = error.message;
  }

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
          {errorTitle}
        </Typography>

        <Box
          component="img"
          src={errorImage}
          alt="Error illustration"
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
          {errorMessage}
        </Typography>

        {/* Show error details in development mode */}
        {process.env.NODE_ENV === "development" && error instanceof Error && (
          <Box
            sx={{
              p: 2,
              mb: 4,
              borderRadius: 2,
              backgroundColor: alpha(theme.palette.error.main, 0.05),
              border: "1px solid",
              borderColor: alpha(theme.palette.error.main, 0.2),
              maxWidth: 600,
              mx: "auto",
              textAlign: "left",
              overflow: "auto",
            }}>
            <Typography
              variant="body2"
              color="error.main"
              fontFamily="monospace">
              {error.stack || error.message}
            </Typography>
          </Box>
        )}

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

export default RouteErrorElement;

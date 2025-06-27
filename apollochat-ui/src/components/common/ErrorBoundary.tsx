import React, { Component, ErrorInfo, ReactNode } from "react";
import {
  Box,
  Button,
  Container,
  Typography,
  alpha,
  useTheme,
  useMediaQuery,
} from "@mui/material";
import { snackVar } from "../../constants/snack";
import { Link } from "react-router-dom";

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
  };

  public static getDerivedStateFromError(error: Error): State {
    // Update state so the next render will show the fallback UI
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    

    // Show error in snackbar
    snackVar({
      message: `An error occurred: ${error.message}`,
      type: "error",
    });
  }

  public render(): ReactNode {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return <ErrorFallback error={this.state.error} />;
    }

    return this.props.children;
  }
}

interface ErrorFallbackProps {
  error: Error | null;
}

const ErrorFallback: React.FC<ErrorFallbackProps> = ({ error }) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

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
          Oops! Something went wrong
        </Typography>

        <Box
          component="img"
          src="https://illustrations.popsy.co/amber/digital-nomad.svg"
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
          We've encountered an unexpected error. Our team has been notified and
          is working on a fix.
        </Typography>

        {error && (
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
              {error.message}
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
            onClick={() => window.location.reload()}
            sx={{ px: { xs: 3, md: 4 } }}>
            Refresh Page
          </Button>
        </Box>
      </Box>
    </Container>
  );
};

export default ErrorBoundary;


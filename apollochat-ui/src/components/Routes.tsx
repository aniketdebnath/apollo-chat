import { createBrowserRouter } from "react-router-dom";
import Login from "./auth/Login";
import Signup from "./auth/Signup";
import Home from "./home/Home";
import Chat from "./chat/Chat";
import { Profile } from "./profile/Profile";
import {
  Box,
  Typography,
  Container,
  Paper,
  alpha,
  useTheme,
} from "@mui/material";

// Placeholder components for new pages
const ComingSoon = ({ title }: { title: string }) => {
  const theme = useTheme();

  return (
    <Container
      maxWidth="md"
      sx={{ py: 8 }}>
      <Paper
        elevation={0}
        sx={{
          p: 4,
          borderRadius: 3,
          textAlign: "center",
          border: "1px solid",
          borderColor: "divider",
          backgroundColor: alpha(theme.palette.background.paper, 0.8),
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
          }}>
          {title}
        </Typography>
        <Typography
          variant="h6"
          color="text.secondary"
          sx={{ mb: 3 }}>
          This feature is coming soon!
        </Typography>
        <Box
          component="img"
          src="https://illustrations.popsy.co/amber/digital-nomad.svg"
          alt="Coming soon illustration"
          sx={{
            width: "100%",
            maxWidth: 400,
            height: "auto",
            mb: 4,
          }}
        />
        <Typography color="text.secondary">
          We're working hard to bring you this feature. Check back soon!
        </Typography>
      </Paper>
    </Container>
  );
};

const Explore = () => <ComingSoon title="Explore" />;
const Notifications = () => <ComingSoon title="Notifications" />;
const Favorites = () => <ComingSoon title="Favorites" />;

const router = createBrowserRouter([
  {
    path: "/login",
    element: <Login />,
  },
  {
    path: "/signup",
    element: <Signup />,
  },
  {
    path: "/",
    element: <Home />,
  },
  {
    path: "/chats/:_id",
    element: <Chat />,
  },
  {
    path: "/profile",
    element: <Profile />,
  },
  {
    path: "/explore",
    element: <Explore />,
  },
  {
    path: "/notifications",
    element: <Notifications />,
  },
  {
    path: "/favorites",
    element: <Favorites />,
  },
]);

export default router;

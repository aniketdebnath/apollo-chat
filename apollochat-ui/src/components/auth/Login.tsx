import { Link, useNavigate } from "react-router-dom";
import Auth from "./Auth";
import { useLogin } from "../../hooks/useLogin";
import {
  Button,
  Typography,
  Box,
  Divider,
  alpha,
  useTheme,
} from "@mui/material";
import { RocketLaunch } from "@mui/icons-material";
import GoogleSignIn from "./GoogleSignIn";
import { useGoogleAuthError } from "../../hooks/useGoogleAuthError";

const Login = () => {
  const { login, error: loginError } = useLogin();
  const { error: googleError } = useGoogleAuthError();
  const theme = useTheme();
  const navigate = useNavigate();

  // Use either login error or Google OAuth error
  const error = loginError || googleError || undefined;

  // Custom success color for the demo button
  const successColor = "#00B8A9"; // Using the success color from the theme

  return (
    <Auth
      submitLabel="Login"
      onSubmit={(request) => login(request)}
      error={error}>
      <Box sx={{ width: "100%" }}>
        <Box sx={{ position: "relative", my: 1, width: "100%" }}>
          <Divider sx={{ width: "100%" }}>
            <Typography
              variant="body2"
              color="text.secondary"
              sx={{ px: 1 }}>
              or
            </Typography>
          </Divider>
        </Box>

        <GoogleSignIn sx={{ mb: 2 }} />

        <Button
          component={Link}
          to="/signup"
          variant="outlined"
          fullWidth
          sx={{
            mt: 1,
            py: 1.2,
            borderRadius: 2,
            textTransform: "none",
            fontWeight: 600,
          }}>
          Create Account
        </Button>

        <Box sx={{ mt: 3, mb: 1 }}>
          <Divider sx={{ width: "100%" }}>
            <Typography
              variant="body2"
              color="text.secondary"
              sx={{ px: 1 }}>
              Want to see it in action?
            </Typography>
          </Divider>
        </Box>

        <Button
          onClick={() => navigate("/demo")}
          variant="outlined"
          fullWidth
          startIcon={<RocketLaunch />}
          sx={{
            mt: 1,
            py: 1.2,
            borderRadius: 2,
            textTransform: "none",
            fontWeight: 600,
            borderWidth: 2,
            borderColor: successColor,
            color: successColor,
            backgroundImage: `linear-gradient(to right, ${alpha(
              successColor,
              0.05
            )}, ${alpha(successColor, 0.1)})`,
            "&:hover": {
              backgroundImage: `linear-gradient(to right, ${alpha(
                successColor,
                0.1
              )}, ${alpha(successColor, 0.15)})`,
              borderColor: successColor,
              borderWidth: 2,
            },
          }}>
          Explore Demo
        </Button>
      </Box>
    </Auth>
  );
};

export default Login;

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

const Login = () => {
  const { login, error } = useLogin();
  const theme = useTheme();
  const navigate = useNavigate();

  return (
    <Auth
      submitLabel="Login"
      onSubmit={(request) => login(request)}
      error={error}>
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
            Recruiter? Try it out
          </Typography>
        </Divider>
      </Box>

      <Button
        onClick={() => navigate("/demo")}
        variant="outlined"
        color="secondary"
        fullWidth
        startIcon={<RocketLaunch />}
        sx={{
          mt: 1,
          py: 1.2,
          borderRadius: 2,
          textTransform: "none",
          fontWeight: 600,
          borderWidth: 2,
          backgroundImage: `linear-gradient(to right, ${alpha(
            theme.palette.secondary.main,
            0.05
          )}, ${alpha(theme.palette.secondary.main, 0.1)})`,
          "&:hover": {
            backgroundImage: `linear-gradient(to right, ${alpha(
              theme.palette.secondary.main,
              0.1
            )}, ${alpha(theme.palette.secondary.main, 0.15)})`,
            borderWidth: 2,
          },
        }}>
        Try Demo
      </Button>
    </Auth>
  );
};

export default Login;

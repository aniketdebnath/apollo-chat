import { Link } from "react-router-dom";
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

const Login = () => {
  const { login, error } = useLogin();
  const theme = useTheme();

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
    </Auth>
  );
};

export default Login;

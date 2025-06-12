import { Link, useNavigate } from "react-router-dom";
import {
  Button,
  TextField,
  Typography,
  Box,
  InputAdornment,
  Divider,
  alpha,
  useTheme,
} from "@mui/material";
import Auth from "./Auth";
import { useCreateUser } from "../../hooks/useCreateUser";
import { useState } from "react";
import { extractErrorMessage } from "../../utils/errors";
import { useLogin } from "../../hooks/useLogin";
import { UNKNOWN_ERROR_MESSAGE } from "../../constants/error";
import PersonOutlineIcon from "@mui/icons-material/PersonOutline";
import { RocketLaunch } from "@mui/icons-material";

const Signup = () => {
  const [createUser] = useCreateUser();
  const [error, setError] = useState("");
  const [username, setUsername] = useState("");
  const { login } = useLogin();
  const navigate = useNavigate();
  const theme = useTheme();

  // Custom success color for the demo button
  const successColor = "#00B8A9"; // Using the success color from the theme

  return (
    <Auth
      submitLabel="Sign Up"
      error={error}
      extraFields={[
        <TextField
          key="username-field"
          type="text"
          label="Username"
          variant="outlined"
          value={username}
          onChange={(event) => setUsername(event.target.value)}
          error={!!error}
          required
          fullWidth
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <PersonOutlineIcon color="action" />
              </InputAdornment>
            ),
          }}
          sx={{
            "& .MuiOutlinedInput-root": {
              borderRadius: 2,
            },
          }}
        />,
      ]}
      onSubmit={async ({ email, password }) => {
        try {
          await createUser({
            variables: {
              createUserInput: {
                email,
                username,
                password,
              },
            },
          });
          await login({ email, password });
          setError("");
        } catch (error) {
          const errorMessage = extractErrorMessage(error);
          if (errorMessage) {
            setError(errorMessage);
            return;
          }
          setError(UNKNOWN_ERROR_MESSAGE);
        }
      }}>
      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          gap: 1,
          mb: 2,
        }}>
        <Typography
          variant="body2"
          color="text.secondary">
          Already have an account?
        </Typography>
        <Button
          component={Link}
          to="/login"
          color="primary"
          variant="text"
          size="small"
          sx={{
            fontWeight: 600,
            textTransform: "none",
            fontSize: "0.875rem",
          }}>
          Log in
        </Button>
      </Box>

      <Box sx={{ mt: 2, mb: 1 }}>
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
    </Auth>
  );
};

export default Signup;

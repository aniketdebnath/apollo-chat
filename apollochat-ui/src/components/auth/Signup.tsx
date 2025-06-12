import { Link } from "react-router-dom";
import {
  Button,
  TextField,
  Typography,
  Box,
  InputAdornment,
} from "@mui/material";
import Auth from "./Auth";
import { useCreateUser } from "../../hooks/useCreateUser";
import { useState } from "react";
import { extractErrorMessage } from "../../utils/errors";
import { useLogin } from "../../hooks/useLogin";
import { UNKNOWN_ERROR_MESSAGE } from "../../constants/error";
import PersonOutlineIcon from "@mui/icons-material/PersonOutline";

const Signup = () => {
  const [createUser] = useCreateUser();
  const [error, setError] = useState("");
  const [username, setUsername] = useState("");
  const { login } = useLogin();

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
    </Auth>
  );
};

export default Signup;

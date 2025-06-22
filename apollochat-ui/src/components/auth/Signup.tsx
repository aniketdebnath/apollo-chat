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
  Alert,
  Stack,
} from "@mui/material";
import Auth from "./Auth";
import { useCreateUser } from "../../hooks/useCreateUser";
import { useState } from "react";
import { extractErrorMessage } from "../../utils/errors";
import { useLogin } from "../../hooks/useLogin";
import { UNKNOWN_ERROR_MESSAGE } from "../../constants/error";
import PersonOutlineIcon from "@mui/icons-material/PersonOutline";
import { RocketLaunch } from "@mui/icons-material";
import GoogleSignIn from "./GoogleSignIn";
import { useGoogleAuthError } from "../../hooks/useGoogleAuthError";
import OtpVerification from "./OtpVerification";

const Signup = () => {
  const [createUser] = useCreateUser();
  const [error, setError] = useState("");
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showOtpVerification, setShowOtpVerification] = useState(false);
  const [verificationComplete, setVerificationComplete] = useState(false);
  const navigate = useNavigate();
  const theme = useTheme();
  const { error: googleError } = useGoogleAuthError();

  // Use either signup error or Google OAuth error
  const displayError = error || googleError || undefined;

  // Custom success color for the demo button
  const successColor = "#00B8A9"; // Using the success color from the theme

  const handleSignup = async ({
    email: inputEmail,
    password: inputPassword,
  }: {
    email: string;
    password: string;
  }) => {
    try {
      // Store credentials for later login after OTP verification
      setEmail(inputEmail);
      setPassword(inputPassword);

      // Create the user
      await createUser({
        variables: {
          createUserInput: {
            email: inputEmail,
            username,
            password: inputPassword,
          },
        },
      });

      // Show OTP verification screen
      setShowOtpVerification(true);
      setError("");
    } catch (error) {
      const errorMessage = extractErrorMessage(error);
      if (errorMessage) {
        setError(errorMessage);
        return;
      }
      setError(UNKNOWN_ERROR_MESSAGE);
    }
  };

  const handleVerificationComplete = () => {
    setVerificationComplete(true);
  };

  const handleGoBack = () => {
    setShowOtpVerification(false);
  };

  // Success screen after verification
  if (verificationComplete) {
    return (
      <Auth
        submitLabel=""
        onSubmit={async () => Promise.resolve()}
        error={undefined}>
        <Box sx={{ width: "100%", textAlign: "center" }}>
          <Alert
            severity="success"
            sx={{ mb: 3, fontSize: "1rem" }}>
            Email verification successful! Your account has been created.
          </Alert>

          <Typography
            variant="h6"
            sx={{ mb: 4, fontSize: "1rem" }}>
            Please proceed to login with your credentials.
          </Typography>

          <Button
            variant="contained"
            color="primary"
            size="large"
            fullWidth
            onClick={() => navigate("/login")}
            sx={{
              py: 1.5,
              borderRadius: 2,
              textTransform: "none",
              fontSize: "1rem",
              fontWeight: 600,
              mb: 2,
            }}>
            Go to Login
          </Button>
        </Box>
      </Auth>
    );
  }

  // OTP verification screen
  if (showOtpVerification) {
    return (
      <Auth
        submitLabel=""
        onSubmit={async () => Promise.resolve()}
        error={undefined}>
        <OtpVerification
          email={email}
          onVerificationComplete={handleVerificationComplete}
          onGoBack={handleGoBack}
        />
      </Auth>
    );
  }

  // Main signup form
  return (
    <Auth
      submitLabel="Sign Up"
      onSubmit={handleSignup}
      error={displayError}
      extraFields={[
        <TextField
          key="username-field"
          type="text"
          label="Username"
          variant="outlined"
          value={username}
          onChange={(event) => setUsername(event.target.value)}
          error={!!displayError}
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
      ]}>
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
      </Box>
    </Auth>
  );
};

export default Signup;

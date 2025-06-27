import { Link, useNavigate, useLocation } from "react-router-dom";
import Auth from "./Auth";
import { useLogin } from "../../hooks/useLogin";
import {
  Button,
  Typography,
  Box,
  Divider,
  alpha,
  useTheme,
  TextField,
  Alert,
  CircularProgress,
  InputAdornment,
  IconButton,
  Stack,
} from "@mui/material";
import { useState, useEffect } from "react";
import { RocketLaunch } from "@mui/icons-material";
import GoogleSignIn from "./GoogleSignIn";
import { useGoogleAuthError } from "../../hooks/useGoogleAuthError";
import PasswordResetOtp from "./PasswordResetOtp";
import { getRelativeApiUrl } from "../../utils/api-url";
import LockOutlinedIcon from "@mui/icons-material/LockOutlined";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import ErrorOutlineIcon from "@mui/icons-material/ErrorOutline";
import CheckCircleOutlineIcon from "@mui/icons-material/CheckCircleOutline";
import EmailIcon from "@mui/icons-material/Email";
import VisibilityIcon from "@mui/icons-material/Visibility";
import VisibilityOffIcon from "@mui/icons-material/VisibilityOff";

const Login = () => {
  const { login, demoLogin, error: loginError } = useLogin();
  const { error: googleError } = useGoogleAuthError();
  const theme = useTheme();
  const navigate = useNavigate();
  const location = useLocation();

  // Check if this is a demo login request
  const isDemoLogin =
    new URLSearchParams(location.search).get("demo") === "true";
  const [demoLoading, setDemoLoading] = useState(isDemoLogin);
  const [demoError, setDemoError] = useState<string | null>(null);

  // Auto-login for demo user
  useEffect(() => {
    if (isDemoLogin) {
      const loginAsDemo = async () => {
        try {
          await demoLogin();
          navigate("/");
        } catch (error) {
          
          setDemoError(
            "Failed to log in to demo account. Please try again later."
          );
          setDemoLoading(false);
        }
      };

      loginAsDemo();
    }
  }, [isDemoLogin, demoLogin, navigate]);

  // States for forgot password flow
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [forgotPasswordEmail, setForgotPasswordEmail] = useState("");
  const [forgotPasswordStep, setForgotPasswordStep] = useState<
    "email" | "otp" | "newPassword"
  >("email");
  const [forgotPasswordError, setForgotPasswordError] = useState<string | null>(
    null
  );
  const [forgotPasswordLoading, setForgotPasswordLoading] = useState(false);
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [resetSuccess, setResetSuccess] = useState(false);

  // Use either login error or Google OAuth error
  const error = loginError || googleError || demoError || undefined;

  // Custom success color for the demo button
  const successColor = "#00B8A9"; // Using the success color from the theme

  // Request password reset by sending OTP
  const handleRequestReset = async () => {
    if (!forgotPasswordEmail) {
      setForgotPasswordError("Please enter your email address");
      return;
    }

    setForgotPasswordLoading(true);
    setForgotPasswordError(null);

    try {
      const response = await fetch(
        getRelativeApiUrl("/auth/request-password-reset"),
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ email: forgotPasswordEmail }),
          credentials: "include",
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to request password reset");
      }

      // Move to OTP verification step
      setForgotPasswordStep("otp");
    } catch (err) {
      setForgotPasswordError(
        err instanceof Error ? err.message : "An error occurred"
      );
    } finally {
      setForgotPasswordLoading(false);
    }
  };

  // Handle OTP verification completion
  const handleVerificationComplete = () => {
    setForgotPasswordStep("newPassword");
  };

  // Handle going back from OTP verification to email input
  const handleGoBack = () => {
    setForgotPasswordStep("email");
  };

  // Reset password with new password
  const handleResetPassword = async () => {
    if (!newPassword) {
      setForgotPasswordError("Please enter a new password");
      return;
    }

    if (newPassword !== confirmPassword) {
      setForgotPasswordError("Passwords do not match");
      return;
    }

    setForgotPasswordLoading(true);
    setForgotPasswordError(null);

    try {
      const response = await fetch(getRelativeApiUrl("/auth/reset-password"), {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email: forgotPasswordEmail, newPassword }),
        credentials: "include",
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to reset password");
      }

      // Show success message
      setResetSuccess(true);
    } catch (err) {
      setForgotPasswordError(
        err instanceof Error ? err.message : "An error occurred"
      );
    } finally {
      setForgotPasswordLoading(false);
    }
  };

  // Email input step for forgot password
  const renderForgotPasswordEmailStep = () => (
    <Box sx={{ width: "100%", textAlign: "center", position: "relative" }}>
      <Box sx={{ position: "absolute", left: 0, top: 0 }}>
        <IconButton
          onClick={() => setShowForgotPassword(false)}
          color="primary"
          aria-label="go back to login">
          <ArrowBackIcon />
        </IconButton>
      </Box>

      <LockOutlinedIcon
        color="primary"
        sx={{ fontSize: 40, mb: 2 }}
      />
      <Typography
        variant="h5"
        component="h1"
        fontWeight="bold"
        gutterBottom>
        Forgot Password
      </Typography>

      <Typography
        variant="body1"
        sx={{ mb: 3, textAlign: "center" }}>
        Enter your email address and we'll send you a verification code to reset
        your password.
      </Typography>

      {forgotPasswordError && (
        <Alert
          severity="error"
          sx={{ mb: 2, width: "100%" }}
          icon={<ErrorOutlineIcon />}>
          {forgotPasswordError}
        </Alert>
      )}

      <TextField
        label="Email Address"
        variant="outlined"
        fullWidth
        value={forgotPasswordEmail}
        onChange={(e) => setForgotPasswordEmail(e.target.value)}
        sx={{ mb: 3 }}
        InputProps={{
          startAdornment: (
            <InputAdornment position="start">
              <EmailIcon color="action" />
            </InputAdornment>
          ),
        }}
      />

      <Button
        variant="contained"
        color="primary"
        onClick={handleRequestReset}
        disabled={forgotPasswordLoading || !forgotPasswordEmail}
        sx={{ width: "100%", py: 1.5, fontWeight: "bold" }}>
        {forgotPasswordLoading ? (
          <CircularProgress size={24} />
        ) : (
          "Send Reset Code"
        )}
      </Button>
    </Box>
  );

  // New password input step for forgot password
  const renderNewPasswordStep = () => (
    <Box sx={{ width: "100%", textAlign: "center", position: "relative" }}>
      <Box sx={{ position: "absolute", left: 0, top: 0 }}>
        <IconButton
          onClick={() => setForgotPasswordStep("otp")}
          color="primary"
          aria-label="go back to verification">
          <ArrowBackIcon />
        </IconButton>
      </Box>

      <LockOutlinedIcon
        color="primary"
        sx={{ fontSize: 40, mb: 2 }}
      />
      <Typography
        variant="h5"
        component="h1"
        fontWeight="bold"
        gutterBottom>
        Reset Password
      </Typography>

      <Typography
        variant="body1"
        sx={{ mb: 3, textAlign: "center" }}>
        Enter your new password below.
      </Typography>

      {forgotPasswordError && (
        <Alert
          severity="error"
          sx={{ mb: 2, width: "100%" }}
          icon={<ErrorOutlineIcon />}>
          {forgotPasswordError}
        </Alert>
      )}

      {resetSuccess && (
        <Alert
          severity="success"
          sx={{ mb: 3, width: "100%" }}
          icon={<CheckCircleOutlineIcon />}>
          Your password has been reset successfully!
        </Alert>
      )}

      <TextField
        type={showPassword ? "text" : "password"}
        label="New Password"
        variant="outlined"
        fullWidth
        value={newPassword}
        onChange={(e) => setNewPassword(e.target.value)}
        sx={{ mb: 2 }}
        InputProps={{
          endAdornment: (
            <InputAdornment position="end">
              <IconButton
                onClick={() => setShowPassword(!showPassword)}
                edge="end">
                {showPassword ? <VisibilityOffIcon /> : <VisibilityIcon />}
              </IconButton>
            </InputAdornment>
          ),
        }}
      />

      <TextField
        type={showConfirmPassword ? "text" : "password"}
        label="Confirm Password"
        variant="outlined"
        fullWidth
        value={confirmPassword}
        onChange={(e) => setConfirmPassword(e.target.value)}
        sx={{ mb: 3 }}
        InputProps={{
          endAdornment: (
            <InputAdornment position="end">
              <IconButton
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                edge="end">
                {showConfirmPassword ? (
                  <VisibilityOffIcon />
                ) : (
                  <VisibilityIcon />
                )}
              </IconButton>
            </InputAdornment>
          ),
        }}
      />

      {resetSuccess ? (
        <Button
          variant="contained"
          color="primary"
          onClick={() => setShowForgotPassword(false)}
          sx={{ width: "100%", py: 1.5, fontWeight: "bold" }}>
          Return to Login
        </Button>
      ) : (
        <Button
          variant="contained"
          color="primary"
          onClick={handleResetPassword}
          disabled={forgotPasswordLoading || !newPassword || !confirmPassword}
          sx={{ width: "100%", py: 1.5, fontWeight: "bold" }}>
          {forgotPasswordLoading ? (
            <CircularProgress size={24} />
          ) : (
            "Reset Password"
          )}
        </Button>
      )}
    </Box>
  );

  // Forgot password flow
  if (showForgotPassword) {
    return (
      <Auth
        submitLabel=""
        onSubmit={async () => Promise.resolve()}
        error={undefined}>
        {forgotPasswordStep === "email" && renderForgotPasswordEmailStep()}
        {forgotPasswordStep === "otp" && (
          <PasswordResetOtp
            email={forgotPasswordEmail}
            onVerificationComplete={handleVerificationComplete}
            onGoBack={handleGoBack}
          />
        )}
        {forgotPasswordStep === "newPassword" && renderNewPasswordStep()}
      </Auth>
    );
  }

  // Show loading screen for demo login
  if (demoLoading) {
    return (
      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          height: "100vh",
        }}>
        <CircularProgress />
        <Typography sx={{ mt: 2 }}>Loading demo account...</Typography>
      </Box>
    );
  }

  // Main login form
  return (
    <Auth
      submitLabel="Login"
      onSubmit={(request) => login(request)}
      error={error}
      extraFields={[]}>
      <Box sx={{ width: "100%" }}>
        {/* Forgot Password Link */}
        <Box
          sx={{
            width: "100%",
            display: "flex",
            justifyContent: "flex-end",
          }}>
          <Button
            onClick={() => setShowForgotPassword(true)}
            color="primary"
            variant="text"
            size="small"
            sx={{
              fontWeight: 500,
              textTransform: "none",
              fontSize: "0.875rem",
            }}>
            Forgot Password?
          </Button>
        </Box>

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
          onClick={() => navigate("/login?demo=true")}
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


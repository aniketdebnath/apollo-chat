import React, { useState } from "react";
import {
  Box,
  TextField,
  Button,
  Typography,
  CircularProgress,
  Alert,
  Divider,
  Stack,
  IconButton,
  InputAdornment,
} from "@mui/material";
import { getRelativeApiUrl } from "../../utils/api-url";
import LockOutlinedIcon from "@mui/icons-material/LockOutlined";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import ErrorOutlineIcon from "@mui/icons-material/ErrorOutline";
import CheckCircleOutlineIcon from "@mui/icons-material/CheckCircleOutline";
import EmailIcon from "@mui/icons-material/Email";
import VisibilityIcon from "@mui/icons-material/Visibility";
import VisibilityOffIcon from "@mui/icons-material/VisibilityOff";
import Auth from "./Auth";
import OtpVerification from "./OtpVerification";
import { useNavigate } from "react-router-dom";

const ForgotPassword = () => {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentStep, setCurrentStep] = useState<
    "email" | "otp" | "newPassword"
  >("email");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [resetSuccess, setResetSuccess] = useState(false);
  const navigate = useNavigate();

  // Request password reset by sending OTP
  const handleRequestReset = async () => {
    if (!email) {
      setError("Please enter your email address");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await fetch(
        getRelativeApiUrl("/auth/request-password-reset"),
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ email }),
          credentials: "include",
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to request password reset");
      }

      // Move to OTP verification step
      setCurrentStep("otp");
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  // Handle OTP verification completion
  const handleVerificationComplete = () => {
    setCurrentStep("newPassword");
  };

  // Handle going back from OTP verification to email input
  const handleGoBack = () => {
    setCurrentStep("email");
  };

  // Reset password with new password
  const handleResetPassword = async () => {
    if (!newPassword) {
      setError("Please enter a new password");
      return;
    }

    if (newPassword !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await fetch(getRelativeApiUrl("/auth/reset-password"), {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, newPassword }),
        credentials: "include",
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to reset password");
      }

      // Show success message
      setResetSuccess(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  // Email input step
  const renderEmailStep = () => (
    <Box sx={{ width: "100%", textAlign: "center" }}>
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

      {error && (
        <Alert
          severity="error"
          sx={{ mb: 2, width: "100%" }}
          icon={<ErrorOutlineIcon />}>
          {error}
        </Alert>
      )}

      <TextField
        label="Email Address"
        variant="outlined"
        fullWidth
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        sx={{ mb: 3 }}
        InputProps={{
          startAdornment: (
            <InputAdornment position="start">
              <EmailIcon color="action" />
            </InputAdornment>
          ),
        }}
      />

      <Stack
        spacing={2}
        direction="row"
        sx={{ width: "100%" }}>
        <Button
          variant="outlined"
          color="primary"
          onClick={() => navigate("/login")}
          sx={{ flex: 1 }}>
          Back to Login
        </Button>
        <Button
          variant="contained"
          color="primary"
          onClick={handleRequestReset}
          disabled={loading || !email}
          sx={{ flex: 1, py: 1.5, fontWeight: "bold" }}>
          {loading ? <CircularProgress size={24} /> : "Send Reset Code"}
        </Button>
      </Stack>
    </Box>
  );

  // New password input step
  const renderNewPasswordStep = () => (
    <Box sx={{ width: "100%", textAlign: "center", position: "relative" }}>
      <Box sx={{ position: "absolute", left: 0, top: 0 }}>
        <IconButton
          onClick={() => setCurrentStep("otp")}
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

      {error && (
        <Alert
          severity="error"
          sx={{ mb: 2, width: "100%" }}
          icon={<ErrorOutlineIcon />}>
          {error}
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
          onClick={() => navigate("/login")}
          sx={{ width: "100%", py: 1.5, fontWeight: "bold" }}>
          Go to Login
        </Button>
      ) : (
        <Button
          variant="contained"
          color="primary"
          onClick={handleResetPassword}
          disabled={loading || !newPassword || !confirmPassword}
          sx={{ width: "100%", py: 1.5, fontWeight: "bold" }}>
          {loading ? <CircularProgress size={24} /> : "Reset Password"}
        </Button>
      )}
    </Box>
  );

  return (
    <Auth
      submitLabel=""
      onSubmit={async () => Promise.resolve()}
      error={undefined}>
      {currentStep === "email" && renderEmailStep()}
      {currentStep === "otp" && (
        <OtpVerification
          email={email}
          onVerificationComplete={handleVerificationComplete}
          onGoBack={handleGoBack}
        />
      )}
      {currentStep === "newPassword" && renderNewPasswordStep()}
    </Auth>
  );
};

export default ForgotPassword;

import React, { useState, useEffect } from "react";
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
  Tooltip,
  LinearProgress,
} from "@mui/material";
import { getRelativeApiUrl } from "../../utils/api-url";
import LockOutlinedIcon from "@mui/icons-material/LockOutlined";
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined";
import ErrorOutlineIcon from "@mui/icons-material/ErrorOutline";
import CheckCircleOutlineIcon from "@mui/icons-material/CheckCircleOutline";

interface PasswordResetOtpProps {
  email: string;
  onVerificationComplete: () => void;
  onGoBack: () => void;
}

const PasswordResetOtp: React.FC<PasswordResetOtpProps> = ({
  email,
  onVerificationComplete,
  onGoBack,
}) => {
  const [otp, setOtp] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [resendLoading, setResendLoading] = useState(false);
  const [resendSuccess, setResendSuccess] = useState(false);
  const [timeRemaining, setTimeRemaining] = useState(15 * 60); // 15 minutes in seconds
  const [timerActive, setTimerActive] = useState(true);
  const [resendCooldown, setResendCooldown] = useState(0); // Cooldown timer for resend (in seconds)
  const [verifyAttempts, setVerifyAttempts] = useState(0); // Track verification attempts
  const [isRateLimited, setIsRateLimited] = useState(false); // Track if we're rate limited

  // Maximum allowed verification attempts before showing warning
  const MAX_VERIFY_ATTEMPTS = 3;
  // Maximum resend cooldown time (60 seconds = 1 minute)
  const MAX_RESEND_COOLDOWN = 60;

  // Start countdown timer when component mounts
  useEffect(() => {
    let interval: NodeJS.Timeout;

    if (timerActive && timeRemaining > 0) {
      interval = setInterval(() => {
        setTimeRemaining((prevTime) => {
          if (prevTime <= 1) {
            clearInterval(interval);
            return 0;
          }
          return prevTime - 1;
        });
      }, 1000);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [timerActive, timeRemaining]);

  // Resend cooldown timer
  useEffect(() => {
    let cooldownInterval: NodeJS.Timeout;

    if (resendCooldown > 0) {
      cooldownInterval = setInterval(() => {
        setResendCooldown((prevTime) => {
          if (prevTime <= 1) {
            clearInterval(cooldownInterval);
            return 0;
          }
          return prevTime - 1;
        });
      }, 1000);
    }

    return () => {
      if (cooldownInterval) clearInterval(cooldownInterval);
    };
  }, [resendCooldown]);

  // Format time as MM:SS
  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes.toString().padStart(2, "0")}:${remainingSeconds
      .toString()
      .padStart(2, "0")}`;
  };

  // Parse error message from response
  const parseErrorMessage = (error: any, defaultMessage: string): string => {
    if (error instanceof Error) {
      // Check for rate limit errors
      if (
        error.message.includes("Rate limit exceeded") ||
        error.message.includes("Too many verification attempts")
      ) {
        setIsRateLimited(true);
        return error.message;
      }
      return error.message;
    }

    if (typeof error === "object" && error !== null) {
      return error.message || defaultMessage;
    }

    return defaultMessage;
  };

  const handleVerifyOtp = async () => {
    if (!otp) {
      setError("Please enter the OTP code");
      return;
    }

    if (otp.length !== 6) {
      setError("OTP code must be 6 digits");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // Use the password reset OTP verification endpoint
      const response = await fetch(
        getRelativeApiUrl("/auth/verify-reset-otp"),
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ email, otp }),
          credentials: "include",
        }
      );

      const data = await response.json();

      if (!response.ok) {
        // Increment attempt counter
        setVerifyAttempts((prev) => prev + 1);

        // Check for rate limiting errors
        if (response.status === 429) {
          setIsRateLimited(true);
          throw new Error(
            data.message ||
              "Too many verification attempts. Please wait before trying again."
          );
        }

        throw new Error(data.message || "Invalid or expired OTP");
      }

      // Success - reset attempts
      setVerifyAttempts(0);
      onVerificationComplete();
    } catch (err) {
      setError(parseErrorMessage(err, "Failed to verify OTP"));
    } finally {
      setLoading(false);
    }
  };

  const handleResendOtp = async () => {
    setResendLoading(true);
    setResendSuccess(false);
    setError(null);

    try {
      // Use the password reset request endpoint
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
        // Check for rate limiting errors
        if (response.status === 429) {
          setIsRateLimited(true);
          throw new Error(
            data.message ||
              "Rate limit exceeded. Please wait before requesting another OTP code."
          );
        }

        throw new Error(data.message || "Failed to send OTP");
      }

      setResendSuccess(true);
      // Reset timer when OTP is resent
      setTimeRemaining(15 * 60);
      setTimerActive(true);
      // Set cooldown for resend button (1 minute)
      setResendCooldown(MAX_RESEND_COOLDOWN);
      // Reset rate limited status
      setIsRateLimited(false);
    } catch (err) {
      setError(parseErrorMessage(err, "Failed to resend OTP"));
    } finally {
      setResendLoading(false);
    }
  };

  // Calculate cooldown progress percentage
  const cooldownProgress =
    ((MAX_RESEND_COOLDOWN - resendCooldown) / MAX_RESEND_COOLDOWN) * 100;

  return (
    <Box
      sx={{
        width: "100%",
        textAlign: "center",
        position: "relative",
      }}>
      <Box sx={{ position: "absolute", left: 0, top: 0 }}>
        <IconButton
          onClick={onGoBack}
          color="primary"
          aria-label="go back">
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
        Password Reset Verification
      </Typography>

      <Typography
        variant="body1"
        sx={{ mb: 3, textAlign: "center" }}>
        We've sent a verification code to <strong>{email}</strong>. Please enter
        the code below to verify your email and reset your password.
      </Typography>

      {error && (
        <Alert
          severity="error"
          sx={{ mb: 2, width: "100%" }}
          icon={<ErrorOutlineIcon />}>
          {error}
        </Alert>
      )}

      {resendSuccess && (
        <Alert
          severity="success"
          sx={{ mb: 2, width: "100%" }}
          icon={<CheckCircleOutlineIcon />}>
          OTP has been resent to your email
        </Alert>
      )}

      {/* OTP expiration timer */}
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          width: "100%",
          mb: 2,
          bgcolor: timeRemaining === 0 ? "error.light" : "primary.light",
          py: 1,
          px: 2,
          borderRadius: 1,
        }}>
        <AccessTimeIcon
          sx={{
            mr: 1,
            color: timeRemaining === 0 ? "error.dark" : "primary.dark",
          }}
        />
        <Typography
          variant="body2"
          color={timeRemaining === 0 ? "error.dark" : "primary.dark"}
          fontWeight="medium">
          {timeRemaining > 0
            ? `Code expires in: ${formatTime(timeRemaining)}`
            : "Code expired. Please request a new one."}
        </Typography>
      </Box>

      {/* Warning for multiple failed attempts */}
      {verifyAttempts >= MAX_VERIFY_ATTEMPTS && !isRateLimited && (
        <Alert
          severity="warning"
          sx={{ mb: 2, width: "100%" }}
          icon={<InfoOutlinedIcon />}>
          Multiple failed attempts detected. Make sure you're entering the
          correct code.
        </Alert>
      )}

      {/* Rate limiting warning */}
      {isRateLimited && (
        <Alert
          severity="warning"
          sx={{ mb: 2, width: "100%" }}
          icon={<InfoOutlinedIcon />}>
          Rate limit reached. Please wait before trying again.
        </Alert>
      )}

      <TextField
        label="Verification Code"
        variant="outlined"
        fullWidth
        value={otp}
        onChange={(e) => setOtp(e.target.value.replace(/[^0-9]/g, ""))}
        sx={{ mb: 3 }}
        placeholder="Enter 6-digit code"
        error={!!error && error.includes("OTP")}
        inputProps={{
          maxLength: 6,
          inputMode: "numeric",
          pattern: "[0-9]*",
        }}
        InputProps={{
          sx: { letterSpacing: "0.5em", fontWeight: "bold" },
        }}
      />

      <Stack
        spacing={2}
        sx={{
          width: "100%",
        }}>
        <Button
          variant="contained"
          color="primary"
          fullWidth
          onClick={handleVerifyOtp}
          disabled={
            loading || timeRemaining === 0 || otp.length !== 6 || isRateLimited
          }
          sx={{ py: 1.5, fontWeight: "bold" }}>
          {loading ? <CircularProgress size={24} /> : "Verify Code"}
        </Button>

        <Divider>
          <Typography
            variant="body2"
            color="text.secondary">
            Didn't receive the code?
          </Typography>
        </Divider>

        {/* Resend cooldown progress */}
        {resendCooldown > 0 && (
          <Box sx={{ width: "100%", mb: 1 }}>
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                mb: 0.5,
              }}>
              <Typography
                variant="caption"
                color="text.secondary">
                Resend available in: {formatTime(resendCooldown)}
              </Typography>
              <Typography
                variant="caption"
                color="text.secondary">
                {Math.round(cooldownProgress)}%
              </Typography>
            </Box>
            <LinearProgress
              variant="determinate"
              value={cooldownProgress}
            />
          </Box>
        )}

        <Tooltip
          title={
            resendCooldown > 0
              ? `You can request a new code in ${formatTime(resendCooldown)}`
              : "Request a new verification code"
          }
          arrow>
          <span>
            <Button
              variant="outlined"
              color="primary"
              onClick={handleResendOtp}
              disabled={resendLoading || resendCooldown > 0 || isRateLimited}
              sx={{ mt: 1, width: "100%" }}>
              {resendLoading ? <CircularProgress size={20} /> : "Resend Code"}
            </Button>
          </span>
        </Tooltip>
      </Stack>
    </Box>
  );
};

export default PasswordResetOtp;

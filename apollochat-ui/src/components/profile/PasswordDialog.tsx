import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  IconButton,
  Alert,
  Box,
  Typography,
} from "@mui/material";
import { Close, AccessTime as AccessTimeIcon } from "@mui/icons-material";
import { useState, useEffect } from "react";

interface PasswordDialogProps {
  open: boolean;
  onClose: () => void;
  email: string;
  onRequestOtp: (email: string) => Promise<void>;
  onVerifyOtp: (otp: string) => Promise<void>;
  onResetPassword: (
    newPassword: string,
    confirmPassword: string
  ) => Promise<void>;
  timeRemaining: number;
  resendCooldown: number;
}

export const PasswordDialog = ({
  open,
  onClose,
  email,
  onRequestOtp,
  onVerifyOtp,
  onResetPassword,
  timeRemaining,
  resendCooldown,
}: PasswordDialogProps) => {
  const [step, setStep] = useState<"request" | "verify" | "reset">("request");
  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [isRequestingOtp, setIsRequestingOtp] = useState(false);

  useEffect(() => {
    if (open) {
      setStep("request");
      setOtp("");
      setNewPassword("");
      setConfirmPassword("");
      setError("");
      setIsRequestingOtp(false);
    }
  }, [open]);

  // Format time as MM:SS
  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes.toString().padStart(2, "0")}:${remainingSeconds
      .toString()
      .padStart(2, "0")}`;
  };

  const handleRequestOtp = async () => {
    try {
      setError("");
      setIsRequestingOtp(true);
      await onRequestOtp(email);
      setStep("verify");
    } catch (error) {
      setError(
        error instanceof Error
          ? error.message
          : "Failed to send verification code"
      );
    } finally {
      setIsRequestingOtp(false);
    }
  };

  const handleVerifyOtp = async () => {
    if (!otp || otp.length !== 6) {
      setError("Please enter the 6-digit verification code");
      return;
    }

    try {
      await onVerifyOtp(otp);
      setStep("reset");
      setError("");
    } catch (error) {
      setError(
        error instanceof Error ? error.message : "Failed to verify code"
      );
    }
  };

  const handleResetPassword = async () => {
    // Validate password
    if (!newPassword) {
      setError("Password cannot be empty");
      return;
    }

    if (newPassword.length < 8) {
      setError("Password must be at least 8 characters long");
      return;
    }

    // Check for strong password requirements
    const hasUpperCase = /[A-Z]/.test(newPassword);
    const hasLowerCase = /[a-z]/.test(newPassword);
    const hasNumbers = /\d/.test(newPassword);
    const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(newPassword);

    if (!(hasUpperCase && hasLowerCase && hasNumbers && hasSpecialChar)) {
      setError(
        "Password must include at least one uppercase letter, one lowercase letter, one number, and one special character"
      );
      return;
    }

    if (newPassword !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    try {
      await onResetPassword(newPassword, confirmPassword);
    } catch (error) {
      setError(
        error instanceof Error ? error.message : "Failed to reset password"
      );
    }
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      fullWidth
      maxWidth="sm">
      <DialogTitle>
        Change Password
        <IconButton
          aria-label="close"
          onClick={onClose}
          sx={{
            position: "absolute",
            right: 8,
            top: 8,
          }}>
          <Close />
        </IconButton>
      </DialogTitle>
      <DialogContent>
        {error && (
          <Alert
            severity="error"
            sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        {step === "request" && (
          <Box sx={{ mt: 2 }}>
            <Typography
              variant="body1"
              sx={{ mb: 2 }}>
              To change your password, we'll send a verification code to your
              email address.
            </Typography>
            <TextField
              margin="dense"
              label="Email"
              type="email"
              fullWidth
              value={email}
              variant="outlined"
              disabled
              sx={{ mb: 2 }}
            />
          </Box>
        )}

        {step === "verify" && (
          <Box sx={{ mt: 2 }}>
            <Typography
              variant="body1"
              sx={{ mb: 2 }}>
              We've sent a verification code to <strong>{email}</strong>. Please
              enter the code below.
            </Typography>

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

            <TextField
              margin="dense"
              label="Verification Code"
              type="text"
              fullWidth
              value={otp}
              onChange={(e) => setOtp(e.target.value.replace(/[^0-9]/g, ""))}
              variant="outlined"
              placeholder="Enter 6-digit code"
              inputProps={{
                maxLength: 6,
                inputMode: "numeric",
                pattern: "[0-9]*",
              }}
              InputProps={{
                sx: { letterSpacing: "0.5em", fontWeight: "bold" },
              }}
              sx={{ mb: 2 }}
            />

            <Button
              variant="text"
              disabled={resendCooldown > 0}
              onClick={handleRequestOtp}
              sx={{ mb: 1 }}>
              {resendCooldown > 0
                ? `Resend code in ${resendCooldown}s`
                : "Resend verification code"}
            </Button>
          </Box>
        )}

        {step === "reset" && (
          <Box sx={{ mt: 2 }}>
            <Typography
              variant="body1"
              sx={{ mb: 2 }}>
              Please enter your new password.
            </Typography>
            <TextField
              margin="dense"
              label="New Password"
              type="password"
              fullWidth
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              variant="outlined"
              helperText="Must be at least 8 characters with uppercase, lowercase, number, and special character"
              sx={{ mb: 2 }}
            />
            <TextField
              margin="dense"
              label="Confirm New Password"
              type="password"
              fullWidth
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              variant="outlined"
            />

            <Alert
              severity="info"
              sx={{ mt: 2 }}>
              After changing your password, you will be logged out from all
              devices for security reasons.
            </Alert>
          </Box>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        {step === "request" && (
          <Button
            onClick={handleRequestOtp}
            variant="contained"
            disabled={!email || isRequestingOtp}>
            {isRequestingOtp ? "Sending..." : "Send Code"}
          </Button>
        )}
        {step === "verify" && (
          <Button
            onClick={handleVerifyOtp}
            variant="contained"
            disabled={!otp || otp.length !== 6 || timeRemaining === 0}>
            Verify
          </Button>
        )}
        {step === "reset" && (
          <Button
            onClick={handleResetPassword}
            variant="contained"
            disabled={
              !newPassword ||
              !confirmPassword ||
              newPassword !== confirmPassword
            }>
            Update Password
          </Button>
        )}
      </DialogActions>
    </Dialog>
  );
};

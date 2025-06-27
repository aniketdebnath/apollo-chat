import {
  Button,
  Typography,
  Box,
  Paper,
  Container,
  alpha,
  useTheme,
  CircularProgress,
  Skeleton,
} from "@mui/material";
import { useGetMe } from "../../hooks/useGetMe";
import { ArrowBack, UploadFile } from "@mui/icons-material";
import { snackVar } from "../../constants/snack";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { getRelativeApiUrl } from "../../utils/api-url";
import { useUpdateUser } from "../../hooks/useUpdateUser";
import { onLogout } from "../../utils/logout";
import { ProfileAvatar } from "./ProfileAvatar";
import { UserInfoCard } from "./UserInfoCard";
import { UsernameDialog } from "./UsernameDialog";
import { PasswordDialog } from "./PasswordDialog";

export const Profile = () => {
  const { data, loading } = useGetMe();
  const navigate = useNavigate();
  const theme = useTheme();
  const { updateUser, loading: updateLoading } = useUpdateUser();

  // Username update states
  const [usernameDialogOpen, setUsernameDialogOpen] = useState(false);

  // Password update states
  const [passwordDialogOpen, setPasswordDialogOpen] = useState(false);
  const [email, setEmail] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [timeRemaining, setTimeRemaining] = useState(15 * 60); // 15 minutes in seconds
  const [timerActive, setTimerActive] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(0);

  // Set email when data is loaded
  useEffect(() => {
    if (data?.me?.email) {
      setEmail(data.me.email);
    }
  }, [data?.me?.email]);

  const handleUsernameUpdate = async (newUsername: string) => {
    try {
      await updateUser({
        variables: {
          updateUserInput: {
            username: newUsername,
          },
        },
      });
      setUsernameDialogOpen(false);
    } catch (error) {
      throw error;
    }
  };

  const handleRequestOtp = async () => {
    try {
      setPasswordError("");

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
        throw new Error(data.message || "Failed to send verification code");
      }

      setTimeRemaining(15 * 60); // 15 minutes
      setTimerActive(true);
      setResendCooldown(60); // 1 minute cooldown

      // Start countdown timer for OTP expiration
      const timerInterval = setInterval(() => {
        setTimeRemaining((prev) => {
          if (prev <= 1) {
            clearInterval(timerInterval);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);

      // Start cooldown timer for resend button
      const cooldownInterval = setInterval(() => {
        setResendCooldown((prev) => {
          if (prev <= 1) {
            clearInterval(cooldownInterval);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);

      snackVar({
        message: "Verification code sent to your email",
        type: "success",
      });
    } catch (error) {
      throw error;
    }
  };

  const handleVerifyOtp = async (otp: string) => {
    try {
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
        throw new Error(data.message || "Invalid or expired verification code");
      }
    } catch (error) {
      throw error;
    }
  };

  const handleResetPassword = async (
    newPassword: string,
    confirmPassword: string
  ) => {
    try {
      // First, reset password via REST API
      const response = await fetch(getRelativeApiUrl("/auth/reset-password"), {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: email,
          newPassword: newPassword,
        }),
        credentials: "include",
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || "Failed to reset password");
      }

      const data = await response.json();

      snackVar({
        message: "Password updated successfully. Please log in again.",
        type: "success",
      });

      setPasswordDialogOpen(false);
      setTimerActive(false);

      // Log out user after password change (for security)
      setTimeout(() => {
        onLogout();
        navigate("/login");
      }, 1500);
    } catch (error) {
      throw error;
    }
  };

  return (
    <Container maxWidth="md">
      <Box
        sx={{
          py: 4,
          px: 2,
          minHeight: "calc(100vh - 70px)",
        }}>
        <Button
          startIcon={<ArrowBack />}
          onClick={() => navigate(-1)}
          sx={{
            mb: 4,
            textTransform: "none",
            fontWeight: 500,
          }}>
          Back
        </Button>

        <Paper
          elevation={0}
          sx={{
            p: { xs: 3, md: 5 },
            borderRadius: 3,
            backgroundColor: alpha(theme.palette.background.paper, 0.8),
            border: "1px solid",
            borderColor: "divider",
            position: "relative",
            overflow: "hidden",
          }}>
          {/* Background decorative gradient */}
          <Box
            sx={{
              position: "absolute",
              top: 0,
              right: 0,
              width: "50%",
              height: "30%",
              background: `radial-gradient(circle at top right, ${alpha(
                theme.palette.primary.main,
                0.2
              )}, transparent 70%)`,
              zIndex: 0,
            }}
          />

          <Box sx={{ position: "relative", zIndex: 1 }}>
            <Typography
              variant="h4"
              fontWeight={700}
              sx={{ mb: 4, textAlign: "center" }}>
              Profile
            </Typography>

            {loading ? (
              <Box
                sx={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  gap: 3,
                }}>
                <Skeleton
                  variant="circular"
                  width={180}
                  height={180}
                />
                <Skeleton
                  variant="text"
                  width={200}
                  height={40}
                />
                <Skeleton
                  variant="text"
                  width={240}
                  height={24}
                />
                <Skeleton
                  variant="rectangular"
                  width={200}
                  height={40}
                  sx={{ borderRadius: 2 }}
                />
              </Box>
            ) : (
              <Box
                sx={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                }}>
                {/* Profile Avatar */}
                <ProfileAvatar
                  imageUrl={data?.me?.imageUrl}
                  username={data?.me?.username}
                />

                {/* User Info */}
                <Typography
                  variant="h4"
                  fontWeight={600}
                  sx={{ mb: 1 }}>
                  {data?.me?.username}
                </Typography>

                <UserInfoCard
                  username={data?.me?.username || ""}
                  email={data?.me?.email || ""}
                  onEditUsername={() => setUsernameDialogOpen(true)}
                  onChangePassword={() => setPasswordDialogOpen(true)}
                />
              </Box>
            )}
          </Box>
        </Paper>
      </Box>

      {/* Username Update Dialog */}
      <UsernameDialog
        open={usernameDialogOpen}
        onClose={() => setUsernameDialogOpen(false)}
        onUpdate={handleUsernameUpdate}
        currentUsername={data?.me?.username || ""}
        loading={updateLoading}
      />

      {/* Password Change Dialog */}
      <PasswordDialog
        open={passwordDialogOpen}
        onClose={() => setPasswordDialogOpen(false)}
        email={email}
        onRequestOtp={handleRequestOtp}
        onVerifyOtp={handleVerifyOtp}
        onResetPassword={handleResetPassword}
        timeRemaining={timeRemaining}
        resendCooldown={resendCooldown}
      />
    </Container>
  );
};

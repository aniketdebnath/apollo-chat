import {
  Avatar,
  Button,
  Typography,
  Box,
  Paper,
  Container,
  alpha,
  useTheme,
  Card,
  CardContent,
  CircularProgress,
  Skeleton,
  Tooltip,
} from "@mui/material";
import { useGetMe } from "../../hooks/useGetMe";
import { UploadFile, Email, Person, ArrowBack } from "@mui/icons-material";
import { API_URL } from "../../constants/urls";
import { snackVar } from "../../constants/snack";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { stringToColor, getAvatarProps } from "../../utils/avatar";

export const Profile = () => {
  const { data, loading } = useGetMe();
  const [uploading, setUploading] = useState(false);
  const navigate = useNavigate();
  const theme = useTheme();

  const handleFileUpload = async (event: any) => {
    try {
      if (!event.target.files || !event.target.files[0]) return;

      setUploading(true);
      const file = event.target.files[0];

      // Validate file type
      if (!file.type.match("image.*")) {
        snackVar({ message: "Please select an image file", type: "error" });
        setUploading(false);
        return;
      }

      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        snackVar({ message: "Image must be less than 5MB", type: "error" });
        setUploading(false);
        return;
      }

      const formData = new FormData();
      formData.append("file", file);

      const res = await fetch(`${API_URL}/users/image`, {
        method: "POST",
        body: formData,
      });

      if (!res.ok) {
        throw new Error("Image Upload Failed.");
      }

      snackVar({
        message: "Profile picture updated successfully",
        type: "success",
      });

      // Refresh data to show the new image
      setTimeout(() => {
        window.location.reload();
      }, 1000);
    } catch (error) {
      snackVar({
        message: "Error uploading image. Please try again.",
        type: "error",
      });
    } finally {
      setUploading(false);
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
                <Box sx={{ position: "relative", mb: 3 }}>
                  {data?.me?.imageUrl ? (
                    <Avatar
                      src={data.me.imageUrl}
                      sx={{
                        width: 180,
                        height: 180,
                        border: "4px solid",
                        borderColor: alpha(theme.palette.primary.main, 0.3),
                      }}
                    />
                  ) : (
                    <Avatar
                      sx={{
                        width: 180,
                        height: 180,
                        bgcolor: stringToColor(data?.me?.username || "User"),
                        fontSize: "4rem",
                        border: "4px solid",
                        borderColor: alpha(theme.palette.primary.main, 0.3),
                      }}>
                      {data?.me?.username?.substring(0, 1).toUpperCase()}
                    </Avatar>
                  )}

                  <Tooltip title="Upload profile picture">
                    <Box
                      component="label"
                      sx={{
                        position: "absolute",
                        bottom: 0,
                        right: 0,
                        bgcolor: "background.paper",
                        width: 50,
                        height: 50,
                        borderRadius: "50%",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        cursor: "pointer",
                        boxShadow: theme.shadows[3],
                        border: "1px solid",
                        borderColor: "divider",
                        transition: "all 0.2s",
                        "&:hover": {
                          bgcolor: alpha(theme.palette.primary.main, 0.1),
                        },
                      }}>
                      {uploading ? (
                        <CircularProgress size={24} />
                      ) : (
                        <UploadFile color="primary" />
                      )}
                      <input
                        type="file"
                        accept="image/*"
                        hidden
                        onChange={handleFileUpload}
                        disabled={uploading}
                      />
                    </Box>
                  </Tooltip>
                </Box>

                {/* User Info */}
                <Typography
                  variant="h4"
                  fontWeight={600}
                  sx={{ mb: 1 }}>
                  {data?.me?.username}
                </Typography>

                <Card
                  elevation={0}
                  sx={{
                    maxWidth: 400,
                    width: "100%",
                    mt: 4,
                    bgcolor: alpha(theme.palette.background.default, 0.6),
                    borderRadius: 3,
                    border: "1px solid",
                    borderColor: "divider",
                  }}>
                  <CardContent>
                    <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
                      <Person
                        color="action"
                        sx={{ mr: 2 }}
                      />
                      <Box>
                        <Typography
                          variant="caption"
                          color="text.secondary">
                          Username
                        </Typography>
                        <Typography variant="body1">
                          {data?.me?.username}
                        </Typography>
                      </Box>
                    </Box>

                    <Box sx={{ display: "flex", alignItems: "center" }}>
                      <Email
                        color="action"
                        sx={{ mr: 2 }}
                      />
                      <Box>
                        <Typography
                          variant="caption"
                          color="text.secondary">
                          Email
                        </Typography>
                        <Typography variant="body1">
                          {data?.me?.email}
                        </Typography>
                      </Box>
                    </Box>
                  </CardContent>
                </Card>

                <Button
                  component="label"
                  variant="contained"
                  size="large"
                  disabled={uploading}
                  startIcon={
                    uploading ? <CircularProgress size={20} /> : <UploadFile />
                  }
                  sx={{
                    mt: 4,
                    textTransform: "none",
                    fontWeight: 600,
                    borderRadius: 2,
                    px: 3,
                  }}>
                  {uploading ? "Uploading..." : "Change Profile Picture"}
                  <input
                    type="file"
                    accept="image/*"
                    hidden
                    onChange={handleFileUpload}
                    disabled={uploading}
                  />
                </Button>
              </Box>
            )}
          </Box>
        </Paper>
      </Box>
    </Container>
  );
};

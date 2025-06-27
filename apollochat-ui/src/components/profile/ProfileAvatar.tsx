import {
  Avatar,
  Box,
  CircularProgress,
  Tooltip,
  alpha,
  useTheme,
} from "@mui/material";
import { UploadFile } from "@mui/icons-material";
import { useState } from "react";
import { stringToColor } from "../../utils/avatar";
import { getRelativeApiUrl } from "../../utils/api-url";
import { snackVar } from "../../constants/snack";

interface ProfileAvatarProps {
  imageUrl?: string | null;
  username?: string;
  size?: number;
}

export const ProfileAvatar = ({
  imageUrl,
  username,
  size = 180,
}: ProfileAvatarProps) => {
  const [uploading, setUploading] = useState(false);
  const theme = useTheme();

  const handleFileUpload = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
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

      const res = await fetch(getRelativeApiUrl("/users/image"), {
        method: "POST",
        body: formData,
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.message || "Image Upload Failed.");
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
        message: `Error uploading image: ${
          error instanceof Error ? error.message : "Please try again"
        }`,
        type: "error",
      });
    } finally {
      setUploading(false);
    }
  };

  return (
    <Box sx={{ position: "relative", mb: 3 }}>
      {imageUrl ? (
        <Avatar
          src={imageUrl}
          sx={{
            width: size,
            height: size,
            border: "4px solid",
            borderColor: alpha(theme.palette.primary.main, 0.3),
          }}
        />
      ) : (
        <Avatar
          sx={{
            width: size,
            height: size,
            bgcolor: stringToColor(username || "User"),
            fontSize: `${size / 45}rem`,
            border: "4px solid",
            borderColor: alpha(theme.palette.primary.main, 0.3),
          }}>
          {username?.substring(0, 1).toUpperCase()}
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
  );
};

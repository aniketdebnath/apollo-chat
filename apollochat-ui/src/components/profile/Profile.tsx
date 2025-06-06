import { Avatar, Button, Stack, Typography } from "@mui/material";
import { useGetMe } from "../../hooks/useGetMe";
import { UploadFile } from "@mui/icons-material";
import { API_URL } from "../../constants/urls";
import { snackVar } from "../../constants/snack";
export const Profile = () => {
  const user = useGetMe();
  const handleFileUpload = async (event: any) => {
    try {
      const formData = new FormData();
      formData.append("file", event.target.files[0]);
      const res = await fetch(`${API_URL}/users/image`, {
        method: "POST",
        body: formData,
      });
      if (!res) {
        throw new Error("Image Upload Failed.");
      }
      snackVar({ message: "Image uploaded sucessfully.", type: "success" });
    } catch (error) {
      snackVar({ message: "Error uploading file.", type: "error" });
    }
  };
  return (
    <Stack
      spacing={6}
      sx={{
        marginTop: "2.5rem",
        alignItems: "center",
        justifyContent: "center",
      }}>
      <Typography variant="h1">{user?.data?.me?.username}</Typography>
      <Avatar
        sx={{ width: 256, height: 256 }}
        src={user.data?.me.imageUrl}
      />
      <Button
        component="label"
        variant="contained"
        size="large"
        startIcon={<UploadFile />}>
        Upload Image
        <input
          type="file"
          hidden
          onChange={handleFileUpload}
        />
      </Button>
    </Stack>
  );
};

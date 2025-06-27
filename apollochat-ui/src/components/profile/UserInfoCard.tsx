import {
  Box,
  Card,
  CardContent,
  IconButton,
  Tooltip,
  Typography,
  alpha,
  useTheme,
  Divider,
} from "@mui/material";
import { Email, Person, Lock, Edit } from "@mui/icons-material";

interface UserInfoCardProps {
  username: string;
  email: string;
  onEditUsername: () => void;
  onChangePassword: () => void;
}

export const UserInfoCard = ({
  username,
  email,
  onEditUsername,
  onChangePassword,
}: UserInfoCardProps) => {
  const theme = useTheme();

  return (
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
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            mb: 2,
            justifyContent: "space-between",
          }}>
          <Box sx={{ display: "flex", alignItems: "center" }}>
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
              <Typography variant="body1">{username}</Typography>
            </Box>
          </Box>
          <Tooltip title="Edit username">
            <IconButton
              onClick={onEditUsername}
              size="small">
              <Edit fontSize="small" />
            </IconButton>
          </Tooltip>
        </Box>

        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}>
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
              <Typography variant="body1">{email}</Typography>
            </Box>
          </Box>
        </Box>

        <Divider sx={{ my: 2 }} />

        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}>
          <Box sx={{ display: "flex", alignItems: "center" }}>
            <Lock
              color="action"
              sx={{ mr: 2 }}
            />
            <Box>
              <Typography
                variant="caption"
                color="text.secondary">
                Password
              </Typography>
              <Typography variant="body1">••••••••</Typography>
            </Box>
          </Box>
          <Tooltip title="Change password">
            <IconButton
              onClick={onChangePassword}
              size="small">
              <Edit fontSize="small" />
            </IconButton>
          </Tooltip>
        </Box>
      </CardContent>
    </Card>
  );
};

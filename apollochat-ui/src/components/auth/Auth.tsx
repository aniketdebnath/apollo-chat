import {
  Button,
  Stack,
  TextField,
  Typography,
  Paper,
  Box,
  InputAdornment,
  IconButton,
  alpha,
  useTheme,
  CircularProgress,
} from "@mui/material";
import { useEffect, useState } from "react";
import { useGetMe } from "../../hooks/useGetMe";
import { useNavigate } from "react-router-dom";
import VisibilityIcon from "@mui/icons-material/Visibility";
import VisibilityOffIcon from "@mui/icons-material/VisibilityOff";
import EmailIcon from "@mui/icons-material/Email";

interface AuthProps {
  submitLabel: string;
  onSubmit: (credentials: { email: string; password: string }) => Promise<void>;
  children: React.ReactNode;
  extraFields?: React.ReactNode[];
  error?: string;
}

const Auth = ({
  submitLabel,
  onSubmit,
  children,
  error,
  extraFields,
}: AuthProps) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { data } = useGetMe();
  const navigate = useNavigate();
  const theme = useTheme();

  useEffect(() => {
    if (data) {
      navigate("/");
    }
  }, [data, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email.trim() || !password.trim()) return;

    setIsSubmitting(true);
    try {
      await onSubmit({ email, password });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Box
      sx={{
        height: "100vh",
        width: "100%",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        position: "fixed",
        top: 0,
        left: 0,
        overflow: "hidden",
        backgroundImage:
          "radial-gradient(circle at 30% 30%, rgba(108, 99, 255, 0.2) 0%, transparent 70%), radial-gradient(circle at 70% 70%, rgba(255, 101, 132, 0.2) 0%, transparent 70%)",
        zIndex: 1000,
      }}>
      <Paper
        elevation={4}
        sx={{
          maxWidth: 420,
          width: "100%",
          p: { xs: 3, sm: 4 },
          borderRadius: 3,
          backgroundColor: alpha(theme.palette.background.paper, 0.8),
          backdropFilter: "blur(10px)",
          border: "1px solid",
          borderColor: "divider",
        }}>
        <Stack
          spacing={4}
          component="form"
          onSubmit={handleSubmit}>
          <Box sx={{ textAlign: "center", mb: 2 }}>
            <Typography
              variant="h4"
              fontWeight={700}
              sx={{
                backgroundImage: "linear-gradient(90deg, #6C63FF, #FF6584)",
                backgroundClip: "text",
                color: "transparent",
                mb: 1,
              }}>
              Apollo Chat
            </Typography>
            <Typography
              variant="subtitle1"
              color="text.secondary">
              {submitLabel === "Login"
                ? "Sign in to your account"
                : "Create a new account"}
            </Typography>
          </Box>

          <TextField
            type="email"
            label="Email"
            variant="outlined"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            error={!!error}
            required
            fullWidth
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <EmailIcon color="action" />
                </InputAdornment>
              ),
            }}
            sx={{
              "& .MuiOutlinedInput-root": {
                borderRadius: 2,
              },
            }}
          />

          {extraFields}

          <TextField
            type={showPassword ? "text" : "password"}
            label="Password"
            variant="outlined"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            error={!!error}
            helperText={error}
            required
            fullWidth
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
            sx={{
              "& .MuiOutlinedInput-root": {
                borderRadius: 2,
              },
            }}
          />

          <Button
            type="submit"
            variant="contained"
            disabled={isSubmitting}
            fullWidth
            sx={{
              py: 1.5,
              borderRadius: 2,
              textTransform: "none",
              fontSize: "1rem",
              fontWeight: 600,
            }}>
            {isSubmitting ? (
              <CircularProgress
                size={24}
                color="inherit"
              />
            ) : (
              submitLabel
            )}
          </Button>

          <Box sx={{ textAlign: "center" }}>{children}</Box>
        </Stack>
      </Paper>
    </Box>
  );
};

export default Auth;

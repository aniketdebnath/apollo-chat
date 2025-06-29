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
  Divider,
  useMediaQuery,
} from "@mui/material";
import { useEffect, useState, useRef } from "react";
import { useGetMe } from "../../hooks/useGetMe";
import { useNavigate } from "react-router-dom";
import VisibilityIcon from "@mui/icons-material/Visibility";
import VisibilityOffIcon from "@mui/icons-material/VisibilityOff";
import EmailIcon from "@mui/icons-material/Email";
import { motion, Variants, AnimatePresence } from "framer-motion";

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
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));
  const authCardRef = useRef<HTMLDivElement>(null);

  // Animation variants
  const containerVariants: Variants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        when: "beforeChildren",
        staggerChildren: 0.3,
        delayChildren: 0.3,
      },
    },
  };

  const itemVariants: Variants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        type: "spring",
        stiffness: 100,
        damping: 12,
      },
    },
  };

  const logoVariants: Variants = {
    hidden: { scale: 0.8, opacity: 0 },
    visible: {
      scale: 1,
      opacity: 1,
      transition: {
        duration: 0.8,
      },
    },
  };

  // Text animation for the tagline
  const [taglineIndex, setTaglineIndex] = useState(0);
  const taglines = [
    "Connect. Communicate. Collaborate.",
    "Seamless. Synchronous. Secure.",
    "Modern Messaging for Teams.",
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setTaglineIndex((prevIndex) => (prevIndex + 1) % taglines.length);
    }, 4000);

    return () => clearInterval(interval);
  }, []);

  // Auto-scroll to the auth card on mobile
  useEffect(() => {
    if (isMobile && authCardRef.current) {
      // Short delay to ensure rendering is complete
      const timer = setTimeout(() => {
        if (authCardRef.current) {
          authCardRef.current.scrollIntoView({
            behavior: "smooth",
            block: "center",
          });
        }
      }, 500);

      return () => clearTimeout(timer);
    }
  }, [isMobile]);

  useEffect(() => {
    if (data) {
      navigate("/");
    }
  }, [data, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!submitLabel || !email.trim() || !password.trim()) return;

    setIsSubmitting(true);
    try {
      await onSubmit({ email, password });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Determine if we should show the form fields
  const showFormFields = submitLabel !== "";

  return (
    <Box
      sx={{
        minHeight: "100vh",
        width: "100%",
        display: "flex",
        flexDirection: { xs: "column", md: "row" },
        position: "absolute", // Changed from fixed to absolute
        top: 0,
        left: 0,
        overflow: "auto", // Allow scrolling
        backgroundImage:
          "radial-gradient(circle at 30% 30%, rgba(108, 99, 255, 0.2) 0%, transparent 70%), radial-gradient(circle at 70% 70%, rgba(255, 101, 132, 0.2) 0%, transparent 70%)",
        zIndex: 1000,
      }}>
      {/* Mobile Logo Section (only shown on mobile) */}
      {isMobile && (
        <Box
          sx={{
            width: "100%",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            py: 6,
            px: 3,
          }}>
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8 }}
            style={{ width: "100%", maxWidth: "250px" }}>
            <Box
              sx={{
                width: "180px",
                height: "180px",
                mb: 2,
                position: "relative",
                mx: "auto",
              }}>
              <img
                src="/logo512.png"
                alt="Apollo Chat Logo"
                style={{
                  width: "100%",
                  height: "100%",
                  objectFit: "contain",
                  filter: "drop-shadow(0 0 20px rgba(108, 99, 255, 0.3))",
                }}
              />
            </Box>

            {/* Apollo Chat Text Logo */}
            <Box sx={{ textAlign: "center", width: "100%" }}>
              <Typography
                variant="h1"
                sx={{
                  fontSize: "3rem",
                  fontWeight: 800,
                  backgroundImage: "linear-gradient(90deg, #6C63FF, #FF6584)",
                  backgroundClip: "text",
                  color: "transparent",
                  textAlign: "center",
                  lineHeight: 1.1,
                  letterSpacing: "-0.03em",
                  textTransform: "uppercase",
                  mb: 0,
                }}>
                Apollo
              </Typography>

              <Typography
                variant="h2"
                sx={{
                  fontSize: "1.8rem",
                  fontWeight: 600,
                  backgroundImage: "linear-gradient(90deg, #6C63FF, #FF6584)",
                  backgroundClip: "text",
                  color: "transparent",
                  textAlign: "center",
                  letterSpacing: "0.1em",
                  textTransform: "uppercase",
                }}>
                Chat
              </Typography>

              {/* Tagline */}
              <Typography
                variant="subtitle1"
                sx={{
                  mt: 2,
                  color: "rgba(255, 255, 255, 0.7)",
                  fontWeight: 300,
                  letterSpacing: "0.03em",
                  textAlign: "center",
                }}>
                {taglines[taglineIndex]}
              </Typography>
            </Box>
          </motion.div>
        </Box>
      )}

      {/* Left half - Apollo Logo (desktop only) */}
      <Box
        sx={{
          width: "50%",
          display: { xs: "none", md: "flex" },
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          px: 3,
        }}>
        {/* Apollo Logo from public folder */}
        <motion.div
          initial="hidden"
          animate="visible"
          variants={containerVariants}
          style={{ width: "100%", maxWidth: "400px" }}>
          <motion.div variants={logoVariants}>
            <Box
              sx={{
                width: "280px",
                height: "280px",
                mb: 3,
                position: "relative",
                mx: "auto",
              }}>
              <motion.img
                src="/logo512.png"
                alt="Apollo Chat Logo"
                style={{
                  width: "100%",
                  height: "100%",
                  objectFit: "contain",
                  filter: "drop-shadow(0 0 20px rgba(108, 99, 255, 0.3))",
                }}
                animate={{
                  filter: [
                    "drop-shadow(0 0 20px rgba(108, 99, 255, 0.3))",
                    "drop-shadow(0 0 25px rgba(255, 101, 132, 0.4))",
                    "drop-shadow(0 0 20px rgba(108, 99, 255, 0.3))",
                  ],
                }}
                transition={{
                  duration: 4,
                  repeat: Infinity,
                  repeatType: "reverse",
                }}
              />
            </Box>
          </motion.div>

          {/* Apollo Chat Text Logo - Modern Style */}
          <Box sx={{ textAlign: "center", width: "100%" }}>
            <motion.div variants={itemVariants}>
              <Typography
                variant="h1"
                sx={{
                  fontSize: { md: "4.2rem", lg: "5rem" },
                  fontWeight: 800,
                  backgroundImage: "linear-gradient(90deg, #6C63FF, #FF6584)",
                  backgroundClip: "text",
                  color: "transparent",
                  textAlign: "center",
                  lineHeight: 1.1,
                  letterSpacing: "-0.03em",
                  textTransform: "uppercase",
                  mb: 0,
                  px: 1,
                }}>
                Apollo
              </Typography>
            </motion.div>

            <motion.div variants={itemVariants}>
              <Typography
                variant="h2"
                sx={{
                  fontSize: { md: "2.5rem", lg: "3rem" },
                  fontWeight: 600,
                  backgroundImage: "linear-gradient(90deg, #6C63FF, #FF6584)",
                  backgroundClip: "text",
                  color: "transparent",
                  textAlign: "center",
                  letterSpacing: "0.1em",
                  textTransform: "uppercase",
                }}>
                Chat
              </Typography>
            </motion.div>

            {/* Fixed container for taglines to prevent layout shifts */}
            <Box
              sx={{
                mt: 3,
                height: "2rem",
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                width: "100%",
                position: "relative",
                overflow: "hidden",
              }}>
              <motion.div
                key={taglineIndex}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.5 }}
                style={{
                  position: "absolute",
                  width: "100%",
                  textAlign: "center",
                }}>
                <Typography
                  variant="subtitle1"
                  sx={{
                    color: "rgba(255, 255, 255, 0.7)",
                    fontWeight: 300,
                    letterSpacing: "0.03em",
                    fontSize: { md: "0.9rem", lg: "1rem" },
                    width: "100%",
                    textAlign: "center",
                    whiteSpace: "nowrap",
                    px: 2,
                  }}>
                  {taglines[taglineIndex]}
                </Typography>
              </motion.div>
            </Box>
          </Box>
        </motion.div>
      </Box>

      {/* Center divider with gradient fade effect */}
      <Box
        sx={{
          position: "absolute",
          top: "10%",
          bottom: "10%",
          left: "50%",
          width: "1px",
          transform: "translateX(-50%)",
          background:
            "linear-gradient(to bottom, transparent, rgba(255, 255, 255, 0.15) 20%, rgba(255, 255, 255, 0.15) 80%, transparent)",
          display: { xs: "none", md: "block" },
        }}
      />

      {/* Right half - contains the card */}
      <Box
        sx={{
          width: { xs: "100%", md: "50%" },
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          p: 2,
          minHeight: { xs: "auto", md: "100vh" },
          pb: { xs: 6, md: 2 },
        }}>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{
            type: "spring",
            stiffness: 100,
            damping: 15,
            delay: 0.4,
          }}
          style={{ width: "100%", maxWidth: 420 }}>
          <Paper
            elevation={4}
            className="auth-card"
            ref={authCardRef}
            sx={{
              width: "100%",
              p: { xs: 3, sm: 4 },
              borderRadius: 3,
              backgroundColor: "#121212",
              backdropFilter: "blur(10px)",
              border: "1px solid",
              borderColor: "rgba(255, 255, 255, 0.1)",
              color: "white",
              minHeight: "450px",
              display: "flex",
              flexDirection: "column",
              position: "relative",
              zIndex: 2,
            }}>
            <Stack
              spacing={4}
              component="form"
              onSubmit={handleSubmit}
              sx={{ flex: 1 }}>
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
                  color="rgba(255, 255, 255, 0.7)">
                  {showFormFields
                    ? submitLabel === "Login"
                      ? "Sign in to your account"
                      : "Create a new account"
                    : ""}
                </Typography>
              </Box>

              {showFormFields && (
                <>
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
                          <EmailIcon
                            sx={{ color: "rgba(255, 255, 255, 0.7)" }}
                          />
                        </InputAdornment>
                      ),
                    }}
                    sx={{
                      "& .MuiOutlinedInput-root": {
                        borderRadius: 2,
                        color: "white",
                        "& fieldset": {
                          borderColor: "rgba(255, 255, 255, 0.2)",
                        },
                        "&:hover fieldset": {
                          borderColor: "rgba(255, 255, 255, 0.3)",
                        },
                        "&.Mui-focused fieldset": {
                          borderColor: theme.palette.primary.main,
                        },
                      },
                      "& .MuiInputLabel-root": {
                        color: "rgba(255, 255, 255, 0.7)",
                      },
                      "& .MuiInputLabel-root.Mui-focused": {
                        color: theme.palette.primary.main,
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
                            edge="end"
                            sx={{ color: "rgba(255, 255, 255, 0.7)" }}>
                            {showPassword ? (
                              <VisibilityOffIcon />
                            ) : (
                              <VisibilityIcon />
                            )}
                          </IconButton>
                        </InputAdornment>
                      ),
                    }}
                    sx={{
                      "& .MuiOutlinedInput-root": {
                        borderRadius: 2,
                        color: "white",
                        "& fieldset": {
                          borderColor: "rgba(255, 255, 255, 0.2)",
                        },
                        "&:hover fieldset": {
                          borderColor: "rgba(255, 255, 255, 0.3)",
                        },
                        "&.Mui-focused fieldset": {
                          borderColor: theme.palette.primary.main,
                        },
                      },
                      "& .MuiInputLabel-root": {
                        color: "rgba(255, 255, 255, 0.7)",
                      },
                      "& .MuiInputLabel-root.Mui-focused": {
                        color: theme.palette.primary.main,
                      },
                      "& .MuiFormHelperText-root": {
                        color: theme.palette.error.light,
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
                      backgroundColor: "#6C63FF",
                      "&:hover": {
                        backgroundColor: "#5A52D5",
                      },
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
                </>
              )}

              <Box
                sx={{
                  textAlign: "center",
                  color: "white",
                  flex: submitLabel ? 0 : 1,
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: submitLabel ? "flex-start" : "center",
                }}>
                {children}
              </Box>
            </Stack>
          </Paper>
        </motion.div>
      </Box>
    </Box>
  );
};

export default Auth;

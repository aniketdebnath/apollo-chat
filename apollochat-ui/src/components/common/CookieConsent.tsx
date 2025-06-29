import React, { useState, useEffect, useRef } from "react";
import {
  Box,
  Button,
  Typography,
  Paper,
  Link,
  useTheme,
  alpha,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Switch,
  Divider,
  IconButton,
  Tooltip,
} from "@mui/material";
import { motion, AnimatePresence } from "framer-motion";
import CookieIcon from "@mui/icons-material/Cookie";
import CloseIcon from "@mui/icons-material/Close";
import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined";

interface CookiePreferences {
  necessary: boolean;
  analytics: boolean;
  marketing: boolean;
  preferences: boolean;
}

const CookieConsent: React.FC = () => {
  const [showConsent, setShowConsent] = useState(false);
  const [showCustomizeModal, setShowCustomizeModal] = useState(false);
  const theme = useTheme();
  const initializedRef = useRef(false);

  // Default cookie preferences
  const [cookiePreferences, setCookiePreferences] = useState<CookiePreferences>(
    {
      necessary: true, // Always required
      analytics: true,
      marketing: false,
      preferences: true,
    }
  );

  useEffect(() => {
    // Prevent this effect from running more than once
    if (initializedRef.current) return;
    initializedRef.current = true;

    // Check if user has already accepted cookies
    const hasAccepted = localStorage.getItem("cookieConsent") === "accepted";
    const savedPreferences = localStorage.getItem("cookiePreferences");

    // If preferences exist, load them
    if (savedPreferences) {
      try {
        setCookiePreferences((prevPreferences) => ({
          ...prevPreferences,
          ...JSON.parse(savedPreferences),
        }));
      } catch (e) {}
    }

    // Show the banner after a short delay if not accepted
    if (!hasAccepted) {
      const timer = setTimeout(() => {
        setShowConsent(true);
      }, 1000);

      return () => clearTimeout(timer);
    }
  }, []);

  const handleAccept = () => {
    // Accept all cookies
    const allAccepted = {
      necessary: true,
      analytics: true,
      marketing: true,
      preferences: true,
    };

    localStorage.setItem("cookieConsent", "accepted");
    localStorage.setItem("cookiePreferences", JSON.stringify(allAccepted));
    setCookiePreferences(allAccepted);
    setShowConsent(false);
  };

  const handleCustomize = () => {
    setShowCustomizeModal(true);
  };

  const handleCloseModal = () => {
    setShowCustomizeModal(false);
  };

  const handleSavePreferences = () => {
    localStorage.setItem("cookieConsent", "accepted");
    localStorage.setItem(
      "cookiePreferences",
      JSON.stringify(cookiePreferences)
    );
    setShowCustomizeModal(false);
    setShowConsent(false);
  };

  const handlePreferenceChange =
    (name: keyof CookiePreferences) =>
    (event: React.ChangeEvent<HTMLInputElement>) => {
      // Don't allow necessary cookies to be disabled
      if (name === "necessary") return;

      setCookiePreferences({
        ...cookiePreferences,
        [name]: event.target.checked,
      });
    };

  return (
    <>
      <AnimatePresence>
        {showConsent && (
          <motion.div
            initial={{ y: 80, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 80, opacity: 0 }}
            transition={{ type: "spring", stiffness: 120, damping: 20 }}
            style={{
              position: "fixed",
              bottom: 16,
              left: 16,
              right: 16,
              zIndex: 2000,
              display: "flex",
              justifyContent: "center",
            }}>
            <Paper
              elevation={3}
              sx={{
                p: { xs: 1.5, sm: 2 },
                maxWidth: { xs: "100%", sm: "800px" },
                width: "100%",
                borderRadius: 3,
                backgroundColor: alpha(theme.palette.background.paper, 0.95),
                backdropFilter: "blur(8px)",
                border: "1px solid",
                borderColor: alpha(theme.palette.divider, 0.1),
                display: "flex",
                flexDirection: "row",
                alignItems: "center",
                justifyContent: "space-between",
                gap: { xs: 1, sm: 2 },
              }}>
              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  gap: { xs: 1, sm: 1.5 },
                }}>
                <CookieIcon
                  color="primary"
                  sx={{
                    fontSize: { xs: 20, sm: 24 },
                    opacity: 0.9,
                  }}
                />
                <Box>
                  <Typography
                    variant="subtitle1"
                    fontWeight={600}
                    sx={{
                      mb: 0.2,
                      fontSize: { xs: "0.75rem", sm: "1rem" },
                    }}>
                    We use cookies
                  </Typography>
                  <Typography
                    variant="body2"
                    color="text.secondary"
                    sx={{
                      fontSize: { xs: "0.65rem", sm: "0.8rem" },
                      display: { xs: "none", sm: "block" },
                    }}>
                    To enhance your experience.{" "}
                    <Link
                      href="/privacy"
                      sx={{ ml: 0.2 }}>
                      Privacy Policy
                    </Link>
                  </Typography>
                  <Typography
                    variant="body2"
                    color="text.secondary"
                    sx={{
                      fontSize: "0.65rem",
                      display: { xs: "block", sm: "none" },
                    }}>
                    <Link href="/privacy">Privacy Policy</Link>
                  </Typography>
                </Box>
              </Box>
              <Box
                sx={{
                  display: "flex",
                  gap: { xs: 0.5, sm: 1 },
                  alignSelf: "center",
                  flexShrink: 0,
                }}>
                <Button
                  variant="text"
                  size="small"
                  onClick={handleCustomize}
                  sx={{
                    minWidth: { xs: "60px", sm: "80px" },
                    px: { xs: 0.5, sm: 2 },
                    borderRadius: 2,
                    textTransform: "none",
                    fontSize: { xs: "0.7rem", sm: "0.875rem" },
                  }}>
                  Customize
                </Button>
                <Button
                  variant="contained"
                  size="small"
                  onClick={handleAccept}
                  sx={{
                    minWidth: { xs: "60px", sm: "80px" },
                    px: { xs: 0.5, sm: 2 },
                    borderRadius: 2,
                    fontWeight: 500,
                    textTransform: "none",
                    boxShadow: "none",
                    fontSize: { xs: "0.7rem", sm: "0.875rem" },
                    "&:hover": {
                      boxShadow: "none",
                    },
                  }}>
                  Accept All
                </Button>
              </Box>
            </Paper>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Cookie Preferences Modal */}
      <Dialog
        open={showCustomizeModal}
        onClose={handleCloseModal}
        maxWidth="xs"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: 3,
            backgroundColor: theme.palette.background.paper,
            overflow: "hidden",
          },
        }}>
        <DialogTitle
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            p: 2,
          }}>
          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            <CookieIcon
              color="primary"
              sx={{ fontSize: 20 }}
            />
            <Typography
              variant="subtitle1"
              fontWeight={600}>
              Cookie Preferences
            </Typography>
          </Box>
          <IconButton
            onClick={handleCloseModal}
            size="small"
            sx={{ color: "text.secondary" }}>
            <CloseIcon fontSize="small" />
          </IconButton>
        </DialogTitle>

        <Divider />

        <DialogContent sx={{ p: 2 }}>
          <Typography
            variant="body2"
            color="text.secondary"
            sx={{ mb: 2, fontSize: "0.85rem" }}>
            We use cookies to enhance your browsing experience and analyze our
            traffic.
          </Typography>

          {/* Necessary Cookies */}
          <Box sx={{ mb: 1.5, py: 0.5 }}>
            <Box
              sx={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
              }}>
              <Box sx={{ display: "flex", alignItems: "center" }}>
                <Typography
                  variant="body1"
                  fontWeight={600}
                  sx={{ fontSize: "0.9rem" }}>
                  Necessary
                </Typography>
                <Tooltip title="Required for the website to function">
                  <InfoOutlinedIcon
                    sx={{ ml: 0.5, fontSize: 14, color: "text.secondary" }}
                  />
                </Tooltip>
              </Box>
              <Switch
                checked={cookiePreferences.necessary}
                disabled={true}
                size="small"
              />
            </Box>
          </Box>

          {/* Analytics Cookies */}
          <Box sx={{ mb: 1.5, py: 0.5 }}>
            <Box
              sx={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
              }}>
              <Box sx={{ display: "flex", alignItems: "center" }}>
                <Typography
                  variant="body1"
                  fontWeight={600}
                  sx={{ fontSize: "0.9rem" }}>
                  Analytics
                </Typography>
                <Tooltip title="Help us understand how visitors interact with our website">
                  <InfoOutlinedIcon
                    sx={{ ml: 0.5, fontSize: 14, color: "text.secondary" }}
                  />
                </Tooltip>
              </Box>
              <Switch
                checked={cookiePreferences.analytics}
                onChange={handlePreferenceChange("analytics")}
                size="small"
              />
            </Box>
          </Box>

          {/* Marketing Cookies */}
          <Box sx={{ mb: 1.5, py: 0.5 }}>
            <Box
              sx={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
              }}>
              <Box sx={{ display: "flex", alignItems: "center" }}>
                <Typography
                  variant="body1"
                  fontWeight={600}
                  sx={{ fontSize: "0.9rem" }}>
                  Marketing
                </Typography>
                <Tooltip title="Used to display relevant advertisements">
                  <InfoOutlinedIcon
                    sx={{ ml: 0.5, fontSize: 14, color: "text.secondary" }}
                  />
                </Tooltip>
              </Box>
              <Switch
                checked={cookiePreferences.marketing}
                onChange={handlePreferenceChange("marketing")}
                size="small"
              />
            </Box>
          </Box>

          {/* Preference Cookies */}
          <Box sx={{ mb: 0.5, py: 0.5 }}>
            <Box
              sx={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
              }}>
              <Box sx={{ display: "flex", alignItems: "center" }}>
                <Typography
                  variant="body1"
                  fontWeight={600}
                  sx={{ fontSize: "0.9rem" }}>
                  Preferences
                </Typography>
                <Tooltip title="Remember your settings and preferences">
                  <InfoOutlinedIcon
                    sx={{ ml: 0.5, fontSize: 14, color: "text.secondary" }}
                  />
                </Tooltip>
              </Box>
              <Switch
                checked={cookiePreferences.preferences}
                onChange={handlePreferenceChange("preferences")}
                size="small"
              />
            </Box>
          </Box>
        </DialogContent>

        <Divider />

        <DialogActions sx={{ p: 2, justifyContent: "flex-end" }}>
          <Button
            variant="text"
            onClick={handleCloseModal}
            sx={{
              borderRadius: 2,
              textTransform: "none",
              fontWeight: 500,
              minWidth: "70px",
            }}>
            Cancel
          </Button>
          <Button
            variant="contained"
            onClick={handleSavePreferences}
            sx={{
              borderRadius: 2,
              fontWeight: 500,
              textTransform: "none",
              boxShadow: "none",
              minWidth: "70px",
              "&:hover": {
                boxShadow: "none",
              },
            }}>
            Save
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default CookieConsent;

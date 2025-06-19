import React, { useState, useEffect } from "react";
import {
  Box,
  Button,
  Typography,
  Paper,
  Link,
  useTheme,
  alpha,
  useMediaQuery,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormGroup,
  FormControlLabel,
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
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

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
    // Check if user has already accepted cookies
    const hasAccepted = localStorage.getItem("cookieConsent") === "accepted";
    const savedPreferences = localStorage.getItem("cookiePreferences");

    // If preferences exist, load them
    if (savedPreferences) {
      try {
        setCookiePreferences({
          ...cookiePreferences,
          ...JSON.parse(savedPreferences),
        });
      } catch (e) {
        console.error("Error parsing saved cookie preferences");
      }
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
            initial={{ y: 100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 100, opacity: 0 }}
            transition={{ type: "spring", stiffness: 100, damping: 15 }}
            style={{
              position: "fixed",
              bottom: 0,
              left: 0,
              right: 0,
              zIndex: 2000,
              padding: "16px",
            }}>
            <Paper
              elevation={6}
              sx={{
                p: { xs: 2, sm: 3 },
                mx: "auto",
                maxWidth: "1200px",
                borderRadius: 2,
                backgroundColor: alpha(theme.palette.background.paper, 0.9),
                backdropFilter: "blur(10px)",
                border: "1px solid",
                borderColor: "divider",
                display: "flex",
                flexDirection: isMobile ? "column" : "row",
                alignItems: isMobile ? "flex-start" : "center",
                justifyContent: "space-between",
                gap: 2,
              }}>
              <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                <CookieIcon
                  color="primary"
                  sx={{
                    fontSize: { xs: 32, sm: 40 },
                    opacity: 0.8,
                  }}
                />
                <Box>
                  <Typography
                    variant="h6"
                    fontWeight={600}
                    sx={{ mb: 0.5 }}>
                    We use cookies
                  </Typography>
                  <Typography
                    variant="body2"
                    color="text.secondary">
                    Apollo Chat uses cookies to enhance your experience and
                    analyze our traffic. By clicking "Accept", you consent to
                    our use of cookies.
                    <Link
                      href="/privacy"
                      sx={{ ml: 0.5 }}>
                      Privacy Policy
                    </Link>
                  </Typography>
                </Box>
              </Box>
              <Box
                sx={{
                  display: "flex",
                  gap: 1,
                  mt: isMobile ? 1 : 0,
                  alignSelf: isMobile ? "flex-end" : "center",
                }}>
                <Button
                  variant="outlined"
                  size="small"
                  onClick={handleCustomize}
                  sx={{
                    minWidth: "100px",
                    borderRadius: 1.5,
                  }}>
                  Customize
                </Button>
                <Button
                  variant="contained"
                  onClick={handleAccept}
                  sx={{
                    minWidth: "100px",
                    borderRadius: 1.5,
                    fontWeight: 600,
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
        maxWidth="sm"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: 2,
            backgroundColor: theme.palette.background.paper,
          },
        }}>
        <DialogTitle
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            pb: 1,
          }}>
          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            <CookieIcon color="primary" />
            <Typography variant="h6">Cookie Preferences</Typography>
          </Box>
          <IconButton
            onClick={handleCloseModal}
            size="small">
            <CloseIcon />
          </IconButton>
        </DialogTitle>

        <DialogContent sx={{ pt: 1 }}>
          <Typography
            variant="body2"
            color="text.secondary"
            sx={{ mb: 2 }}>
            We use cookies to enhance your browsing experience, serve
            personalized ads or content, and analyze our traffic. By clicking
            "Save Preferences", you consent to our use of cookies.
          </Typography>

          <Divider sx={{ my: 2 }} />

          {/* Necessary Cookies */}
          <Box sx={{ mb: 2 }}>
            <Box
              sx={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                mb: 1,
              }}>
              <Typography
                variant="subtitle1"
                fontWeight={600}>
                Necessary Cookies
              </Typography>
              <FormControlLabel
                control={
                  <Switch
                    checked={cookiePreferences.necessary}
                    disabled={true}
                  />
                }
                label="Required"
                labelPlacement="start"
                sx={{
                  mx: 0,
                  "& .MuiFormControlLabel-label": {
                    visibility: "hidden",
                    width: 0,
                  },
                }}
              />
            </Box>
            <Typography
              variant="body2"
              color="text.secondary">
              These cookies are required for the website to function and cannot
              be disabled.
            </Typography>
          </Box>

          {/* Analytics Cookies */}
          <Box sx={{ mb: 2 }}>
            <Box
              sx={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                mb: 1,
              }}>
              <Box sx={{ display: "flex", alignItems: "center" }}>
                <Typography
                  variant="subtitle1"
                  fontWeight={600}>
                  Analytics Cookies
                </Typography>
                <Tooltip title="These cookies help us understand how visitors interact with our website">
                  <InfoOutlinedIcon
                    sx={{ ml: 1, fontSize: 16, color: "text.secondary" }}
                  />
                </Tooltip>
              </Box>
              <FormControlLabel
                control={
                  <Switch
                    checked={cookiePreferences.analytics}
                    onChange={handlePreferenceChange("analytics")}
                  />
                }
                label="Analytics"
                labelPlacement="start"
                sx={{
                  mx: 0,
                  "& .MuiFormControlLabel-label": {
                    visibility: "hidden",
                    width: 0,
                  },
                }}
              />
            </Box>
            <Typography
              variant="body2"
              color="text.secondary">
              Help us improve our website by collecting anonymous information.
            </Typography>
          </Box>

          {/* Marketing Cookies */}
          <Box sx={{ mb: 2 }}>
            <Box
              sx={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                mb: 1,
              }}>
              <Box sx={{ display: "flex", alignItems: "center" }}>
                <Typography
                  variant="subtitle1"
                  fontWeight={600}>
                  Marketing Cookies
                </Typography>
                <Tooltip title="These cookies are used to track visitors across websites to display relevant advertisements">
                  <InfoOutlinedIcon
                    sx={{ ml: 1, fontSize: 16, color: "text.secondary" }}
                  />
                </Tooltip>
              </Box>
              <FormControlLabel
                control={
                  <Switch
                    checked={cookiePreferences.marketing}
                    onChange={handlePreferenceChange("marketing")}
                  />
                }
                label="Marketing"
                labelPlacement="start"
                sx={{
                  mx: 0,
                  "& .MuiFormControlLabel-label": {
                    visibility: "hidden",
                    width: 0,
                  },
                }}
              />
            </Box>
            <Typography
              variant="body2"
              color="text.secondary">
              Used to deliver advertisements more relevant to you and your
              interests.
            </Typography>
          </Box>

          {/* Preference Cookies */}
          <Box sx={{ mb: 2 }}>
            <Box
              sx={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                mb: 1,
              }}>
              <Box sx={{ display: "flex", alignItems: "center" }}>
                <Typography
                  variant="subtitle1"
                  fontWeight={600}>
                  Preference Cookies
                </Typography>
                <Tooltip title="These cookies remember your settings and preferences">
                  <InfoOutlinedIcon
                    sx={{ ml: 1, fontSize: 16, color: "text.secondary" }}
                  />
                </Tooltip>
              </Box>
              <FormControlLabel
                control={
                  <Switch
                    checked={cookiePreferences.preferences}
                    onChange={handlePreferenceChange("preferences")}
                  />
                }
                label="Preferences"
                labelPlacement="start"
                sx={{
                  mx: 0,
                  "& .MuiFormControlLabel-label": {
                    visibility: "hidden",
                    width: 0,
                  },
                }}
              />
            </Box>
            <Typography
              variant="body2"
              color="text.secondary">
              Allow the website to remember choices you make (such as your user
              name, language, or region).
            </Typography>
          </Box>
        </DialogContent>

        <DialogActions sx={{ px: 3, pb: 3, pt: 1 }}>
          <Button
            variant="outlined"
            onClick={handleCloseModal}
            sx={{ borderRadius: 1.5 }}>
            Cancel
          </Button>
          <Button
            variant="contained"
            onClick={handleSavePreferences}
            sx={{ borderRadius: 1.5, fontWeight: 600 }}>
            Save Preferences
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default CookieConsent;

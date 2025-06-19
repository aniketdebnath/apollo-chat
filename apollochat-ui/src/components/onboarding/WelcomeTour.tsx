import React, { useState, useEffect } from "react";
import {
  Box,
  Typography,
  Button,
  Paper,
  useTheme,
  alpha,
  IconButton,
  Fade,
  Stepper,
  Step,
  StepLabel,
  StepContent,
  Avatar,
} from "@mui/material";
import { motion } from "framer-motion";
import CloseIcon from "@mui/icons-material/Close";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import HomeIcon from "@mui/icons-material/Home";
import ChatIcon from "@mui/icons-material/Chat";
import PushPinIcon from "@mui/icons-material/PushPin";
import PersonIcon from "@mui/icons-material/Person";
import ExploreIcon from "@mui/icons-material/Explore";
import router from "../../components/Routes";

// Define the tour steps
interface TourStep {
  title: string;
  description: string;
  icon: React.ReactNode;
}

const tourSteps: TourStep[] = [
  {
    title: "Welcome to Apollo Chat",
    description:
      "Let's take a quick tour of the key features to help you get started.",
    icon: <ChatIcon fontSize="large" />,
  },
  {
    title: "Home",
    description:
      "The Home page shows your recent chats and quick access to all features. It's your starting point for everything in Apollo Chat.",
    icon: <HomeIcon fontSize="large" />,
  },
  {
    title: "Start a Chat",
    description:
      "Click the + button in the top-right corner of your chat list to start a new conversation. You can create private chats with specific people or public chats anyone can join.",
    icon: <ChatIcon fontSize="large" />,
  },
  {
    title: "Pin Important Chats",
    description:
      "Keep your important conversations at the top of your list by pinning them. Just click the pin icon in any chat header to pin or unpin it.",
    icon: <PushPinIcon fontSize="large" />,
  },
  {
    title: "Explore Public Chats",
    description:
      "Discover and join public conversations by visiting the Explore page. It's a great way to meet new people and join interesting discussions.",
    icon: <ExploreIcon fontSize="large" />,
  },
  {
    title: "Update Your Status",
    description:
      "Let others know if you're available by setting your status. Click your profile picture in the top-right corner to change between Online, Away, Do Not Disturb, and Offline.",
    icon: <PersonIcon fontSize="large" />,
  },
];

const WelcomeTour: React.FC = () => {
  const [activeStep, setActiveStep] = useState(0);
  const [showTour, setShowTour] = useState(false);
  const theme = useTheme();

  useEffect(() => {
    // Check if this is the user's first visit
    const hasSeenTour = localStorage.getItem("welcomeTourComplete") === "true";

    // Show tour after a short delay to ensure all elements are loaded
    if (!hasSeenTour) {
      const timer = setTimeout(() => {
        setShowTour(true);
      }, 1500);

      return () => clearTimeout(timer);
    }
  }, []);

  const handleNext = () => {
    setActiveStep((prevActiveStep) => prevActiveStep + 1);
  };

  const handleBack = () => {
    setActiveStep((prevActiveStep) => prevActiveStep - 1);
  };

  const handleFinish = () => {
    // Mark tour as completed
    localStorage.setItem("welcomeTourComplete", "true");
    setShowTour(false);
  };

  const handleSkip = () => {
    // Mark tour as completed even if skipped
    localStorage.setItem("welcomeTourComplete", "true");
    setShowTour(false);
  };

  if (!showTour) return null;

  return (
    <Fade in={showTour}>
      <Box
        sx={{
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          zIndex: 2000,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: "rgba(0, 0, 0, 0.5)",
          backdropFilter: "blur(4px)",
        }}>
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.3 }}
          style={{ width: "90%", maxWidth: "550px" }}>
          <Paper
            elevation={6}
            sx={{
              p: 4,
              borderRadius: 3,
              backgroundColor: alpha(theme.palette.background.paper, 0.95),
              border: "1px solid",
              borderColor: "divider",
              maxHeight: "80vh",
              overflow: "auto",
            }}>
            <Box
              sx={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                mb: 3,
              }}>
              <Typography
                variant="h5"
                fontWeight={700}
                sx={{
                  backgroundImage: "linear-gradient(90deg, #6C63FF, #FF6584)",
                  backgroundClip: "text",
                  color: "transparent",
                }}>
                Apollo Chat Tour
              </Typography>
              <IconButton
                size="small"
                onClick={handleSkip}
                sx={{ color: "text.secondary" }}>
                <CloseIcon fontSize="small" />
              </IconButton>
            </Box>

            <Stepper
              activeStep={activeStep}
              orientation="vertical">
              {tourSteps.map((step, index) => (
                <Step key={step.title}>
                  <StepLabel
                    StepIconComponent={() => (
                      <Avatar
                        sx={{
                          bgcolor:
                            index === activeStep
                              ? "primary.main"
                              : alpha(theme.palette.primary.main, 0.2),
                          color:
                            index === activeStep ? "white" : "primary.main",
                          width: 32,
                          height: 32,
                        }}>
                        {index + 1}
                      </Avatar>
                    )}>
                    <Typography
                      variant="subtitle1"
                      fontWeight={600}>
                      {step.title}
                    </Typography>
                  </StepLabel>
                  <StepContent>
                    <Box
                      sx={{
                        display: "flex",
                        alignItems: "center",
                        mb: 2,
                        mt: 1,
                      }}>
                      <Box
                        sx={{
                          mr: 2,
                          color: "primary.main",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          p: 1,
                          borderRadius: 2,
                          bgcolor: alpha(theme.palette.primary.main, 0.1),
                        }}>
                        {step.icon}
                      </Box>
                      <Typography
                        variant="body1"
                        color="text.secondary">
                        {step.description}
                      </Typography>
                    </Box>
                    <Box sx={{ mb: 2, display: "flex", gap: 1 }}>
                      <Button
                        disabled={index === 0}
                        onClick={handleBack}
                        startIcon={<ArrowBackIcon />}
                        size="small"
                        sx={{ mr: 1 }}>
                        Back
                      </Button>
                      {index === tourSteps.length - 1 ? (
                        <Button
                          variant="contained"
                          onClick={handleFinish}
                          endIcon={<CheckCircleIcon />}
                          size="small">
                          Finish
                        </Button>
                      ) : (
                        <Button
                          variant="contained"
                          onClick={handleNext}
                          endIcon={<ArrowForwardIcon />}
                          size="small">
                          Next
                        </Button>
                      )}
                    </Box>
                  </StepContent>
                </Step>
              ))}
            </Stepper>

            <Box sx={{ textAlign: "right" }}>
              <Button
                variant="text"
                onClick={handleSkip}
                size="small"
                sx={{ color: "text.secondary" }}>
                Skip Tour
              </Button>
            </Box>
          </Paper>
        </motion.div>
      </Box>
    </Fade>
  );
};

export default WelcomeTour;

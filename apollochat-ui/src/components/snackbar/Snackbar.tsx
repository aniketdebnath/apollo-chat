import {
  Snackbar as MUISnackbar,
  useTheme,
  Box,
  Typography,
  IconButton,
} from "@mui/material";
import MuiAlert, { AlertProps } from "@mui/material/Alert";
import { forwardRef } from "react";
import { useReactiveVar } from "@apollo/client";
import { snackVar } from "../../constants/snack";
import CloseIcon from "@mui/icons-material/Close";
import CheckCircleOutlineIcon from "@mui/icons-material/CheckCircleOutline";
import ErrorOutlineIcon from "@mui/icons-material/ErrorOutline";
import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined";
import WarningAmberOutlinedIcon from "@mui/icons-material/WarningAmberOutlined";

const CustomAlert = forwardRef<
  HTMLDivElement,
  AlertProps & { message: string; isDemoMessage?: boolean }
>(function Alert({ severity, message, onClose, isDemoMessage, ...props }, ref) {
  const theme = useTheme();

  const getIcon = () => {
    switch (severity) {
      case "success":
        return <CheckCircleOutlineIcon />;
      case "error":
        return <ErrorOutlineIcon />;
      case "warning":
        return <WarningAmberOutlinedIcon />;
      case "info":
      default:
        return <InfoOutlinedIcon />;
    }
  };

  const getBgColor = () => {
    switch (severity) {
      case "success":
        return theme.palette.success.main;
      case "error":
        return theme.palette.error.main;
      case "warning":
        return isDemoMessage
          ? "#FFAF20" // Custom yellow for demo mode
          : theme.palette.warning.main;
      case "info":
      default:
        return theme.palette.info.main;
    }
  };

  return (
    <Box
      ref={ref}
      sx={{
        display: "flex",
        alignItems: "center",
        gap: 1.5,
        backgroundColor: isDemoMessage
          ? "rgba(255, 175, 32, 0.1)"
          : "background.paper",
        boxShadow: theme.shadows[6],
        borderRadius: 2,
        padding: "12px 16px",
        minWidth: 300,
        borderLeft: "4px solid",
        borderColor: getBgColor(),
        ...(isDemoMessage && {
          width: "100%",
          maxWidth: "600px",
          margin: "0 auto",
          transition: "all 0.3s ease",
          animation: "pulse 2s infinite",
          "@keyframes pulse": {
            "0%": { boxShadow: `0 0 0 0 ${theme.palette.warning.light}40` },
            "70%": { boxShadow: `0 0 0 10px ${theme.palette.warning.light}00` },
            "100%": { boxShadow: `0 0 0 0 ${theme.palette.warning.light}00` },
          },
        }),
      }}
      {...props}>
      <Box
        sx={{
          color: getBgColor(),
          display: "flex",
        }}>
        {getIcon()}
      </Box>
      <Typography
        variant="body2"
        sx={{
          flex: 1,
          fontWeight: isDemoMessage ? 600 : 400,
        }}>
        {message}
      </Typography>
      {!isDemoMessage && (
        <IconButton
          size="small"
          onClick={onClose as any}
          sx={{ ml: 1 }}>
          <CloseIcon fontSize="small" />
        </IconButton>
      )}
    </Box>
  );
});

const Snackbar = () => {
  const snack = useReactiveVar(snackVar);
  const isDemoMessage = snack?.message?.includes("Demo Mode");

  const handleClose = (
    _event?: React.SyntheticEvent | Event,
    reason?: string
  ) => {
    if (reason === "clickaway" || isDemoMessage) {
      return;
    }

    snackVar(undefined);
  };

  return (
    <>
      {snack && (
        <MUISnackbar
          open={!!snack}
          autoHideDuration={isDemoMessage ? null : 6000}
          onClose={handleClose}
          anchorOrigin={{
            vertical: isDemoMessage ? "bottom" : "bottom",
            horizontal: isDemoMessage ? "center" : "right",
          }}
          sx={{
            "& .MuiSnackbarContent-root": {
              p: 0,
              bgcolor: "transparent",
              boxShadow: "none",
            },
            ...(isDemoMessage && {
              bottom: "20px !important",
              left: "50% !important",
              transform: "translateX(-50%) !important",
              right: "auto !important",
            }),
          }}>
          <CustomAlert
            onClose={handleClose}
            severity={snack.type}
            message={snack.message}
            isDemoMessage={isDemoMessage}
          />
        </MUISnackbar>
      )}
    </>
  );
};

export default Snackbar;

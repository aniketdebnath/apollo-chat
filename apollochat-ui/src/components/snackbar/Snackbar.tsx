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
  AlertProps & { message: string }
>(function Alert({ severity, message, onClose, ...props }, ref) {
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
        return theme.palette.warning.main;
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
        backgroundColor: "background.paper",
        boxShadow: theme.shadows[6],
        borderRadius: 2,
        padding: "12px 16px",
        minWidth: 300,
        borderLeft: "4px solid",
        borderColor: getBgColor(),
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
        sx={{ flex: 1 }}>
        {message}
      </Typography>
      <IconButton
        size="small"
        onClick={onClose as any}
        sx={{ ml: 1 }}>
        <CloseIcon fontSize="small" />
      </IconButton>
    </Box>
  );
});

const Snackbar = () => {
  const snack = useReactiveVar(snackVar);

  const handleClose = (
    _event?: React.SyntheticEvent | Event,
    reason?: string
  ) => {
    if (reason === "clickaway") {
      return;
    }

    snackVar(undefined);
  };

  return (
    <>
      {snack && (
        <MUISnackbar
          open={!!snack}
          autoHideDuration={6000}
          onClose={handleClose}
          anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
          sx={{
            "& .MuiSnackbarContent-root": {
              p: 0,
              bgcolor: "transparent",
              boxShadow: "none",
            },
          }}>
          <CustomAlert
            onClose={handleClose}
            severity={snack.type}
            message={snack.message}
          />
        </MUISnackbar>
      )}
    </>
  );
};

export default Snackbar;

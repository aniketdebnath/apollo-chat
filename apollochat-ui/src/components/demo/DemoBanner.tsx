import { Box, Button, Paper, Typography, alpha, useTheme } from "@mui/material";
import { ArrowBackOutlined } from "@mui/icons-material";
import { useNavigate } from "react-router-dom";

const DemoBanner = () => {
  const theme = useTheme();
  const navigate = useNavigate();

  return (
    <Paper
      elevation={0}
      sx={{
        py: 1.5,
        px: 2,
        borderRadius: 2,
        border: "1px solid",
        borderColor: "warning.main",
        backgroundColor: alpha(theme.palette.warning.main, 0.08),
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
      }}>
      <Box>
        <Typography
          variant="subtitle2"
          fontWeight={600}
          color="warning.main">
          Demo Mode
        </Typography>
        <Typography
          variant="body2"
          color="text.secondary"
          sx={{ fontSize: "0.8rem" }}>
          This is a demonstration with mock data. No actual backend calls are
          made.
        </Typography>
      </Box>
      <Button
        variant="outlined"
        color="warning"
        size="small"
        startIcon={<ArrowBackOutlined fontSize="small" />}
        onClick={() => navigate("/login")}
        sx={{
          borderRadius: 1.5,
          textTransform: "none",
          fontWeight: 500,
          ml: 2,
          whiteSpace: "nowrap",
          py: 0.5,
        }}>
        Exit Demo
      </Button>
    </Paper>
  );
};

export default DemoBanner;

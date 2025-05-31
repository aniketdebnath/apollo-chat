import { Typography } from "@mui/material";
import QuickreplyOutlinedIcon from "@mui/icons-material/QuickreplyOutlined";
import router from "../../Routes";
const MobileLogo = () => {
  return (
    <>
      <QuickreplyOutlinedIcon
        sx={{ display: { xs: "flex", md: "none" }, mr: 1 }}
      />
      <Typography
        variant="h5"
        noWrap
        component="a"
        onClick={() => router.navigate("/")}
        sx={{
          mr: 2,
          display: { xs: "flex", md: "none" },
          flexGrow: 1,
          fontFamily: "monospace",
          fontWeight: 700,
          letterSpacing: ".3rem",
          color: "inherit",
          textDecoration: "none",
        }}>
        APOLLO CHAT
      </Typography>
    </>
  );
};
export default MobileLogo;

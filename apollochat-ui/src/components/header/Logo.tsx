import { Typography } from "@mui/material";
import QuickreplyOutlinedIcon from "@mui/icons-material/QuickreplyOutlined";
import router from "../Routes";

const Logo = () => {
  return (
    <>
      <QuickreplyOutlinedIcon
        sx={{ display: { xs: "none", md: "flex" }, mr: 1 }}
      />
      <Typography
        variant="h6"
        noWrap
        component="a"
        onClick={() => router.navigate("/")}
        sx={{
          mr: 2,
          display: { xs: "none", md: "flex" },
          fontFamily: "monospace",
          cursor: "pointer",
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
export default Logo;

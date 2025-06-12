import { Box, Button, alpha, useTheme } from "@mui/material";
import { Pages } from "../../interfaces/pages.interface";
import router from "../Routes";

interface NavigationProps {
  pages: Pages[];
}

const Navigation = ({ pages }: NavigationProps) => {
  const theme = useTheme();

  return (
    <Box
      sx={{
        display: { xs: "none", md: "flex" },
        ml: 4,
      }}>
      {pages.map((page) => (
        <Button
          key={page.title}
          onClick={() => router.navigate(page.path)}
          sx={{
            mx: 1,
            color: "white",
            position: "relative",
            overflow: "hidden",
            "&::after": {
              content: '""',
              position: "absolute",
              bottom: 0,
              left: 0,
              width: "100%",
              height: "2px",
              backgroundColor: theme.palette.primary.main,
              transform: "scaleX(0)",
              transformOrigin: "bottom right",
              transition: "transform 0.3s ease-out",
            },
            "&:hover": {
              backgroundColor: "transparent",
              "&::after": {
                transform: "scaleX(1)",
                transformOrigin: "bottom left",
              },
            },
          }}>
          {page.title}
        </Button>
      ))}
    </Box>
  );
};

export default Navigation;

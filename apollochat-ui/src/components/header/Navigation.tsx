import { Box, Button } from "@mui/material";
import { Pages } from "../../interfaces/pages.interface";
import router from "../Routes";
interface NavigationProps {
  pages: Pages[];
}

const Navigation = ({ pages }: NavigationProps) => {
  return (
    <Box sx={{ flexGrow: 1, display: { xs: "none", md: "flex" } }}>
      {pages.map((page) => (
        <Button
          key={page.title}
          onClick={() => router.navigate(page.path)}
          sx={{ my: 2, color: "white", display: "block" }}>
          {page.title}
        </Button>
      ))}
    </Box>
  );
};
export default Navigation;

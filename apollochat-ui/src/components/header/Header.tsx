import AppBar from "@mui/material/AppBar";
import Toolbar from "@mui/material/Toolbar";
import Container from "@mui/material/Container";
import Logo from "./Logo";
import MobileNavigation from "./mobile/MobileNavigation";
import MobileLogo from "./mobile/MobileLogo";
import Navigation from "./Navigation";
import UserSettings from "./UserSettings";
import { useReactiveVar } from "@apollo/client";
import { authenticatedVar } from "../../constants/authenticated";
import { Pages } from "../../interfaces/pages.interface";

const pages: Pages[] = [
  {
    title: "Home",
    path: "/",
  },
];

const unauthenticatedPages: Pages[] = [
  {
    title: "Login",
    path: "/login",
  },
  {
    title: "Signup",
    path: "/signup",
  },
];

const Header = () => {
  const authenticated = useReactiveVar(authenticatedVar);
  return (
    <AppBar position="static">
      <Container maxWidth="xl">
        <Toolbar disableGutters>
          <Logo />
          <MobileNavigation
            pages={authenticated ? pages : unauthenticatedPages}
          />
          <MobileLogo />
          <Navigation pages={authenticated ? pages : unauthenticatedPages} />
          {authenticated && <UserSettings />}
        </Toolbar>
      </Container>
    </AppBar>
  );
};
export default Header;

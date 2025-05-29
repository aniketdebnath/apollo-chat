import AppBar from "@mui/material/AppBar";

import Toolbar from "@mui/material/Toolbar";

import Container from "@mui/material/Container";

import Logo from "./Logo";
import MobileNavigation from "./MobileNavigation";
import MobileLogo from "./MobileLogo";
import Navigation from "./Navigation";
import UserSettings from "./UserSettings";

const pages = ["Products", "Pricing", "Blog"];
const settings = ["Profile", "Account", "Dashboard", "Logout"];

const Header = () => {
  return (
    <AppBar position="static">
      <Container maxWidth="xl">
        <Toolbar disableGutters>
          <Logo />
          <MobileNavigation pages={pages} />
          <MobileLogo />
          <Navigation pages={pages} />
          <UserSettings settings={settings} />
        </Toolbar>
      </Container>
    </AppBar>
  );
};
export default Header;

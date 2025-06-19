import {
  Box,
  Container,
  CssBaseline,
  Grid,
  ThemeProvider,
} from "@mui/material";
//import Auth from "./components/auth/Auth";
import { RouterProvider } from "react-router-dom";
import router from "./components/Routes";
import { ApolloProvider } from "@apollo/client";
import client from "./constants/apollo-client";
import Guard from "./components/auth/Guard";
import Header from "./components/header/Header";
import Snackbar from "./components/snackbar/Snackbar";
import { ChatList } from "./components/chat-list/ChatList";
import { usePath } from "./hooks/usePath";
import darkTheme from "./theme/theme";
import CookieConsent from "./components/common/CookieConsent";
import WelcomeTour from "./components/onboarding/WelcomeTour";
import "@fontsource/poppins/300.css";
import "@fontsource/poppins/400.css";
import "@fontsource/poppins/500.css";
import "@fontsource/poppins/600.css";
import "@fontsource/poppins/700.css";

const App = () => {
  const { path } = usePath();
  const showChatList = path === "/" || path.includes("chats");
  const isAuthPage = path.includes("login") || path.includes("signup");

  return (
    <ApolloProvider client={client}>
      <ThemeProvider theme={darkTheme}>
        <CssBaseline />
        <Box
          sx={{
            display: "flex",
            flexDirection: "column",
            minHeight: "100vh",
            bgcolor: "background.default",
          }}>
          {!isAuthPage && <Header />}
          <Guard>
            <Box
              component="main"
              sx={{
                flex: 1,
                display: "flex",
                overflow: "hidden",
                pt: isAuthPage ? 0 : 2,
                pb: isAuthPage ? 0 : 1,
              }}>
              <Container
                maxWidth="xl"
                sx={{
                  display: "flex",
                  flexDirection: "column",
                  height: "100%",
                  p: isAuthPage ? 0 : undefined,
                }}>
                {showChatList && !isAuthPage ? (
                  <Grid
                    container
                    spacing={3}
                    sx={{ height: "100%" }}>
                    <Grid
                      item
                      xs={12}
                      md={4}
                      lg={3}
                      xl={3}
                      sx={{
                        display: { xs: "none", md: "block" },
                        height: { md: "calc(100vh - 100px)" },
                      }}>
                      <ChatList />
                    </Grid>
                    <Grid
                      item
                      xs={12}
                      md={8}
                      lg={9}
                      xl={9}
                      sx={{
                        height: {
                          xs: "calc(100vh - 100px)",
                          md: "calc(100vh - 100px)",
                        },
                      }}>
                      <Routes />
                    </Grid>
                  </Grid>
                ) : (
                  <Routes />
                )}
              </Container>
            </Box>
          </Guard>
          <Snackbar />
          <CookieConsent />
          {!isAuthPage && <WelcomeTour />}
        </Box>
      </ThemeProvider>
    </ApolloProvider>
  );
};

const Routes = () => {
  return <RouterProvider router={router} />;
};
export default App;

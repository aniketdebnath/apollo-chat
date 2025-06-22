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
import ErrorBoundary from "./components/common/ErrorBoundary";
import "@fontsource/poppins/300.css";
import "@fontsource/poppins/400.css";
import "@fontsource/poppins/500.css";
import "@fontsource/poppins/600.css";
import "@fontsource/poppins/700.css";

const App = () => {
  const { path } = usePath();
  const isAuthPage = ["/login", "/signup", "/demo"].includes(path);

  // Pages where ChatList should not be shown
  const excludedFromChatList = [
    "/explore",
    "/notifications",
    "/favorites",
    "/404",
  ];

  // Only show ChatList on main pages (home and chat pages)
  const showChatList =
    !isAuthPage &&
    !excludedFromChatList.some((excludedPath) => path.includes(excludedPath));

  return (
    <ApolloProvider client={client}>
      <ThemeProvider theme={darkTheme}>
        <ErrorBoundary>
          <Box
            sx={{
              display: "flex",
              flexDirection: "column",
              minHeight: "100vh",
              bgcolor: "background.default",
              color: "text.primary",
            }}>
            <CssBaseline />
            <Guard>
              <Box sx={{ flex: 1, display: "flex", flexDirection: "column" }}>
                {!isAuthPage && <Header />}
                <Container
                  maxWidth="xl"
                  sx={{
                    flex: 1,
                    display: "flex",
                    flexDirection: "column",
                    py: 3,
                  }}>
                  {showChatList ? (
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
        </ErrorBoundary>
      </ThemeProvider>
    </ApolloProvider>
  );
};

const Routes = () => {
  return <RouterProvider router={router} />;
};

export default App;

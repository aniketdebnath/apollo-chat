import { Box, Container, Grid } from "@mui/material";
import DemoBanner from "./DemoBanner";
import DemoChatList from "./DemoChatList";
import DemoChatArea from "./DemoChatArea";
import { useEffect } from "react";

/**
 * Demo component that provides a no-login preview of the application.
 *
 * This component serves as a demonstration of the Apollo Chat application
 * without requiring authentication. It shows a realistic UI with mock data
 * and disabled interactive elements.
 */
const Demo = () => {
  // Disable body scrolling when the demo component mounts
  useEffect(() => {
    // Save the original overflow style
    const originalStyle = window.getComputedStyle(document.body).overflow;
    // Apply the fixed style
    document.body.style.overflow = "hidden";

    // Restore the original style on unmount
    return () => {
      document.body.style.overflow = originalStyle;
    };
  }, []);

  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        height: "100vh",
        bgcolor: "background.default",
        overflow: "hidden",
      }}>
      {/* Demo Mode Banner */}
      <Container
        maxWidth="xl"
        sx={{ mb: 2, mt: 2 }}>
        <DemoBanner />
      </Container>

      {/* Main Content Grid */}
      <Box
        component="main"
        sx={{
          flex: 1,
          display: "flex",
          overflow: "hidden",
          pb: 3,
        }}>
        <Container
          maxWidth="xl"
          sx={{
            display: "flex",
            flexDirection: "column",
            height: "calc(100% - 20px)",
          }}>
          <Grid
            container
            spacing={3}
            sx={{ height: "100%" }}>
            {/* Chat List */}
            <Grid
              item
              xs={12}
              md={4}
              lg={3}
              xl={3}
              sx={{
                display: { xs: "none", md: "block" },
                height: { md: "calc(100% - 20px)" },
              }}>
              <DemoChatList />
            </Grid>

            {/* Chat Content */}
            <Grid
              item
              xs={12}
              md={8}
              lg={9}
              xl={9}
              sx={{
                height: "calc(100% - 20px)",
              }}>
              <DemoChatArea />
            </Grid>
          </Grid>
        </Container>
      </Box>
    </Box>
  );
};

export default Demo;

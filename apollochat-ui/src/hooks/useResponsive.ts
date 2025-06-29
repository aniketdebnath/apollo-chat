import { useMediaQuery, useTheme } from "@mui/material";

export const useResponsive = () => {
  const theme = useTheme();

  // Check if screen matches different breakpoints
  const isXs = useMediaQuery(theme.breakpoints.down("sm")); // < 600px
  const isSm = useMediaQuery(theme.breakpoints.down("md")); // < 900px
  const isMd = useMediaQuery(theme.breakpoints.down("lg")); // < 1200px
  const isLg = useMediaQuery(theme.breakpoints.down("xl")); // < 1536px

  /**
   * Get a value based on current screen size
   */
  const getValue = <T>(options: {
    xs?: T;
    sm?: T;
    md?: T;
    lg?: T;
    default: T;
  }): T => {
    if (isXs && options.xs !== undefined) return options.xs;
    if (isSm && options.sm !== undefined) return options.sm;
    if (isMd && options.md !== undefined) return options.md;
    if (isLg && options.lg !== undefined) return options.lg;
    return options.default;
  };

  return {
    isXs,
    isSm,
    isMd,
    isLg,
    getValue,
  };
};

/**
 * Screen size breakpoint constants for responsive design
 * These can be used with useMediaQuery throughout the application
 */

export const SCREEN_SIZES = {
  xs: "(max-width: 600px)",
  sm: "(max-width: 900px)",
  md: "(max-width: 1200px)",
  lg: "(max-width: 1536px)",
};

/**
 * Helper function to get responsive values based on screen size
 * @param options Object containing values for different screen sizes
 * @returns The appropriate value based on the current screen size
 *
 * Example usage:
 * const fontSize = getResponsiveValue({ xs: 12, sm: 14, md: 16, default: 18 });
 */
export const getResponsiveValue = <T>(options: {
  xs?: T;
  sm?: T;
  md?: T;
  lg?: T;
  default: T;
}): T => {
  // This is a placeholder - actual implementation would use useMediaQuery
  // This function should be used with React hooks in components
  return options.default;
};

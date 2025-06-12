/**
 * Utility functions for working with avatars
 */

/**
 * Generates a consistent color based on a string (like username)
 * @param string - The input string to derive color from
 * @returns A hex color code
 */
export const stringToColor = (string: string): string => {
  if (!string) return "#6C63FF"; // Default to primary color

  let hash = 0;
  for (let i = 0; i < string.length; i++) {
    hash = string.charCodeAt(i) + ((hash << 5) - hash);
  }

  const colors = [
    "#6C63FF", // primary
    "#FF6584", // secondary
    "#00B8A9", // success
    "#0084FF", // info
    "#FFAF20", // warning
    "#7D56F4", // purple
    "#FF9A7B", // coral
    "#41C1BA", // teal
    "#4EA5F6", // blue
    "#FFCD52", // yellow
  ];

  const index = Math.abs(hash) % colors.length;
  return colors[index];
};

/**
 * Creates avatar props based on a name
 * @param name - The user name to derive avatar from
 * @returns Object with sx and children props for Avatar component
 */
export const getAvatarProps = (name: string) => {
  return {
    sx: {
      bgcolor: stringToColor(name),
    },
    children: `${name.split(" ")[0][0]}${
      name.split(" ").length > 1 ? name.split(" ")[1][0] : ""
    }`.toUpperCase(),
  };
};

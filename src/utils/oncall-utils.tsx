/**
 * Converts a string to a hex color code
 *
 * @param str String to convert
 * @returns Inputted string as hex color code
 */
export const stringToColor = (str: string): string => {
  let hash = 0;
  for (const char of str.split("")) {
    hash = char.charCodeAt(0) + ((hash << 5) - hash);
  }
  let color = "#";
  for (let i = 0; i < 3; i++) {
    const value = (hash >> (i * 8)) & 0xff;
    color += value.toString(16).padStart(2, "0");
  }
  return color;
};

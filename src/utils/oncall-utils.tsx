/**
 * Generate RGB from combination of name/week/random number
 */

export const stringToColor = (str?: string, week?: number, seed?: number): string => {
  if (!str) return "#cccccc";

  const actualSeed = seed ?? Math.floor(Math.random() * 50) + 1;

  const combined = week !== undefined ? `${str}-${week}-${actualSeed}` : `${str}-${actualSeed}`;

  let hash = 0;
  for (let i = 0; i < combined.length; i++) {
    hash = combined.charCodeAt(i) + ((hash << 5) - hash);
    hash = hash & hash; // Convert to 32-bit integer
  }

  // Generate RGB values in a visible range (50-200)
  const r = 50 + (((hash >> 0) & 0xff) % 150);
  const g = 50 + (((hash >> 8) & 0xff) % 150);
  const b = 50 + (((hash >> 16) & 0xff) % 150);

  return `rgb(${r}, ${g}, ${b})`;
};

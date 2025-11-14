/**
 * Generate deterministic, visually distinct color from string
 * Uses HSL for better color separation
 */
export const stringToColor = (str?: string, week?: number, seed?: number): string => {
  if (!str) return "#cccccc";

  const actualSeed = seed || 1;
  const combined = week !== undefined ? `${str}-${week}-${actualSeed}` : `${str}-${actualSeed}`;

  let hash = 0;
  for (let i = 0; i < combined.length; i++) {
    hash = combined.charCodeAt(i) + ((hash << 5) - hash);
    hash = hash & hash; // 32-bit integer
  }

  const hue = Math.abs(hash) % 360;
  const saturation = 65; // % saturation
  const lightness = 55; // % lightness

  return `hsl(${hue}, ${saturation}%, ${lightness}%)`;
};

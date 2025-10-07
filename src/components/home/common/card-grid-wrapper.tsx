import Masonry from "@mui/lab/Masonry";
import { Box } from "@mui/material";
import type { ReactNode } from "react";

/**
 * Wrapper component for consistent card layout using Masonry
 *
 * @param props - component props
 * @returns ReactNode
 */
interface CardGridWrapperProps {
  children: ReactNode[];
}
/**
 * CardGridWrapper component
 *
 * A reusable layout wrapper that arranges card components
 * in a responsive masonry grid. It ensures consistent spacing
 * and alignment across different screens (e.g., home, admin).
 *
 * @param children - Array of card components to render in the masonry layout
 * @returns JSX element containing the wrapped cards
 */
const CardGridWrapper = ({ children }: CardGridWrapperProps) => {
  return (
    <Box sx={{ marginRight: "-16px" }}>
      <Masonry columns={{ xs: 1, sm: 2 }} spacing={2}>
        {children}
      </Masonry>
    </Box>
  );
};

export default CardGridWrapper;

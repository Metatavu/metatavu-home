import { Box } from "@mui/material";
import Masonry from "@mui/lab/Masonry";
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

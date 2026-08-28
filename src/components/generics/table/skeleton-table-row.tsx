import { Skeleton } from "@mui/material";
import type { GridColDef } from "@mui/x-data-grid";

/**
 * Component properties
 */
interface Props {
  idx: number;
  column: GridColDef;
}

/**
 * Skeleton table row component
 *
 * @param props component properties
 */
const SkeletonTableRow = ({ idx, column }: Props) => {
  const marginRight = 20;
  return (
    <Skeleton
      variant={"text"}
      key={`skeleton-text-${idx}`}
      sx={{
        height: "20px",
        width: `${column.width ? column.width - marginRight : column.width}px`,
        marginRight: `${marginRight}px`
      }}
    />
  );
};

export default SkeletonTableRow;

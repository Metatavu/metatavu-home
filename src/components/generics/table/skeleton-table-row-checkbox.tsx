import { Skeleton } from "@mui/material";

/**
 * Component properties
 */
interface Props {
  idx: number;
}

/**
 * Skeleton table row checkbox component
 *
 * @param props component properties
 */
const SkeletonTableRowCheckbox = ({ idx }: Props) => (
  <Skeleton
    variant={"rounded"}
    key={`skeleton-row-checkbox${idx}`}
    sx={{
      height: "20px",
      width: "20px",
      margin: "15px 25px 15px 14px"
    }}
  />
);

export default SkeletonTableRowCheckbox;

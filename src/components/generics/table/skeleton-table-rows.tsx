import { Box, Grid } from "@mui/material";
import type { GridColDef } from "@mui/x-data-grid";
import SkeletonTableItem from "./skeleton-table-row";
import SkeletonTableRowCheckbox from "./skeleton-table-row-checkbox";

/**
 * Component props
 */
interface Props {
  dataGridHeight: number;
  dataGridRowHeight: number;
  dataGridColumnHeaderHeight: number;
  columns: GridColDef[];
}

/**
 * Skeleton table rows component
 *
 * @param props component properties
 */
const SkeletonTableRows = ({
  dataGridHeight,
  dataGridRowHeight,
  dataGridColumnHeaderHeight,
  columns
}: Props) => {
  const rowCount = Math.floor((dataGridHeight - dataGridColumnHeaderHeight) / dataGridRowHeight);

  return (
    <>
      {[...Array(rowCount)].map((_item, idx) => {
        return (
          <Box
            key={`skeleton-row-container${idx}`}
            sx={{
              borderBottom: "1px solid lightgrey"
            }}
          >
            <Grid
              container
              key={`skeleton-row-grid-container${idx}`}
              sx={{
                alignItems: "center"
              }}
            >
              {columns.map((column, idx) => (
                <Box
                  key={`skeleton-row-grid-item-box${idx}`}
                  sx={{ display: "flex", alignItems: "center" }}
                >
                  {idx === 0 ? <SkeletonTableRowCheckbox idx={idx} /> : null}
                  <SkeletonTableItem idx={idx} column={column} />
                </Box>
              ))}
            </Grid>
          </Box>
        );
      })}
    </>
  );
};

export default SkeletonTableRows;

import { Inventory } from "@mui/icons-material";
import { Box, Pagination, styled, useTheme } from "@mui/material";
import {
  DataGrid,
  type GridColDef,
  type GridRowSelectionModel,
  gridPageCountSelector,
  gridPaginationModelSelector,
  useGridApiContext,
  useGridSelector
} from "@mui/x-data-grid";
import { type Dispatch, type SetStateAction, useMemo } from "react";
import strings from "src/localization/strings";
import SkeletonTableRows from "./skeleton-table-rows";

interface CustomSkeletonTableRowsProps {
  dataGridHeight: number;
  dataGridRowHeight: number;
  dataGridColumnHeaderHeight: number;
  columns: GridColDef[];
}

const CustomSkeletonTableRows = ({
  dataGridHeight,
  dataGridRowHeight,
  dataGridColumnHeaderHeight,
  columns
}: CustomSkeletonTableRowsProps) => (
  <SkeletonTableRows
    dataGridHeight={dataGridHeight}
    dataGridRowHeight={dataGridRowHeight}
    dataGridColumnHeaderHeight={dataGridColumnHeaderHeight}
    columns={columns}
  />
);

const StyledGridOverlay = styled("div")(() => ({
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  justifyContent: "center",
  height: "100%"
}));

const CustomNoRowsOverlay = () => (
  <StyledGridOverlay>
    <Inventory />
    <Box sx={{ mt: 1 }}>{strings.dataGrid.noRows}</Box>
  </StyledGridOverlay>
);

interface TableProps<T> {
  rows: T[];
  columns: GridColDef[];
  loading: boolean;
  onRowClick: (arg?: any) => void;
  selectedRowIds: GridRowSelectionModel;
  setSelectedRowIds: Dispatch<SetStateAction<GridRowSelectionModel>>;
  dataGridHeight?: number;
  dataGridRowHeight?: number;
  dataGridColumnHeaderHeight?: number;
}

/**
 * Re-usable table component.
 *
 * @param props.dataGridHeight - Calculated height for the datagrid
 * @param props.dataGridRowHeight - Calculated row height for datagrid
 * @param props.dataGridColumnHeaderHeight - Calculated height for the header
 * @param props.rows - Array of items for rows
 * @param props.columns - Array of items for columns
 * @param props.loading- Boolean indicating if the page is loading
 * @param props.selectedRowIds - Id's of the rows selected
 * @param props.setSelectedRowIds - Set id's to be selected
 * @param props.formOpen - Boolean to indicate if form is open
 *
 * @returns Styled component for table to be used across the application
 */
const AppTable = <T,>({
  rows,
  columns,
  loading,
  onRowClick,
  selectedRowIds,
  setSelectedRowIds,
  dataGridHeight = 700,
  dataGridRowHeight = 52,
  dataGridColumnHeaderHeight = 56
}: TableProps<T>) => {
  const theme = useTheme();

  /**
   * Loading overlay component for DataGrid
   */
  const LoadingOverlay = useMemo(
    () => () => (
      <CustomSkeletonTableRows
        dataGridHeight={dataGridHeight}
        dataGridRowHeight={dataGridRowHeight}
        dataGridColumnHeaderHeight={dataGridColumnHeaderHeight}
        columns={columns}
      />
    ),
    [dataGridHeight, dataGridRowHeight, dataGridColumnHeaderHeight]
  );
  return (
    <DataGrid
      sx={{
        height: dataGridHeight,
        width: "100%",
        border: "none",
        "& .MuiDataGrid-columnSeparator": {
          display: "none"
        },
        "& .MuiDataGrid-columnHeader": {
          backgroundColor: theme.palette.background.secondary,
          borderRadius: 0
        },
        "& .MuiDataGrid-columnHeaders": {
          borderRadius: theme.radius.s,
          width: "fit-content",
          overflow: "hidden"
        },
        "& .MuiDataGrid-footerContainer": {
          borderTop: "none"
        }
      }}
      rowHeight={dataGridRowHeight}
      columnHeaderHeight={dataGridColumnHeaderHeight}
      autoPageSize
      onRowSelectionModelChange={(model: GridRowSelectionModel) => {
        setSelectedRowIds?.(model);
      }}
      rows={rows}
      loading={loading && !rows.length}
      slots={{
        loadingOverlay: LoadingOverlay,
        noRowsOverlay: CustomNoRowsOverlay,
        pagination: CustomPagination
      }}
      columns={columns}
      rowSelectionModel={selectedRowIds}
      onRowClick={(params) => {
        onRowClick(params.id);
      }}
      initialState={{
        sorting: {
          sortModel: [{ field: "updatedAt", sort: "asc" }]
        }
      }}
    />
  );
};

/**
 * Custom pagination for table.
 *
 * @returns Styled pagination to be used in the table component.
 * If page count is 1 or less, returns null.
 */
const CustomPagination = () => {
  const apiRef = useGridApiContext();
  const theme = useTheme();

  const pageCount = useGridSelector(apiRef, gridPageCountSelector);
  const paginationModel = useGridSelector(apiRef, gridPaginationModelSelector);

  if (pageCount <= 1) {
    return null;
  }
  return (
    <Box
      sx={{
        width: "100%",
        display: "flex",
        justifyContent: "center"
      }}
    >
      <Pagination
        count={pageCount}
        page={paginationModel.page + 1}
        onChange={(_, value) => apiRef.current.setPage(value - 1)}
        sx={{
          "& .MuiPaginationItem-root.Mui-selected": {
            backgroundColor: theme.palette.background.selected
          }
        }}
      />
    </Box>
  );
};

export default AppTable;

import { GridColDef } from "@mui/x-data-grid";

export const columns: GridColDef[] = [
  { field: "id", headerName: "ID", width: 90 },
  {
    field: "type",
    headerName: "Vacation Type",
    width: 150,
    editable: false
  },
  {
    field: "startDate",
    headerName: "Start Date",
    width: 150,
    editable: false
  },
  {
    field: "endDate",
    headerName: "End Date",
    width: 150,
    editable: false
  },
  {
    field: "days",
    headerName: "Day Count",
    width: 150,
    editable: false
  },
  {
    field: "status",
    headerName: "Status",
    width: 150,
    editable: false
  }
];

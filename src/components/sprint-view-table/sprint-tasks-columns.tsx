import type { GridColDef } from "@mui/x-data-grid";
import strings from "../../localization/strings";

/**
 * Sprint view tasks table columns component
 *
 *  @param props component properties
 */
const sprintViewTasksColumns = () => {
  /**
   * Define columns for data grid
   */
  const columns: GridColDef[] = [
    {
      field: "title",
      headerClassName: "header-color",
      headerName: strings.sprint.taskName,
      minWidth: 0,
      flex: 1,
    },
    {
      field: "estimateWorkHours",
      headerClassName: "header-color",
      headerName: strings.sprint.estimatedTime,
      flex: 1,
      renderCell: (params) => params.value,
    },
    {
      field: "startDate",
      headerClassName: "header-color",
      flex: 1,
      renderCell: (params) => params.value,
    },
    {
      field: "deadLine",
      headerClassName: "header-color",
      headerName: "DeadLine",
      flex: 1,
      renderCell: (params) => params.value,
    },
    {
      field: "actualWorkHours",
      headerClassName: "header-color",
      headerName: "Actual Work Hours",
      flex: 1,
      renderCell: (params) => params.value,
    },
  ];
  return columns;
};

export default sprintViewTasksColumns;

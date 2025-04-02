import type { GridColDef } from "@mui/x-data-grid";
import strings from "../../localization/strings";

const sprintViewTasksColumns = () => {
  const columns: GridColDef[] = [
    {
      field: "title",
      headerClassName: "header-color",
      headerName: strings.sprint.taskName,
      minWidth: 0,
      flex: 2,
    },
    {
      field: "estimateWorkHours",
      headerClassName: "header-color",
      headerName: strings.sprint.estimatedTime,
      flex: 1,
      renderCell: (params) => params.value,
    },
    {
      field: "actualWorkHours",
      headerClassName: "header-color",
      headerName: strings.sprint.actualWorkHours,
      flex: 1,
      renderCell: (params) => params.value,
    },
    {
      field: "startDate",
      headerClassName: "header-color",
      headerName: strings.sprint.startDate,
      flex: 1,
      renderCell: (params) => params.value,
    },
    {
      field: "deadline",
      headerClassName: "header-color",
      headerName: strings.sprint.deadLine,
      flex: 1,
      renderCell: (params) => params.value,
    },
    {
      field: "assignee",
      headerClassName: "header-color",
      headerName: strings.sprint.assigned,
      flex: 2,
      renderCell: (params) => params.value,
    },
  ];
  return columns;
};

export default sprintViewTasksColumns;
import type { GridColDef } from "@mui/x-data-grid";
import strings from "../../localization/strings";
import type { Phase } from "../../generated/homeLambdasClient";

/**
 * Component properties
 */
interface Props {
  // tasks: Tasks[];
  // timeEntries: number[];
  phase: Phase[];
}

/**
 * Sprint view tasks table columns component
 *
 *  @param props component properties
 */
const sprintViewTasksColumns = ({ phase, timeEntries }: Props) => {
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
      field: "workHour",
      headerClassName: "header-color",
      headerName: strings.sprint.estimatedTime,
      flex: 1,
      renderCell: (params) => params.value 
    },
    {
      field: "startDate",
      headerClassName: "header-color",
      flex: 3,
      renderCell: (params) => params.value
    },
    {
      field: "deadLine",
      headerClassName: "header-color",
      headerName: "DeadLine",
      renderCell: (params) => params.value
    }
    // {
    //   field: "assignedPersons",
    //   headerClassName: "header-color",
    //   headerName: strings.sprint.assigned,
    //   flex: 1,
    //   renderCell: (params) =>
    //     // <UserAvatars assignedPersons={params.row.assignedPersons} />
    //     console.log(),
    // },
    // {
    //   field: "status",
    //   headerClassName: "header-color",
    //   headerName: strings.sprint.taskStatus,
    //   flex: 1,
    //   valueGetter: (params) => params.row.statusCategory || "",
    //   renderCell: (params) => params.row.status
    // },
    // {
    //   field: "priority",
    //   headerClassName: "header-color",
    //   headerName: strings.sprint.taskPriority,
    //   cellClassName: (params) => (params.row.highPriority ? "high_priority" : "low_priority"),
    //   flex: 1,
    //   valueGetter: (params) => (params.row.highPriority ? "High" : "Normal")
    // },
    // {
    //   field: "estimate",
    //   headerClassName: "header-color",
    //   headerName: strings.sprint.estimatedTime,
    //   flex: 1,
    //   valueGetter: (params) => getHoursAndMinutes(params.row.estimate || 0)
    // },
    // // {
    //   field: "timeEntries",
    //   headerClassName: "header-color",
    //   headerName: strings.sprint.timeEntries,
    //   flex: 1,
    //   valueGetter: (params) =>
    //     getHoursAndMinutes(getTotalTimeEntriesTasks(params.row, tasks, timeEntries))
    // }
  ];
  return columns;
};

export default sprintViewTasksColumns;

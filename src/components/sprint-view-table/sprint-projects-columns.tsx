import type { GridColDef } from "@mui/x-data-grid";
import { Box } from "@mui/material";
import strings from "../../localization/strings";
import { getHoursAndMinutes } from "src/utils/time-utils";
import {
  getProjectColor,
  getProjectName,
  getTotalTimeEntriesAllocations,
  timeLeft,
  totalAllocations,
} from "src/utils/sprint-utils";
import type {
  Allocations,
  Projects,
  ResourceAllocations,
  WorkHours,
} from "src/generated/homeLambdasClient";

/**
 * Component properties
 */
interface Props {
  resourceAllocations: ResourceAllocations[];
  // workHours: WorkHours[];
  // projects: Projects[];
}

/**
 * Sprint view projects table columns component
 *
 * @param props component properties
 */
const sprintViewProjectsColumns = ({
  resourceAllocations,
}: // workHours,
// projects,
Props) => {
  /**
   * Define columns for data grid
   */
  const columns: GridColDef[] = [
    {
      field: "projectName",
      headerClassName: "header-color",
      filterable: false,
      headerName: strings.sprint.myAllocation,
      flex: 2,
      valueGetter: (params) =>
        getProjectName(params.row, resourceAllocations, projects),
      renderCell: (params) => (
        <>
          <Box
            minWidth="45px"
            style={{ marginRight: "10px" }}
            component="span"
            sx={{
              bgcolor: getProjectColor(
                params.row,
                resourceAllocations,
                projects
              ),
              height: 25,
              borderRadius: "5px",
            }}
          />
          {getProjectName(params.row, resourceAllocations, projects)}
        </>
      ),
    },
    // {
    //   field: "allocation",
    //   headerClassName: "header-color",
    //   headerName: strings.sprint.allocation,
    //   flex: 1,
    //   valueGetter: (params) => getHoursAndMinutes(totalAllocations(params.row)),
    // },
    // {
    //   field: "timeEntries",
    //   headerClassName: "header-color",
    //   headerName: strings.sprint.timeEntries,
    //   flex: 1,
    //   valueGetter: (params) =>
    //     getHoursAndMinutes(
    //       getTotalTimeEntriesAllocations(
    //         params.row,
    //         resourceAllocations,
    //         workHours
    //       )
    //     ),
    // },
    // {
    //   field: "allocationsLeft",
    //   headerClassName: "header-color",
    //   headerName: strings.sprint.allocationLeft,
    //   flex: 1,
    //   cellClassName: (params) =>
    //     timeLeft(params.row, resourceAllocations, timeEntries) < 0
    //       ? "negative-value"
    //       : "",
    //   valueGetter: (params) =>
    //     getHoursAndMinutes(timeLeft(params.row, allocations, timeEntries)),
    // },
  ];
  return columns;
};

export default sprintViewProjectsColumns;

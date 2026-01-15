import { Box } from "@mui/material";
import type { GridColDef } from "@mui/x-data-grid";
import type { ResourceAllocations } from "src/generated/homeLambdasClient";
import { getAssigneName, getProjectName, getTotalEstimatedHours } from "src/utils/sprint-utils";
import strings from "../../localization/strings";

/**
 * Sprint view projects interfaces
 */
interface Props {
  resourceAllocations: ResourceAllocations[];
}
/**
 * Sprint view projects table columns component
 *
 * @param props component properties
 */
const createSprintViewProjectsColumns = ({ resourceAllocations }: Props) => {
  const columns: GridColDef[] = [
    {
      field: "project",
      headerClassName: "header-color",
      filterable: false,
      sortable: true,
      headerName: strings.sprint.myAllocation,
      flex: 2,
      valueGetter: (params) => getProjectName(params.row.project, resourceAllocations),
      renderCell: (params) => (
        <Box display="flex" alignItems="center" justifyContent="center">
          {getProjectName(params.row.project, resourceAllocations)}
        </Box>
      )
    },
    {
      field: "allocationHours",
      headerClassName: "header-color",
      filterable: false,
      sortable: true,
      headerName: strings.sprint.estimatedTime,
      flex: 2,
      valueGetter: (params) => getTotalEstimatedHours(resourceAllocations, params.row.project),
      renderCell: (params) => (
        <Box display="flex" alignItems="center" justifyContent="center" ml={5}>
          {getTotalEstimatedHours(resourceAllocations, params.row.project)}
        </Box>
      )
    },
    {
      field: "user",
      headerClassName: "header-color",
      filterable: false,
      sortable: true,
      headerName: strings.sprint.assigned,
      flex: 4,
      valueGetter: (params) => getAssigneName(resourceAllocations, params.row.project),
      renderCell: (params) => (
        <Box display="flex" alignItems="center" justifyContent="center">
          {getAssigneName(resourceAllocations, params.row.project)}
        </Box>
      )
    }
  ];
  return columns;
};

export default createSprintViewProjectsColumns;

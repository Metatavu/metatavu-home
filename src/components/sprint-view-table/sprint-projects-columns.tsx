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

      valueGetter: (_value, row) =>
        row?.project ? getProjectName(row.project, resourceAllocations) : "",

      renderCell: (params) => (
        <Box display="flex" alignItems="center" justifyContent="left">
          {params.row?.project ? getProjectName(params.row.project, resourceAllocations) : ""}
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

      valueGetter: (_value, row) =>
        row?.project ? getTotalEstimatedHours(resourceAllocations, row.project) : "",

      renderCell: (params) => (
        <Box display="flex" alignItems="center" justifyContent="left" ml={5}>
          {params.row?.project
            ? getTotalEstimatedHours(resourceAllocations, params.row.project)
            : ""}
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

      valueGetter: (_value, row) =>
        row?.project ? getAssigneName(resourceAllocations, row.project) : "",

      renderCell: (params) => (
        <Box display="flex" alignItems="center" justifyContent="left">
          {params.row?.project ? getAssigneName(resourceAllocations, params.row.project) : ""}
        </Box>
      )
    }
  ];

  return columns;
};

export default createSprintViewProjectsColumns;

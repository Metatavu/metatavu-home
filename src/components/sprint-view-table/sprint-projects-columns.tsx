import { Box } from "@mui/material";
import type { GridColDef } from "@mui/x-data-grid";
import type {
  ResourceAllocations
} from "src/generated/homeLambdasClient";
import {
  getAssigneName,
  getPhaseName,
  getProjectName,
  getTotalEstimatedHours,
} from "src/utils/sprint-utils";
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
      headerName: strings.sprint.myAllocation,
      flex: 2,
      valueGetter: (params) => {
        getProjectName(params.row.project, resourceAllocations);
      },
      renderCell: (params) => (
        <>
          <Box display="flex" alignItems="center" justifyContent="center" />
          {getProjectName(params.row.project, resourceAllocations)}{" "}
        </>
      ),
    },
    {
      field: "allocationHours",
      headerClassName: "header-color",
      filterable: false,
      headerName: strings.sprint.estimatedTime,
      flex: 1,
      valueGetter: (param) => {
        getTotalEstimatedHours(resourceAllocations, param.row.project);
      },
      renderCell: (param) => (
      <>
        <Box marginLeft={"50px"} display="flex" alignItems="center" justifyContent="center" />
        {getTotalEstimatedHours(resourceAllocations, param.row.project)}{" "}
      </>
      )
    },
    {
      field: "phase",
      headerClassName: "header-color",
      filterable: false,
      headerName: strings.sprint.taskName,
      flex: 1,
      valueGetter: (params) => {
        getPhaseName(params.row.phase, resourceAllocations);
      },
      renderCell: (params) => (
      <>
        <Box display="flex" alignItems="center" justifyContent="center" />
        {getPhaseName(params.row.phase, resourceAllocations)}{" "}
      </>
      )
    },
    {
      field: "user",
      headerClassName: "header-color",
      filterable: false,
      headerName: strings.sprint.assigned,
      flex: 1,
      valueGetter: (params) => {
        getAssigneName(params.row.user, resourceAllocations);
      },
      renderCell: (params) => (
      <>
        <Box display="flex" alignItems="center" justifyContent="center" />
        {getAssigneName(params.row.user, resourceAllocations)}{" "}
      </>
      )
    },
  ];
  return columns;
};

export default createSprintViewProjectsColumns;
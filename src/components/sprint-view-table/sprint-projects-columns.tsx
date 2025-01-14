import type { GridColDef } from "@mui/x-data-grid";
import { Box } from "@mui/material";
import strings from "../../localization/strings";
import {
  getAssigneName,
  getPhaseName,
  getProjectName,
} from "src/utils/sprint-utils";
import type {
  ResourceAllocations,
  ResourceAllocationsProject,
} from "src/generated/homeLambdasClient";

/**
 * Sprint view projects interfaces
 */
interface Props {
  severaProjectId: ResourceAllocationsProject[];
  project: ResourceAllocations[];
  resourceAllocations: ResourceAllocations[];
  user: ResourceAllocations[];
  phase: ResourceAllocations[];
}

/**
 * Sprint view projects table columns component
 *
 * @param props component properties
 */
const sprintViewProjectsColumns = ({ project, user, phase }: Props) => {
  const columns: GridColDef[] = [
    {
      field: "project",
      headerClassName: "header-color",
      filterable: false,
      headerName: strings.sprint.myAllocation,
      flex: 2,
      valueGetter: (params) => {
        getProjectName(params.row.project, project);
      },
      renderCell: (params) => {
        return (
          <>
            <Box display="flex" alignItems="center" justifyContent="center" />
            {getProjectName(params.row.project, project)}{" "}
          </>
        );
      },
    },
    {
      field: "calculatedAllocationHours",
      headerClassName: "header-color",
      filterable: false,
      headerName: strings.sprint.timeAllocated,
      flex: 1,
      renderCell: (params) => {
        return (
          <>
            <Box
              marginLeft={"50px"}
              display="flex"
              alignItems="center"
              justifyContent="center"
            />
            {params.value}
          </>
        );
      },
    },
    {
      field: "allocationHours",
      headerClassName: "header-color",
      filterable: false,
      headerName: strings.sprint.estimatedTime,
      flex: 1,
      renderCell: (params) => {
        return (
          <>
            <Box
              marginLeft={"50px"}
              display="flex"
              alignItems="center"
              justifyContent="center"
            />
            {params.value}
          </>
        );
      },
    },
    {
      field: "phase",
      headerClassName: "header-color",
      filterable: false,
      headerName: strings.sprint.taskName,
      flex: 1,
      valueGetter: (params) => {
        getPhaseName(params.row.phase, phase);
      },
      renderCell: (params) => {
        return (
          <>
            <Box display="flex" alignItems="center" justifyContent="center" />
            {getPhaseName(params.row.phase, phase)}{" "}
          </>
        );
      },
    },
    {
      field: "user",
      headerClassName: "header-color",
      filterable: false,
      headerName: strings.sprint.assigned,
      flex: 2,
      valueGetter: (params) => {
        getAssigneName(params.row.user, user);
      },
      renderCell: (params) => {
        return (
          <>
            <Box display="flex" alignItems="center" justifyContent="center" />
            {getAssigneName(params.row.user, user)}{" "}
          </>
        );
      },
    },
  ];
  return columns;
};

export default sprintViewProjectsColumns;
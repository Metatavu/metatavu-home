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
      field: "calculatedHours",
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
      field: "estimateHours",
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
      field: "Tasks",
      headerClassName: "header-color",
      filterable: false,
      headerName: strings.sprint.taskName,
      flex: 1,
      valueGetter: (params) => {
        getPhaseName(params.row.tasks, phase);
      },
      renderCell: (params) => {
        return (
          <>
            <Box display="flex" alignItems="center" justifyContent="center" />
            {getPhaseName(params.row.tasks, phase)}{" "}
          </>
        );
      },
    },
    {
      field: "Assignee",
      headerClassName: "header-color",
      filterable: false,
      headerName: strings.sprint.assigned,
      flex: 2,
      valueGetter: (params) => {
        getAssigneName(params.row.assignee, user);
      },
      renderCell: (params) => {
        return (
          <>
            <Box display="flex" alignItems="center" justifyContent="center" />
            {getAssigneName(params.row.assignee, user)}{" "}
          </>
        );
      },
    },
  ];
  return columns;
};

export default sprintViewProjectsColumns;
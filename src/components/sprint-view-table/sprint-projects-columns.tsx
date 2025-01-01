import type { GridColDef } from "@mui/x-data-grid";
import { Box } from "@mui/material";
import strings from "../../localization/strings";
import {
  getAssigneName,
  getPhaseName,
  // getProjectColor,
  getProjectName,
  // totalAllocations,
} from "src/utils/sprint-utils";
import type { ResourceAllocationsInner } from "src/generated/homeLambdasClient/models/ResourceAllocationsInner";
import type { ResourceAllocationsInnerProjects } from "src/generated/homeLambdasClient/models/ResourceAllocationsInnerProjects";

interface Props {
  severaProjectId: ResourceAllocationsInnerProjects[];
  project: ResourceAllocationsInner[];
  resourceAllocations: ResourceAllocationsInner[];
  user: ResourceAllocationsInner[];
  phase: ResourceAllocationsInner[];
}

/**
 * Sprint view projects table columns component
 *
 * @param props component properties
 */
const sprintViewProjectsColumns = ({ project, user, phase }: Props) => {
  /**
   * Define columns for data grid
   */
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
    }
  ];
  return columns;
};

export default sprintViewProjectsColumns;

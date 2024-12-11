import type { GridColDef } from "@mui/x-data-grid";
import { Box } from "@mui/material";
import strings from "../../localization/strings";
import { getHoursAndMinutes } from "src/utils/time-utils";
import {
  getAssigneName,
  getPhaseName,
  // getProjectColor,
  getProjectName,
  getTotalTimeEntriesAllocations,
  timeLeft,
  // totalAllocations,
} from "src/utils/sprint-utils";
import type {
  Allocations,
  Projects,
  ResourceAllocations,
  ResourceAllocationsInner,
  ResourceAllocationsInnerProjects,
  ResourceAllocationsInnerUsers,
  ResourceAllocationsProject,
  WorkHours,
} from "src/generated/homeLambdasClient";

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
const sprintViewProjectsColumns = ({
  project,
  user,
  phase
  
}:

Props) => {
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
            <Box
        display="flex"
        alignItems="center"
        justifyContent="center"

            />
            {getProjectName(params.row.project, project)} {/* Fetch and display project name */}
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
            {params.value} {/* Fetch and display project name */}
          </>
        );
      }
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
            {params.value} {/* Fetch and display project name */}
          </>
        );
      }
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
            <Box
        display="flex"
        alignItems="center"
        justifyContent="center"
            />
            {getPhaseName(params.row.tasks, phase)} {/* Fetch and display project name */}
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
            <Box
        display="flex"
        alignItems="center"
        justifyContent="center"

            />
            {getAssigneName(params.row.assignee, user)} {/* Fetch and display project name */}
          </>
        );
      },
    },
        // {
    //   field: "projectName",
    //   headerClassName: "header-color",
    //   filterable: false,
    //   headerName: strings.sprint.myAllocation,
    //   flex: 2,
    //   valueGetter: (params) =>
    //     getProjectName(params.row, severaProjectId, projects),
    //   renderCell: (params) => (
    //     <>
    //       <Box
    //         minWidth="45px"
    //         style={{ marginRight: "10px" }}
    //         component="span"
    //         // sx={{
    //         //   bgcolor: getProjectColor(
    //         //     params.row,
    //         //     severaProjectId,
    //         //     projects
    //         //   ),
    //         //   height: 25,
    //         //   borderRadius: "5px",
    //         // }}
    //       />
    //       {getProjectName(params.row, severaProjectId, projects)}
    //     </>
    //   ),
    // },
    // {
    //   field: "project",
    //   headerClassName: "header-color",
    //   filterable: false,
    //   headerName: strings.sprint.myAllocation,
    //   flex: 2,
    //   renderCell: (params) => (
    //     <>
    //       <Box
    //         component="span"
    //       />
    //       {params.value}
    //     </>
    //   ),
    // },
  ];
  return columns;
};

export default sprintViewProjectsColumns;

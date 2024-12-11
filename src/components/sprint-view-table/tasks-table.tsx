import { Box, Card, CircularProgress, IconButton, Typography } from "@mui/material";
import type { Projects, ResourceAllocationsInner, ResourceAllocationsInnerPhase, ResourceAllocationsInnerProject, Tasks, TimeEntries } from "src/generated/homeLambdasClient";
import { DataGrid } from "@mui/x-data-grid";
import { useEffect, useState } from "react";
import { useLambdasApi } from "src/hooks/use-api";
import KeyboardArrowUpIcon from "@mui/icons-material/KeyboardArrowUp";
import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";
import strings from "src/localization/strings";
import sprintViewTasksColumns from "./sprint-tasks-columns";
import { errorAtom } from "src/atoms/error";
import { useSetAtom } from "jotai";
import { getSeveraProjectId } from "src/utils/sprint-utils";

/**
 * Component properties
 */
interface Props {
  project: ResourceAllocationsInner;
  loggedInPersonId?: number;
  filter?: string;

}

/**
 * Task table component
 *
 * @param props component properties
 */
const TaskTable = ({ project, loggedInPersonId, filter }: Props) => {
  const { tasksApi, timeEntriesApi, phaseApi } = useLambdasApi();
  // const [tasks, setTasks] = useState<Tasks[]>([]);
  const [phase, setPhase] = useState<ResourceAllocationsInnerPhase[]>();
  const [timeEntries, setTimeEntries] = useState<number[]>([]);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  // const columns = sprintViewTasksColumns({ phase, timeEntries });
  const setError = useSetAtom(errorAtom);

  /**
   * Gather tasks and time entries when project is available and update reload state
   */
  useEffect(() => {
    if (project && open) {
      getTasksAndTimeEntries();
    }
  }, [project, open, filter]);

  /**
   * Handle loggenInPersonId change
   */
  useEffect(() => {
    setPhase([]);
    setOpen(false);
  }, [loggedInPersonId]);

  /**
   * Get tasks and total time entries
   */
  const getTasksAndTimeEntries = async () => {
    setLoading(true);
    if (!(phase?.length) || !(timeEntries?.length)) {
      try {
        const severaProjectId = getSeveraProjectId(project);
        const fetchedTasks = await phaseApi.getPhasesBySeveraProjectId({ severaProjectId: severaProjectId || "" })

        console.log("Fetching tasks here", fetchedTasks);

        // setPhase(fetchedTasks);
        // const fetchedTimeEntries = await Promise.all(
        //   fetchedTasks.map(async (task) => {
        //     try {
        //       if (project.id) {
        //         const totalTimeEntries = await timeEntriesApi.listProjectTimeEntries({
        //           projectId: project.id,
        //           taskId: task.id
        //         });
        //         let totalMinutes = 0;
        //         totalTimeEntries.forEach((timeEntry: TimeEntries) => {
        //           if (loggedInPersonId && timeEntry.person === loggedInPersonId) {
        //             totalMinutes += timeEntry.timeRegistered || 0;
        //           }
        //           if (!loggedInPersonId) {
        //             totalMinutes += timeEntry.timeRegistered || 0;
        //           }
        //         });
        //         return totalMinutes;
        //       }
        //     } catch (error) {
        //       const message: string = strings
        //         .formatString(
        //           strings.sprintRequestError.fetchTasksError,
        //           task.id || `${strings.sprintRequestError.fetchTaskIdError}`,
        //           error as string
        //         )
        //         .toString();
        //       setError(message);
        //     }
        //     return 0;
        //   })
        // );
        // setTimeEntries(fetchedTimeEntries);
      } catch (error) {
        setError(`${strings.sprintRequestError.fetchTimeEntriesError} ${error}`);
      }
    }
    setLoading(false);
  };

  return (
    <Card
      key={0}
      sx={{
        backgroundColor: "#f2f2f2",
        margin: 0,
        paddingTop: "5px",
        paddingBottom: "5px",
        width: "100%",
        height: "100",
        marginBottom: "16px",
        "& .high_priority": {
          color: "red"
        },
        "& .low_priority": {
          color: "green"
        }
      }}
    >
      Task Table
      <IconButton onClick={() => setOpen(!open)}>
        {open ? <KeyboardArrowUpIcon /> : <KeyboardArrowDownIcon />}
      </IconButton>
      <Typography style={{ display: "inline" }}>{project?.name}</Typography>
      {open && (
        <>
          {loading ? (
            <Box sx={{ textAlign: "center" }}>
              <CircularProgress
                sx={{
                  scale: "100%",
                  mt: "3%",
                  mb: "3%"
                }}
              />
            </Box>
          ) : (
            // <DataGrid
            //   sx={{
            //     backgroundColor: "#f6f6f6",
            //     borderTop: 0,
            //     borderLeft: 0,
            //     borderRight: 0,
            //     borderBottom: 0,
            //     "& .header-color": {
            //       backgroundColor: "#f2f2f2"
            //     }
            //   }}
            //   autoHeight={true}
            //   localeText={{ noResultsOverlayLabel: strings.sprint.notFound }}
            //   disableColumnFilter
            //   hideFooter={true}
            //   filterModel={{
            //     items: [
            //       {
            //         field: "status",
            //         operator: "contains",
            //         value: filter
            //       }
            //     ]
            //   }}
            //   // rows={tasks}
            //   // columns={columns}
            // />
            console.log("Tasks here")
          )}
        </>
      )}
    </Card>
  );
};

export default TaskTable;

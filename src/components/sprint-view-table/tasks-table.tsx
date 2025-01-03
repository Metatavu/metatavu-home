import {
  Box,
  Card,
  CircularProgress,
  IconButton,
  Typography,
} from "@mui/material";
import { DataGrid } from "@mui/x-data-grid";
import { useEffect, useState } from "react";
import { useLambdasApi } from "src/hooks/use-api";
import KeyboardArrowUpIcon from "@mui/icons-material/KeyboardArrowUp";
import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";
import strings from "src/localization/strings";
import sprintViewTasksColumns from "./sprint-tasks-columns";
import { errorAtom } from "src/atoms/error";
import { useSetAtom } from "jotai";
import {
  Phase,
  PhaseProject,
  ResourceAllocations,
  ResourceAllocationsProject,
  WorkHours,
  WorkHoursPhase,
} from "src/generated/homeLambdasClient";
import { getPhaseName, getWorkHour } from "src/utils/sprint-utils";

/**
 * Component properties
 */
interface Props {
  project: ResourceAllocations;
  loggedInPersonId?: number;
  filter?: string;
}

/**
 * Task table component
 *
 * @param props component properties
 */
const TaskTable = ({ project, loggedInPersonId, filter }: Props) => {
  const { phaseApi, workHoursApi } = useLambdasApi();
  const [phase, setPhase] = useState<Phase[]>([]);
  const [workHours, setWorkHours] = useState<WorkHours[]>([]);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const columns = sprintViewTasksColumns({ phase, workHours });
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

  const rows = phase.map((phase) => {
    // Dynamically fetch the actual work hours for each phase
    const actualWorkHours = getWorkHour(
      phase.severaPhaseId || "No data",
      workHours
    );

    console.log("Actual work hours is here ", actualWorkHours);
    console.log("Phase is here ", phase);

    return {
      id: phase.severaPhaseId,
      title: phase.name,
      estimateWorkHours: phase.workHoursEstimate,
      startDate: phase.startDate?.toISOString().split("T")[0],
      deadLine: phase.deadLine
        ? new Date(phase.deadLine).toLocaleDateString("en-US", {
            day: "2-digit",
            month: "short",
            year: "numeric",
          })
        : undefined,
      actualWorkHours: actualWorkHours || "No data",
    };
  });

  console.log("Phase is here ", phase);

  console.log("Rows is here ", rows);

  /**
   * Get tasks and total time entries
   */
  const getTasksAndTimeEntries = async () => {
    setLoading(true);
    if (!phase?.length) {
      try {
        const fetchedTasks = await phaseApi.getPhasesBySeveraProjectId({
          severaProjectId: project.project?.severaProjectId || "",
        });
        const fetchedWorkHours = await workHoursApi.getAllWorkHours({
          severaProjectId: project.project?.severaProjectId || "",
        });
        setWorkHours(fetchedWorkHours);
        setPhase(fetchedTasks);
      } catch (error) {
        setError(
          `${strings.sprintRequestError.fetchTimeEntriesError} ${error}`
        );
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
          color: "red",
        },
        "& .low_priority": {
          color: "green",
        },
      }}
    >
      <IconButton onClick={() => setOpen(!open)}>
        {open ? <KeyboardArrowUpIcon /> : <KeyboardArrowDownIcon />}
      </IconButton>
      <Typography style={{ display: "inline" }}>
        {project.project?.name}
      </Typography>
      {open && (
        <>
          {loading ? (
            <Box sx={{ textAlign: "center" }}>
              <CircularProgress
                sx={{
                  scale: "100%",
                  mt: "3%",
                  mb: "3%",
                }}
              />
            </Box>
          ) : (
            <DataGrid
              sx={{
                backgroundColor: "#f6f6f6",
                borderTop: 0,
                borderLeft: 0,
                borderRight: 0,
                borderBottom: 0,
                "& .header-color": {
                  backgroundColor: "#f2f2f2",
                },
              }}
              autoHeight={true}
              localeText={{ noResultsOverlayLabel: strings.sprint.notFound }}
              disableColumnFilter
              hideFooter={true}
              filterModel={{
                items: [
                  {
                    field: "status",
                    operator: "contains",
                    value: filter,
                  },
                ],
              }}
              rows={rows}
              columns={columns}
            />
          )}
        </>
      )}
    </Card>
  );
};

export default TaskTable;

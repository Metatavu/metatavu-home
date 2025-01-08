import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";
import KeyboardArrowUpIcon from "@mui/icons-material/KeyboardArrowUp";
import {
  Box,
  Card,
  CircularProgress,
  IconButton,
  Typography,
} from "@mui/material";
import { DataGrid } from "@mui/x-data-grid";
import { useSetAtom } from "jotai";
import { useEffect, useState } from "react";
import { errorAtom } from "src/atoms/error";
import type {
  Phase,
  ResourceAllocations,
  WorkHours,
} from "src/generated/homeLambdasClient";
import { useLambdasApi } from "src/hooks/use-api";
import strings from "src/localization/strings";
import { formatDateSevera, getWorkHour } from "src/utils/sprint-utils";
import sprintViewTasksColumns from "./sprint-tasks-columns";

/**
 * Interface for TaskTable component
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
  const columns = sprintViewTasksColumns();
  const setError = useSetAtom(errorAtom);

  const rows = phase.map((phase) => {
    const actualWorkHours = getWorkHour(
      phase.severaPhaseId || "Severa Phase Id not found",
      workHours
    );
    return {
      id: phase.severaPhaseId,
      title: phase.name,
      estimateWorkHours: phase.workHoursEstimate,
      startDate: phase.startDate?.toISOString().split("T")[0],
      deadLine: formatDateSevera(phase.deadline?.toISOString() || ""),
      actualWorkHours: actualWorkHours || "0",
    };
  });

  /**
   * Get Tasks and WorkHours for tasks
   */
  const getTasksAndWorkHours = async () => {
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
          `${strings.sprintRequestError.fetchWorkHoursAndTasksError} ${error}`
        );
      }
    }
    setLoading(false);
  };

  useEffect(() => {
    if (project && open) {
      getTasksAndWorkHours();
    }
  }, [project, open, filter]);

  useEffect(() => {
    setPhase([]);
    setOpen(false);
  }, [loggedInPersonId]);

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
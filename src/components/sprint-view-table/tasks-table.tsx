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
  WorkHours
} from "src/generated/homeLambdasClient";
import { useLambdasApi } from "src/hooks/use-api";
import strings from "src/localization/strings";
import { mapPhasesToRows } from "src/utils/sprint-utils";
import sprintViewTasksColumns from "./sprint-tasks-columns";

/**
 * Interface for TaskTable component
 */
interface Props {
  phases: Phase;
  loggedInPersonId?: string;
  filter?: string;
  project: ResourceAllocations
}

/**
 * Task table component
 *
 * @param props component properties
 */
const TaskTable = ({ phases, loggedInPersonId, filter, project }: Props) => {
  const { phaseApi, workHoursApi } = useLambdasApi();
  const [phase, setPhase] = useState<Phase[]>([]);
  const [workHours, setWorkHours] = useState<WorkHours[]>([]);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const columns = sprintViewTasksColumns();
  const setError = useSetAtom(errorAtom);
  const rows = phase.map((phase) => mapPhasesToRows(phase, workHours));
  /**
   * Get Tasks and WorkHours for tasks
   */
  const getTasksAndWorkHours = async () => {
    setLoading(true);
    if (!phase?.length) {
      try {
        const fetchedTasks = await phaseApi.getPhasesBySeveraProjectId({
          severaProjectId: phases.project?.severaProjectId || "",
        });
        const fetchedWorkHours = await workHoursApi.getAllWorkHours({
          severaProjectId: phases.project?.severaProjectId || "",
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
  }, [project, open]);

  useEffect(() => {
    if (loggedInPersonId) {
      setPhase([]);
      setOpen(false);
    }
  }, []);
  
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
        {phases.project?.name}
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
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
import { useAtomValue, useSetAtom } from "jotai";
import { useEffect, useState } from "react";
import { userProfileAtom } from "src/atoms/auth";
import { errorAtom } from "src/atoms/error";
import { usersAtom } from "src/atoms/user";
import type {
  Phase,
  ResourceAllocationsProject,
  User,
  WorkHours
} from "src/generated/homeLambdasClient";
import { useLambdasApi } from "src/hooks/use-api";
import strings from "src/localization/strings";
import type { PhaseRow } from "src/types/index";
import { getSeveraUserId, mapPhasesToRows } from "src/utils/sprint-utils";
import sprintViewTasksColumns from "./sprint-tasks-columns";

/**
 * Interface for TaskTable component
 */
interface Props {
  filter?: string;
  project: ResourceAllocationsProject
}

/**
 * Task table component
 *
 * @param props component properties
 */
const TaskTable = ({filter, project }: Props) => {
  const users = useAtomValue(usersAtom);
  const userProfile = useAtomValue(userProfileAtom);
  const loggedInUser = users.find(
    (users: User) => users.id === userProfile?.id
  );
  const { phaseApi, workHoursApi } = useLambdasApi();
  const [phase, setPhase] = useState<Phase[]>([]);
  const [workHours, setWorkHours] = useState<WorkHours[]>([]);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const columns = sprintViewTasksColumns();
  const setError = useSetAtom(errorAtom);
  const severaUserId = loggedInUser ? getSeveraUserId(loggedInUser) : "";
  const rows: PhaseRow[] = phase.map((phase) => mapPhasesToRows(phase, workHours, severaUserId));

  /**
   * Get Phases and WorkHours for tasks
   */
  const getPhasesAndWorkHours = async () => {
    setLoading(true);
    if (!phase?.length) {
      try {
        // const severaUserId = getSeveraUserId(loggedInUser);
        const fetchedPhases = await phaseApi.getPhasesBySeveraProjectId({
          severaProjectId: project.severaProjectId || "",
        });
        const fetchedWorkHours = await workHoursApi.getAllWorkHours({
          // severaUserId,
          severaProjectId: project.severaProjectId || "",

        });
        setWorkHours(fetchedWorkHours);
        setPhase(fetchedPhases);
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
      getPhasesAndWorkHours();
    }
  }, [project, open]);
  
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
        {project.name}
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
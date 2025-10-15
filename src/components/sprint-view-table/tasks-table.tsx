import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";
import KeyboardArrowUpIcon from "@mui/icons-material/KeyboardArrowUp";
import { Box, Card, CircularProgress, IconButton, Typography } from "@mui/material";
import { DataGrid } from "@mui/x-data-grid";
import { useAtomValue, useSetAtom } from "jotai";
import { useEffect, useState } from "react";
import { userProfileAtom } from "src/atoms/auth";
import { errorAtom } from "src/atoms/error";
import { usersAtom } from "src/atoms/user";
import type {
  Phase,
  ResourceAllocations,
  ResourceAllocationsProject,
  User,
  WorkHours
} from "src/generated/homeLambdasClient";
import { useLambdasApi } from "src/hooks/use-api";
import strings from "src/localization/strings";
import type { PhaseRow } from "src/types/index";
import { getSeveraUserId, mapPhasesToRows } from "src/utils/sprint-utils";
import UserRoleUtils from "src/hooks/use-user-role";
import sprintViewTasksColumns from "./sprint-tasks-columns";

/**
 * Interface for TaskTable component
 */
interface Props {
  filter?: string;
  project: ResourceAllocationsProject;
}

/**
 * Task table component
 *
 * @param props component properties
 */
const TaskTable = ({ filter, project }: Props) => {
  const users = useAtomValue(usersAtom);
  const {adminMode} = UserRoleUtils();
  const userProfile = useAtomValue(userProfileAtom);
  const loggedInUser = users.find((users: User) => users.id === userProfile?.id);
  const { phaseApi, workHoursApi, resourceAllocationsApi } = useLambdasApi();
  const [phase, setPhase] = useState<Phase[]>([]);
  const [workHours, setWorkHours] = useState<WorkHours[]>([]);
  const [resourceAllocations, setResourceAllocations] = useState<ResourceAllocations[]>([]);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const columns = sprintViewTasksColumns();
  const setError = useSetAtom(errorAtom);
  const severaUserId = loggedInUser ? getSeveraUserId(loggedInUser) : "";
  const rows: PhaseRow[] = phase
    .map((phase) => mapPhasesToRows(phase, workHours, severaUserId, resourceAllocations, adminMode))
    .filter((row): row is PhaseRow => row !== null);

  /**
   * Get Phases and WorkHours for tasks
   */
  const getPhasesAndWorkHours = async () => {
    if (!loggedInUser) return;
    setLoading(true);
    if (!phase?.length) {
      try {
        const severaProjectId = project.severaProjectId || "";
        const [fetchedResourceAllocations] = await Promise.all([
          resourceAllocationsApi.getAllResourceAllocations({ severaUserId })
        ]);
        const [fetchedPhases, fetchedWorkHours] = await Promise.all([
          phaseApi.getPhasesBySeveraProjectId({
            severaProjectId
          }),
          workHoursApi.getAllWorkHours({
            severaProjectId
          })
        ]);
        setResourceAllocations(fetchedResourceAllocations);
        setWorkHours(fetchedWorkHours);
        setPhase(fetchedPhases);
      } catch (error) {
        setError(`${strings.sprintRequestError.fetchWorkHoursAndTasksError} ${error}`);
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
          color: "red"
        },
        "& .low_priority": {
          color: "green"
        }
      }}
    >
      <Box
        onClick={() => setOpen(!open)}
        sx={{
          display: "flex",
          alignItems: "center",
          padding: "2px",
          width: "100%",
          cursor: "pointer"
        }}
      >
        <IconButton>{open ? <KeyboardArrowUpIcon /> : <KeyboardArrowDownIcon />}</IconButton>
        <Typography>{project.name}</Typography>
      </Box>
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
            <DataGrid
              sx={{
                backgroundColor: "#f6f6f6",
                borderTop: 0,
                borderLeft: 0,
                borderRight: 0,
                borderBottom: 0,
                "& .header-color": {
                  backgroundColor: "#f2f2f2"
                }
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
                    value: filter
                  }
                ]
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

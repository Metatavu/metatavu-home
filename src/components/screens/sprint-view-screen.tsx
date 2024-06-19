import { useState, useEffect } from "react";
import { Card, CircularProgress, Typography, Box, FormControlLabel, Switch } from "@mui/material";
import { useLambdasApi } from "src/hooks/use-api";
import type { Person } from "src/generated/client";
import { useAtomValue, useSetAtom } from "jotai";
import { personsAtom } from "src/atoms/person";
import config from "src/app/config";
import { userProfileAtom } from "src/atoms/auth";
import type { Allocations, Projects } from "src/generated/homeLambdasClient/models/";
import { DataGrid } from "@mui/x-data-grid";
import { getHoursAndMinutes, getSprintEnd, getSprintStart } from "src/utils/time-utils";
import TaskTable from "src/components/sprint-view-table/tasks-table";
import strings from "src/localization/strings";
import sprintViewProjectsColumns from "src/components/sprint-view-table/sprint-projects-columns";
import { errorAtom } from "src/atoms/error";
import {
  calculateWorkingLoad,
  totalAllocations,
  fetchProjectDetails
} from "src/utils/sprint-utils";
import { TaskStatusFilter } from "src/components/sprint-view-table/menu-Item-filter-table";

/**
 * Sprint view screen component
 */
const SprintViewScreen = () => {
  const persons: Person[] = useAtomValue(personsAtom);
  const userProfile = useAtomValue(userProfileAtom);
  const loggedInPerson = persons.find(
    (person: Person) =>
      person.id === config.person.forecastUserIdOverride || person.keycloakId === userProfile?.id
  );
  const [allocations, setAllocations] = useState<Allocations[]>([]);
  const [projects, setProjects] = useState<Projects[]>([]);
  const [timeEntries, setTimeEntries] = useState<number[]>([]);
  const [loading, setLoading] = useState(false);
  const [myTasks, setMyTasks] = useState(true);
  const [filter, setFilter] = useState("");
  const todaysDate = new Date().toISOString();
  const sprintStartDate = getSprintStart(todaysDate);
  const sprintEndDate = getSprintEnd(todaysDate);
  const columns = sprintViewProjectsColumns({ allocations, timeEntries, projects });
  const setError = useSetAtom(errorAtom);
  const { allocationsApi, projectsApi, timeEntriesApi } = useLambdasApi();

  /**
   * Get project data if user is logged in
   */
  useEffect(() => {
    fetchProjectAndAllocations();
  }, [loggedInPerson]);

  const fetchProjectAndAllocations = async () => {
    setLoading(true);
    if (!loggedInPerson) return;

    const { filteredAllocations, filteredProjects, fetchedTimeEntries } = await fetchProjectDetails(
      {
        setError,
        person: loggedInPerson,
        allocationsApi,
        projectsApi,
        timeEntriesApi
      }
    );
    setProjects(filteredProjects);
    setAllocations(filteredAllocations);
    setTimeEntries(fetchedTimeEntries);
    setLoading(false);
  };

  /**
   * Calculate total unallocated time for the user in the current 2 week period
   *
   * @param allocation task allocated within a project
   */
  const unallocatedTime = (allocation: Allocations[]) => {
    const totalAllocatedTime = allocation.reduce(
      (total, allocation) => total + totalAllocations(allocation),
      0
    );
    return calculateWorkingLoad(loggedInPerson) - totalAllocatedTime;
  };

  /**
   * Featute for task filtering
   */
  const handleOnClickTask = () => {
    setMyTasks(!myTasks);
    setFilter("");
  };

  return (
    <>
      {loading ? (
        <Card
          sx={{
            p: "25%",
            display: "flex",
            justifyContent: "center"
          }}
        >
          {
            <Box sx={{ textAlign: "center" }}>
              <Typography>{strings.placeHolder.pleaseWait}</Typography>
              <CircularProgress
                sx={{
                  scale: "150%",
                  mt: "5%",
                  mb: "5%"
                }}
              />
            </Box>
          }
        </Card>
      ) : (
        <>
          <FormControlLabel
            control={<Switch checked={myTasks} />}
            label={strings.sprint.showMyTasks}
            onClick={() => handleOnClickTask()}
          />
          <TaskStatusFilter setFilter={setFilter} />
          <Card
            sx={{
              margin: 0,
              width: "100%",
              height: "100",
              marginBottom: "16px",
              marginTop: "16px",
              padding: "0px",
              "& .negative-value": {
                color: "red"
              }
            }}
          >
            <DataGrid
              sx={{
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
              rows={allocations}
              columns={columns}
            />
            <Box
              sx={{
                backgroundColor: "#e6e6e6",
                display: "flex",
                justifyContent: "space-between",
                padding: "5px",
                paddingTop: "10px",
                paddingBottom: "10px"
              }}
            >
              <Typography>
                {strings.sprint.unAllocated}
                <span
                  style={{
                    paddingLeft: "5px",
                    color: unallocatedTime(allocations) < 0 ? "red" : ""
                  }}
                >
                  {getHoursAndMinutes(unallocatedTime(allocations))}
                </span>
              </Typography>
              <Typography style={{ paddingRight: "5px" }}>
                {strings.formatString(
                  strings.sprint.current,
                  sprintStartDate.toLocaleString(),
                  sprintEndDate.toLocaleString()
                )}
              </Typography>
            </Box>
          </Card>
          {projects.map((project) => (
            <TaskTable
              key={project.id}
              project={project}
              loggedInPersonId={myTasks ? loggedInPerson?.id : undefined}
              filter={filter}
            />
          ))}
        </>
      )}
    </>
  );
};

export default SprintViewScreen;

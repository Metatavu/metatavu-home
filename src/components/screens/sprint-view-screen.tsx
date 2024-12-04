import { useState, useEffect } from "react";
import {
  Card,
  CircularProgress,
  Typography,
  Box,
  FormControlLabel,
  Switch,
} from "@mui/material";
import { useLambdasApi } from "src/hooks/use-api";
import type { Person } from "src/generated/client";
import { useAtomValue, useSetAtom } from "jotai";
import { personsAtom } from "src/atoms/person";
import config from "src/app/config";
import { userProfileAtom } from "src/atoms/auth";
import type {
  Allocations,
  Projects,
  ResourceAllocations,
  ResourceAllocationsPhase,
  ResourceAllocationsProject,
  TimeEntries,
  User,
} from "src/generated/homeLambdasClient/models/";
import { DataGrid } from "@mui/x-data-grid";
import {
  getHoursAndMinutes,
  getSprintEnd,
  getSprintStart,
} from "src/utils/time-utils";
import TaskTable from "src/components/sprint-view-table/tasks-table";
import strings from "src/localization/strings";
import sprintViewProjectsColumns from "src/components/sprint-view-table/sprint-projects-columns";
import { errorAtom } from "src/atoms/error";
import {
  calculateWorkingLoad,
  totalAllocations,
  filterAllocationsAndProjects,
  getSeveraUserId,
} from "src/utils/sprint-utils";
import { TaskStatusFilter } from "src/components/sprint-view-table/menu-Item-filter-table";
import { usersAtom } from "src/atoms/user";
import { get } from "react-hook-form";

/**
 * Sprint view screen component
 */
const SprintViewScreen = () => {
  const { resourceAllocationsApi, projectsApi, timeEntriesApi } =
    useLambdasApi();
  // const persons: Person[] = useAtomValue(personsAtom);
  const users = useAtomValue(usersAtom);
  const userProfile = useAtomValue(userProfileAtom);
  const loggedInUser = users.find(
    (users: User) => users.id === userProfile?.id
  );
  // const loggedInUser = persons.find(
  //   (person: Person) =>
  //     person.id === config.person.forecastUserIdOverride ||
  //     person.keycloakId === userProfile?.id
  // );
  // const [allocations, setAllocations] = useState<Allocations[]>([]);
  const [resourceAllocations, setResourceAllocations] = useState<
    ResourceAllocations[]
  >([]);
  const [resourceAllocationsProject, setResourceAllocationsProject] = useState<
    ResourceAllocationsProject[]
  >([]);
  const [resourceAllocationsPhase, setResourceAllocationsPhase] = useState<
    ResourceAllocationsPhase[]
  >([]);
  // const [projects, setProjects] = useState<Projects[]>([]);
  // const [timeEntries, setTimeEntries] = useState<number[]>([]);
  const [loading, setLoading] = useState(false);
  const [myTasks, setMyTasks] = useState(true);
  const [filter, setFilter] = useState("");
  const todaysDate = new Date().toISOString();
  const sprintStartDate = getSprintStart(todaysDate);
  const sprintEndDate = getSprintEnd(todaysDate);
  const columns = sprintViewProjectsColumns({
    severaProjectId: resourceAllocationsProject,
    projects: resourceAllocationsProject,
  });
  const setError = useSetAtom(errorAtom);

  /**
   * Get project data if user is logged in
   */
  useEffect(() => {
    fetchProjectDetails();
  }, [loggedInUser]);

  /**
   * Fetch allocations, project names and time entries
   */
  const fetchProjectDetails = async () => {
    if (!loggedInUser) return;

    setLoading(true);
    try {
      const severaUserId = getSeveraUserId(loggedInUser);
      const fetchedResourceAllocations =
        await resourceAllocationsApi.getAllocationsBySeveraUserId({
          severaUserId: severaUserId,
        });
        console.log("Severa User Id", severaUserId);
      console.log(
        "Is this fetched resource allocations hereeeeeeeeeeeeeeeeee",
        fetchedResourceAllocations
      );
      setResourceAllocations([fetchedResourceAllocations]);
      // const fetchedAllocations = await allocationsApi.listAllocations({
      //   startDate: new Date(),
      //   endDate: new Date(),
      //   personId: loggedInUser?.id.toString(),
      // });
      // const fetchedProjects = await projectsApi.listProjects({
      //   startDate: new Date(),
      // });
      // const { filteredAllocations, filteredProjects } =
      //   filterAllocationsAndProjects(fetchedAllocations, fetchedProjects);
      // const fetchedTimeEntries = await Promise.all(
      //   filteredAllocations.map(async (allocation) => {
      //     try {
      //       if (allocation.project) {
      //         const totalTimeEntries =
      //           await timeEntriesApi.listProjectTimeEntries({
      //             projectId: allocation.project,
      //             startDate: allocation.startDate,
      //             endDate: allocation.endDate,
      //           });
      //         let totalMinutes = 0;
      //         totalTimeEntries.forEach((timeEntry: TimeEntries) => {
      //           if (loggedInUser && timeEntry.person === loggedInUser.id) {
      //             totalMinutes += timeEntry.timeRegistered || 0;
      //           }
      //         });
      //         return totalMinutes;
      //       }
      //     } catch (error) {
      //       if (allocation.id) {
      //         const message: string = strings
      //           .formatString(
      //             strings.sprintRequestError.fetchAllocationError,
      //             allocation.id.toString(),
      //             error as string
      //           )
      //           .toString();
      //         setError(message);
      //       }
      //     }
      //     return 0;
      //   })
      // );
      // setProjects(filteredProjects);
      // setAllocations(filteredAllocations);
      // setTimeEntries(fetchedTimeEntries);
    } catch (error) {
      setError(`${strings.sprintRequestError.fetchError}, ${error}`);
    }
    setLoading(false);
  };

  /**
   * Calculate total unallocated time for the user in the current 2 week period
   *
   * @param allocation task allocated within a project
   */
  // const unallocatedTime = (allocation: Allocations[]) => {
  //   const totalAllocatedTime = allocation.reduce(
  //     (total, allocation) => total + totalAllocations(allocation),
  //     0
  //   );
  //   return calculateWorkingLoad(loggedInUser) - totalAllocatedTime;
  // };

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
            justifyContent: "center",
          }}
        >
          {
            <Box sx={{ textAlign: "center" }}>
              <Typography>{strings.placeHolder.pleaseWait}</Typography>
              <CircularProgress
                sx={{
                  scale: "150%",
                  mt: "5%",
                  mb: "5%",
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
                color: "red",
              },
            }}
          >
            <DataGrid
              sx={{
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
              rows={resourceAllocationsProject}
              columns={columns}
            />
            <Box
              sx={{
                backgroundColor: "#e6e6e6",
                display: "flex",
                justifyContent: "space-between",
                padding: "5px",
                paddingTop: "10px",
                paddingBottom: "10px",
              }}
            >
              {/* <Typography>
                {strings.sprint.unAllocated}
                <span
                  style={{
                    paddingLeft: "5px",
                    color:
                      unallocatedTime(resourceAllocations) < 0 ? "red" : "",
                  }}
                >
                  {getHoursAndMinutes(unallocatedTime(resourceAllocations))}
                </span>
              </Typography> */}
              <Typography style={{ paddingRight: "5px" }}>
                {strings.formatString(
                  strings.sprint.current,
                  sprintStartDate.toLocaleString(),
                  sprintEndDate.toLocaleString()
                )}
              </Typography>
            </Box>
          </Card>
          {resourceAllocationsProject.map((project) => (
            <TaskTable
              key={project.severaProjectId}
              project={project}
              loggedInPersonId={myTasks ? Number(loggedInUser?.id) : undefined}
              filter={filter}
            />
          ))}
        </>
      )}
    </>
  );
};

export default SprintViewScreen;

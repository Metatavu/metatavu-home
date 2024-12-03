import { useAtom, useAtomValue, useSetAtom } from "jotai";
import { useEffect, useState } from "react";
import { personsAtom } from "src/atoms/person";
import { userProfileAtom } from "src/atoms/auth";
import type { Person } from "src/generated/client";
import config from "src/app/config";
import { useLambdasApi } from "src/hooks/use-api";
import type { TimeEntries, User } from "src/generated/homeLambdasClient";
import { CardContent, Skeleton, Typography } from "@mui/material";
import SprintViewBarChart from "src/components/charts/sprint-view-bar-chart";
import type { SprintViewChartData } from "src/types";
import strings from "src/localization/strings";
import {
  totalAllocations,
  filterAllocationsAndProjects,
} from "src/utils/sprint-utils";
import { errorAtom } from "src/atoms/error";
import {
  allocationsAtom,
  projectsAtom,
  timeEntriesAtom,
} from "src/atoms/sprint-data";
import { usersAtom } from "src/atoms/user";

/**
 * Sprint card component for users
 */
const UserSprintViewCard = () => {
  const [loading, setLoading] = useState(false);
  // const [persons] = useAtom(personsAtom);
  const users = useAtomValue(usersAtom);
  const userProfile = useAtomValue(userProfileAtom);
  // const loggedInPerson = persons.find(
  //   (person: Person) =>
  //     person.id === config.person.forecastUserIdOverride || person.keycloakId === userProfile?.id
  // );
  const loggedInUser = users.find(
    (users: User) => users.id === userProfile?.id
  );
  // const [allocations, setAllocations] = useAtom(allocationsAtom);
  // const [projects, setProjects] = useAtom(projectsAtom);
  // const [timeEntries, setTimeEntries] = useAtom(timeEntriesAtom);
  const [resourceAllocations, setResourceAllocations] = useState<
    ResourceAllocations[]
  >([]);
  const [resourceAllocationsProject, setResourceAllocationsProject] = useState<
    ResourceAllocationsProject[]
  >([]);
  const [resourceAllocationsPhase, setResourceAllocationsPhase] = useState<
    ResourceAllocationsPhase[]
  >([]);
  // const { allocationsApi, projectsApi, timeEntriesApi } = useLambdasApi();
  const { resourceAllocationsApi, projectsApi, timeEntriesApi } =
    useLambdasApi();
  const setError = useSetAtom(errorAtom);

  useEffect(() => {
    getAllocationsAndProjects();
  }, [loggedInUser]);

  /**
   * Get allocations, projects names, colors and time entries
   */
  const getAllocationsAndProjects = async () => {
    setLoading(true);
    if (loggedInUser && !resourceAllocations.length) {
      try {
        const severaUserId = getSeveraUserId(loggedInUser);
        const fetchedResourceAllocations =
          await resourceAllocationsApi.getAllocationsBySeveraUserId({
            severaUserId: severaUserId,
          });
        console.log(
          "Is this correct hereeeeeeeeeeeeeeeeee",
          fetchedResourceAllocations
        );
        setResourceAllocations([fetchedResourceAllocations]);
        // const fetchedAllocations = await allocationsApi.listAllocations({
        //   personId: loggedInPerson.id.toString(),
        //   startDate: new Date(),
        //   endDate: new Date(),
        // });
        // const fetchedProjects = await projectsApi.listProjects({
        //   startDate: new Date(),
        // });
        // const { filteredAllocations, filteredProjects } =
        //   filterAllocationsAndProjects(fetchedAllocations, fetchedProjects);
        // const totalTimeEntries = await Promise.all(
        //   filteredAllocations.map(async (allocation) => {
        //     try {
        //       if (allocation.project) {
        //         const fetchedTimeEntries =
        //           await timeEntriesApi.listProjectTimeEntries({
        //             projectId: allocation.project,
        //             startDate: allocation.startDate,
        //             endDate: allocation.endDate,
        //           });
        //         let totalMinutes = 0;
        //         fetchedTimeEntries.map((timeEntry: TimeEntries) => {
        //           if (
        //             loggedInPerson &&
        //             timeEntry.person === loggedInPerson.id
        //           ) {
        //             totalMinutes += timeEntry.timeRegistered || 0;
        //           }
        //         });
        //         return totalMinutes;
        //       }
        //     } catch (error) {
        //       setError(
        //         `${strings.sprintRequestError.fetchTimeEntriesError}, ${error}`
        //       );
        //     }
        //     return 0;
        //   })
        // );
        // setProjects(filteredProjects);
        // setAllocations(filteredAllocations);
        // setTimeEntries(totalTimeEntries);
      } catch (error) {
        setError(`${strings.sprintRequestError.fetchError}, ${error}`);
      }
    }
    setLoading(false);
  };

  /**
   * Combines allocations and projects data for chart
   */
  const createChartData = (): SprintViewChartData[] => {
    return resourceAllocations.map((allocation, index) => {
      return {
        id: index,
        projectName: resourceAllocationsProject[index].name || "",
        // timeAllocated: totalAllocations(allocation),
        // timeEntries: timeEntries[index],
        // color: projects[index].color || "",
      };
    });
  };

  /**
   * Renders sprint view bar chart
   */
  const renderBarChart = () => (
    <>
      {resourceAllocations.length ? (
        <CardContent sx={{ display: "flex", justifyContent: "left" }}>
          <SprintViewBarChart chartData={createChartData()} />
        </CardContent>
      ) : (
        <Typography style={{ paddingLeft: "0" }}>
          {strings.sprint.noAllocation}
        </Typography>
      )}
    </>
  );

  return <>{!loggedInUser || loading ? <Skeleton /> : renderBarChart()}</>;
};

export default UserSprintViewCard;

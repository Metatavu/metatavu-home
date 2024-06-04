import { useAtom, useAtomValue, useSetAtom } from "jotai";
import { useEffect, useState } from "react";
import { personsAtom } from "src/atoms/person";
import { userProfileAtom } from "src/atoms/auth";
import { Person } from "src/generated/client";
import config from "src/app/config";
import { useLambdasApi } from "src/hooks/use-api";
import { Allocations, Projects, TimeEntries } from "src/generated/homeLambdasClient";
import { CardContent, Skeleton, Typography } from "@mui/material";
import SprintViewBarChart from "src/components/charts/sprint-view-bar-chart";
import { SprintViewChartData } from "src/types";
import strings from "src/localization/strings";
import { totalAllocations, filterAllocationsAndProjects } from "src/utils/sprint-utils";
import { errorAtom } from "src/atoms/error";

/**
 * Sprint card component for users
 */
const UserSprintViewCard = () => {
  const [loading, setLoading] = useState(false);
  const [persons] = useAtom(personsAtom);
  const userProfile = useAtomValue(userProfileAtom);
  const loggedInPerson = persons.find(
    (person: Person) => person.id === config.person.forecastUserIdOverride || person.keycloakId === userProfile?.id
  );
  const [allocations, setAllocations] = useState<Allocations[]>([]);
  const [projects, setProjects] = useState<Projects[]>([]);
  const [timeEntries, setTimeEntries] = useState<number[]>([]);
  const { allocationsApi, projectsApi, timeEntriesApi } = useLambdasApi();
  const setError = useSetAtom(errorAtom);

  useEffect(() => {
    getAllocationsAndProjects();
  }, [loggedInPerson]);

  /**
   * Get allocations, projects names, colors and time entries
   */
  const getAllocationsAndProjects = async () => {
    setLoading(true);
    if (loggedInPerson) {
      try {
        let fetchedAllocations = await allocationsApi.listAllocations({
          personId: loggedInPerson.id.toString(),
          startDate: new Date(),
          endDate: new Date()
        });
        const fetchedProjects = await projectsApi.listProjects();
        const {filteredallocations, filteredProjects} = filterAllocationsAndProjects(fetchedAllocations, fetchedProjects);
        const totalTimeEntries = await Promise.all(filteredallocations.map(async (allocation) => {
          try {
            if (allocation.project) {
              const fetchedTimeEntries = await timeEntriesApi.listProjectTimeEntries({
                projectId: allocation.project,
                startDate: allocation.startDate,
                endDate: allocation.endDate
              });
              let totalMinutes = 0;
              fetchedTimeEntries.forEach((timeEntry: TimeEntries) => {
                if (loggedInPerson && timeEntry.person === loggedInPerson.id) {
                  totalMinutes += (timeEntry.timeRegistered || 0);
                }
              });
              return totalMinutes;
            }
          } catch (error) {
            setError(`${strings.sprintRequestError.fetchTimeEntriesError}, ${error}`);
          }
          return 0;
        }));
        setProjects(filteredProjects);
        setAllocations(filteredallocations);
        setTimeEntries(totalTimeEntries);
      } catch (error) {
        setError(`${strings.sprintRequestError.fetchError}, ${error}`);
      }
    }
    setLoading(false);
  }

  /**
   * Combines allocations and projects data for chart
   */
  const createChartData = (): SprintViewChartData[] => {
    return allocations.map((allocation, index) => {
      return {
        projectName: projects[index].name || "",
        timeAllocated: totalAllocations(allocation),
        timeEntries: timeEntries[index],
        color: projects[index].color || ""
      };
    })
  }

  /**
   * Renders sprint view bar chart
   */
  const renderBarChart = () =>
    <>
      {allocations.length ?
        <CardContent sx={{ display: "flex", justifyContent: "left" }}>
          <SprintViewBarChart chartData={createChartData()} />
        </CardContent>
        :
        <Typography style={{ paddingLeft: "0" }}>{strings.sprint.noAllocations}</Typography>
      }
    </>

  return (
    <>
      {!loggedInPerson || loading ?
        <Skeleton /> : renderBarChart()
      }
    </>
  )
}

export default UserSprintViewCard;
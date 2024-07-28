import type { Person } from "src/generated/client";
import type {
  Allocations,
  AllocationsApi,
  Projects,
  ProjectsApi,
  Tasks,
  TimeEntries,
  TimeEntriesApi
} from "src/generated/homeLambdasClient";
import strings from "src/localization/strings";

/**
 * Retrieve total time entries for an allocation
 *
 * @param allocation allocation
 * @param allocations list of allocations
 * @param timeEntries list of total time entries associated with allocations
 */
export const getTotalTimeEntriesAllocations = (
  allocation: Allocations,
  allocations: Allocations[],
  timeEntries: number[]
) => {
  if (timeEntries.length) {
    return timeEntries[allocations.indexOf(allocation)] || 0;
  }
  return 0;
};

/**
 * Retrieve total time entries for a task
 *
 * @param task task of allocated project
 * @param tasks list of tasks related to the project
 * @param timeEntries list of total time associated with tasks
 */
export const getTotalTimeEntriesTasks = (task: Tasks, tasks: Tasks[], timeEntries: number[]) => {
  if (timeEntries.length) {
    return timeEntries[tasks.indexOf(task)] || 0;
  }
  return 0;
};

/**
 * Get project name
 *
 * @param allocation allocation
 * @param allocations list of allocations
 * @param projects list of project associated with the allocations
 */
export const getProjectName = (
  allocation: Allocations,
  allocations: Allocations[],
  projects: Projects[]
) => {
  if (projects.length) {
    return projects[allocations.indexOf(allocation)]?.name || "";
  }
  return "";
};

/**
 * Get project color
 *
 * @param allocation allocation
 * @param allocations list of allocations
 * @param projects list of projects associated with allocations
 */
export const getProjectColor = (
  allocation: Allocations,
  allocations: Allocations[],
  projects: Projects[]
) => {
  if (projects.length) {
    return projects[allocations.indexOf(allocation)]?.color || "";
  }
  return "";
};

/**
 * Calculate total time allocated to the project for 2 week period
 *
 * @param allocation expected work load of user in minutes
 */
export const totalAllocations = (allocation: Allocations) => {
  const totalMinutes =
    (allocation.monday || 0) +
    (allocation.tuesday || 0) +
    (allocation.wednesday || 0) +
    (allocation.thursday || 0) +
    (allocation.friday || 0);
  return totalMinutes * 2;
};

/**
 * Calculate the remaining time of project completion
 *
 * @param allocation allocation
 * @param allocations list of allocations
 * @param projects list of projects associated with allocations
 */
export const timeLeft = (
  allocation: Allocations,
  allocations: Allocations[],
  timeEntries: number[]
) => {
  return (
    totalAllocations(allocation) -
      getTotalTimeEntriesAllocations(allocation, allocations, timeEntries) || 0
  );
};

/**
 * Calculate registered time for the user in the current 2 week period
 *
 * @param person user time spent on the project in minutes
 */
export const calculateWorkingLoad = (person?: Person) => {
  if (!person) return 0;

  const totalMinutes =
    (person.monday || 0) +
    (person.tuesday || 0) +
    (person.wednesday || 0) +
    (person.thursday || 0) +
    (person.friday || 0);
  return totalMinutes * 2;
};

/**
 * Filter allocations and projects if project is not running
 *
 * @param allocations allocations
 * @param projects list of running projects
 */
export const filterAllocationsAndProjects = (allocations: Allocations[], projects: Projects[]) => {
  const filteredProjects: Projects[] = [];
  const filteredAllocations = allocations.filter((allocation) =>
    projects.find((project) => allocation.project === project.id)
  );
  filteredAllocations.map((allocation) => {
    const allocationProject = projects.find((project) => allocation.project === project.id);
    if (allocationProject) filteredProjects.push(allocationProject);
  });
  return { filteredAllocations, filteredProjects };
};
/**
 *  component properties
 */
interface Props {
  setError: (error: string) => void;
  person: Person;
  allocationsApi: AllocationsApi;
  projectsApi: ProjectsApi;
  timeEntriesApi: TimeEntriesApi;
}

/**
 * Fetch allocations, project names and time entries
 */
export const fetchProjectDetails = async ({
  setError,
  person,
  allocationsApi,
  projectsApi,
  timeEntriesApi
}: Props) => {
  try {
    const fetchedAllocations = await allocationsApi.listAllocations({
      startDate: new Date(),
      endDate: new Date(),
      personId: person?.id.toString()
    });
    const fetchedProjects = await projectsApi.listProjects({ startDate: new Date() });
    const { filteredAllocations, filteredProjects } = filterAllocationsAndProjects(
      fetchedAllocations,
      fetchedProjects
    );
    const fetchedTimeEntries = await Promise.all(
      filteredAllocations.map(async (allocation) => {
        try {
          if (allocation.project) {
            const totalTimeEntries = await timeEntriesApi.listProjectTimeEntries({
              projectId: allocation.project,
              startDate: allocation.startDate,
              endDate: allocation.endDate
            });
            let totalMinutes = 0;
            totalTimeEntries.forEach((timeEntry: TimeEntries) => {
              if (person && timeEntry.person === person.id) {
                totalMinutes += timeEntry.timeRegistered || 0;
              }
            });
            return totalMinutes;
          }
        } catch (error) {
          if (allocation.id) {
            const message: string = strings
              .formatString(
                strings.sprintRequestError.fetchAllocationError,
                allocation.id.toString(),
                error as string
              )
              .toString();
            setError(message);
          }
        }
        return 0;
      })
    );
    return { filteredAllocations, filteredProjects, fetchedTimeEntries };
  } catch (error) {
    setError(`${strings.sprintRequestError.fetchError}, ${error}`);
    return { filteredAllocations: [], filteredProjects: [], fetchedTimeEntries: [] };
  }
};

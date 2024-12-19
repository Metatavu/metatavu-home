import config from "src/app/config";
import type { Person } from "src/generated/client";
import type {
  Allocations,
  Projects,
  ResourceAllocations,
  ResourceAllocationsPhase,
  ResourceAllocationsProject,
  Tasks,
  User,
  WorkHours,
} from "src/generated/homeLambdasClient";
import { ResourceAllocationsInner } from "src/generated/homeLambdasClient/models/ResourceAllocationsInner";
import { ResourceAllocationsInnerPhase } from "src/generated/homeLambdasClient/models/ResourceAllocationsInnerPhase";
import { ResourceAllocationsInnerProjects } from "src/generated/homeLambdasClient/models/ResourceAllocationsInnerProjects";
import { ResourceAllocationsInnerUsers } from "src/generated/homeLambdasClient/models/ResourceAllocationsInnerUsers";

/**
 * Retrieve total time entries for an allocation
 *
 * @param allocation allocation
 * @param allocations list of allocations
 * @param timeEntries list of total time entries associated with allocations
 */
export const getTotalTimeEntriesAllocations = (
  allocation: ResourceAllocations,
  allocations: ResourceAllocations[],
  workHours: WorkHours[]
) => {
  if (workHours.length) {
    return workHours[allocations.indexOf(allocation)] || 0;
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
export const getTotalTimeEntriesTasks = (
  task: Tasks,
  tasks: Tasks[],
  timeEntries: number[]
) => {
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
  project: ResourceAllocationsInnerProjects,
  projects: ResourceAllocationsInner[]
) => {
  const foundProject = projects.find(
    (p) => p.project?.severaProjectId === project.severaProjectId
  );

  if (foundProject) {
    return foundProject.project?.name;
  }
};

export const getAssigneName = (
  user: ResourceAllocationsInnerUsers,
  users: ResourceAllocationsInner[]
) => {
  const foundUser = users.find(
    (u) => u.user?.severaUserId === user.severaUserId
  );

  if (foundUser) {
    return foundUser.user?.name;
  }
};

export const getAssigneNamePhase = (
  user: ResourceAllocationsInnerPhase,
  users: ResourceAllocationsInner[]
) => {
  const foundAssignee = users.find(
    (p) => p.phase?.severaPhaseId === user.severaPhaseId
  );
  if (foundAssignee) {
    return foundAssignee.user?.name;
  }
};

export const getPhaseName = (
  phase: ResourceAllocationsInnerPhase,
  phases: ResourceAllocationsInner[]
) => {
  const foundPhase = phases.find(
    (p) => p.phase?.severaPhaseId === phase.severaPhaseId
  );

  if (foundPhase) {
    return foundPhase.phase?.name;
  }
};

// export const getAllocationHour = (
//   allocation: ResourceAllocationsInner,
//   allocations: ResourceAllocationsInner[],
// ) => {
//   if (workHours.length) {
//     return workHours[allocations.indexOf(allocation)] || 0;
//   }
//   return 0;
// }
// )

/**
 * Get project color
 *
 * @param allocation allocation
 * @param allocations list of allocations
 * @param projects list of projects associated with allocations
 */
// export const getProjectColor = (
//   allocation: ResourceAllocations,
//   allocations: ResourceAllocations[],
//   projects: Projects[]
// ) => {
//   if (projects.length) {
//     return projects[allocations.indexOf(allocation)]?.color || "";
//   }
//   return "";
// };

/**
 * Calculate total time allocated to the project for 2 week period
 *
 * @param allocation expected work load of user in minutes
 */
// export const totalAllocations = (allocation: Allocations) => {
//   const totalMinutes =
//     (allocation.monday || 0) +
//     (allocation.tuesday || 0) +
//     (allocation.wednesday || 0) +
//     (allocation.thursday || 0) +
//     (allocation.friday || 0);
//   return totalMinutes * 2;
// };

/**
 * Calculate the remaining time of project completion
 *
 * @param allocation allocation
 * @param allocations list of allocations
 * @param projects list of projects associated with allocations
 */
// export const timeLeft = (
//   allocation: ResourceAllocations,
//   allocations: ResourceAllocations[],
//   workHours: WorkHours[]
// ) => {
//   return (
//     totalAllocations(allocation) -
//       getTotalTimeEntriesAllocations(allocation, allocations, timeEntries) || 0
//   );
// };

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
export const filterAllocationsAndProjects = (
  allocations: Allocations[],
  projects: Projects[]
) => {
  const filteredProjects: Projects[] = [];
  const filteredAllocations = allocations.filter((allocation) =>
    projects.find((project) => allocation.project === project.id)
  );
  for (const allocation of filteredAllocations) {
    const allocationProject = projects.find(
      (project) => allocation.project === project.id
    );
    if (allocationProject) filteredProjects.push(allocationProject);
  }
  return { filteredAllocations, filteredProjects };
};

export const getSeveraUserId = (user: User | undefined): string => {
  return user?.attributes?.severaUserId ?? config.user.testUserSeveraId ?? "";
};

export const getSeveraProjectId = (
  project: ResourceAllocationsInnerProjects | undefined
): string => {
  return (
    project?.attributes?.severaProjectId ?? config.phase.testPhaseSeveraId ?? ""
  );
};

export const getSeveraProjectIds = (
  projects: ResourceAllocationsInnerProjects[] | undefined
): string[] => {
  if (!projects || projects.length === 0) return [];

  return projects
    .map((project) => project?.attributes?.severaProjectId)
    .filter((id): id is string => !!id); // Filter out undefined or empty IDs
};

// Function to filter tasks based on severaProjectId and extract task names
export const getTaskNamesByProjectId = (
  phases: any[], // The fetched phases data
  targetProjectId: string // The project ID to match
): string[] => {
  return phases
    .filter((phase) => phase.project?.severaProjectId === targetProjectId) // Filter by project ID
    .map((phase) => phase.name); // Extract only the task names
};

// export const filterAllocationsAndProjectsSevera = (
//   allocations: ResourceAllocationsInner[],
//   projects: ResourceAllocationsProject[]
// ) => {
//   const filteredProjects: ResourceAllocationsInnerProjects[] = [];
//   const filteredAllocations = allocations.filter((allocation) =>
//     projects.find((project) => allocation.project. === project.severaProjectId)
//   );
//   for (const allocation of filteredAllocations) {
//     const allocationProject = projects.find(
//       (project) => allocation.project === project.id
//     );
//     if (allocationProject) filteredProjects.push(allocationProject);
//   }
//   return { filteredAllocations, filteredProjects };
// };

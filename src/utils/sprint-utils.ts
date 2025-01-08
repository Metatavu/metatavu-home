import config from "src/app/config";
import type { ResourceAllocations, ResourceAllocationsPhase, ResourceAllocationsProject, ResourceAllocationsUser, User, WorkHours } from "src/generated/homeLambdasClient";

/**
 * Get project name
 *
 * @param project project with type of ResourceAllocationsProject
 * @param projects list of projects with type of ResourceAllocations[]
 * 
 * @returns project name
 */
export const getProjectName = (
  project: ResourceAllocationsProject,
  projects: ResourceAllocations[]
) => {
  const foundProject = projects.find(
    (p) => p.project?.severaProjectId === project.severaProjectId
  );

  if (foundProject) {
    return foundProject.project?.name;
  }
};

/**
 * Get assignee name
 *
 * @param user user with type of ResourceAllocationsUser
 * @param users list of users with type of ResourceAllocations[]
 * 
 * @returns user name
 */
export const getAssigneName = (
  user: ResourceAllocationsUser,
  users: ResourceAllocations[]
) => {
  const foundUser = users.find(
    (u) => u.user?.severaUserId === user.severaUserId
  );

  if (foundUser) {
    return foundUser.user?.name;
  }
};

/**
 * Get phase name
 *
 * @param phase phase with type of ResourceAllocationsPhase
 * @param phases list of phases with type of ResourceAllocations[]
 * 
 * @returns phase name
 */
export const getPhaseName = (
  phase: ResourceAllocationsPhase,
  phases: ResourceAllocations[]
) => {
  const foundPhase = phases.find(
    (p) => p.phase?.severaPhaseId === phase.severaPhaseId
  );

  if (foundPhase) {
    return foundPhase.phase?.name;
  }
};

/**
 * Get work hour
 *
 * @param severaPhaseId phase id with type string
 * @param workHours list of workHours with type of WorkHours[]
 * 
 * @returns WorkHours for each phases
 */
export const getWorkHour = (severaPhaseId: string, workHours: WorkHours[]) => {
  const foundPhase = workHours.find(
    (p) => p.phase?.severaPhaseId === severaPhaseId
  );

  return foundPhase ? foundPhase.quantity : undefined;
};

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
 * Get severa user id
 *
 * @param user with type of User
 * 
 * @returns severaUserId 
 */
export const getSeveraUserId = (user: User): string => {
  return user?.attributes?.severaUserId ?? config.user.testUserSeveraId ?? "";
};

/**
 * Formating date from Severa's date format
 *
 * @param date type string
 * 
 * @returns date in format of "dd MMM yyyy"
 */
export const formatDateSevera = (date: string) => {
  return new Date(date).toLocaleDateString("en-US", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
};
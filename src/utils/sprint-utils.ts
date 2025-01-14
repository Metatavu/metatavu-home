import config from "src/app/config";
import type { Phase, ResourceAllocations, ResourceAllocationsPhase, ResourceAllocationsProject, ResourceAllocationsUser, User, WorkHours } from "src/generated/homeLambdasClient";

/**
 * Get project name
 *
 * @param project project with type ResourceAllocationsProject
 * @param projects list of projects with type ResourceAllocations[]
 * 
 * @returns project name
 */
export const getProjectName = (
  project: ResourceAllocationsProject,
  resourceAllocations: ResourceAllocations[]
) => {
  const foundProject = resourceAllocations.find(
    (resourceAllocations) => resourceAllocations.project?.severaProjectId === project.severaProjectId
  );

  if (foundProject) {
    return foundProject.project?.name;
  }
};

/**
 * Get assignee name
 *
 * @param user user with type ResourceAllocationsUser
 * @param users list of users with type ResourceAllocations[]
 * 
 * @returns user name
 */
export const getAssigneName = (
  user: ResourceAllocationsUser,
  resourceAllocations: ResourceAllocations[]
) => {
  const foundUser = resourceAllocations.find(
    (resourceAllocations) => resourceAllocations.user?.severaUserId === user.severaUserId
  );
  if (foundUser) {
    return foundUser.user?.name|| "";
  }
};

/**
 * Get phase name
 *
 * @param phase phase with type ResourceAllocationsPhase
 * @param phases list of phases with type ResourceAllocations[]
 * 
 * @returns phase name
 */
export const getPhaseName = (
  phase: ResourceAllocationsPhase,
  resourceAllocations: ResourceAllocations[]
) => {
  const foundPhase = resourceAllocations.find(
    (resourceAllocations) => resourceAllocations.phase?.severaPhaseId === phase.severaPhaseId
  );

  if (foundPhase) {
    return foundPhase.phase?.name || "";
  }
};

/**
 * Get work hour
 *
 * @param severaPhaseId phase id with type string
 * @param workHours list of workHours with type WorkHours[]
 * 
 * @returns WorkHours for each phases
 */
export const getWorkHour = (severaPhaseId: string, workHours: WorkHours[]) => {
  const foundPhase = workHours.find(
    (workHours) => workHours.phase?.severaPhaseId === severaPhaseId
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
 * @param user user with type User
 * 
 * @returns severaUserId 
 */
export const getSeveraUserId = (user: User): string => {
  return user?.attributes?.severaUserId ?? config.user.testUserSeveraId ?? "";
};

/**
 * Formating date from Severa's date format
 *
 * @param date date with type string
 * 
 * @returns date in format of "dd MMM yyyy"
 */
export const formatDateSevera = (date: string) => {
  return new Date(date).toLocaleDateString("fi-FI", {
    day: "2-digit",
    month: "numeric",
    year: "numeric",
  });
};

export const mapPhasesToRows = (phase: Phase, workHours: WorkHours[]) => {
  const actualWorkHours = getWorkHour(
    phase.severaPhaseId || "Severa Phase Id not found",
    workHours
  );
  
  return {
    id: phase.severaPhaseId,
    title: phase.name,
    estimateWorkHours: phase.workHoursEstimate,
    startDate: phase.startDate?.toISOString().split("T")[0],
    deadLine: formatDateSevera(phase.deadline?.toISOString() || ""),
    actualWorkHours: actualWorkHours || "0",
  };
};
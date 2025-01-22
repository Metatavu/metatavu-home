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

// TODO: Fixing this function in the future
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
 * Get total work hours for each phase 
 * 
 * @param workHours with type WorkHours[]
 * @param phase with type Phase
 * @param userId with type string
 * 
 * @returns total work hours for each phase according to the userId
 */
const totalWorkHours = (workHours: WorkHours[], phase: Phase, userId: string) => {
  return workHours
    .filter(workHour => workHour.phase?.severaPhaseId === phase.severaPhaseId && workHour.user?.severaUserId === userId)
    .reduce((total, workHour) => total + (workHour.quantity || 0), 0);
}

/**
 * Get phases's assignee
 * 
 * @param workHours with type WorkHours[]
 * @param userId with type string
 * 
 * @returns assignee's name excludes given userId
 */
const getAssigneeWorkHours = (workHours: WorkHours[]) => {
  const assignee = new Set(
    workHours.map((workHour) => workHour.user?.name)
  );
  return Array.from(assignee).join(", ");
};

/**
 * Mapping phases to rows for datagrid
 * 
 * @param phase Phase
 * @param workHours WorkHours[]
 * 
 * @returns PhaseRow
 */
export const mapPhasesToRows = (phase: Phase, workHours: WorkHours[], userId: string) => {
  return {
    id: phase.severaPhaseId || "",
    title: phase.name || "",
    estimateWorkHours: phase.workHoursEstimate || "0",
    startDate: phase.startDate?.toISOString().split("T")[0] || "",
    deadline: phase.deadline?.toISOString().split("T")[0] || "",
    actualWorkHours: totalWorkHours(workHours, phase, userId),
    assignee: getAssigneeWorkHours(workHours),
  };
};

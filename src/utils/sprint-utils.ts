import config from "src/app/config";
import type {
  Phase,
  ResourceAllocations,
  ResourceAllocationsPhase,
  ResourceAllocationsProject,
  User,
  WorkHours
} from "src/generated/homeLambdasClient";
import type { PhaseRow } from "../types";

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
    (resourceAllocations) =>
      resourceAllocations.project?.severaProjectId === project.severaProjectId
  );

  if (foundProject) {
    return foundProject.project?.name;
  }
};

/**
 * Get assignee name
 *
 * @param resourceAllocations resourceAllocations with type ResourceAllocations[]
 * @param project project with type ResourceAllocationsProject
 *
 * @returns user name
 */
export const getAssigneName = (
  resourceAllocations: ResourceAllocations[],
  project: ResourceAllocationsProject
) => {
  const user = new Map();
  resourceAllocations
    .filter((allocation) => allocation.project?.severaProjectId === project.severaProjectId)
    .forEach((allocation) => {
      user.set(allocation.user?.severaUserId, allocation.user?.name);
    });
  return Array.from(user.values()).join(", ");
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
const totalWorkHours = (
  workHours: WorkHours[],
  phase: Phase,
  userId: string,
  adminMode: boolean
) => {
  if (adminMode) {
    return workHours
      .filter((workHour) => workHour.phase?.severaPhaseId === phase.severaPhaseId)
      .reduce((total, workHour) => total + (workHour.quantity || 0), 0);
  }
  return workHours
    .filter((workHour) => {
      const matchingPhase = workHour.phase?.severaPhaseId === phase.severaPhaseId;
      const matchingUser = workHour.user?.severaUserId === userId;
      return matchingPhase && matchingUser;
    })
    .reduce((total, workHour) => total + (workHour.quantity || 0), 0);
};

/**
 * Get phases's assignee
 *
 * @param workHours with type WorkHours[]
 *
 * @returns assignee's name for each phase
 */
const getAssigneeWorkHours = (workHours: WorkHours[], phase: Phase) => {
  const assigneeMap = new Map();

  workHours.forEach((workHour) => {
    if (workHour.user?.severaUserId && workHour.phase?.severaPhaseId === phase.severaPhaseId) {
      assigneeMap.set(workHour.user.severaUserId, workHour.user.name);
    }
  });
  return Array.from(assigneeMap.values()).join(", ");
};

/**
 * Mapping phases to rows for datagrid
 *
 * @param phase Phase
 * @param workHours WorkHours[]
 * @param userId string
 *
 * @returns PhaseRow
 */
export const mapPhasesToRows = (
  phase: Phase,
  workHours: WorkHours[],
  userId: string,
  resourceAllocations: ResourceAllocations[],
  adminMode: boolean
): PhaseRow | null => {
  const workHour = workHours.find(
    (workHour) =>
      workHour.phase?.severaPhaseId === phase.severaPhaseId &&
      workHour.user?.severaUserId === userId
  );
  return {
    id: phase.severaPhaseId || "",
    title: phase.name || "",
    estimateWorkHours: adminMode
      ? phase.workHoursEstimate || "0"
      : getEstimateHoursUser(resourceAllocations, phase) || "0",
    startDate: phase.startDate?.toISOString().split("T")[0] || "",
    deadline: phase.deadline?.toISOString().split("T")[0] || "",
    actualWorkHours: totalWorkHours(workHours, phase, userId, adminMode),
    assignee: adminMode ? getAssigneeWorkHours(workHours, phase) : workHour?.user?.name || ""
  };
};

/**
 * Get total estimated hours (general) with matching project
 *
 * @param resourceAllocations with type ResourceAllocations[]
 * @param project with type ResourceAllocationsProject
 *
 * @returns total estimated hours for each phase
 */
export const getTotalEstimatedHours = (
  resourceAllocations: ResourceAllocations[],
  project: ResourceAllocationsProject
) => {
  return resourceAllocations
    .filter((allocation) => allocation.project?.severaProjectId === project.severaProjectId)
    .reduce((total, allocation) => total + (allocation.allocationHours || 0), 0);
};

/**
 * Get total estimated hours with matching phase
 *
 * @param resourceAllocations with type ResourceAllocations[]
 * @param phase with type Phase
 *
 * @returns total estimated hours for each phase
 */
export const getEstimateHoursUser = (
  resourceAllocations: ResourceAllocations[],
  phase: Phase
): string | number => {
  return resourceAllocations
    .filter((allocation) => allocation.phase?.severaPhaseId === phase.severaPhaseId)
    .reduce((total, allocation) => total + (allocation.allocationHours || 0), 0);
};

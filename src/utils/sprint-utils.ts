import config from "src/app/config";
import type { ResourceAllocations, ResourceAllocationsPhase, ResourceAllocationsProject, ResourceAllocationsUser, User, WorkHours } from "src/generated/homeLambdasClient";

/**
 * Get project name
 *
 * @param allocation allocation
 * @param allocations list of allocations
 * @param projects list of project associated with the allocations
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

export const getSeveraUserId = (user: User): string => {
  return user?.attributes?.severaUserId ?? config.user.testUserSeveraId ?? "";
};

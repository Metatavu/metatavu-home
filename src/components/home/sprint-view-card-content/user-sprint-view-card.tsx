import { Box, CardContent, Skeleton, Typography } from "@mui/material";
import { useAtomValue, useSetAtom } from "jotai";
import { useEffect, useState } from "react";
import { userProfileAtom } from "src/atoms/auth";
import { errorAtom } from "src/atoms/error";
import { usersAtom } from "src/atoms/user";
import SprintViewBarChart from "src/components/charts/sprint-view-bar-chart";
import SprintViewLegend from "src/components/charts/sprint-view-legend";
import type { ResourceAllocations, User, WorkHours } from "src/generated/homeLambdasClient";
import useSprintViewHandlers from "src/hooks/sprint-custom-hooks";
import { useLambdasApi } from "src/hooks/use-api";
import useUserRole from "src/hooks/use-user-role";
import strings from "src/localization/strings";
import type { SprintViewChartData } from "src/types";
import { getSeveraUserId, getTotalEstimatedHours } from "src/utils/sprint-utils";

/**
 * Sprint card component for users
 */
const SprintViewCardContent = () => {
  const { filterAllocations } = useSprintViewHandlers();
  const { adminMode } = useUserRole();
  const [loading, setLoading] = useState(false);
  const users = useAtomValue(usersAtom);
  const userProfile = useAtomValue(userProfileAtom);
  const loggedInUser = users.find((users: User) => users.id === userProfile?.id);
  const [resourceAllocations, setResourceAllocations] = useState<ResourceAllocations[]>([]);
  const [workHours, setWorkHours] = useState<WorkHours[]>([]);

  const { resourceAllocationsApi, workHoursApi } = useLambdasApi();
  const setError = useSetAtom(errorAtom);
  const filteredAllocations = filterAllocations(resourceAllocations, adminMode);

  useEffect(() => {
    getAllocationsAndProjects();
  }, [loggedInUser]);

  /**
   * Get ResourceAllocation data using severaUserId
   */
  const getAllocationsAndProjects = async () => {
    setLoading(true);
    if (loggedInUser && !resourceAllocations.length) {
      try {
        const severaUserId = getSeveraUserId(loggedInUser);
        const [fetchedResourceAllocations, fetchedWorkHours] = await Promise.all([
          adminMode
            ? resourceAllocationsApi.getAllResourceAllocations()
            : resourceAllocationsApi.getAllResourceAllocations({ severaUserId }),
          workHoursApi.getAllWorkHours({ severaUserId })
        ]);

        setResourceAllocations(fetchedResourceAllocations);
        setWorkHours(fetchedWorkHours);
      } catch (error) {
        setError(`${strings.sprintRequestError.fetchResourceAllocationsError}, ${error}`);
      }
    }
    setLoading(false);
  };
  const getTotalActualWorkHours = (projectId: string) => {
    return workHours
      .filter((workHour) => workHour.project?.severaProjectId === projectId)
      .reduce((total, workHour) => total + (workHour.quantity || 0), 0);
  };

  /**
   * Mapping resource allocation data from Severa to SprintViewChartData type
   */
  const createChartData = (): SprintViewChartData[] => {
    const mapping = filteredAllocations.map((allocation) => {
      const project = allocation.project;
      const estimateHours = project ? getTotalEstimatedHours(resourceAllocations, project) : 0;

      return {
        severaResourceAllocationId: allocation.severaResourceAllocationId || "",
        projectName: allocation.project?.name || "",
        actualWorkHours: project ? getTotalActualWorkHours(project.severaProjectId || "") : 0,
        estimatedWorkHour: estimateHours || ""
      };
    });
    return mapping;
  };

  /**
   * Renders sprint view bar chart
   */
  const renderBarChart = () => (
    <>
      {resourceAllocations.length ? (
        <CardContent>
          <SprintViewBarChart chartData={createChartData()} />
          <Box sx={{ ml: 21, display: "flex" }}>
            <SprintViewLegend />
          </Box>
        </CardContent>
      ) : (
        <Typography style={{ paddingLeft: "0" }}>{strings.sprint.noAllocation}</Typography>
      )}
    </>
  );
  return <>{!loggedInUser || loading ? <Skeleton /> : renderBarChart()}</>;
};

export default SprintViewCardContent;

import { CardContent, Skeleton, Typography } from "@mui/material";
import { useAtomValue, useSetAtom } from "jotai";
import { useEffect, useState } from "react";
import { userProfileAtom } from "src/atoms/auth";
import { errorAtom } from "src/atoms/error";
import { usersAtom } from "src/atoms/user";
import SprintViewBarChart from "src/components/charts/sprint-view-bar-chart";
import type { ResourceAllocations, User } from "src/generated/homeLambdasClient";
import { useLambdasApi } from "src/hooks/use-api";
import strings from "src/localization/strings";
import type { SprintViewChartData } from "src/types";
import {
  getSeveraUserId
} from "src/utils/sprint-utils";

/**
 * Sprint card component for users
 */
const UserSprintViewCard = () => {
  const [loading, setLoading] = useState(false);
  const users = useAtomValue(usersAtom);
  const userProfile = useAtomValue(userProfileAtom);
  const loggedInUser = users.find(
    (users: User) => users.id === userProfile?.id
  );
  const [resourceAllocations, setResourceAllocations] = useState<ResourceAllocations[]>([]);
  const { resourceAllocationsApi } = useLambdasApi();
  const setError = useSetAtom(errorAtom);

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
        const fetchedResourceAllocations =
        await resourceAllocationsApi.getAllocationsBySeveraUserId({
          severaUserId,
        });
        setResourceAllocations(fetchedResourceAllocations);
      } catch (error) {
        setError(`${strings.sprintRequestError.fetchResourceAllocationsError}, ${error}`);
      }
    }
    setLoading(false);
  };

  /**
   * Mapping resource allocation data from Severa to SprintViewChartData type
   */
  const createChartData = (): SprintViewChartData[] => {
    const mapping = resourceAllocations.map((allocation) => {
      return {
        severaResourceAllocationId: allocation.severaResourceAllocationId || "",
        projectName: allocation.project?.name || "",
        actualWorkHours: allocation.calculatedAllocationHours || "",
        estimatedWorkHour: allocation.allocationHours || "",
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
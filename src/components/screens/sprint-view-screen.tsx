import {
  Box,
  Card,
  CircularProgress,
  Typography
} from "@mui/material";
import { DataGrid } from "@mui/x-data-grid";
import { useAtomValue, useSetAtom } from "jotai";
import { useEffect, useState } from "react";
import { userProfileAtom } from "src/atoms/auth";
import { errorAtom } from "src/atoms/error";
import { usersAtom } from "src/atoms/user";
import TaskTable from "src/components/sprint-view-table/tasks-table";
import type {
  ResourceAllocations,
  User
} from "src/generated/homeLambdasClient/models/";
import { useLambdasApi } from "src/hooks/use-api";
import strings from "src/localization/strings";
import { getSeveraUserId } from "src/utils/sprint-utils";
import { getSprintEnd, getSprintStart } from "src/utils/time-utils";
import createSprintViewProjectsColumns from "../sprint-view-table/sprint-projects-columns";

/**
 * Sprint view screen component
 */
const SprintViewScreen = () => {
  const { resourceAllocationsApi } = useLambdasApi();
  const users = useAtomValue(usersAtom);
  const userProfile = useAtomValue(userProfileAtom);
  const loggedInUser = users.find(
    (users: User) => users.id === userProfile?.id
  );
  const [resourceAllocations, setResourceAllocations] = useState<ResourceAllocations[]>();
  const [loading, setLoading] = useState(false);
  const todaysDate = new Date().toISOString();
  const sprintStartDate = getSprintStart(todaysDate);
  const sprintEndDate = getSprintEnd(todaysDate);
  const setError = useSetAtom(errorAtom);

  const columns = createSprintViewProjectsColumns({
    resourceAllocations: resourceAllocations || [],
  });
  
  const allocationRows: ResourceAllocations[] = resourceAllocations?.map((allocation) => ({
    id: allocation.severaResourceAllocationId || "",
    severaResourceAllocationId: allocation.severaResourceAllocationId || "", 
    allocationHours: allocation.allocationHours || 0,
    calculatedAllocationHours: allocation.calculatedAllocationHours || 0,
    phase: allocation.phase || undefined,
    user: allocation.user || undefined,
    project: allocation.project || undefined, 
  })) || [];

  useEffect(() => {
    if(loggedInUser) {
      fetchProjectDetails();
    }
  }, []);

  const fetchProjectDetails = async () => {
    if (!loggedInUser) return;

    setLoading(true);
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
    setLoading(false);
  };

  return (
    <>
      {loading ? (
        <Card
          sx={{
            p: "25%",
            display: "flex",
            justifyContent: "center",
          }}
        >
          {
            <Box sx={{ textAlign: "center" }}>
              <Typography>{strings.placeHolder.pleaseWait}</Typography>
              <CircularProgress
                sx={{
                  scale: "150%",
                  mt: "5%",
                  mb: "5%",
                }}
              />
            </Box>
          }
        </Card>
      ) : (
        <>
          {/* TODO: Need to fetch the status from home-lambdas first for phases, then recreate filter in metatavu-home */}
          {/* <TaskStatusFilter setFilter={setFilter} /> */}
          <Card
            sx={{
              margin: 0,
              width: "100%",
              height: "100",
              marginBottom: "16px",
              marginTop: "16px",
              padding: "0px",
              "& .negative-value": {
                color: "red",
              },
            }}
          >
            <DataGrid
              sx={{
                borderTop: 0,
                borderLeft: 0,
                borderRight: 0,
                borderBottom: 0,
                "& .header-color": {
                  backgroundColor: "#f2f2f2",
                },
              }}
              autoHeight={true}
              localeText={{ noResultsOverlayLabel: strings.sprint.notFound }}
              disableColumnFilter
              hideFooter={true}
              rows={allocationRows || []}
              columns={columns}
            />
            <Box
              sx={{
                backgroundColor: "#e6e6e6",
                display: "flex",
                justifyContent: "space-between",
                padding: "5px",
                paddingTop: "10px",
                paddingBottom: "10px",
              }}
            >
              {/* TODO: Maybe after able to get status, we can add feature color for phases, Example: unfinished phase => colors: red */}
              {/* <Typography>
                <span
                // style={{
                //   paddingLeft: "5px",
                //   color:
                //     unallocatedTime(resourceAllocations) < 0 ? "red" : "",
                // }}
                />
              </Typography> */}
              <Typography style={{ paddingRight: "5px" }}>
                {strings.formatString(
                  strings.sprint.current,
                  sprintStartDate.toLocaleString(),
                  sprintEndDate.toLocaleString()
                )}
              </Typography>
            </Box>
          </Card>
          {resourceAllocations?.map((resourceAllocations) => (
            <TaskTable
              key={resourceAllocations.phase?.severaPhaseId}
              project={resourceAllocations}
              phases={resourceAllocations}
            />
          ))}
        </>
      )}
    </>
  );
};

export default SprintViewScreen;
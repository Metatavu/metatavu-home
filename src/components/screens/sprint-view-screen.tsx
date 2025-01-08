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
import sprintViewProjectsColumns from "src/components/sprint-view-table/sprint-projects-columns";
import TaskTable from "src/components/sprint-view-table/tasks-table";
import type {
  ResourceAllocations,
  ResourceAllocationsProject,
  User,
} from "src/generated/homeLambdasClient/models/";
import { useLambdasApi } from "src/hooks/use-api";
import strings from "src/localization/strings";
import { getSeveraUserId } from "src/utils/sprint-utils";
import { getSprintEnd, getSprintStart } from "src/utils/time-utils";

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
  const [resourceAllocations, setResourceAllocations] =
    useState<ResourceAllocations[]>();
  const [resourceAllocationsProject] = useState<ResourceAllocationsProject[]>([]);
  const [loading, setLoading] = useState(false);
  const [myTasks, setMyTasks] = useState(true);
  const [filter, setFilter] = useState("");
  const todaysDate = new Date().toISOString();
  const sprintStartDate = getSprintStart(todaysDate);
  const sprintEndDate = getSprintEnd(todaysDate);
  const setError = useSetAtom(errorAtom);

  const columns = sprintViewProjectsColumns({
    severaProjectId: resourceAllocationsProject,
    project: resourceAllocations || [],
    resourceAllocations: resourceAllocations || [],
    user: resourceAllocations || [],
    phase: resourceAllocations || [],
  });

  const allocationRows = resourceAllocations?.map((allocation) => ({
    id: allocation.severaResourceAllocationId,
    project: allocation.project,
    calculatedHours: allocation.calculatedAllocationHours,
    estimateHours: allocation.allocationHours,
    tasks: allocation.phase,
    assignee: allocation.user,
  }));

  useEffect(() => {
    fetchProjectDetails();
  }, [loggedInUser]);

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
      setError(`${strings.sprintRequestError.fetchError}, ${error}`);
    }
    setLoading(false);
  };

  // const handleOnClickTask = () => {
  //   setMyTasks(!myTasks);
  //   setFilter("");
  // };

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
          {/* <FormControlLabel
            control={<Switch checked={myTasks} />}
            label={strings.sprint.showMyTasks}
            onClick={() => handleOnClickTask()}
          />
          <TaskStatusFilter setFilter={setFilter} /> */}
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
          {resourceAllocations?.map((project) => (
            <TaskTable
              key={project.phase?.severaPhaseId}
              project={project}
              loggedInPersonId={myTasks ? Number(loggedInUser?.id) : undefined}
              filter={filter}
            />
          ))}
        </>
      )}
    </>
  );
};

export default SprintViewScreen;
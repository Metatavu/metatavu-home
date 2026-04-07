import {
  Box,
  Card,
  CircularProgress,
  Container,
  Divider,
  FormControl,
  InputLabel,
  MenuItem,
  Paper,
  Select,
  Stack,
  Typography,
  useTheme
} from "@mui/material";
import { DataGrid } from "@mui/x-data-grid";
import { useAtomValue, useSetAtom } from "jotai";
import { useCallback, useEffect, useId, useState } from "react";
import { userProfileAtom } from "src/atoms/auth";
import { errorAtom } from "src/atoms/error";
import { usersAtom } from "src/atoms/user";
import TaskTable from "src/components/sprint-view-table/tasks-table";
import type {
  ResourceAllocations,
  ResourceAllocationsProject,
  User
} from "src/generated/homeLambdasClient/models/";
import useSprintViewHandlers from "src/hooks/sprint-custom-hooks";
import { useLambdasApi } from "src/hooks/use-api";
import useUserRole from "src/hooks/use-user-role";
import strings from "src/localization/strings";
import { SprintViewFilterTypes } from "src/types/index";
import { getSeveraUserId } from "src/utils/sprint-utils";
import { getSprintEnd, getSprintStart } from "src/utils/time-utils";
import BackButton from "../generics/back-button";
import SearchBar from "../generics/search-bar";
import createSprintViewProjectsColumns from "../sprint-view-table/sprint-projects-columns";

/**
 * Sprint view screen component
 */
const SprintViewScreen = () => {
  const theme = useTheme();
  const filterSelectId = useId();
  const { resourceAllocationsApi } = useLambdasApi();
  const {
    filterType,
    searchQuery,
    selectedProject,
    handleFilterChange,
    handleRowClick,
    setSearchQuery,
    filterAllocations
  } = useSprintViewHandlers();
  const users = useAtomValue(usersAtom);
  const userProfile = useAtomValue(userProfileAtom);
  const loggedInUser = users.find((users: User) => users.id === userProfile?.id);
  const [resourceAllocations, setResourceAllocations] = useState<ResourceAllocations[]>([]);
  const [loading, setLoading] = useState(false);
  const todaysDate = new Date().toISOString();
  const sprintStartDate = getSprintStart(todaysDate);
  const sprintEndDate = getSprintEnd(todaysDate);
  const setError = useSetAtom(errorAtom);
  const { adminMode } = useUserRole();
  const columns = createSprintViewProjectsColumns({
    resourceAllocations: resourceAllocations || []
  });
  const filteredAllocations = filterAllocations(resourceAllocations, adminMode);

  const fetchProjectDetails = useCallback(async () => {
    if (!loggedInUser) return;

    setLoading(true);
    try {
      const severaUserId = getSeveraUserId(loggedInUser);
      const fetchedResourceAllocations = adminMode
        ? await resourceAllocationsApi.getAllResourceAllocations()
        : await resourceAllocationsApi.getAllResourceAllocations({
            severaUserId
          });
      setResourceAllocations(fetchedResourceAllocations);
    } catch (error) {
      setError(`${strings.sprintRequestError.fetchResourceAllocationsError}, ${error}`);
    }
    setLoading(false);
  }, [loggedInUser, adminMode, resourceAllocationsApi, setError]);

  useEffect(() => {
    if (loggedInUser) {
      fetchProjectDetails();
    }
  }, [loggedInUser, fetchProjectDetails]);

  return (
    <>
      {loading ? (
        <Card
          sx={{
            p: "25%",
            display: "flex",
            justifyContent: "center",
            backgroundColor: theme.palette.background.paper
          }}
        >
          <Box sx={{ textAlign: "center" }}>
            <Typography>{strings.placeHolder.pleaseWait}</Typography>
            <CircularProgress
              sx={{
                scale: "150%",
                mt: "5%",
                mb: "5%"
              }}
            />
          </Box>
        </Card>
      ) : (
        /* TODO: Need to fetch the status from home-lambdas first for phases, then recreate filter in metatavu-home */
        /* <TaskStatusFilter setFilter={setFilter} /> */
        <Container maxWidth="lg" sx={{ mt: 4 }}>
          <Paper elevation={3} sx={{ padding: 4, borderRadius: 3 }}>
            <Stack spacing={3}>
              {adminMode && (
                <>
                  <Typography variant="h5" fontWeight="bold" color="primary">
                    {strings.sprint.allocation}
                  </Typography>
                  <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                    <Typography variant="subtitle1" fontWeight="medium" color="text.secondary">
                      {strings.sprint.filter}
                    </Typography>
                    <FormControl sx={{ minWidth: 140 }}>
                      <InputLabel id={filterSelectId}>{strings.sprint.filterType}</InputLabel>
                      <Select
                        labelId={filterSelectId}
                        value={filterType}
                        onChange={handleFilterChange}
                        label={strings.sprint.filterType}
                      >
                        <MenuItem value={SprintViewFilterTypes.clear}>
                          {strings.sprint.clear}
                        </MenuItem>
                        <MenuItem value={SprintViewFilterTypes.project}>
                          {strings.sprint.project}
                        </MenuItem>
                        <MenuItem value={SprintViewFilterTypes.user}>
                          {strings.sprint.user}
                        </MenuItem>
                      </Select>
                    </FormControl>
                  </Box>
                  <SearchBar
                    searchInput={searchQuery}
                    handleSearchInputChange={(_, value) => setSearchQuery(value)}
                    styles={{ width: "100%" }}
                    placeholder={strings.sprint.searchBy}
                  />
                </>
              )}
              <Card sx={{ bgcolor: theme.palette.background.paper }}>
                <DataGrid
                  sx={{
                    "& .MuiDataGrid-columnHeaders": {
                      backgroundColor: theme.palette.background.default,
                      color: theme.palette.text.primary
                    },

                    "& .MuiDataGrid-cell": {
                      color: theme.palette.text.primary
                    },
                    "& .MuiDataGrid-row:hover": {
                      backgroundColor: theme.palette.action.hover
                    },
                    "& .MuiDataGrid-row.Mui-selected": {
                      backgroundColor: theme.palette.action.selected
                    },
                    "& .MuiDataGrid-row.Mui-selected:hover": {
                      backgroundColor: theme.palette.action.selected
                    }
                  }}
                  autoHeight
                  localeText={{
                    noResultsOverlayLabel: strings.sprint.notFound
                  }}
                  disableColumnFilter
                  hideFooter
                  rows={filteredAllocations}
                  columns={columns}
                  getRowId={(row) => row.severaResourceAllocationId}
                  onRowClick={(params) => handleRowClick(params.row)}
                />
                <Box
                  sx={{
                    backgroundColor: theme.palette.background.default,
                    p: 1.5,
                    textAlign: "right"
                  }}
                >
                  <Typography variant="body2" color="text.primary">
                    {strings.formatString(
                      strings.sprint.current,
                      sprintStartDate.toLocaleString(),
                      sprintEndDate.toLocaleString()
                    )}
                  </Typography>
                </Box>
              </Card>
              <Divider sx={{ borderColor: theme.palette.divider }} />
              {selectedProject ? (
                <TaskTable key={selectedProject.severaProjectId} project={selectedProject} />
              ) : (
                filteredAllocations.map((resourceAllocations) => (
                  <TaskTable
                    key={resourceAllocations.project?.severaProjectId}
                    project={resourceAllocations.project ?? ({} as ResourceAllocationsProject)}
                  />
                ))
              )}
            </Stack>
          </Paper>
          <BackButton styles={{ mt: 3 }} />
        </Container>
      )}
    </>
  );
};

export default SprintViewScreen;

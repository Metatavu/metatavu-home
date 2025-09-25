import { Search, Close } from "@mui/icons-material";
import {
  Box,
  Card,
  CircularProgress,
  Typography,
  Paper,
  Divider,
  Container,
  Stack,
  TextField,
  InputAdornment,
  Select,
  MenuItem,
  IconButton,
  FormControl,
  InputLabel
} from "@mui/material";
import { DataGrid } from "@mui/x-data-grid";
import { useAtomValue, useSetAtom } from "jotai";
import { useEffect, useState } from "react";
import { userProfileAtom } from "src/atoms/auth";
import { errorAtom } from "src/atoms/error";
import { usersAtom } from "src/atoms/user";
import TaskTable from "src/components/sprint-view-table/tasks-table";
import BackButton from "../generics/back-button";
import type {
  ResourceAllocations,
  ResourceAllocationsProject,
  User
} from "src/generated/homeLambdasClient/models/";
import { useLambdasApi } from "src/hooks/use-api";
import strings from "src/localization/strings";
import { getSeveraUserId } from "src/utils/sprint-utils";
import { getSprintEnd, getSprintStart } from "src/utils/time-utils";
import UserRoleUtils from "src/utils/user-role-utils";
import createSprintViewProjectsColumns from "../sprint-view-table/sprint-projects-columns";
import useSprintViewHandlers from "src/hooks/sprint-custom-hooks";

/**
 * Sprint view screen component
 */
const SprintViewScreen = () => {
  const { resourceAllocationsApi } = useLambdasApi();
  const { 
    filterType,
    searchQuery, 
    selectedProject, 
    handleFilterChange, 
    handleRowClick,
    handleClearSearch, 
    setSearchQuery, 
    filterAllocations } = useSprintViewHandlers();
  const users = useAtomValue(usersAtom);
  const userProfile = useAtomValue(userProfileAtom);
  const loggedInUser = users.find(
    (users: User) => users.id === userProfile?.id
  );
  const [resourceAllocations, setResourceAllocations] = useState<ResourceAllocations[]>([]);
  const [loading, setLoading] = useState(false);
  const todaysDate = new Date().toISOString();
  const sprintStartDate = getSprintStart(todaysDate);
  const sprintEndDate = getSprintEnd(todaysDate);
  const setError = useSetAtom(errorAtom);
  const adminMode = UserRoleUtils.adminMode();
  const columns = createSprintViewProjectsColumns({
    resourceAllocations: resourceAllocations || [],
  });
  const filteredAllocations = filterAllocations(resourceAllocations, adminMode);
  
  useEffect(() => {
    fetchProjectDetails();
  }, [loggedInUser]);

  const fetchProjectDetails = async () => {
    if (!loggedInUser) return;

    setLoading(true);
    try {
      const severaUserId = getSeveraUserId(loggedInUser);
      const fetchedResourceAllocations = adminMode
        ? await resourceAllocationsApi.getAllResourceAllocations()
        : await resourceAllocationsApi.getAllResourceAllocations({ severaUserId });
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
        </Card>
      ) : (
        /* TODO: Need to fetch the status from home-lambdas first for phases, then recreate filter in metatavu-home */
        /* <TaskStatusFilter setFilter={setFilter} /> */
        <Container maxWidth="lg" sx={{ mt: 4}}>
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
                      <InputLabel id="filter-select-label">{strings.sprint.filterType}</InputLabel>
                      <Select
                        labelId="filter-select-label"
                        value={filterType}
                        onChange={handleFilterChange}
                        label="Filter Type"
                      >
                        <MenuItem value="project">{strings.sprint.project}</MenuItem>
                        <MenuItem value="user">{strings.sprint.user}</MenuItem>
                      </Select>
                    </FormControl>
                  </Box>
                  <TextField
                    label={strings.formatString(strings.sprint.searchBy, filterType === "project" ? strings.sprint.project : strings.sprint.user)}
                    variant="outlined"
                    fullWidth
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <Search color="action" />
                        </InputAdornment>
                      ),
                      endAdornment: searchQuery && (
                        <InputAdornment position="end">
                          <IconButton onClick={handleClearSearch} size="small">
                            <Close fontSize="small" />
                          </IconButton>
                        </InputAdornment>
                      ),
                      sx: {
                        borderRadius: 2,
                        backgroundColor: "background.paper",
                      },
                    }}
                  />
                </>
              )}
              <Card>
                <DataGrid
                  sx={{
                    "& .MuiDataGrid-columnHeaders": { backgroundColor: "#e9ecef" },
                    "& .MuiDataGrid-row:nth-of-type(even)": { backgroundColor: "#dee2e6" },
                    "& .MuiDataGrid-row:hover": { cursor: "pointer", backgroundColor: "#ced4da" },
                  }}
                  autoHeight
                  localeText={{ noResultsOverlayLabel: strings.sprint.notFound }}
                  disableColumnFilter
                  hideFooter
                  rows={filteredAllocations}
                  columns={columns}
                  getRowId={(row) => row.severaResourceAllocationId}
                  onRowClick={(params) => handleRowClick(params.row)}
                />
                <Box sx={{ backgroundColor: "#e9ecef", p: 1.5, textAlign: "right" }}>
                  <Typography variant="body2" color="text.primary">
                    {strings.formatString(
                      strings.sprint.current,
                      sprintStartDate.toLocaleString(),
                      sprintEndDate.toLocaleString()
                    )}
                  </Typography>
                </Box>
              </Card>
              <Divider />
              {selectedProject ? (
                <TaskTable key={selectedProject.severaProjectId} project={selectedProject} />
              ) : (
                (filteredAllocations).map((resourceAllocations) => (
                  <TaskTable
                    key={resourceAllocations.project?.severaProjectId}
                    project={resourceAllocations.project ?? ({} as ResourceAllocationsProject)}
                  />
                ))
              )}
            </Stack>
          </Paper>
         <BackButton sx={{ mt: 3 }} />
        </Container>
      )}
    </>
  );
};

export default SprintViewScreen;
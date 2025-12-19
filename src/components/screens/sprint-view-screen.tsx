import { Close, Search } from "@mui/icons-material";
import {
  Box,
  Card,
  CircularProgress,
  Container,
  Divider,
  FormControl,
  IconButton,
  InputAdornment,
  InputLabel,
  MenuItem,
  Paper,
  Select,
  Stack,
  TextField,
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
  ResourceAllocationsProject
} from "src/generated/homeLambdasClient/models/";
import useSprintViewHandlers from "src/hooks/sprint-custom-hooks";
import { useLambdasApi } from "src/hooks/use-api";
import useUserRole from "src/hooks/use-user-role";
import strings from "src/localization/strings";
import { getSeveraUserId } from "src/utils/sprint-utils";
import { getSprintEnd, getSprintStart } from "src/utils/time-utils";
import BackButton from "../generics/back-button";
import createSprintViewProjectsColumns from "../sprint-view-table/sprint-projects-columns";

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
    setFilterType
  } = useSprintViewHandlers();

  const users = useAtomValue(usersAtom);
  const userProfile = useAtomValue(userProfileAtom);
  const loggedInUser = users.find((u) => u.id === userProfile?.id);
  const setError = useSetAtom(errorAtom);
  const { adminMode } = useUserRole();

  const [resourceAllocations, setResourceAllocations] = useState<ResourceAllocations[]>([]);
  const [loading, setLoading] = useState(true);

  const columns = createSprintViewProjectsColumns({ resourceAllocations });

  // Fetch allocations
  useEffect(() => {
    const fetchData = async () => {
      if (!loggedInUser) return;
      setLoading(true);

      try {
        const severaUserId = getSeveraUserId(loggedInUser);
        const allocations = adminMode
          ? await resourceAllocationsApi.getAllResourceAllocations()
          : await resourceAllocationsApi.getAllResourceAllocations({ severaUserId });

        setResourceAllocations(allocations);
        setFilterType("project"); // default
      } catch (error) {
        setError(`${strings.sprintRequestError.fetchResourceAllocationsError}, ${error}`);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [loggedInUser, adminMode, resourceAllocationsApi, setError, setFilterType]);

  // Filter allocations dynamically based on filterType
  const filteredAllocations = resourceAllocations.filter((allocation) => {
    if (!searchQuery) return true;

    switch (filterType) {
      case "project":
        return allocation.project?.name?.toLowerCase().includes(searchQuery.toLowerCase());
      case "user":
        return allocation.user?.name?.toLowerCase().includes(searchQuery.toLowerCase());
      case "phase":
        // assuming allocation.phase?.name exists
        return allocation.phase?.name?.toLowerCase().includes(searchQuery.toLowerCase());
      default:
        return true;
    }
  });

  if (loading) {
    return (
      <Card sx={{ p: "25%", display: "flex", justifyContent: "center" }}>
        <Box sx={{ textAlign: "center" }}>
          <Typography>{strings.placeHolder.pleaseWait}</Typography>
          <CircularProgress sx={{ scale: "150%", mt: 2 }} />
        </Box>
      </Card>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ mt: 4 }}>
      <Paper elevation={3} sx={{ padding: 4, borderRadius: 3 }}>
        <Stack spacing={3}>
          {adminMode && (
            <>
              <Typography variant="h5" fontWeight="bold" color="primary">
                {strings.sprint.allocation}
              </Typography>

              {/* Filter selector */}
              <Box sx={{ display: "flex", alignItems: "center", gap: 2, flexWrap: "wrap" }}>
                <Typography variant="subtitle1" fontWeight="medium" color="text.secondary">
                  {strings.sprint.filter}
                </Typography>
                <FormControl sx={{ minWidth: 140 }}>
                  <InputLabel id="filter-select-label">{strings.sprint.filterType}</InputLabel>
                  <Select
                    labelId="filter-select-label"
                    value={filterType}
                    onChange={handleFilterChange}
                    label={strings.sprint.filterType}
                  >
                    <MenuItem value="project">{strings.sprint.project}</MenuItem>
                    <MenuItem value="user">{strings.sprint.user}</MenuItem>
                    <MenuItem value="phase">{strings.sprint.phase}</MenuItem> {/* added */}
                  </Select>
                </FormControl>

                {/* Search input */}
                <TextField
                  label={strings.formatString(
                    strings.sprint.searchBy,
                    filterType === "project"
                      ? strings.sprint.project
                      : filterType === "user"
                        ? strings.sprint.user
                        : "Phase"
                  )}
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
                    sx: { borderRadius: 2, backgroundColor: "background.paper" }
                  }}
                />
              </Box>
            </>
          )}

          {/* DataGrid */}
          <Card>
            <DataGrid
              sx={{
                "& .MuiDataGrid-columnHeaders": { backgroundColor: "#e9ecef" },
                "& .MuiDataGrid-row:nth-of-type(even)": { backgroundColor: "#dee2e6" },
                "& .MuiDataGrid-row:hover": { cursor: "pointer", backgroundColor: "#ced4da" }
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
                  getSprintStart(new Date().toISOString()).toLocaleString(),
                  getSprintEnd(new Date().toISOString()).toLocaleString()
                )}
              </Typography>
            </Box>
          </Card>

          <Divider />

          {/* Task Tables */}
          {selectedProject ? (
            <TaskTable key={selectedProject.severaProjectId} project={selectedProject} />
          ) : (
            filteredAllocations.map((allocation) => (
              <TaskTable
                key={allocation.project?.severaProjectId}
                project={allocation.project ?? ({} as ResourceAllocationsProject)}
              />
            ))
          )}
        </Stack>
      </Paper>
      <BackButton styles={{ mt: 3 }} />
    </Container>
  );
};

export default SprintViewScreen;

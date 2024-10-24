import React, { useState, useEffect, useMemo } from "react";
import {
  Card,
  CircularProgress,
  Typography,
  Box,
  Grid,
  Alert,
  Container,
  Button,
  InputAdornment,
  IconButton,
  MenuItem,
  Select,
  FormControl,
  Chip,
  OutlinedInput,
} from "@mui/material";
import Content from "../software-registry/allContent";
import { useLambdasApi } from "src/hooks/use-api";
import type { SoftwareRegistry, SoftwareStatus } from "src/generated/homeLambdasClient";
import strings from "src/localization/strings";
import AddSoftwareModal from "../software-registry/AddSoftwareModal";
import GridViewIcon from "@mui/icons-material/GridView";
import ListViewIcon from "@mui/icons-material/List";
import { useAtomValue } from "jotai";
import { authAtom } from "src/atoms/auth";
import UserRoleUtils from "src/utils/user-role-utils";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import SearchIcon from "@mui/icons-material/Search";
import useCreateSoftware from "src/hooks/use-create-software";

const statusOptions = [
  { value: "ALL", label: "Show all" },
  { value: "PENDING", label: "Pending" },
  { value: "UNDER_REVIEW", label: "Under review" },
  { value: "ACCEPTED", label: "Accepted" },
  { value: "DEPRECATED", label: "Deprecated" },
  { value: "DECLINED", label: "Declined" },
];

/**
 * All software screen component
 */
const AllSoftwareScreen: React.FC = () => {
  const { softwareApi } = useLambdasApi();
  const [applications, setApplications] = useState<SoftwareRegistry[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const auth = useAtomValue(authAtom);
  const loggedUserId = auth?.token?.sub ?? "";
  const adminMode = UserRoleUtils.adminMode();
  const [selectedStatus, setSelectedStatus] = useState<string>("ALL");
  const [error, setError] = useState<string | null>(null);
  const [searchTerms, setSearchTerms] = useState<string[]>([]);
  const [inputValue, setInputValue] = useState<string>("");
  const [isGridView, setIsGridView] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [showAll, setShowAll] = useState(false);
  const { createSoftware } = useCreateSoftware(loggedUserId, setApplications);

  /**
   * Fetches the list of all software applications from the API.
   * Updates the application state with the fetched data.
   */
  useEffect(() => {
    fetchSoftwareData();
  }, []);

  /**
   * Fetches all software data.
   * This function retrieves the list of software applications from the API and updates the state.
   */
  const fetchSoftwareData = async () => {
    setLoading(true);
    setError(null);
    try {
      const fetchedApplications = await softwareApi.listSoftware();
      setApplications(fetchedApplications);
    } catch (error) {
      setError(`Error fetching software data: ${error}`);
    } finally {
      setLoading(false);
    }
  };

  /**
   * Filters the applications based on the input and search terms.
   */
  const filterBySearchTerms = (app: SoftwareRegistry): boolean => {
    const lowerCaseInput = inputValue.toLowerCase();
    const matchesInput = app.name.toLowerCase().includes(lowerCaseInput) ||
      (app.tags ?? []).some(tag => tag.toLowerCase().includes(lowerCaseInput));

    const matchesTerms = searchTerms.every(term => {
      const lowerCaseTerm = term.toLowerCase();
      return (
        app.name.toLowerCase().includes(lowerCaseTerm) ||
        (app.tags ?? []).some(tag => tag.toLowerCase().includes(lowerCaseTerm))
      );
    });

    return matchesInput && matchesTerms;
  };

  const filterByStatus = (app: SoftwareRegistry, status: string): boolean => {
    return status === "ALL" || app.status === status;
  };

  const filteredApplications = useMemo(() => {
    return applications.filter(app => {
      const matchesSearch = filterBySearchTerms(app);
      const matchesStatus = filterByStatus(app, selectedStatus);
      return matchesSearch && matchesStatus;
    });
  }, [applications, inputValue, searchTerms, selectedStatus]);

  /**
   * Handles the input for search terms.
   * Adds new search terms when the "Enter" key is pressed.
   */
  const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "Enter" && inputValue.trim() !== "") {
      event.preventDefault();

      if (!searchTerms.includes(inputValue.trim())) {
        setSearchTerms([...searchTerms, inputValue.trim()]);
        setInputValue("");
      }
    }
  };

  /**
   * Deletes a search term chip.
   */
  const handleDeleteChip = (chipToDelete: string) => {
    setSearchTerms((prevChips) =>
      prevChips.filter((chip) => chip !== chipToDelete)
    );
  };

  /**
   * Updates the status of application.
   * 
   * @param {string} id - The id of the application to update.
   * @param {SoftwareStatus} newStatus - The new status to assign to the application.
   */
  const handleStatusChange = async (id: string, newStatus: SoftwareStatus) => {
    try {
      const appToUpdate = applications.find(app => app.id === id);

      if (appToUpdate) {
        const updatedApp: SoftwareRegistry = {
          ...appToUpdate,
          status: newStatus,
          name: appToUpdate.name || "",
          description: appToUpdate.description || "",
          review: appToUpdate.review || "",
          url: appToUpdate.url || "",
          image: appToUpdate.image || "",
          tags: appToUpdate.tags || [],
          users: appToUpdate.users || []
        };

        const updatedApplications = applications.map(app =>
          app.id === id ? updatedApp : app
        );
        setApplications(updatedApplications);

        await softwareApi.updateSoftwareById({
          id,
          softwareRegistry: updatedApp
        });
      }
    } catch (error) {
      console.error(`Error updating status: ${error}`);
    }
  };

  /**
   * Adds the current user to the list of users for the specified application.
   * 
   * @param {string} id - The id of the application to save.
   */
  const handleSave = async (id: string) => {
    try {
      const applicationToUpdate = applications.find(app => app.id === id);
      if (!applicationToUpdate) {
        throw new Error(`Application with ID ${id} not found`);
      }

      const updatedUsers = applicationToUpdate.users ? [...applicationToUpdate.users, loggedUserId] : [loggedUserId];

      const updatedApplications = applications.map(app =>
        app.id === id ? { ...app, users: updatedUsers, isInMyApplications: true } : app
      );
      setApplications(updatedApplications);

      await softwareApi.updateSoftwareById({
        id,
        softwareRegistry: {
          ...applicationToUpdate,
          users: updatedUsers,
        }
      });

    } catch (error) {
      console.error(`Error saving the app: ${error}`);
    }
  };

  /**
   * Removes the specified application.
   * 
   * @param {string} id - The id of the application to remove.
   */
  const handleRemove = async (id: string) => {
    try {
      const applicationToDelete = applications.find(app => app.id === id);
      if (!applicationToDelete) {
        throw new Error(`Application with ID ${id} not found`);
      }

      const updatedApplications = applications.filter(app => app.id !== id);
      setApplications(updatedApplications);

      await softwareApi.deleteSoftwareById({ id });

    } catch (error) {
      console.error(`Error deleting the app: ${error}`);
    }
  };

  if (loading) {
    return (
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
    );
  }

  return (
    <Container>
      <Grid container direction="column" alignItems="center" mt={4}>
        <Grid
          item
          container
          justifyContent="space-between"
          alignItems="center"
          mb={2}
          mt={4}
        >
          <Typography
            variant="h4"
            sx={{ fontWeight: "bold", fontSize: "28px", color: "#333" }}
          >
            {strings.softwareRegistry.allApplications}
          </Typography>
          <Button
            variant="contained"
            onClick={() => setIsModalOpen(true)}
            sx={{
              textTransform: "none",
              color: "#fff",
              fontSize: "18px",
              background: "#f9473b",
              borderRadius: "100px",
              "&:hover": { background: "#000" },
            }}
          >
            {strings.softwareRegistry.addApplication}
          </Button>
        </Grid>

        <Grid container justifyContent="space-between" alignItems="center" mb={2}>
          <Box
            sx={{
              display: "flex",
              flexDirection: "row",
              alignItems: "center",
              width: "100%",
            }}
          >
            <FormControl sx={{ minWidth: "120px" }}>
              <Select
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
                variant="outlined"
                sx={{
                  borderRadius: "10px",
                  height: "45px",
                  backgroundColor: "#f9473b",
                  color: "#fff",
                  padding: "0 15px",
                  "& .MuiSvgIcon-root": {
                    color: "#fff",
                  },
                }}
                IconComponent={ExpandMoreIcon}
              >
                {statusOptions.map((option) => (
                  <MenuItem key={option.value} value={option.value}>
                    {option.label}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <OutlinedInput
              placeholder={strings.softwareRegistry.searchBy}
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={handleKeyDown}
              startAdornment={searchTerms.map((term) => (
                <Chip
                  key={term}
                  label={term}
                  onDelete={() => handleDeleteChip(term)}
                  sx={{
                    marginRight: "5px",
                    backgroundColor: "#BDBDBD",
                    color: "#fff",
                  }}
                />
              ))}
              endAdornment={
                <InputAdornment position="end">
                  <SearchIcon sx={{ color: "gray" }} />
                </InputAdornment>
              }
              sx={{
                marginLeft: "15px",
                borderRadius: "10px",
                height: "45px",
                width: "50%",
                padding: "10px",
                backgroundColor: "#f1f1f1",
                boxShadow: "inset 0px 4px 6px rgba(0, 0, 0, 0.1)",
              }}
            />
            <Box sx={{ display: "flex", marginLeft: "auto" }}>
              <IconButton
                onClick={() => setIsGridView(true)}
                sx={{
                  backgroundColor: isGridView ? "#f9473b" : "#f2f2f2",
                  color: isGridView ? "#fff" : "#000",
                  borderRadius: "8px",
                  padding: "10px",
                  marginRight: "4px",
                  marginLeft: "10px",
                  transition: "background-color 0.3s ease",
                  "&:hover": {
                    backgroundColor: "#000",
                    color: "#fff",
                  },
                }}
              >
                <GridViewIcon />
              </IconButton>
              <IconButton
                onClick={() => setIsGridView(false)}
                sx={{
                  backgroundColor: !isGridView ? "#f9473b" : "#f2f2f2",
                  color: !isGridView ? "#fff" : "#000",
                  borderRadius: "8px",
                  padding: "10px",
                  transition: "background-color 0.3s ease",
                  "&:hover": {
                    backgroundColor: "#000",
                    color: "#fff",
                  },
                }}
              >
                <ListViewIcon />
              </IconButton>
            </Box>
          </Box>
        </Grid>

        <Grid container justifyContent="flex-start" mt={2} mb={6} width="100%">
          <Grid item xs>
            {error && (
              <Box mb={2} width="100%">
                <Alert severity="error">{error}</Alert>
              </Box>
            )}

            <Content
              applications={
                showAll ?
                  filteredApplications :
                  filteredApplications.slice(0, 8)
              }
              isGridView={isGridView}
              onStatusChange={handleStatusChange}
              adminMode={adminMode}
              onSave={handleSave}
              onRemove={handleRemove}
              loggedUserId={loggedUserId}
            />

            {filteredApplications.length > 4 && (
              <Box textAlign="center" mt={3}>
                <Button
                  variant="contained"
                  color="primary"
                  onClick={() => setShowAll(!showAll)}
                  sx={{
                    textTransform: "none",
                    color: "#fff",
                    fontSize: "18px",
                    background: "#f9473b",
                    borderRadius: "100px",
                    "&:hover": { background: "#000" },
                  }}
                >
                  {
                    showAll
                      ? strings.softwareRegistry.showLess
                      : strings.softwareRegistry.showMore
                  }
                </Button>
              </Box>
            )}
          </Grid>
        </Grid>
      </Grid>

      <AddSoftwareModal
        open={isModalOpen}
        handleClose={() => setIsModalOpen(false)}
        handleSave={createSoftware}
        disabled={loading}
        existingSoftwareList={applications}
      />
    </Container>
  );
};

export default AllSoftwareScreen;

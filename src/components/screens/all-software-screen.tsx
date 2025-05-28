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
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
} from "@mui/material";
import Content from "../software-registry/allContent";
import { useLambdasApi } from "src/hooks/use-api";
import type { SoftwareRegistry } from "src/generated/homeLambdasClient";
import { SoftwareStatus } from "src/generated/homeLambdasClient";
import strings from "src/localization/strings";
import GridViewIcon from "@mui/icons-material/GridView";
import ListViewIcon from "@mui/icons-material/List";
import { useAtomValue } from "jotai";
import { authAtom } from "src/atoms/auth";
import UserRoleUtils from "src/utils/user-role-utils";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import SearchIcon from "@mui/icons-material/Search";
import useCreateSoftware from "src/hooks/use-create-software";
import AddSoftwareModal from "../software-registry/AddSoftwareModal";



/**
 * All software screen component
 */
const AllSoftwareScreen = () => {
  const { softwareApi } = useLambdasApi();
  const [software, setApplications] = useState<SoftwareRegistry[]>([]);
  const [loading, setLoading] = useState(true);
  const auth = useAtomValue(authAtom);
  const loggedUserId = auth?.token?.sub ?? "";
  const adminMode = UserRoleUtils.adminMode();
  const [selectedStatus, setSelectedStatus] = useState<SoftwareStatusFilterOptions>("ALL");
  const [error, setError] = useState<string | null>(null);
  const [searchTerms, setSearchTerms] = useState<string[]>([]);
  const [inputValue, setInputValue] = useState("");
  const [isGridView, setIsGridView] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [showAll, setShowAll] = useState(false);
  const { createSoftware } = useCreateSoftware(loggedUserId, setApplications);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedApplicationId, setSelectedApplicationId] = useState<string | null>(null);

const allStatusValues = ["ALL", ...Object.values(SoftwareStatus)] as const;

type SoftwareStatusFilterOptions = typeof allStatusValues[number];

const statusOptions = allStatusValues.map((value) => ({
  value,
  label: strings.softwareStatus[value.toLowerCase() as keyof typeof strings.softwareStatus]
}));

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
   * @param software - A software registry item to be tested against the search filters.
   * @returns `true` if the application matches both the user input and all search terms; otherwise, `false`
   */
  const filterBySearchTerms = (software: SoftwareRegistry): boolean => {
    const lowerCaseInput = inputValue.toLowerCase();
    const matchesInput = software.name.toLowerCase().includes(lowerCaseInput) ||
      (software.tags ?? []).some(tag => tag.toLowerCase().includes(lowerCaseInput));

    const matchesTerms = searchTerms.every(term => {
      const lowerCaseTerm = term.toLowerCase();
      return (
        software.name.toLowerCase().includes(lowerCaseTerm) ||
        (software.tags ?? []).some(tag => tag.toLowerCase().includes(lowerCaseTerm))
      );
    });

    return matchesInput && matchesTerms;
  };

  /**
 * Filters the application by its status.
 *
 * @param software - The software application to check.
 * @param status - The status filter value (e.g., "ALL", "PENDING", etc.).
 * @returns `true` if the application matches the given status or if the status is "ALL"; otherwise, `false`.
 */
  const filterByStatus = (software: SoftwareRegistry, status: string): boolean => {
    return status === "ALL" || software.status === status;
  };

  const filteredApplications = useMemo(() => {
    return software.filter(app => {
      const matchesSearch = filterBySearchTerms(app);
      const matchesStatus = filterByStatus(app, selectedStatus);
      return matchesSearch && matchesStatus;
    });
  }, [software, inputValue, searchTerms, selectedStatus]);

  /**
   * Handles the input for search terms.
   * Adds new search terms when the "Enter" key is pressed.
   * @param event - The keyboard event triggered by the user pressing a key inside the input field.
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
   * @param chipToDelete - The search term (chip) to remove from the list.
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
      const softwareToUpdate = software.find(software => software.id === id);

      if (softwareToUpdate) {
        const updatedApp: SoftwareRegistry = {
          ...softwareToUpdate,
          status: newStatus
        };

        const updatedSoftwares = software.map(software =>
          software.id === id ? updatedApp : software
        );
        setApplications(updatedSoftwares);

        await softwareApi.updateSoftwareById({
          id,
          softwareRegistry: updatedApp
        });
      }
    } catch (error) {
      setError(`Error updating status: ${error}`);
    }
  };

  /**
   * Adds the current user to the list of users for the specified application.
   * 
   * @param {string} id - The id of the application to save.
   */
  const handleSave = async (id: string) => {
    try {
      const softwareToUpdate = software.find(software => software.id === id);
      if (!softwareToUpdate) {
        throw new Error(`Application with ID ${id} not found`);
      }

      const updatedUsers = softwareToUpdate.users ? [...softwareToUpdate.users, loggedUserId] : [loggedUserId];

      const updatedApplications = software.map(software =>
        software.id === id ? { ...software, users: updatedUsers, isInMyApplications: true } : software
      );
      setApplications(updatedApplications);

      await softwareApi.updateSoftwareById({
        id,
        softwareRegistry: {
          ...softwareToUpdate,
          users: updatedUsers,
        }
      });

    } catch (error) {
      setError(`Error saving the app: ${error}`);
    }
  };

  /**
   * Opens the delete confirmation dialog.
   *
   * @param id - The ID of the application to delete.
   */
  const openDeleteDialog = (id: string) => {
    setSelectedApplicationId(id);
    setDeleteDialogOpen(true);
  };

  /**
   * Closes the delete confirmation dialog.
   */
  const closeDeleteDialog = () => {
    setSelectedApplicationId(null);
    setDeleteDialogOpen(false);
  };

  /**
   * Handles the removal of an application after confirmation.
   */
  const handleRemove = async () => {
    if (!selectedApplicationId) return;

    try {
      const applicationToDelete = software.find(app => app.id === selectedApplicationId);
      if (!applicationToDelete) {
        throw new Error(`Application with ID ${selectedApplicationId} not found`);
      }

      const updatedApplications = software.filter(app => app.id !== selectedApplicationId);
      setApplications(updatedApplications);

      await softwareApi.deleteSoftwareById({ id: selectedApplicationId });
    } catch (error) {
      setError(`Error deleting the app: ${error}`);
    } finally {
      closeDeleteDialog();
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
              onRemove={openDeleteDialog}
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
        existingSoftwareList={software}
      />

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={deleteDialogOpen}
        onClose={closeDeleteDialog}
        aria-labelledby="delete-dialog-title"
        aria-describedby="delete-dialog-description"
      >
        <DialogTitle id="delete-dialog-title">
          {strings.softwareRegistry.confirmDeletion}
        </DialogTitle>
        <DialogContent>
          <DialogContentText id="delete-dialog-description">
          {strings.softwareRegistry.deleteSoftwareDescription}
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={closeDeleteDialog} color="primary">
            {strings.softwareRegistry.cancel}
          </Button>
          <Button onClick={handleRemove} color="secondary" autoFocus>
            {strings.softwareRegistry.delete}
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default AllSoftwareScreen;

import {
  Alert,
  Box,
  Button,
  Card,
  CircularProgress,
  Container,
  Grid,
  Typography,
  useTheme
} from "@mui/material";
import { useAtomValue } from "jotai";
import { useEffect, useMemo, useState } from "react";
import { authAtom } from "src/atoms/auth";
import type { SoftwareRegistry } from "src/generated/homeLambdasClient";
import { SoftwareStatus } from "src/generated/homeLambdasClient";
import { useLambdasApi } from "src/hooks/use-api";
import useCreateSoftware from "src/hooks/use-create-software";
import useUserRole from "src/hooks/use-user-role";
import strings from "src/localization/strings";
import { DeleteItemType } from "src/types/index";
import DeleteConfirmationDialog from "../contexts/delete-confirmation-dialog";
import BackButton from "../generics/back-button";
import CreateButton from "../generics/create-button";
import Dropdown from "../generics/dropdown";
import ListViewButton from "../generics/list-view-button";
import SearchBar from "../generics/search-bar";
import Content from "../software-registry/allContent";
import AddSoftwareModal from "../software-registry/SoftwareModal";

/**
 * All software screen component
 */
const AllSoftwareScreen = () => {
  const { softwareApi } = useLambdasApi();
  const [software, setApplications] = useState<SoftwareRegistry[]>([]);
  const [loading, setLoading] = useState(false);
  const auth = useAtomValue(authAtom);
  const loggedUserId = auth?.token?.sub ?? "";
  const { adminMode } = useUserRole();
  const allStatusValues = ["ALL", ...Object.values(SoftwareStatus)] as const;
  const [selectedStatus, setSelectedStatus] = useState<SoftwareStatusFilterOptions>(
    allStatusValues[0]
  );
  const [error, setError] = useState<string | null>(null);
  const [searchTerms, setSearchTerms] = useState<string[]>([]);
  const [inputValue, setInputValue] = useState("");
  const [listView, setListView] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [showAll, setShowAll] = useState(false);
  const { createSoftware } = useCreateSoftware(loggedUserId, setApplications);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedApplicationId, setSelectedApplicationId] = useState<string | null>(null);
  const [deleteTitle, setDeleteTitle] = useState<string | undefined>(undefined);
  const theme = useTheme();

  type SoftwareStatusFilterOptions = (typeof allStatusValues)[number];

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
    } catch (error: any) {
      const errorMessage = await error?.response?.json();
      setError(`${strings.error.softwareFetchFailed} ${errorMessage?.message || error}`);
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
    const matchesInput =
      software.name.toLowerCase().includes(lowerCaseInput) ||
      (software.tags ?? []).some((tag) => tag.toLowerCase().includes(lowerCaseInput));

    const matchesTerms = searchTerms.every((term) => {
      const lowerCaseTerm = term.toLowerCase();
      return (
        software.name.toLowerCase().includes(lowerCaseTerm) ||
        (software.tags ?? []).some((tag) => tag.toLowerCase().includes(lowerCaseTerm))
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
    return status === allStatusValues[0] || software.status === status;
  };

  const filteredApplications = useMemo(() => {
    return software.filter((app) => {
      const matchesSearch = filterBySearchTerms(app);
      const matchesStatus = filterByStatus(app, selectedStatus);
      return matchesSearch && matchesStatus;
    });
  }, [software, inputValue, searchTerms, selectedStatus]);

  /**
   * Updates the status of application.
   *
   * @param {string} id - The id of the application to update.
   * @param {SoftwareStatus} newStatus - The new status to assign to the application.
   */
  const handleStatusChange = async (id: string, newStatus: SoftwareStatus) => {
    try {
      const softwareToUpdate = software.find((software) => software.id === id);

      if (softwareToUpdate) {
        const updatedApp: SoftwareRegistry = {
          ...softwareToUpdate,
          status: newStatus
        };

        const updatedSoftwares = software.map((software) =>
          software.id === id ? updatedApp : software
        );
        setApplications(updatedSoftwares);

        await softwareApi.updateSoftwareById({
          id,
          softwareRegistry: updatedApp
        });
      }
    } catch (error: any) {
      const errorMessage = await error?.response?.json();
      setError(`${strings.error.softwareStatusUpdateFailed} ${errorMessage?.message || error}`);
    }
  };

  /**
   * Adds the current user to the list of users for the specified application.
   *
   * @param {string} id - The id of the application to save.
   */
  const handleSave = async (id: string) => {
    try {
      const softwareToUpdate = software.find((software) => software.id === id);
      if (!softwareToUpdate) {
        throw new Error(`Application with ID ${id} not found`);
      }

      const updatedUsers = softwareToUpdate.users
        ? [...softwareToUpdate.users, loggedUserId]
        : [loggedUserId];

      const updatedApplications = software.map((software) =>
        software.id === id
          ? { ...software, users: updatedUsers, isInMyApplications: true }
          : software
      );
      setApplications(updatedApplications);

      await softwareApi.updateSoftwareById({
        id,
        softwareRegistry: {
          ...softwareToUpdate,
          users: updatedUsers
        }
      });
    } catch (error: any) {
      const errorMessage = await error?.response?.json();
      setError(`${strings.error.softwareSaveFailed} ${errorMessage?.message || error}`);
    }
  };

  /**
   * Opens the delete confirmation dialog.
   *
   * @param id - The ID of the application to delete.
   * @param title - The title of the application to delete.
   */
  const openDeleteDialog = (id: string, title: string) => {
    setSelectedApplicationId(id);
    setDeleteTitle(title);
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
      const applicationToDelete = software.find((app) => app.id === selectedApplicationId);
      if (!applicationToDelete) {
        throw new Error(`Application with ID ${selectedApplicationId} not found`);
      }

      const updatedApplications = software.filter((app) => app.id !== selectedApplicationId);
      setApplications(updatedApplications);

      await softwareApi.deleteSoftwareById({ id: selectedApplicationId });
    } catch (error: any) {
      const errorMessage = await error?.response?.json();
      setError(`${strings.error.softwareDeleteFailed} ${errorMessage?.message || error}`);
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
          justifyContent: "center"
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
    );
  }

  return (
    <Container>
      <Grid container direction="column" alignItems="stretch" mt={4}>
        <Grid container justifyContent="space-between" alignItems="center" mb={2} mt={4}>
          <Typography variant="h3">{strings.softwareRegistry.allApplications}</Typography>
        </Grid>

        <Box
          sx={{
            display: "flex",
            alignItems: "flex-start",
            gap: 2,
            width: "100%",
            mt: 2
          }}
        >
          {/*TODO: The logic behind how the software is managed should be changed to be similar to the wiki one*/}
          <SearchBar
            searchInput={inputValue}
            handleSearchInputChange={(_event, newInputValue) => setInputValue(newInputValue)}
            tags={Array.from(new Set(software.flatMap((app) => app.tags ?? [])))}
            handleSelectedTagChange={(newSelectedTags) => setSearchTerms(newSelectedTags)}
            autoCompleteId="software-registry-search-tags"
            styles={{ width: { lg: "55%", md: "55%", xs: "100%" } }}
            placeholder={strings.softwareRegistry.searchBy}
          />
          <Dropdown
            displayOption={selectedStatus}
            handleDisplayOptionChange={(e) =>
              setSelectedStatus(e.target.value as SoftwareStatusFilterOptions)
            }
            displayOptions={statusOptions}
          />
          <ListViewButton listView={listView} setListView={setListView} />
          <CreateButton
            onClick={() => setIsModalOpen(true)}
            text={strings.softwareRegistry.addApplication}
          />
        </Box>

        <Grid container justifyContent="flex-start" mt={2} mb={6} width="100%">
          <Grid size="grow">
            {error && (
              <Box mb={2} width="100%">
                <Alert severity="error">{error}</Alert>
              </Box>
            )}
            <Content
              applications={showAll ? filteredApplications : filteredApplications.slice(0, 8)}
              isGridView={!listView}
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
                  color="secondary"
                  onClick={() => setShowAll(!showAll)}
                  sx={{
                    textTransform: "none",
                    color: theme.palette.secondary.contrastText,
                    fontSize: "18px",
                    borderRadius: "100px",
                    backgroundColor: theme.palette.secondary.main,
                    "&:hover": { backgroundColor: theme.palette.secondary.dark }
                  }}
                >
                  {showAll ? strings.softwareRegistry.showLess : strings.softwareRegistry.showMore}
                </Button>
              </Box>
            )}
          </Grid>
        </Grid>
      </Grid>
      <BackButton styles={{ marginBottom: 2 }} />
      <AddSoftwareModal
        open={isModalOpen}
        handleClose={() => setIsModalOpen(false)}
        handleSave={createSoftware}
        disabled={loading}
        existingSoftwareList={software}
      />
      <DeleteConfirmationDialog
        open={deleteDialogOpen}
        setOpen={setDeleteDialogOpen}
        onConfirm={handleRemove}
        deleteType={DeleteItemType.SOFTWARE}
        deleteTitle={deleteTitle}
      />
    </Container>
  );
};

export default AllSoftwareScreen;
